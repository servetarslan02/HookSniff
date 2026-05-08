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
 * // Event gönder
 * await agent.emit('stock.low', { product: 'Laptop', count: 3 });
 *
 * // Bağlan (WebSocket real-time)
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

type EventHandler = (event: AgentEvent) => void;

export class HookSniffAgent {
  private agentKey: string;
  private baseUrl: string;
  private autoReconnect: boolean;
  private reconnectInterval: number;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private wildcardHandlers: EventHandler[] = [];
  private ws: WebSocket | null = null;
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
   * Event gönder (HTTP API)
   */
  async emit(eventType: string, payload: any, targetAgentId?: string): Promise<EmitResult> {
    const response = await this.request('POST', `/agents/${this.agentId}/emit`, {
      event_type: eventType,
      payload,
      target_agent_id: targetAgentId,
    });
    return response as EmitResult;
  }

  /**
   * Event geçmişini getir
   */
  async getEvents(page = 1): Promise<AgentEvent[]> {
    const response = await this.request('GET', `/agents/${this.agentId}/events?page=${page}`);
    return (response as any).events;
  }

  /**
   * Routing kuralı oluştur
   */
  async addRoute(eventType: string, targetAgentId: string): Promise<any> {
    return this.request('POST', '/agents/routes', {
      event_type: eventType,
      target_agent_id: targetAgentId,
    });
  }

  /**
   * Anomaly durumunu kontrol et
   */
  async checkHealth(): Promise<any> {
    return this.request('GET', `/agents/${this.agentId}/anomaly`);
  }

  /**
   * WebSocket ile real-time bağlan
   */
  async connect(): Promise<void> {
    // Önce agent bilgisini al
    await this.resolveAgentId();

    const wsUrl = this.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.connected = true;
          // Auth mesajı gönder
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
    this.connected = false;
  }

  /**
   * Bağlı mı?
   */
  get isConnected(): boolean {
    return this.connected;
  }

  // --- Private ---

  private async resolveAgentId(): Promise<void> {
    if (this.agentId) return;
    const response = await this.request('GET', '/agents');
    const agents = (response as any).agents;
    if (agents && agents.length > 0) {
      // Agent key ile eşleştir
      // Şimdilkilk ilk agent'ı al
      this.agentId = agents[0].id;
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

      // Specific handlers
      const handlers = this.eventHandlers.get(event.event_type);
      if (handlers) {
        handlers.forEach(h => h(event));
      }

      // Wildcard handlers
      this.wildcardHandlers.forEach(h => h(event));
    }
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
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    return response.json();
  }
}

export default HookSniffAgent;
