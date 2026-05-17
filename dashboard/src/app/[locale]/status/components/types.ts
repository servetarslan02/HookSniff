// ─── Types ───
export interface ComponentStatus {
  name: string;
  icon?: string;
  status: 'healthy' | 'degraded' | 'down' | 'unhealthy' | 'unknown';
  latency_ms: number | null;
  description: string;
  last_checked: string;
  uptime_30d?: number;
}

export interface IncidentUpdate {
  time: string;
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
}

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  created_at: string;
  resolved_at: string | null;
  affected_components: string[];
  updates: IncidentUpdate[];
}

export interface Maintenance {
  id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  affected_components: string[];
  description: string;
}

export interface HistoryDay {
  date: string;
  uptime: number;
  incidents: string[];
}

export interface StatusData {
  overall_status: 'operational' | 'degraded' | 'down';
  uptime_30d: number;
  components: ComponentStatus[];
  checked_at: string;
  response_times?: Record<string, number[]>;
}
