export type TabKey = 'overview' | 'endpoints' | 'webhooks' | 'apikeys' | 'applications' | 'usage' | 'notes' | 'communications' | 'billing';

export interface OverviewTabProps {
  detail: any;
  planHistory: any[];
  userEndpoints: any[];
  analytics: any;
  t: (key: string, values?: any) => string;
  tc: (key: string) => string;
  newPlan: string;
  setNewPlan: (plan: string) => void;
  handleUpdatePlan: () => void;
  handleToggleStatus: () => void;
  handleViewDelivery: (deliveryId: string) => void;
  handleReplay: (deliveryId: string) => void;
}

export interface EndpointsTabProps {
  userEndpoints: any[];
  t: (key: string, values?: any) => string;
}

export interface WebhooksTabProps {
  userWebhooks: any[];
  webhooksTotal: number;
  webhooksPage: number;
  setWebhooksPage: (page: number | ((p: number) => number)) => void;
  webhookFilter: { status?: string; event_type?: string };
  setWebhookFilter: (filter: any) => void;
  handleViewDelivery: (deliveryId: string) => void;
  handleReplay: (deliveryId: string) => void;
  t: (key: string, values?: any) => string;
  tc: (key: string) => string;
}

export interface ApiKeysTabProps {
  userApiKeys: any[];
  t: (key: string, values?: any) => string;
}

export interface ApplicationsTabProps {
  userApps: any[];
  t: (key: string, values?: any) => string;
}

export interface UsageTabProps {
  userUsage: any;
  t: (key: string, values?: any) => string;
}

export interface NotesTabProps {
  userTags: any[];
  userNotes: any[];
  newTag: string;
  setNewTag: (tag: string) => void;
  newNote: string;
  setNewNote: (note: string) => void;
  id: string;
  addTagMutation: any;
  removeTagMutation: any;
  addNoteMutation: any;
  t: (key: string, values?: any) => string;
}

export interface CommunicationsTabProps {
  userComms: any[];
  commsTotal: number;
  commsPage: number;
  setCommsPage: (page: number | ((p: number) => number)) => void;
  commFilter: string;
  setCommFilter: (filter: string) => void;
  t: (key: string, values?: any) => string;
  tc: (key: string) => string;
}

export interface BillingTabProps {
  detail: any;
  userInvoices: any[];
  invoicesTotal: number;
  invoicesPage: number;
  setInvoicesPage: (page: number | ((p: number) => number)) => void;
  invoiceFilter: string;
  setInvoiceFilter: (filter: string) => void;
  userPayments: any[];
  userRefunds: any[];
  handleGdprExport: () => void;
  handleGdprDelete: () => void;
  gdprExportMutation: any;
  showGdprDeleteModal: boolean;
  setShowGdprDeleteModal: (show: boolean) => void;
  gdprDeleteReason: string;
  setGdprDeleteReason: (reason: string) => void;
  t: (key: string, values?: any) => string;
  tc: (key: string) => string;
  setShowRefundModal: (show: boolean) => void;
}

export interface UserModalsProps {
  detail: any;
  // Ban modal
  showBanModal: boolean;
  setShowBanModal: (show: boolean) => void;
  banReason: string;
  setBanReason: (reason: string) => void;
  handleConfirmBan: () => void;
  // Email modal
  showEmailModal: boolean;
  setShowEmailModal: (show: boolean) => void;
  emailSubject: string;
  setEmailSubject: (subject: string) => void;
  emailBody: string;
  setEmailBody: (body: string) => void;
  handleSendEmail: () => void;
  sendEmailMutation: any;
  // Refund modal
  showRefundModal: boolean;
  setShowRefundModal: (show: boolean) => void;
  refundAmount: string;
  setRefundAmount: (amount: string) => void;
  refundReason: string;
  setRefundReason: (reason: string) => void;
  handleRefund: () => void;
  refundMutation: any;
  // Test Webhook modal
  showTestWebhookModal: boolean;
  setShowTestWebhookModal: (show: boolean) => void;
  testWebhookUrl: string;
  setTestWebhookUrl: (url: string) => void;
  testWebhookEvent: string;
  setTestWebhookEvent: (event: string) => void;
  testWebhookPayload: string;
  setTestWebhookPayload: (payload: string) => void;
  testWebhookResult: { status_code: number; response_body: string; duration_ms: number } | null;
  setTestWebhookResult: (result: { status_code: number; response_body: string; duration_ms: number } | null) => void;
  handleTestWebhook: () => void;
  testWebhookMutation: any;
  // GDPR Delete modal
  showGdprDeleteModal: boolean;
  setShowGdprDeleteModal: (show: boolean) => void;
  gdprDeleteReason: string;
  setGdprDeleteReason: (reason: string) => void;
  handleGdprDelete: () => void;
  gdprDeleteMutation: any;
  // Delivery Detail modal
  selectedDeliveryId: string | null;
  setSelectedDeliveryId: (id: string | null) => void;
  deliveryDetail: any;
  deliveryLoading: boolean;
  deliveryAttempts: any[];
  t: (key: string, values?: any) => string;
  tc: (key: string) => string;
}
