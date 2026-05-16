'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { StatusBadge } from '@/components/StatusBadge';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell } from '@/components/LazyCharts';
import { useTranslations, useLocale } from 'next-intl';
import {
  useAdminUserDetail,
  useAdminUserAnalytics,
  useAdminUserPlanHistory,
  useAdminUserEndpoints,
  useAdminUserWebhooks,
  useAdminUserApiKeys,
  useAdminUserApplications,
  useAdminUserUsage,
  useAdminUserNotes,
  useAdminUserTags,
  useAdminUserCommunications,
  useAdminUserInvoices,
  useAdminUserPayments,
  useAdminUserRefunds,
  useDeliveryDetail,
  useDeliveryAttempts,
  useUpdateUserPlan,
  useUpdateUserStatus,
  useAdminSendEmail,
  useAdminImpersonate,
  useAdminRefundUser,
  useAdminGdprExport,
  useAdminGdprDelete,
  useAdminUserTestWebhook,
  useAdminAddNote,
  useAdminAddTag,
  useAdminRemoveTag,
  useAdminReplayDelivery,
} from '@/hooks/useAdminData';

const PLAN_OPTIONS = ['developer', 'startup', 'pro', 'enterprise'];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  // ── Data queries ──
  const { data: detail, isLoading: loading } = useAdminUserDetail(id);
  const { data: analytics } = useAdminUserAnalytics(id, 30);
  const { data: planHistoryData } = useAdminUserPlanHistory(id);

  // ── Tab state ──
  type TabKey = 'overview' | 'endpoints' | 'webhooks' | 'apikeys' | 'applications' | 'usage' | 'notes' | 'communications' | 'billing';
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // ── Plan selector ──
  const [newPlan, setNewPlan] = useState('');
  useEffect(() => {
    if (detail?.user?.plan) setNewPlan(detail.user.plan);
  }, [detail?.user?.plan]);

  // ── Tab-specific queries (only enabled when tab is active) ──
  const { data: endpointsData } = useAdminUserEndpoints(id);
  const [webhooksPage, setWebhooksPage] = useState(1);
  const [webhookFilter, setWebhookFilter] = useState<{ status?: string; event_type?: string }>({});
  const { data: webhooksData } = useAdminUserWebhooks(id, { page: webhooksPage, per_page: 50, ...webhookFilter });
  const { data: apiKeysData } = useAdminUserApiKeys(id);
  const { data: appsData } = useAdminUserApplications(id);
  const { data: usageData } = useAdminUserUsage(id);
  const { data: notesData } = useAdminUserNotes(id);
  const { data: tagsData } = useAdminUserTags(id);
  const [commsPage, setCommsPage] = useState(1);
  const [commFilter, setCommFilter] = useState<string>('');
  const { data: commsData } = useAdminUserCommunications(id, { page: commsPage, per_page: 50, type: commFilter || undefined });
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoiceFilter, setInvoiceFilter] = useState<string>('');
  const { data: invoicesData } = useAdminUserInvoices(id, { page: invoicesPage, per_page: 50, status: invoiceFilter || undefined });
  const { data: paymentsData } = useAdminUserPayments(id, 50);
  const { data: refundsData } = useAdminUserRefunds(id, 50);

  // ── Delivery detail modal ──
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const { data: deliveryDetail, isLoading: deliveryLoading } = useDeliveryDetail(selectedDeliveryId);
  const { data: deliveryAttemptsData } = useDeliveryAttempts(selectedDeliveryId);

  // ── Email modal ──
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // ── Notes/Tags form state ──
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  // ── Refund modal ──
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // ── GDPR state ──
  const [showGdprDeleteModal, setShowGdprDeleteModal] = useState(false);
  const [gdprDeleteReason, setGdprDeleteReason] = useState('');

  // ── Ban reason state ──
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  // ── Test Webhook modal ──
  const [showTestWebhookModal, setShowTestWebhookModal] = useState(false);
  const [testWebhookUrl, setTestWebhookUrl] = useState('');
  const [testWebhookEvent, setTestWebhookEvent] = useState('');
  const [testWebhookPayload, setTestWebhookPayload] = useState('{\n  "test": true\n}');
  const [testWebhookResult, setTestWebhookResult] = useState<{ status_code: number; response_body: string; duration_ms: number } | null>(null);

  // ── Mutations ──
  const updatePlanMutation = useUpdateUserPlan();
  const updateStatusMutation = useUpdateUserStatus();
  const sendEmailMutation = useAdminSendEmail();
  const impersonateMutation = useAdminImpersonate();
  const refundMutation = useAdminRefundUser();
  const gdprExportMutation = useAdminGdprExport();
  const gdprDeleteMutation = useAdminGdprDelete();
  const testWebhookMutation = useAdminUserTestWebhook();
  const addNoteMutation = useAdminAddNote();
  const addTagMutation = useAdminAddTag();
  const removeTagMutation = useAdminRemoveTag();
  const replayDeliveryMutation = useAdminReplayDelivery();

  // ── Derived data ──
  const planHistory = planHistoryData?.history ?? [];
  const userEndpoints = endpointsData?.endpoints ?? [];
  const userWebhooks = webhooksData?.webhooks ?? [];
  const webhooksTotal = webhooksData?.total ?? 0;
  const userApiKeys = apiKeysData?.api_keys ?? [];
  const userApps = appsData?.applications ?? [];
  const userUsage = usageData ?? null;
  const userNotes = notesData?.notes ?? [];
  const userTags = tagsData?.tags ?? [];
  const userComms = commsData?.communications ?? [];
  const commsTotal = commsData?.total ?? 0;
  const userInvoices = invoicesData?.invoices ?? [];
  const invoicesTotal = invoicesData?.total ?? 0;
  const userPayments = paymentsData?.payments ?? [];
  const userRefunds = refundsData?.refunds ?? [];
  const deliveryAttempts = deliveryAttemptsData ?? [];

  // ── Handlers ──
  const handleUpdatePlan = async () => {
    if (!id || !newPlan) return;
    try {
      await updatePlanMutation.mutateAsync({ userId: id, plan: newPlan });
      toast(t("planUpdated", { plan: newPlan }), "success");
    } catch {
      toast(t("failedToUpdatePlan"), "error");
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !detail) return;
    if (detail.user.status === 'active') {
      // Show ban reason modal
      setShowBanModal(true);
      setBanReason('');
      return;
    }
    // Activate user
    try {
      await updateStatusMutation.mutateAsync({ userId: id, status: 'active' });
      toast(t("userActivated"), "success");
    } catch {
      toast(t("failedToUpdateStatus"), "error");
    }
  };

  const handleConfirmBan = async () => {
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({
        userId: id,
        status: 'banned',
        reason: banReason.trim() || undefined,
      });
      toast(t("userBanned"), "success");
      setShowBanModal(false);
      setBanReason('');
    } catch {
      toast(t("failedToUpdateStatus"), "error");
    }
  };

  const handleReplay = async (deliveryId: string) => {
    try {
      await replayDeliveryMutation.mutateAsync({ userId: id, deliveryId });
      toast(t("replaySuccess"), "success");
    } catch {
      toast(t("replayFailed"), "error");
    }
  };

  const handleViewDelivery = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
  };

  const handleImpersonate = async () => {
    if (!id || !detail) return;
    try {
      const result = await impersonateMutation.mutateAsync(id);
      // Open window synchronously before async operations (avoids popup blocker)
      const newWindow = window.open('about:blank', '_blank');
      if (newWindow) {
        newWindow.location.href = `/${locale}/dashboard?impersonate_token=${result.token}`;
      }
      toast(t('impersonating') + `: ${detail.user.email}`, 'success');
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleSendEmail = async () => {
    if (!id || !emailSubject.trim() || !emailBody.trim()) return;
    try {
      await sendEmailMutation.mutateAsync({ userId: id, subject: emailSubject, body: emailBody });
      toast(t('emailSent'), 'success');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch {
      toast(t('emailSendFailed'), 'error');
    }
  };

  const handleRefund = async () => {
    if (!id || !refundAmount || !refundReason.trim()) return;
    const amountCents = Math.round(parseFloat(refundAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast(t('invalidAmount'), 'error');
      return;
    }
    try {
      await refundMutation.mutateAsync({ userId: id, amountCents, reason: refundReason.trim() });
      toast(t('refundSuccess'), 'success');
      setShowRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
    } catch {
      toast(t('refundFailed'), 'error');
    }
  };

  const handleTestWebhook = async () => {
    if (!id || !testWebhookUrl.trim()) return;
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(testWebhookPayload);
    } catch {
      toast(t('invalidJson'), 'error');
      return;
    }
    setTestWebhookResult(null);
    try {
      const result = await testWebhookMutation.mutateAsync({
        userId: id,
        data: {
          endpoint_url: testWebhookUrl.trim(),
          event_type: testWebhookEvent.trim() || undefined,
          payload,
        },
      });
      setTestWebhookResult(result);
      toast(t('testWebhookSent'), 'success');
    } catch {
      toast(t('testWebhookFailed'), 'error');
    }
  };

  const handleGdprExport = async () => {
    if (!id) return;
    try {
      const data = await gdprExportMutation.mutateAsync(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-export-${id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast(t('gdprExportSuccess'), 'success');
    } catch {
      toast(t('gdprExportFailed'), 'error');
    }
  };

  const handleGdprDelete = async () => {
    if (!id || !gdprDeleteReason.trim()) return;
    try {
      await gdprDeleteMutation.mutateAsync({ userId: id, reason: gdprDeleteReason.trim() });
      toast(t('gdprDeleteSuccess'), 'success');
      setShowGdprDeleteModal(false);
      setGdprDeleteReason('');
    } catch {
      toast(t('gdprDeleteFailed'), 'error');
    }
  };

  // ── Loading / Not found ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("userNotFound")}</h2>
        <button type="button"
          onClick={() => router.push('/admin/users')}
          className="text-brand-600 dark:text-brand-400 text-sm font-medium"
        >
          {t("backToUsers")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button type="button"
          onClick={() => router.push('/admin/users')}
          className="text-gray-500 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-400 transition"
        >
          {tc("back")}
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {detail.user.name || detail.user.email}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t("userDetail")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const activeEp = detail.endpoints?.find(e => e.is_active);
              setTestWebhookUrl(activeEp?.url || '');
              setShowTestWebhookModal(true);
            }}
            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition"
          >
            🪝 {t('testWebhook') || 'Test Webhook'}
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 transition"
          >
            📧 {t('sendEmail') || 'Send Email'}
          </button>
          <button
            onClick={handleImpersonate}
            className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 transition"
          >
            👁️ {t('impersonateUser')}
          </button>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
        {([
          { key: 'overview', label: '📊 ' + (t('overview') || 'Overview') },
          { key: 'endpoints', label: '🔗 ' + (t('endpoints') || 'Endpoints') },
          { key: 'webhooks', label: '📦 ' + (t('webhooks') || 'Webhooks') },
          { key: 'apikeys', label: '🔑 ' + (t('apiKeys') || 'API Keys') },
          { key: 'applications', label: '📱 ' + (t('applications') || 'Applications') },
          { key: 'usage', label: '📈 ' + (t('usage') || 'Usage') },
          { key: 'notes', label: '📝 ' + (t('notes') || 'Notes & Tags') },
          { key: 'communications', label: '💬 ' + (t('communications') || 'Communications') },
          { key: 'billing', label: '💰 ' + (t('billing') || 'Billing') },
        ] as { key: TabKey; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (<>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("userInfo")}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">ID</label>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{detail.user.id}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("email")}</label>
              <p className="text-sm text-gray-900 dark:text-white">{detail.user.email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("name")}</label>
              <p className="text-sm text-gray-900 dark:text-white">{detail.user.name || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("status")}</label>
              <div className="mt-1">
                <StatusBadge status={detail.user.status} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("created")}</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(detail.user.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Plan & Status Management */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("management")}</h2>

          <div className="space-y-6">
            {/* Plan Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {t("plan")}
              </label>
              <div className="flex gap-2">
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button type="button"
                  onClick={handleUpdatePlan}
                  disabled={newPlan === detail.user.plan}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-40"
                >
                  {t("update")}
                </button>
              </div>
            </div>

            {/* Status Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {t("accountStatus")}
              </label>
              <button type="button"
                onClick={handleToggleStatus}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  detail.user.status === 'active'
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20'
                }`}
              >
                {detail.user.status === 'active' ? t('banUser') : t('activateUser')}
              </button>
            </div>

            {/* Usage Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                {t("usageStats")}
              </label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">{t("totalDeliveries")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detail.usage_stats?.total_deliveries?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">{t("successRate")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detail.usage_stats?.success_rate || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">{t("endpoints")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detail.usage_stats?.endpoints_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("endpoints")}</h2>
          {detail.endpoints?.length ? (
            <div className="space-y-3">
              {detail.endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <p className="text-sm font-mono text-gray-900 dark:text-white truncate">{ep.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${ep.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {ep.is_active ? t('active') : t('inactive')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(ep.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noEndpoints")}</p>
          )}
        </div>
      </div>

      {/* Plan History */}
      {planHistory.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📋 {t("planHistory") || "Plan History"}</h2>
          </div>
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {planHistory.map((entry, i) => (
              <div key={i} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {String(entry.details?.new_plan || '—')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {t("changedBy") || "Changed by"}: {String(entry.details?.admin_email || 'system')}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Deliveries */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("recentDeliveries")}</h2>
        </div>
        {detail.recent_deliveries?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("event")}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("status")}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("attempts")}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("time")}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {detail.recent_deliveries.map((d, index) => (
                  <tr key={d.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer`} onClick={() => handleViewDelivery(d.id)}>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 10)}…</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">
                        {d.event || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{d.attempt_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button type="button"
                          onClick={() => handleViewDelivery(d.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                        >
                          🔍 {t("viewDetails") || "Details"}
                        </button>
                        <button type="button"
                          onClick={() => handleReplay(d.id)}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                        >
                          ↩ {t("replayDelivery")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">
            {t("noDeliveries")}
          </div>
        )}
      </div>

      {/* Customer Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Deliveries Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("dailyDeliveries")}</h2>
            <div className="h-48">
              {(analytics.daily_deliveries?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.daily_deliveries!.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                    <Bar dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noData")}</p>
              )}
            </div>
          </div>

          {/* Event Distribution */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("eventDistribution")}</h2>
            <div className="h-48">
              {(analytics.top_events?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.top_events!}
                      dataKey="count"
                      nameKey="event"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={4}
                    >
                      {analytics.top_events!.map((_, i) => (
                        <Cell key={i} fill={['#4c6ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noData")}</p>
              )}
            </div>
          </div>

          {/* Endpoint Health */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("endpointHealth")}</h2>
            <div className="space-y-3">
              {(analytics.endpoint_health?.length ?? 0) > 0 ? (
                analytics.endpoint_health!.map((ep, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <p className="text-xs font-mono text-gray-900 dark:text-white truncate">{ep.url}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1">
                        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ep.success_rate >= 99 ? 'bg-green-500' : ep.success_rate >= 95 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${ep.success_rate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-slate-400 w-12 text-right">{ep.success_rate}%</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">avg {ep.avg_latency_ms}ms</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noEndpoints")}</p>
              )}
            </div>
          </div>
        </div>
      )}
      </>)}

      {/* ═══ TAB: Endpoints ═══ */}
      {activeTab === "endpoints" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🔗 {t("endpoints") || "Endpoints"}</h2>
          {userEndpoints.length > 0 ? (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">URL</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("status") || "Status"}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("totalDeliveries") || "Deliveries"}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("lastDelivery") || "Last Delivery"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                    {userEndpoints.map((ep) => (
                      <tr key={ep.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs">{ep.url}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${ep.is_active ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"}`}>{ep.is_active ? t("active") || "Active" : t("inactive") || "Inactive"}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{ep.total_deliveries.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{ep.last_delivery_at ? new Date(ep.last_delivery_at).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noEndpoints") || "No endpoints"}</p>
          )}
        </div>
      )}

      {/* ═══ TAB: Webhooks ═══ */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📦 {t("webhooks") || "Webhooks"}</h2>
            <div className="flex items-center gap-2">
              <select value={webhookFilter.status || ""} onChange={(e) => { setWebhookFilter(f => ({ ...f, status: e.target.value || undefined })); setWebhooksPage(1); }} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                <option value="">{t("allStatuses") || "All Statuses"}</option>
                <option value="delivered">{t('statusDelivered')}</option>
                <option value="failed">{t('statusFailed')}</option>
                <option value="pending">{t('statusPending')}</option>
              </select>
              <span className="text-sm text-gray-500 dark:text-slate-400">{webhooksTotal} {t("total") || "total"}</span>
            </div>
          </div>
          {userWebhooks.length > 0 ? (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("event") || "Event"}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("status") || "Status"}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("attempts") || "Attempts"}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("time") || "Time"}</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc("actions") || "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                    {userWebhooks.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer" onClick={() => handleViewDelivery(d.id)}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 10)}…</td>
                        <td className="px-4 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">{d.event || "—"}</span></td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{d.attempt_count}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{new Date(d.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}><button onClick={() => handleViewDelivery(d.id)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">🔍</button><button onClick={() => handleReplay(d.id)} className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">↩</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {webhooksTotal > 50 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200/50 dark:border-slate-700/50">
                  <button onClick={() => setWebhooksPage(p => Math.max(1, p - 1))} disabled={webhooksPage === 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40">← {t("previous") || "Previous"}</button>
                  <span className="text-sm text-gray-500 dark:text-slate-400">{t("page") || "Page"} {webhooksPage}</span>
                  <button onClick={() => setWebhooksPage(p => p + 1)} disabled={userWebhooks.length < 50} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40">{t("next") || "Next"} →</button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noDeliveries") || "No deliveries"}</p>
          )}
        </div>
      )}

      {/* ═══ TAB: API Keys ═══ */}
      {activeTab === "apikeys" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🔑 {t("apiKeys") || "API Keys"}</h2>
          {userApiKeys.length > 0 ? (
            <div className="glass-card p-6">
              {userApiKeys.map((k, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{k.name}</p>
                    <p className="text-sm font-mono text-gray-500 dark:text-slate-400">{k.prefix}••••••••</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${k.is_active ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500"}`}>{k.is_active ? "Active" : "Inactive"}</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{new Date(k.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noApiKeys") || "No API keys"}</p>
          )}
        </div>
      )}

      {/* ═══ TAB: Applications ═══ */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📱 {t("applications") || "Applications"}</h2>
          {userApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userApps.map((app) => (
                <div key={app.id} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{app.endpoint_count} endpoints</span>
                  </div>
                  {app.description && <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{app.description}</p>}
                  <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noApplications") || "No applications"}</p>
          )}
        </div>
      )}

      {/* ═══ TAB: Usage ═══ */}
      {activeTab === "usage" && userUsage && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📈 {t("usageStats") || "Usage Statistics"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{userUsage.total_deliveries.toLocaleString()}</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("totalDeliveries") || "Total"}</p></div>
            <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{userUsage.success_rate}%</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("successRate") || "Success Rate"}</p></div>
            <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{userUsage.endpoints_count}</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("endpoints") || "Endpoints"}</p></div>
            <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userUsage.last_7_days.toLocaleString()}</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("last7Days") || "Last 7 Days"}</p></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">{t("deliveryBreakdown") || "Delivery Breakdown"}</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-slate-400">{t("delivered") || "Delivered"}</span><span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{userUsage.successful.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-slate-400">{t("failed") || "Failed"}</span><span className="text-sm font-semibold text-red-600 dark:text-red-400">{userUsage.failed.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-slate-400">{t("pending") || "Pending"}</span><span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{userUsage.pending.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">{t("topEvents") || "Top Events"}</h3>
              {userUsage.top_events.length > 0 ? (
                <div className="space-y-2">
                  {userUsage.top_events.map((ev, i) => (
                    <div key={i} className="flex justify-between items-center"><span className="text-sm text-gray-600 dark:text-slate-400 font-mono">{ev.event || "—"}</span><span className="text-sm font-semibold text-gray-900 dark:text-white">{ev.count.toLocaleString()}</span></div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400">{t("noData") || "No data"}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: Notes & Tags ═══ */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📝 {t("notesAndTags") || "Notes & Tags"}</h2>

          {/* Tags Section */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">🏷️ {t("tags") || "Tags"}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {userTags.length > 0 ? userTags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                  {tag.tag}
                  <button
                    onClick={async () => {
                      try {
                        await removeTagMutation.mutateAsync({ userId: id, tag: tag.tag });
                        toast(t("tagRemoved") || "Tag removed", "success");
                      } catch { toast(t("tagRemoveFailed") || "Failed", "error"); }
                    }}
                    className="ml-1 text-brand-500 hover:text-red-500 transition"
                  >✕</button>
                </span>
              )) : <span className="text-xs text-gray-400 dark:text-slate-500">{t("noTags") || "No tags yet"}</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={t("addTagPlaceholder") || "e.g. vip, at-risk, enterprise"}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    addTagMutation.mutateAsync({ userId: id, tag: newTag.trim() })
                      .then((res) => {
                        setNewTag('');
                        toast(res.message, "success");
                      })
                      .catch(() => toast(t("tagAddFailed") || "Failed", "error"));
                  }
                }}
              />
              <button
                onClick={async () => {
                  if (!newTag.trim()) return;
                  try {
                    const res = await addTagMutation.mutateAsync({ userId: id, tag: newTag.trim() });
                    setNewTag('');
                    toast(res.message, "success");
                  } catch { toast(t("tagAddFailed") || "Failed", "error"); }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition"
              >{t("addTag") || "Add Tag"}</button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">📋 {t("notes") || "Notes"}</h3>
            <div className="space-y-3 mb-4">
              {userNotes.length > 0 ? userNotes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-gray-400 dark:text-slate-500">{t("noNotes") || "No notes yet"}</p>}
            </div>
            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t("addNotePlaceholder") || "Write a note about this customer..."}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
              />
              <button
                onClick={async () => {
                  if (!newNote.trim()) return;
                  try {
                    await addNoteMutation.mutateAsync({ userId: id, content: newNote.trim() });
                    setNewNote('');
                    toast(t("noteAdded") || "Note added", "success");
                  } catch { toast(t("noteAddFailed") || "Failed", "error"); }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition"
              >{t("addNote") || "Add Note"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: Communications ═══ */}
      {activeTab === "communications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💬 {t("communications") || "Communication History"}</h2>
            <div className="flex gap-2">
              <select
                value={commFilter}
                onChange={(e) => { setCommFilter(e.target.value); setCommsPage(1); }}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="">{t("allTypes") || "All Types"}</option>
                <option value="email">📧 Email</option>
                <option value="impersonate">👤 Impersonate</option>
                <option value="plan_change">📋 Plan Change</option>
                <option value="ban">🚫 Ban/Activate</option>
                <option value="note">📝 Note</option>
                <option value="tag_added">🏷️ Tag Added</option>
                <option value="tag_removed">🏷️ Tag Removed</option>
              </select>
            </div>
          </div>

          {userComms.length > 0 ? (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("type") || "Type"}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("subject") || "Subject"}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("details") || "Details"}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {userComms.map((comm) => (
                    <tr key={comm.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          comm.type === 'email' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          comm.type === 'impersonate' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                          comm.type === 'plan_change' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                          comm.type === 'ban' || comm.type === 'activated' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          comm.type.startsWith('tag') ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' :
                          'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                        }`}>{comm.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{comm.subject || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate">{comm.details ? JSON.stringify(comm.details).slice(0, 100) : '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(comm.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noCommunications") || "No communication history yet"}</p>
          )}

          {commsTotal > 50 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setCommsPage((p) => Math.max(1, p - 1))} disabled={commsPage === 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">←</button>
              <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">{commsPage} / {Math.ceil(commsTotal / 50)}</span>
              <button onClick={() => setCommsPage((p) => p + 1)} disabled={commsPage >= Math.ceil(commsTotal / 50)} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">→</button>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Billing (Invoices + Payments + Refunds) ═══ */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💰 {t("billing") || "Billing"}</h2>
            {detail && detail.user.plan !== 'free' && detail.user.plan !== 'developer' && (
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                💸 {t("processRefund") || "Process Refund"}
              </button>
            )}
          </div>

          {/* Invoices */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">📄 {t("invoices") || "Invoices"}</h3>
              <select
                value={invoiceFilter}
                onChange={(e) => { setInvoiceFilter(e.target.value); setInvoicesPage(1); }}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="">{t("allStatuses") || "All Statuses"}</option>
                <option value="paid">✅ Paid</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
              </select>
            </div>
            {userInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("plan") || "Plan"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("amount") || "Amount"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("status") || "Status"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("provider") || "Provider"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {userInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">{inv.plan}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{(inv.amount_cents / 100).toFixed(2)} {inv.currency.toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            inv.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>{inv.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{inv.provider}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(inv.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500">{t("noInvoices") || "No invoices yet"}</p>
            )}
            {invoicesTotal > 50 && (
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => setInvoicesPage((p) => Math.max(1, p - 1))} disabled={invoicesPage === 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">←</button>
                <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">{invoicesPage} / {Math.ceil(invoicesTotal / 50)}</span>
                <button onClick={() => setInvoicesPage((p) => p + 1)} disabled={invoicesPage >= Math.ceil(invoicesTotal / 50)} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">→</button>
              </div>
            )}
          </div>

          {/* Payment Transactions */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">💳 {t("payments") || "Payment Transactions"}</h3>
            {userPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("amount") || "Amount"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("status") || "Status"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("provider") || "Provider"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("transactionId") || "Transaction ID"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {userPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{(pay.amount_cents / 100).toFixed(2)} {pay.currency.toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            pay.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            pay.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>{pay.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{pay.provider}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 font-mono">{pay.provider_transaction_id || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(pay.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500">{t("noPayments") || "No payment transactions yet"}</p>
            )}
          </div>

          {/* Refund History */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">💸 {t("refundHistory") || "Refund History"}</h3>
            {userRefunds.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("amount") || "Amount"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("reason") || "Reason"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("status") || "Status"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("provider") || "Provider"}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {userRefunds.map((ref) => (
                      <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">-{(ref.amount_cents / 100).toFixed(2)} {ref.currency.toUpperCase()}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 max-w-xs truncate">{ref.reason || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            ref.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            ref.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>{ref.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{ref.provider}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(ref.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500">{t("noRefunds") || "No refunds yet"}</p>
            )}
          </div>

          {/* GDPR Data Management */}
          <div className="glass-card p-6 border-2 border-amber-200 dark:border-amber-500/30">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">🔐 {t("gdprDataManagement") || "GDPR Data Management"}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              {t("gdprDesc") || "Export or permanently delete all user data per GDPR requirements."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleGdprExport}
                disabled={gdprExportMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {gdprExportMutation.isPending ? (t('exporting') || 'Exporting...') : `📦 ${t('exportData') || 'Export All Data'}`}
              </button>
              <button
                onClick={() => setShowGdprDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
              >
                🗑️ {t('deleteAllData') || 'Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Reason Modal */}
      {showBanModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBanModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚫 {t('banUser')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('banUserConfirm', { email: detail.user.email }) || `Are you sure you want to ban ${detail.user.email}?`}
            </p>
            <div className="mb-4">
              <label htmlFor="ban-reason-detail" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                {t('banReason') || 'Reason (optional)'}
              </label>
              <textarea
                id="ban-reason-detail"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder={t('banReasonPlaceholder') || 'Enter reason for banning this user...'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button"
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleConfirmBan}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                {t('banUser') || 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GDPR Delete Modal */}
      {showGdprDeleteModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGdprDeleteModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              🗑️ {t('deleteAllData') || 'Delete All User Data'}
            </h3>
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ {t('gdprDeleteWarning') || 'This action is permanent and cannot be undone.'}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {t('gdprDeleteDesc') || 'All endpoints, deliveries, invoices, notes, tags, and communication history will be deleted. The account will be downgraded to Free.'}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('deletingDataFor', { email: detail.user.email }) || `Deleting data for: ${detail.user.email}`}
            </p>
            <div>
              <label htmlFor="gdpr-reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('reason') || 'Reason'} *</label>
              <textarea
                id="gdpr-reason"
                value={gdprDeleteReason}
                onChange={(e) => setGdprDeleteReason(e.target.value)}
                placeholder={t('gdprReasonPlaceholder') || 'e.g. User requested via support ticket #1234'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowGdprDeleteModal(false); setGdprDeleteReason(''); }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleGdprDelete}
                disabled={gdprDeleteMutation.isPending || !gdprDeleteReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {gdprDeleteMutation.isPending ? (t('deleting') || 'Deleting...') : (t('confirmDelete') || 'Permanently Delete All Data')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRefundModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💸 {t('processRefund') || 'Process Refund'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('refundFor', { email: detail.user.email }) || `Refund for ${detail.user.email} (${detail.user.plan} plan)`}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="refund-amount" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('amount') || 'Amount'} (USD)</label>
                <input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="49.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="refund-reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('reason') || 'Reason'}</label>
                <textarea
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder={t('refundReasonPlaceholder') || 'Customer requested refund...'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleRefund}
                disabled={refundMutation.isPending || !refundAmount || !refundReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {refundMutation.isPending ? (t('processing') || 'Processing...') : (t('confirmRefund') || 'Confirm Refund')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEmailModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📧 {t('sendEmail') || 'Send Email'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('sendEmailTo', { email: detail.user.email }) || `Send email to ${detail.user.email}`}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('subject') || 'Subject'}</label>
                <input
                  id="email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="email-body" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('message') || 'Message'}</label>
                <textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailBody.trim()}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {sendEmailMutation.isPending ? tc('saving') : t('send') || 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Webhook Modal */}
      {showTestWebhookModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowTestWebhookModal(false); setTestWebhookResult(null); }} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🪝 {t('testWebhook') || 'Test Webhook'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('testWebhookDesc') || `Send a test webhook to ${detail.user.email}'s endpoint`}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="tw-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('endpointUrl') || 'Endpoint URL'} *</label>
                <input
                  id="tw-url"
                  type="url"
                  value={testWebhookUrl}
                  onChange={(e) => setTestWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="tw-event" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('eventType') || 'Event Type'}</label>
                <input
                  id="tw-event"
                  type="text"
                  value={testWebhookEvent}
                  onChange={(e) => setTestWebhookEvent(e.target.value)}
                  placeholder="order.created"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="tw-payload" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('payload') || 'Payload'} (JSON)</label>
                <textarea
                  id="tw-payload"
                  value={testWebhookPayload}
                  onChange={(e) => setTestWebhookPayload(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {/* Result */}
            {testWebhookResult && (
              <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-sm font-medium ${testWebhookResult.status_code < 400 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    HTTP {testWebhookResult.status_code}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {testWebhookResult.duration_ms}ms
                  </span>
                </div>
                <pre className="text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-32">
                  {testWebhookResult.response_body}
                </pre>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button type="button"
                onClick={() => { setShowTestWebhookModal(false); setTestWebhookResult(null); }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleTestWebhook}
                disabled={testWebhookMutation.isPending || !testWebhookUrl.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {testWebhookMutation.isPending ? (t('sending') || 'Sending...') : (t('sendTest') || 'Send Test')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Detail Modal */}
      {selectedDeliveryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDeliveryId(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🔍 {t("deliveryDetails") || "Delivery Details"}
              </h3>
              <button type="button"
                onClick={() => setSelectedDeliveryId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition"
              >
                ✕
              </button>
            </div>

            {deliveryLoading ? (
              <div className="py-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
            ) : deliveryDetail ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">ID</label>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{deliveryDetail.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("status")}</label>
                    <div className="mt-1"><StatusBadge status={deliveryDetail.status} /></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("event")}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{deliveryDetail.event || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("attempts")}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{deliveryDetail.attempt_count}</p>
                  </div>
                  {deliveryDetail.endpoint_url && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 dark:text-slate-400">{t("endpoint")}</label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{deliveryDetail.endpoint_url}</p>
                    </div>
                  )}
                  {deliveryDetail.error_message && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 dark:text-slate-400">{t("error")}</label>
                      <p className="text-sm text-red-600 dark:text-red-400">{deliveryDetail.error_message}</p>
                    </div>
                  )}
                </div>

                {/* Request Body */}
                {deliveryDetail.request_body && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">{t("payload") || "Payload"}</label>
                    <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-300 overflow-x-auto max-h-40">
                      {typeof deliveryDetail.request_body === 'string'
                        ? deliveryDetail.request_body
                        : JSON.stringify(deliveryDetail.request_body, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Request Headers */}
                {deliveryDetail.request_headers && Object.keys(deliveryDetail.request_headers).length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">{t("headers") || "Headers"}</label>
                    <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-300 overflow-x-auto max-h-32">
                      {JSON.stringify(deliveryDetail.request_headers, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Attempts */}
                {deliveryAttempts.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-2 block">{t("attempts") || "Attempts"}</label>
                    <div className="space-y-2">
                      {deliveryAttempts.map((a) => (
                        <div key={a.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                              #{a.attempt_number} — <StatusBadge status={a.status} />
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {a.duration_ms ? `${a.duration_ms}ms` : ''} {new Date(a.created_at).toLocaleString()}
                            </span>
                          </div>
                          {a.response_status && (
                            <p className="text-xs text-gray-600 dark:text-slate-400">HTTP {a.response_status}</p>
                          )}
                          {a.error_message && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{a.error_message}</p>
                          )}
                          {a.response_body && (
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-24">
                              {a.response_body}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
