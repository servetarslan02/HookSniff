"""
HookSniff AI Agent SDK

Kullanım:
    from hooksniff_agent import HookSniffAgent

    agent = HookSniffAgent(
        agent_key="pub_agent_xxxx",
        base_url="https://hooksniff-api-xxx.run.app"
    )

    # Event dinle
    @agent.on("order.created")
    def handle_order(event):
        print(f"Yeni siparis: {event.payload}")

    # Wildcard dinle
    @agent.on("*")
    def handle_all(event):
        print(f"Her event: {event.event_type}")

    # Event gönder
    agent.emit("stock.low", {"product": "Laptop", "count": 3})

    # Hedefli event gönder
    agent.emit("order.process", {"id": 123}, target_agent_id="uuid")

    # Event geçmişini filtrele
    events = agent.get_events(filter={"event_type": "order.*", "direction": "emit"})

    # İstatistikler
    stats = agent.get_stats()

    # SSE ile bağlan (daha basit)
    agent.connect_sse()

    # WebSocket ile bağlan (daha hızlı)
    agent.connect()
"""

import json
import threading
import time
from dataclasses import dataclass, field
from typing import Callable, Optional

import requests
import websocket


@dataclass
class AgentEvent:
    """Agent event veri yapısı."""

    id: str = ""
    agent_id: str = ""
    event_type: str = ""
    payload: dict = field(default_factory=dict)
    direction: str = "receive"
    status: str = "delivered"
    target_agent_id: Optional[str] = None
    created_at: str = ""

    @classmethod
    def from_dict(cls, data: dict) -> "AgentEvent":
        return cls(
            id=data.get("id", ""),
            agent_id=data.get("agent_id", ""),
            event_type=data.get("event_type", ""),
            payload=data.get("payload", {}),
            direction=data.get("direction", "receive"),
            status=data.get("status", "delivered"),
            target_agent_id=data.get("target_agent_id"),
            created_at=data.get("created_at", ""),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "event_type": self.event_type,
            "payload": self.payload,
            "direction": self.direction,
            "status": self.status,
            "target_agent_id": self.target_agent_id,
            "created_at": self.created_at,
        }


@dataclass
class EventStats:
    """Event istatistikleri."""

    total_events: int = 0
    emit_count: int = 0
    receive_count: int = 0
    delivered_count: int = 0
    failed_count: int = 0
    unique_event_types: int = 0
    last_event_at: Optional[str] = None
    last_24h_count: int = 0
    top_event_types: list = field(default_factory=list)


@dataclass
class AnomalyStatus:
    """Anomaly durumu."""

    agent_id: str = ""
    warnings: list = field(default_factory=list)
    rate_limit: dict = field(default_factory=dict)
    healthy: bool = True


class HookSniffError(Exception):
    """HookSniff API hatası."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class HookSniffAgent:
    """
    HookSniff AI Agent SDK

    Agent'lar arası event iletişimi için Python SDK.
    """

    def __init__(
        self,
        agent_key: str,
        base_url: str = "https://hooksniff-api-1046140057667.europe-west1.run.app",
        auto_reconnect: bool = True,
        reconnect_interval: int = 5,
    ):
        self.agent_key = agent_key
        self.base_url = base_url.rstrip("/")
        self.auto_reconnect = auto_reconnect
        self.reconnect_interval = reconnect_interval
        self._handlers: dict[str, list[Callable]] = {}
        self._wildcard_handlers: list[Callable] = []
        self._ws: Optional[websocket.WebSocketApp] = None
        self._connected = False
        self._agent_id: Optional[str] = None
        self._ws_thread: Optional[threading.Thread] = None
        self._sse_thread: Optional[threading.Thread] = None

    def on(self, event_type: str):
        """Event dinleyici decorator."""
        def decorator(func: Callable):
            if event_type == "*":
                self._wildcard_handlers.append(func)
            else:
                if event_type not in self._handlers:
                    self._handlers[event_type] = []
                self._handlers[event_type].append(func)
            return func
        return decorator

    def on_event(self, event_type: str, handler: Callable):
        """Event dinleyici ekle (decorator olmadan)."""
        if event_type == "*":
            self._wildcard_handlers.append(handler)
        else:
            if event_type not in self._handlers:
                self._handlers[event_type] = []
            self._handlers[event_type].append(handler)

    def off(self, event_type: str, handler: Callable):
        """Event dinleyici kaldır."""
        if event_type == "*":
            self._wildcard_handlers = [h for h in self._wildcard_handlers if h != handler]
        else:
            handlers = self._handlers.get(event_type, [])
            self._handlers[event_type] = [h for h in handlers if h != handler]

    def remove_all_listeners(self, event_type: Optional[str] = None):
        """Tüm dinleyicileri kaldır."""
        if event_type:
            self._handlers.pop(event_type, None)
        else:
            self._handlers.clear()
            self._wildcard_handlers.clear()

    def emit(self, event_type: str, payload: dict, target_agent_id: Optional[str] = None) -> dict:
        """Event gönder."""
        self._resolve_agent_id()
        data = {
            "event_type": event_type,
            "payload": payload,
        }
        if target_agent_id:
            data["target_agent_id"] = target_agent_id

        response = self._request("POST", f"/agents/{self._agent_id}/emit", data)
        return response

    def get_events(
        self,
        page: int = 1,
        event_filter: Optional[dict] = None,
    ) -> dict:
        """
        Event geçmişini getir (filtreli).

        Args:
            page: Sayfa numarası
            event_filter: Filtre parametreleri
                - event_type: Event tipi filtresi
                - direction: "emit" veya "receive"
                - since: ISO 8601 tarih (bu tarihten sonra)
                - until: ISO 8601 tarih (bu tarihe kadar)
        """
        self._resolve_agent_id()
        params = {"page": page}
        if event_filter:
            if event_filter.get("event_type"):
                params["event_type"] = event_filter["event_type"]
            if event_filter.get("direction"):
                params["direction"] = event_filter["direction"]
            if event_filter.get("since"):
                params["since"] = event_filter["since"]
            if event_filter.get("until"):
                params["until"] = event_filter["until"]

        qs = "&".join(f"{k}={v}" for k, v in params.items())
        response = self._request("GET", f"/agents/{self._agent_id}/events?{qs}")
        return response

    def get_stats(self) -> EventStats:
        """Event istatistiklerini getir."""
        self._resolve_agent_id()
        response = self._request("GET", f"/agents/{self._agent_id}/stats")
        stats_data = response.get("stats", {})
        return EventStats(
            total_events=stats_data.get("total_events", 0),
            emit_count=stats_data.get("emit_count", 0),
            receive_count=stats_data.get("receive_count", 0),
            delivered_count=stats_data.get("delivered_count", 0),
            failed_count=stats_data.get("failed_count", 0),
            unique_event_types=stats_data.get("unique_event_types", 0),
            last_event_at=stats_data.get("last_event_at"),
            last_24h_count=stats_data.get("last_24h_count", 0),
            top_event_types=stats_data.get("top_event_types", []),
        )

    def check_health(self) -> AnomalyStatus:
        """Anomaly durumunu kontrol et."""
        self._resolve_agent_id()
        response = self._request("GET", f"/agents/{self._agent_id}/anomaly")
        return AnomalyStatus(
            agent_id=response.get("agent_id", ""),
            warnings=response.get("warnings", []),
            rate_limit=response.get("rate_limit", {}),
            healthy=response.get("healthy", True),
        )

    def add_route(self, event_type: str, target_agent_id: str, source_agent_id: Optional[str] = None) -> dict:
        """Routing kuralı oluştur."""
        data = {
            "event_type": event_type,
            "target_agent_id": target_agent_id,
        }
        if source_agent_id:
            data["source_agent_id"] = source_agent_id
        return self._request("POST", "/agents/routes", data)

    def get_routes(self) -> list:
        """Routing kurallarını listele."""
        response = self._request("GET", "/agents/routes")
        return response.get("routes", [])

    def delete_route(self, route_id: str) -> None:
        """Routing kuralı sil."""
        self._request("DELETE", f"/agents/routes/{route_id}")

    def get_rate_limit(self) -> dict:
        """Rate limit bilgisini getir."""
        self._resolve_agent_id()
        response = self._request("GET", f"/agents/{self._agent_id}/rate-limit")
        return response.get("rate_limit", {})

    def update_rate_limit(
        self,
        max_events_per_minute: Optional[int] = None,
        max_events_per_hour: Optional[int] = None,
    ) -> dict:
        """Rate limit güncelle."""
        self._resolve_agent_id()
        data = {}
        if max_events_per_minute is not None:
            data["max_events_per_minute"] = max_events_per_minute
        if max_events_per_hour is not None:
            data["max_events_per_hour"] = max_events_per_hour
        response = self._request("PUT", f"/agents/{self._agent_id}/rate-limit", data)
        return response.get("rate_limit", {})

    def connect_sse(
        self,
        event_type: Optional[str] = None,
        direction: Optional[str] = None,
    ):
        """
        SSE ile real-time bağlan (blocking).

        Args:
            event_type: Event tipi filtresi
            direction: "emit" veya "receive" filtresi
        """
        self._resolve_agent_id()
        params = {}
        if event_type:
            params["event_type"] = event_type
        if direction:
            params["direction"] = direction

        qs = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"{self.base_url}/agents/{self._agent_id}/stream"
        if qs:
            url += f"?{qs}"

        headers = {
            "Authorization": f"Bearer {self.agent_key}",
            "Accept": "text/event-stream",
        }

        try:
            response = requests.get(url, headers=headers, stream=True)
            response.raise_for_status()

            self._connected = True
            buffer = ""

            for chunk in response.iter_content(chunk_size=None):
                if not self._connected:
                    break

                buffer += chunk.decode("utf-8", errors="replace")
                lines = buffer.split("\n")
                buffer = lines.pop() or ""

                for line in lines:
                    if line.startswith("data: "):
                        try:
                            data = json.loads(line[6:])
                            self._handle_sse_message(data)
                        except (json.JSONDecodeError, ValueError):
                            pass

        except Exception as e:
            self._connected = False
            if self.auto_reconnect:
                time.sleep(self.reconnect_interval)
                self.connect_sse(event_type, direction)
            else:
                raise HookSniffError(f"SSE connection failed: {e}")

    def connect_sse_async(
        self,
        event_type: Optional[str] = None,
        direction: Optional[str] = None,
    ):
        """SSE ile real-time bağlan (non-blocking)."""
        self._sse_thread = threading.Thread(
            target=self.connect_sse,
            args=(event_type, direction),
            daemon=True,
        )
        self._sse_thread.start()

    def connect(self):
        """WebSocket ile real-time bağlan (blocking)."""
        self._resolve_agent_id()
        ws_url = self.base_url.replace("https://", "wss://").replace("http://", "ws://") + "/ws"

        def on_message(ws, message):
            try:
                data = json.loads(message)
                self._handle_ws_message(data)
            except Exception:
                pass

        def on_open(ws):
            self._connected = True
            ws.send(json.dumps({"type": "auth", "token": self.agent_key}))

        def on_close(ws, close_status_code, close_msg):
            self._connected = False
            if self.auto_reconnect:
                time.sleep(self.reconnect_interval)
                self.connect()

        def on_error(ws, error):
            pass

        self._ws = websocket.WebSocketApp(
            ws_url,
            on_message=on_message,
            on_open=on_open,
            on_close=on_close,
            on_error=on_error,
        )

        self._ws.run_forever()

    def connect_async(self):
        """WebSocket ile real-time bağlan (non-blocking)."""
        self._ws_thread = threading.Thread(target=self.connect, daemon=True)
        self._ws_thread.start()

    def disconnect(self):
        """Bağlantıyı kes."""
        self.auto_reconnect = False
        if self._ws:
            self._ws.close()
            self._ws = None
        self._connected = False

    @property
    def is_connected(self) -> bool:
        """Bağlı mı?"""
        return self._connected

    def get_agent_id(self) -> str:
        """Agent ID'yi getir."""
        self._resolve_agent_id()
        return self._agent_id

    # --- Private ---

    def _resolve_agent_id(self):
        if self._agent_id:
            return
        response = self._request("GET", "/agents")
        agents = response.get("agents", [])
        if not agents:
            raise HookSniffError("No agents found. Create an agent first.")
        # İlk agent'ı al (tek agent varsayımı)
        self._agent_id = agents[0]["id"]

    def _handle_sse_message(self, data: dict):
        if data.get("type") == "agent_event":
            event = AgentEvent(
                id=data.get("event_id", ""),
                agent_id=self._agent_id or "",
                event_type=data.get("event_type", ""),
                payload=data.get("payload", {}),
                direction=data.get("direction", "receive"),
                status=data.get("status", "delivered"),
                target_agent_id=data.get("target_agent_id"),
                created_at=data.get("created_at", ""),
            )
            self._dispatch_event(event)

    def _handle_ws_message(self, data: dict):
        if data.get("type") == "event":
            event = AgentEvent(
                id=data.get("delivery_id", ""),
                agent_id=data.get("endpoint_id", ""),
                event_type=data.get("event_type", ""),
                payload=data.get("payload", {}).get("data", data.get("payload", {})),
                direction=data.get("payload", {}).get("direction", "receive"),
                status="delivered",
                created_at=data.get("timestamp", ""),
            )
            self._dispatch_event(event)

    def _dispatch_event(self, event: AgentEvent):
        # Specific handlers
        handlers = self._handlers.get(event.event_type, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                print(f"Event handler error: {e}")

        # Wildcard handlers
        for handler in self._wildcard_handlers:
            try:
                handler(event)
            except Exception as e:
                print(f"Wildcard handler error: {e}")

    def _request(self, method: str, path: str, data: Optional[dict] = None) -> dict:
        url = f"{self.base_url}{path}"
        headers = {
            "Content-Type": "application/json",
            "X-Agent-Key": self.agent_key,
        }

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise HookSniffError(f"Unsupported method: {method}")

            if not response.ok:
                error_msg = f"API error {response.status_code}"
                try:
                    error_body = response.json()
                    error_msg = error_body.get("error", {}).get("message", error_msg)
                except Exception:
                    error_msg = f"{error_msg}: {response.text}"
                raise HookSniffError(error_msg, response.status_code)

            return response.json()

        except requests.exceptions.ConnectionError:
            raise HookSniffError(f"Connection failed: {url}")
        except requests.exceptions.Timeout:
            raise HookSniffError(f"Request timeout: {url}")
        except requests.exceptions.RequestException as e:
            raise HookSniffError(f"Request failed: {e}")
