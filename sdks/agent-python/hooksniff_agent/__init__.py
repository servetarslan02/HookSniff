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
        print(f"Yeni siparis: {event['payload']}")

    # Event gönder
    agent.emit("stock.low", {"product": "Laptop", "count": 3})

    # Bağlan (WebSocket real-time)
    agent.connect()
"""

import json
import threading
import time
from typing import Callable, Optional

import requests
import websocket


class AgentEvent:
    """Agent event veri yapısı."""

    def __init__(self, data: dict):
        self.id = data.get("id", "")
        self.agent_id = data.get("agent_id", "")
        self.event_type = data.get("event_type", "")
        self.payload = data.get("payload", {})
        self.direction = data.get("direction", "receive")
        self.status = data.get("status", "delivered")
        self.target_agent_id = data.get("target_agent_id")
        self.created_at = data.get("created_at", "")

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

    def get_events(self, page: int = 1) -> list:
        """Event geçmişini getir."""
        self._resolve_agent_id()
        response = self._request("GET", f"/agents/{self._agent_id}/events?page={page}")
        return response.get("events", [])

    def add_route(self, event_type: str, target_agent_id: str) -> dict:
        """Routing kuralı oluştur."""
        return self._request("POST", "/agents/routes", {
            "event_type": event_type,
            "target_agent_id": target_agent_id,
        })

    def check_health(self) -> dict:
        """Anomaly durumunu kontrol et."""
        self._resolve_agent_id()
        return self._request("GET", f"/agents/{self._agent_id}/anomaly")

    def connect(self):
        """WebSocket ile real-time bağlan (blocking)."""
        self._resolve_agent_id()
        ws_url = self.base_url.replace("https://", "wss://").replace("http://", "ws://") + "/ws"

        def on_message(ws, message):
            try:
                data = json.loads(message)
                self._handle_message(data)
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
        self._connected = False

    @property
    def is_connected(self) -> bool:
        """Bağlı mı?"""
        return self._connected

    # --- Private ---

    def _resolve_agent_id(self):
        if self._agent_id:
            return
        response = self._request("GET", "/agents")
        agents = response.get("agents", [])
        if agents:
            self._agent_id = agents[0]["id"]

    def _handle_message(self, data: dict):
        if data.get("type") == "event":
            event = AgentEvent({
                "id": data.get("delivery_id", ""),
                "agent_id": data.get("endpoint_id", ""),
                "event_type": data.get("event_type", ""),
                "payload": data.get("payload", {}).get("data", data.get("payload", {})),
                "direction": data.get("payload", {}).get("direction", "receive"),
                "status": "delivered",
                "created_at": data.get("timestamp", ""),
            })

            # Specific handlers
            handlers = self._handlers.get(event.event_type, [])
            for handler in handlers:
                handler(event)

            # Wildcard handlers
            for handler in self._wildcard_handlers:
                handler(event)

    def _request(self, method: str, path: str, data: Optional[dict] = None) -> dict:
        url = f"{self.base_url}{path}"
        headers = {
            "Content-Type": "application/json",
            "X-Agent-Key": self.agent_key,
        }

        if method == "GET":
            response = requests.get(url, headers=headers)
        else:
            response = requests.post(url, headers=headers, json=data)

        response.raise_for_status()
        return response.json()
