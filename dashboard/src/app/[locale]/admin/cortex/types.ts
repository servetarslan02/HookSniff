export type Tab = 'overview' | 'anomalies' | 'healing' | 'predictions' | 'ml_quality' | 'proactive' | 'drift' | 'monitor' | 'ab_tests' | 'automl';

export interface CortexHealth {
  status: string;
  metrics: {
    hourly_stats_total: number;
    profiles_total: number;
    anomalies_24h: number;
    healing_actions_24h: number;
    action_memory_total: number;
    predictions_24h: number;
    active_insights: number;
    ml_quality_samples_24h: number;
    proactive_insights: number;
    ml_predictions_total: number;
  };
}

export interface ProactiveInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  severity: string;
  endpoint_id?: string;
  created_at: string;
  acknowledged: boolean;
}
