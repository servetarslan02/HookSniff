'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
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

import { OverviewTab } from './components/OverviewTab';
import { EndpointsTab } from './components/EndpointsTab';
import { WebhooksTab } from './components/WebhooksTab';
import { ApiKeysTab } from './components/ApiKeysTab';
import { ApplicationsTab } from './components/ApplicationsTab';
import { UsageTab } from './components/UsageTab';
import { NotesTab } from './components/NotesTab';
import { CommunicationsTab } from './components/CommunicationsTab';
import { BillingTab } from './components/BillingTab';
import { UserModals } from './components/UserModals';
import type { TabKey } from './components/types';
import { AlertCircle, BarChart3, DollarSign, Eye, Key, Link2, Mail, MessageSquare, Notebook, Package, Smartphone, TrendingUp } from 'lucide-react';

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
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-48 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-32" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4 text-gray-400"><AlertCircle size={56} strokeWidth={1.5} /></div>
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
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {detail.user.name || detail.user.email}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{t("userDetail")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const activeEp = detail.endpoints?.find((e: any) => e.is_active);
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
            <Mail size={16} strokeWidth={1.75} className="inline mr-1" /> {t('sendEmail') || 'Send Email'}
          </button>
          <button
            onClick={handleImpersonate}
            className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 transition"
          >
            <Eye size={16} strokeWidth={1.75} className="inline mr-1" /> {t('impersonateUser')}
          </button>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
        {([
          { key: 'overview', label: t('overview') || 'Overview', icon: <BarChart3 size={14} strokeWidth={1.75} /> },
          { key: 'endpoints', label: t('endpoints') || 'Endpoints', icon: <Link2 size={14} strokeWidth={1.75} /> },
          { key: 'webhooks', label: t('webhooks') || 'Webhooks', icon: <Package size={14} strokeWidth={1.75} /> },
          { key: 'apikeys', label: t('apiKeys') || 'API Keys', icon: <Key size={14} strokeWidth={1.75} /> },
          { key: 'applications', label: t('applications') || 'Applications', icon: <Smartphone size={14} strokeWidth={1.75} /> },
          { key: 'usage', label: t('usage') || 'Usage', icon: <TrendingUp size={14} strokeWidth={1.75} /> },
          { key: 'notes', label: t('notes') || 'Notes & Tags', icon: <Notebook size={14} strokeWidth={1.75} /> },
          { key: 'communications', label: t('communications') || 'Communications', icon: <MessageSquare size={14} strokeWidth={1.75} /> },
          { key: 'billing', label: t('billing') || 'Billing', icon: <DollarSign size={14} strokeWidth={1.75} /> },
        ] as { key: TabKey; label: string; icon?: React.ReactNode }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          detail={detail}
          planHistory={planHistory}
          userEndpoints={userEndpoints}
          analytics={analytics}
          t={t}
          tc={tc}
          newPlan={newPlan}
          setNewPlan={setNewPlan}
          handleUpdatePlan={handleUpdatePlan}
          handleToggleStatus={handleToggleStatus}
          handleViewDelivery={handleViewDelivery}
          handleReplay={handleReplay}
        />
      )}

      {activeTab === "endpoints" && (
        <EndpointsTab userEndpoints={userEndpoints} t={t} />
      )}

      {activeTab === "webhooks" && (
        <WebhooksTab
          userWebhooks={userWebhooks}
          webhooksTotal={webhooksTotal}
          webhooksPage={webhooksPage}
          setWebhooksPage={setWebhooksPage}
          webhookFilter={webhookFilter}
          setWebhookFilter={setWebhookFilter}
          handleViewDelivery={handleViewDelivery}
          handleReplay={handleReplay}
          t={t}
          tc={tc}
        />
      )}

      {activeTab === "apikeys" && (
        <ApiKeysTab userApiKeys={userApiKeys} t={t} />
      )}

      {activeTab === "applications" && (
        <ApplicationsTab userApps={userApps} t={t} />
      )}

      {activeTab === "usage" && (
        <UsageTab userUsage={userUsage} t={t} />
      )}

      {activeTab === "notes" && (
        <NotesTab
          userTags={userTags}
          userNotes={userNotes}
          newTag={newTag}
          setNewTag={setNewTag}
          newNote={newNote}
          setNewNote={setNewNote}
          id={id}
          addTagMutation={addTagMutation}
          removeTagMutation={removeTagMutation}
          addNoteMutation={addNoteMutation}
          t={t}
        />
      )}

      {activeTab === "communications" && (
        <CommunicationsTab
          userComms={userComms}
          commsTotal={commsTotal}
          commsPage={commsPage}
          setCommsPage={setCommsPage}
          commFilter={commFilter}
          setCommFilter={setCommFilter}
          t={t}
          tc={tc}
        />
      )}

      {activeTab === "billing" && (
        <BillingTab
          detail={detail}
          userInvoices={userInvoices}
          invoicesTotal={invoicesTotal}
          invoicesPage={invoicesPage}
          setInvoicesPage={setInvoicesPage}
          invoiceFilter={invoiceFilter}
          setInvoiceFilter={setInvoiceFilter}
          userPayments={userPayments}
          userRefunds={userRefunds}
          handleGdprExport={handleGdprExport}
          handleGdprDelete={handleGdprDelete}
          gdprExportMutation={gdprExportMutation}
          showGdprDeleteModal={showGdprDeleteModal}
          setShowGdprDeleteModal={setShowGdprDeleteModal}
          gdprDeleteReason={gdprDeleteReason}
          setGdprDeleteReason={setGdprDeleteReason}
          t={t}
          tc={tc}
          setShowRefundModal={setShowRefundModal}
        />
      )}

      <UserModals
        detail={detail}
        showBanModal={showBanModal}
        setShowBanModal={setShowBanModal}
        banReason={banReason}
        setBanReason={setBanReason}
        handleConfirmBan={handleConfirmBan}
        showEmailModal={showEmailModal}
        setShowEmailModal={setShowEmailModal}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailBody={emailBody}
        setEmailBody={setEmailBody}
        handleSendEmail={handleSendEmail}
        sendEmailMutation={sendEmailMutation}
        showRefundModal={showRefundModal}
        setShowRefundModal={setShowRefundModal}
        refundAmount={refundAmount}
        setRefundAmount={setRefundAmount}
        refundReason={refundReason}
        setRefundReason={setRefundReason}
        handleRefund={handleRefund}
        refundMutation={refundMutation}
        showTestWebhookModal={showTestWebhookModal}
        setShowTestWebhookModal={setShowTestWebhookModal}
        testWebhookUrl={testWebhookUrl}
        setTestWebhookUrl={setTestWebhookUrl}
        testWebhookEvent={testWebhookEvent}
        setTestWebhookEvent={setTestWebhookEvent}
        testWebhookPayload={testWebhookPayload}
        setTestWebhookPayload={setTestWebhookPayload}
        testWebhookResult={testWebhookResult}
        setTestWebhookResult={setTestWebhookResult}
        handleTestWebhook={handleTestWebhook}
        testWebhookMutation={testWebhookMutation}
        showGdprDeleteModal={showGdprDeleteModal}
        setShowGdprDeleteModal={setShowGdprDeleteModal}
        gdprDeleteReason={gdprDeleteReason}
        setGdprDeleteReason={setGdprDeleteReason}
        handleGdprDelete={handleGdprDelete}
        gdprDeleteMutation={gdprDeleteMutation}
        selectedDeliveryId={selectedDeliveryId}
        setSelectedDeliveryId={setSelectedDeliveryId}
        deliveryDetail={deliveryDetail}
        deliveryLoading={deliveryLoading}
        deliveryAttempts={deliveryAttempts}
        t={t}
        tc={tc}
      />
    </div>
  );
}
