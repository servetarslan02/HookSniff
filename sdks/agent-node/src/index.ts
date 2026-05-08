/**
 * HookSniff AI Agent SDK
 *
 * Kullanım:
 * ```ts
 * import { HookSniffAgent } from '@hooksniff/agent-sdk';
 *
 * const agent = new HookSniffAgent({
 *   agentKey: 'pub_agent_xxxx',
 *   baseUrl: 'https://hooksniff-api-xxx.run.app'
 * });
 *
 * // Event dinle
 * agent.on('order.created', (event) => {
 *   console.log('Yeni siparis:', event.payload);
 * });
 *
 * // Wildcard dinle
 * agent.on('*', (event) => {
 *   console.log('Her event:', event.event_type);
 * });
 *
 * // Event gönder
 * await agent.emit('stock.low', { product: 'Laptop', count: 3 });
 *
 * // Hedefli event gönder
 * await agent.emit('order.process', { id: 123 }, 'target-agent-uuid');
 *
 * // SSE ile bağlan (daha basit, HTTP)
 * await agent.connectSSE();
 *
 * // WebSocket ile bağlan (daha hızlı)
 * await agent.connect();
 * ```
 */

export interface AgentOptions {
  agentKey: string;
  baseUrl?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export interface AgentEvent {
  id: string;
  agent_id: string;
  event_type: string;
  payload: any;
  direction: 'emit' | 'receive';
  status: string;
  target_agent_id?: string;
  created_at: string;
}

export interface EmitResult {
  event_id: string;
  status: string;
  delivered_to: string[];
}

export interface EventFilter {
  event_type?: string;
  direction?: 'emit' | 'receive';
  since?: string;
  until?: string;
}

export interface EventStats {
  total_events: number;
  emit_count: number;
  receive_count: number;
  delivered_count: number;
  failed_count: number;
  unique_event_types: number;
  last_event_at: string | null;
  last_24h_count: number;
  top_event_types: { event_type: string; count: number }[];
}

export interface AnomalyStatus {
  agent_id: string;
  warnings: string[];
  rate_limit: {
    minute_used: number;
    minute_limit: number;
    hour_used: number;
    hour_limit: number;
    minute_remaining: number;
    hour_remaining: number;
  };
  healthy: boolean;
}

type EventHandler = (event: AgentEvent) => void;

export class HookSniffAgent {
  private agentKey: string;
  private baseUrl: string;
  private autoReconnect: boolean;
  private reconnectInterval: number;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private wildcardHandlers: EventHandler[] = [];
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private connected = false;
  private agentId: string | null = null;

  constructor(options: AgentOptions) {
    this.agentKey = options.agentKey;
    this.baseUrl = (options.baseUrl || 'https://hooksniff-api-1046140057667.europe-west1.run.app').replace(/\/$/, '');
    this.autoReconnect = options.autoReconnect ?? true;
    this.reconnectInterval = options.reconnectInterval ?? 5000;
  }

  /**
   * Event dinleyici ekle
   */
  on(eventType: string | '*', handler: EventHandler): void {
    if (eventType === '*') {
      this.wildcardHandlers.push(handler);
    } else {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, []);
      }
      this.eventHandlers.get(eventType)!.push(handler);
    }
  }

  /**
   * Event dinleyici kaldır
   */
  off(eventType: string, handler: EventHandler): void {
    if (eventType === '*') {
      this.wildcardHandlers = this.wildcardHandlers.filter(h => h !== handler);
    } else {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        this.eventHandlers.set(eventType, handlers.filter(h => h !== handler));
      }
    }
  }

  /**
   * Tüm dinleyicileri kaldır
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.eventHandlers.delete(eventType);
    } else {
      this.eventHandlers.clear();
      this.wildcardHandlers = [];
    }
  }

  /**
   * Event gönder (HTTP API)
   */
  async emit(eventType: string, payload: any, targetAgentId?: string): Promise<EmitResult> {
    await this.resolveAgentId();
    const response = await this.request('POST', `/agents/${this.agentId}/emit`, {
      event_type: eventType,
      payload,
      target_agent_id: targetAgentId,
    });
    return response as EmitResult;
  }

  /**
   * Event geçmişini getir (filtreli)
   */
  async getEvents(options?: { page?: number; filter?: EventFilter }): Promise<{ events: AgentEvent[]; pagination: any }> {
    await this.resolveAgentId();
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.filter?.event_type) params.set('event_type', options.filter.event_type);
    if (options?.filter?.direction) params.set('direction', options.filter.direction);
    if (options?.filter?.since) params.set('since', options.filter.since);
    if (options?.filter?.until) params.set('until', options.filter.until);

    const qs = params.toString();
    const response = await this.request('GET', `/agents/${this.agentId}/events${qs ? `?${qs}` : ''}`);
    return response as any;
  }

  /**
   * Event istatistiklerini getir
   */
  async getStats(): Promise<EventStats> {
    await this.resolveAgentId();
    const response = await this.request('GET', `/agents/${this.agentId}/stats`);
    return (response as any).stats;
  }

  /**
   * Anomaly durumunu kontrol et
   */
  async checkHealth(): Promise<AnomalyStatus> {
    await this.resolveAgentId();
    return this.request('GET', `/agents/${this.agentId}/anomaly`) as Promise<AnomalyStatus>;
  }

  /**
   * Routing kuralı oluştur
   */
  async addRoute(eventType: string, targetAgentId: string, sourceAgentId?: string): Promise<any> {
    return this.request('POST', '/agents/routes', {
      event_type: eventType,
      target_agent_id: targetAgentId,
      source_agent_id: sourceAgentId,
    });
  }

  /**
   * Routing kurallarını listele
   */
  async getRoutes(): Promise<any[]> {
    const response = await this.request('GET', '/agents/routes');
    return (response as any).routes;
  }

  /**
   * Routing kuralı sil
   */
  async deleteRoute(routeId: string): Promise<void> {
    await this.request('DELETE', `/agents/routes/${routeId}`);
  }

  /**
   * Rate limit bilgisini getir
   */
  async getRateLimit(): Promise<any> {
    await this.resolveAgentId();
    const response = await this.request('GET', `/agents/${this.agentId}/rate-limit`);
    return (response as any).rate_limit;
  }

  /**
   * Rate limit güncelle
   */
  async updateRateLimit(options: { maxEventsPerMinute?: number; maxEventsPerHour?: number }): Promise<any> {
    await this.resolveAgentId();
    const body: any = {};
    if (options.maxEventsPerMinute !== undefined) body.max_events_per_minute = options.maxEventsPerMinute;
    if (options.maxEventsPerHour !== undefined) body.max_events_per_hour = options.maxEventsPerHour;
    const response = await this.request('PUT', `/agents/${this.agentId}/rate-limit`, body);
    return (response as any).rate_limit;
  }

  /**
   * SSE ile real-time bağlan (daha basit, HTTP tabanlı)
   */
  async connectSSE(filter?: { event_type?: string; direction?: string }): Promise<void> {
    await this.resolveAgentId();

    const params = new URLSearchParams();
    if (filter?.event_type) params.set('event_type', filter.event_type);
    if (filter?.direction) params.set('direction', filter.direction);
    const qs = params.toString();

    const url = `${this.baseUrl}/agents/${this.agentId}/stream${qs ? `?${qs}` : ''}`;

    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(url);

        // SSE EventSource header gönderemez, bu yüzden URL'ye token eklememiz gerekiyor
        // Ancak güvenli değil. Alternatif: fetch + ReadableStream kullan.
        // Şimdilik SSE'i desteklemiyoruz, WS kullan.
        reject(new Error('SSE requires server-side token support. Use connect() for WebSocket instead.'));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fetch tabanlı SSE bağlan (token destekli)
   *
   * NOT: SSE endpoint JWT auth gerektirir (dashboard token).
   * Agent key ile SSE çalışmaz. Agent'lar için WebSocket kullanın.
   */
  async connectSSEWithToken(jwtToken: string, filter?: { event_type?: string; direction?: string }): Promise<void> {
    await this.resolveAgentId();

    const params = new URLSearchParams();
    if (filter?.event_type) params.set('event_type', filter.event_type);
    if (filter?.direction) params.set('direction', filter.direction);
    const qs = params.toString();

    const url = `${this.baseUrl}/agents/${this.agentId}/stream${qs ? `?${qs}` : ''}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Accept': 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      this.connected = true;
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream');

      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        while (this.connected) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                this.handleSSEMessage(data);
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      };

      processStream().catch(() => {
        this.connected = false;
        if (this.autoReconnect) {
          setTimeout(() => this.connectSSEWithToken(filter), this.reconnectInterval);
        }
      });
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  /**
   * WebSocket ile real-time bağlan
   */
  async connect(): Promise<void> {
    await this.resolveAgentId();

    const wsUrl = this.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.connected = true;
          this.ws!.send(JSON.stringify({
            type: 'auth',
            token: this.agentKey,
          }));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (e) {
            // Ignore parse errors
          }
        };

        this.ws.onclose = () => {
          this.connected = false;
          if (this.autoReconnect) {
            setTimeout(() => this.connect(), this.reconnectInterval);
          }
        };

        this.ws.onerror = (error) => {
          if (!this.connected) {
            reject(error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Bağlantıyı kes
   */
  disconnect(): void {
    this.autoReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connected = false;
  }

  /**
   * Bağlı mı?
   */
  get isConnected(): boolean {
    return this.connected;
  }

  /**
   * Agent ID'yi getir (lazy resolve)
   */
  async getAgentId(): Promise<string> {
    await this.resolveAgentId();
    return this.agentId!;
  }

  // --- Private ---

  private async resolveAgentId(): Promise<void> {
    if (this.agentId) return;
    const response = await this.request('GET', '/agents');
    const agents = (response as any).agents;
    if (!agents || agents.length === 0) {
      throw new Error('No agents found. Create an agent first.');
    }
    // Agent key ile eşleşen agent'ı bul
    // Not: API agent_key döndürüyor, bunu kullanarak eşleştir
    // Ancak güvenlik nedeniyle API sadece oluşturma sırasında key döndürür
    // Bu yüzden ilk agent'ı al (tek agent varsayımı)
    this.agentId = agents[0].id;
  }

  private handleSSEMessage(data: any): void {
    if (data.type === 'agent_event') {
      const event: AgentEvent = {
        id: data.event_id || '',
        agent_id: this.agentId || '',
        event_type: data.event_type || '',
        payload: data.payload || {},
        direction: data.direction || 'receive',
        status: data.status || 'delivered',
        target_agent_id: data.target_agent_id,
        created_at: data.created_at || new Date().toISOString(),
      };

      this.dispatchEvent(event);
    }
  }

  private handleMessage(data: any): void {
    if (data.type === 'event') {
      const event: AgentEvent = {
        id: data.delivery_id || '',
        agent_id: data.endpoint_id || '',
        event_type: data.event_type || '',
        payload: data.payload?.data || data.payload,
        direction: data.payload?.direction || 'receive',
        status: 'delivered',
        created_at: data.timestamp || new Date().toISOString(),
      };

      this.dispatchEvent(event);
    }
  }

  private dispatchEvent(event: AgentEvent): void {
    // Specific handlers
    const handlers = this.eventHandlers.get(event.event_type);
    if (handlers) {
      handlers.forEach(h => {
        try { h(event); } catch (e) { console.error('Event handler error:', e); }
      });
    }

    // Wildcard handlers
    this.wildcardHandlers.forEach(h => {
      try { h(event); } catch (e) { console.error('Wildcard handler error:', e); }
    });
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Agent-Key': this.agentKey,
    };

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = `API error ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error?.message || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${await response.text()}`;
      }
      throw new HookSniffError(errorMessage, response.status);
    }

    return response.json();
  }
}

export class HookSniffError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'HookSniffError';
  }
}

export default HookSniffAgent;
