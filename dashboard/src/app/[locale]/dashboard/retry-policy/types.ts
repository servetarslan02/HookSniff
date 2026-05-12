export interface GlobalRetryPolicy {
  default_max_attempts: number;
  default_backoff: 'exponential' | 'linear' | 'fixed';
  default_initial_delay_secs: number;
  default_max_delay_secs: number;
  dead_letter_queue_enabled: boolean;
  dead_letter_queue_max_age_hours: number;
  retry_on_status_codes: number[];
  timeout_secs: number;
}

export const DEFAULT_POLICY: GlobalRetryPolicy = {
  default_max_attempts: 5,
  default_backoff: 'exponential',
  default_initial_delay_secs: 10,
  default_max_delay_secs: 3600,
  dead_letter_queue_enabled: true,
  dead_letter_queue_max_age_hours: 72,
  retry_on_status_codes: [408, 429, 500, 502, 503, 504],
  timeout_secs: 30,
};

export const BACKOFF_OPTIONS = [
  { value: 'exponential', labelKey: 'exponential', descKey: 'exponentialDesc' },
  { value: 'linear', labelKey: 'linear', descKey: 'linearDesc' },
  { value: 'fixed', labelKey: 'fixed', descKey: 'fixedDesc' },
];

export const STATUS_CODES = [
  { code: 408, label: '408 Request Timeout' },
  { code: 429, label: '429 Too Many Requests' },
  { code: 500, label: '500 Internal Server Error' },
  { code: 502, label: '502 Bad Gateway' },
  { code: 503, label: '503 Service Unavailable' },
  { code: 504, label: '504 Gateway Timeout' },
];
