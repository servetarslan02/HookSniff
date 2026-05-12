export interface PortalConfig {
  primary_color: string;
  logo_url: string;
  company_name: string;
  font_family: string;
  dark_mode: boolean;
  show_events: boolean;
  show_deliveries: boolean;
  allowed_events: string[];
}

export const DEFAULT_CONFIG: PortalConfig = {
  primary_color: '#6366f1',
  logo_url: '',
  company_name: '',
  font_family: 'Inter',
  dark_mode: false,
  show_events: true,
  show_deliveries: true,
  allowed_events: [],
};

export const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins',
  'Source Code Pro', 'JetBrains Mono', 'system-ui',
];
