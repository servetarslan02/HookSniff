'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import { useSsoConfig } from '@/hooks/useDashboardData';
import { useTeams } from '@/hooks/useTeams';
import { IDP_TEMPLATES, getFriendlyError } from './sso-utils';

/* ─── SSO Handlers Hook ─── */
export function useSsoHandlers(teamIdProp?: string) {
  const t = useTranslations('sso');
  const { token, user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const teamId = teamIdProp || searchParams.get('team_id') || undefined;
  const { data: ssoConfig, isLoading: loading, refetch } = useSsoConfig(teamId);
  const isEnterprise = user?.plan === 'enterprise';

  // Form state
  const [provider, setProvider] = useState<'saml' | 'oidc'>('saml');
  const [metadata, setMetadata] = useState('');
  const [entityId, setEntityId] = useState('');
  const [ssoUrl, setSsoUrl] = useState('');
  const [certificate, setCertificate] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [defaultTeamId, setDefaultTeamId] = useState<string>('');
  const [defaultRole, setDefaultRole] = useState<string>('viewer');
  const [clientSecret, setClientSecret] = useState('');

  // Role & Team mapping
  const [roleMapping, setRoleMapping] = useState<string>('{}');
  const [teamMapping, setTeamMapping] = useState<string>('{}');
  const [roleMappingError, setRoleMappingError] = useState<string>('');
  const [teamMappingError, setTeamMappingError] = useState<string>('');
  const [roleEntries, setRoleEntries] = useState<Array<{ group: string; role: string }>>([]);
  const [teamEntries, setTeamEntries] = useState<Array<{ domain: string; teamId: string }>>([]);
  const [defaultMappingRole, setDefaultMappingRole] = useState<string>('viewer');

  // SAML metadata
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // SCIM
  const [scimEnabled, setScimEnabled] = useState(false);
  const [scimToken, setScimToken] = useState('');
  const [showScimToken, setShowScimToken] = useState(false);

  const { data: teams = [] } = useTeams();
  const [testPassed, setTestPassed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enforcing, setEnforcing] = useState(false);
  const [showEnforceModal, setShowEnforceModal] = useState(false);
  const [adminBypass, setAdminBypass] = useState(true);
  const [domainInput, setDomainInput] = useState('');
  const [txtRecord, setTxtRecord] = useState('');
  const [generatingTxt, setGeneratingTxt] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [domainVerified, setDomainVerified] = useState<boolean | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [testAndActivateLoading, setTestAndActivateLoading] = useState(false);
  const [friendlyError, setFriendlyError] = useState<{ title: string; message: string; action?: string } | null>(null);

  // Derived
  const hasFormConfig = provider === 'oidc' ? !!(metadata && entityId) : !!(metadata || entityId || ssoUrl || certificate);
  const isConfigured = !!(ssoConfig?.provider || ssoConfig?.issuer_url || ssoConfig?.client_id) || hasFormConfig;
  const isEnforced = ssoConfig?.enabled;

  // Populate form from config
  useEffect(() => {
    if (ssoConfig?.provider) {
      setProvider(ssoConfig.provider as 'saml' | 'oidc');
      setMetadata(ssoConfig.metadata_url || ssoConfig.issuer_url || '');
      setEntityId(ssoConfig.entity_id || ssoConfig.client_id || '');
      setSsoUrl(ssoConfig.sso_url || '');
      setDefaultTeamId(ssoConfig.default_team_id || '');
      setDefaultRole(ssoConfig.default_role || 'viewer');
      setDomainInput(ssoConfig.verified_domain || '');
      setAdminBypass(ssoConfig.admin_bypass ?? true);
      setClientSecret('');
      if (ssoConfig.role_mapping && typeof ssoConfig.role_mapping === 'object') {
        const entries = Object.entries(ssoConfig.role_mapping)
          .filter(([k]) => k !== 'default')
          .map(([group, role]) => ({ group, role: role as string }));
        setRoleEntries(entries);
        if (ssoConfig.role_mapping.default) setDefaultMappingRole(ssoConfig.role_mapping.default as string);
        setRoleMapping(JSON.stringify(ssoConfig.role_mapping));
      }
      if (ssoConfig.team_mapping && typeof ssoConfig.team_mapping === 'object') {
        const entries = Object.entries(ssoConfig.team_mapping)
          .filter(([k]) => k !== 'default')
          .map(([domain, teamId]) => ({ domain, teamId: teamId as string }));
        setTeamEntries(entries);
        setTeamMapping(JSON.stringify(ssoConfig.team_mapping));
      }
    }
  }, [ssoConfig, loading]);

  // Sync visual entries → JSON
  useEffect(() => {
    const obj: Record<string, string> = {};
    for (const e of roleEntries) {
      if (e.group.trim()) obj[e.group.trim()] = e.role;
    }
    if (defaultMappingRole !== 'viewer') obj.default = defaultMappingRole;
    setRoleMapping(JSON.stringify(obj));
  }, [roleEntries, defaultMappingRole]);

  useEffect(() => {
    const obj: Record<string, string> = {};
    for (const e of teamEntries) {
      if (e.domain.trim() && e.teamId.trim()) obj[e.domain.trim()] = e.teamId.trim();
    }
    setTeamMapping(JSON.stringify(obj));
  }, [teamEntries]);

  // ── Handlers ──

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = IDP_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    setProvider(template.provider);
    setFriendlyError(null);
    if (template.provider === 'oidc') {
      if ('issuerUrl' in template && template.issuerUrl) setMetadata(template.issuerUrl);
      else setMetadata('');
      setEntityId('');
      setClientSecret('');
    } else {
      setMetadata('');
      setSsoUrl('');
      setEntityId(template.entityIdPlaceholder || 'urn:hooksniff:sp');
      setCertificate('');
    }
  };

  const handleMetadataChange = useCallback((value: string) => {
    setMetadata(value);
    setFriendlyError(null);
    if (!value || selectedTemplate) return;
    const lower = value.toLowerCase();
    if (lower.includes('login.microsoftonline.com')) { setSelectedTemplate('azure'); setProvider('oidc'); }
    else if (lower.includes('accounts.google.com')) { setSelectedTemplate('google'); setProvider('oidc'); }
    else if (lower.includes('.okta.com')) { setSelectedTemplate('okta'); setProvider('oidc'); }
    else if (lower.includes('auth0.com')) { setSelectedTemplate('auth0'); setProvider('oidc'); }
    else if (lower.includes('/realms/')) { setSelectedTemplate('keycloak'); setProvider('oidc'); }
    else if (lower.includes('onelogin.com')) { setSelectedTemplate('onelogin'); setProvider('saml'); }
    else if (lower.includes('/adfs/') || lower.includes('federationmetadata')) { setSelectedTemplate('adfs'); setProvider('saml'); }
  }, [selectedTemplate]);

  const handleFetchSamlMetadata = async () => {
    if (!metadata || !token) return;
    setFetchingMetadata(true);
    setFriendlyError(null);
    try {
      const queryStr = teamId ? `?team_id=${teamId}` : '';
      const result = await apiFetch<{ sso_url?: string; certificate?: string; entity_id?: string; valid: boolean; issues?: string[] }>(`/sso/test${queryStr}`, {
        method: 'POST', body: {}, token,
      });
      if (result.valid) {
        toast(t('metadataFetched') || 'Metadata fetched successfully!', 'success');
      } else {
        const msg = result.issues?.[0] || 'Could not fetch metadata';
        setFriendlyError(getFriendlyError(msg));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch metadata';
      setFriendlyError(getFriendlyError(msg));
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleTestAndActivate = async () => {
    if (!token) return;
    setTestAndActivateLoading(true);
    setFriendlyError(null);
    try {
      const body: Record<string, unknown> = { provider, enabled: false, admin_bypass: adminBypass };
      if (teamId) body.team_id = teamId;
      if (provider === 'saml') {
        body.metadata_url = metadata || null;
        body.entity_id = entityId || null;
        body.sso_url = ssoUrl || null;
        if (certificate) body.certificate = certificate;
      } else {
        body.issuer_url = metadata || null;
        body.client_id = entityId || null;
        if (clientSecret) body.client_secret = clientSecret;
      }
      if (domainInput.trim()) body.verified_domain = domainInput.trim();
      body.default_team_id = defaultTeamId || null;
      body.default_role = defaultRole || 'viewer';
      try { body.role_mapping = JSON.parse(roleMapping); setRoleMappingError(''); } catch { setRoleMappingError('Invalid JSON'); return; }
      try { body.team_mapping = JSON.parse(teamMapping); setTeamMappingError(''); } catch { setTeamMappingError('Invalid JSON'); return; }
      body.scim_enabled = scimEnabled;
      if (scimToken) body.scim_token = scimToken;

      await apiFetch('/sso/config', { method: 'POST', body, token });
      const { ssoApi } = await import('@/lib/api');
      const result = await ssoApi.testSso(token, teamId);
      if (!result.valid) {
        const errorMsg = result.issues ? (Array.isArray(result.issues) ? result.issues[0] : result.issues) : result.message || 'Test failed';
        setFriendlyError(getFriendlyError(errorMsg));
        toast(errorMsg, 'error');
        setTestAndActivateLoading(false);
        return;
      }
      body.enabled = true;
      await apiFetch('/sso/config', { method: 'POST', body, token });
      setTestPassed(true);
      toast(t('ssoActivated') || 'SSO activated successfully', 'success');
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setFriendlyError(getFriendlyError(msg));
      toast(msg, 'error');
    } finally {
      setTestAndActivateLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { provider, enabled: isEnforced ?? false, admin_bypass: adminBypass };
      if (teamId) body.team_id = teamId;
      if (provider === 'saml') {
        body.metadata_url = metadata || null;
        body.entity_id = entityId || null;
        body.sso_url = ssoUrl || null;
        if (certificate) body.certificate = certificate;
      } else {
        body.issuer_url = metadata || null;
        body.client_id = entityId || null;
        if (clientSecret) body.client_secret = clientSecret;
      }
      if (domainInput.trim()) body.verified_domain = domainInput.trim();
      body.default_team_id = defaultTeamId || null;
      body.default_role = defaultRole || 'viewer';
      await apiFetch('/sso/config', { method: 'POST', body, token });
      toast(t('saved'), 'success');
      setFriendlyError(null);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('saveFailed');
      setFriendlyError(getFriendlyError(msg));
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!token) return;
    setTesting(true);
    setTestPassed(false);
    try {
      const { ssoApi } = await import('@/lib/api');
      const result = await ssoApi.testSso(token, teamId);
      if (result.valid) {
        setTestPassed(true);
        setFriendlyError(null);
        toast(result.message || t('testSuccess'), 'success');
      } else {
        const issues = result.issues ? (Array.isArray(result.issues) ? result.issues.join(', ') : result.issues) : null;
        const errorMsg = issues || result.message || t('testFailed');
        setFriendlyError(getFriendlyError(errorMsg));
        toast(errorMsg, 'error');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('testFailed');
      setFriendlyError(getFriendlyError(msg));
      toast(msg, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleEnforce = async () => {
    if (!token) return;
    setEnforcing(true);
    try {
      const body: Record<string, unknown> = { provider: ssoConfig?.provider || provider, enabled: true, admin_bypass: adminBypass };
      if (teamId) body.team_id = teamId;
      await apiFetch('/sso/config', { method: 'POST', body, token });
      toast(t('enforced'), 'success');
      setShowEnforceModal(false);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('enforceFailed'), 'error');
    } finally {
      setEnforcing(false);
    }
  };

  const handleDisable = async () => {
    if (!token) return;
    if (!window.confirm(t('disableConfirm'))) return;
    setEnforcing(true);
    try {
      const body: Record<string, unknown> = { provider: ssoConfig?.provider || provider, enabled: false };
      if (teamId) body.team_id = teamId;
      await apiFetch('/sso/config', { method: 'POST', body, token });
      toast(t('disabled'), 'success');
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('disableFailed'), 'error');
    } finally {
      setEnforcing(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!window.confirm(t('deleteConfirm'))) return;
    setDeleting(true);
    try {
      const { ssoApi } = await import('@/lib/api');
      await ssoApi.deleteSso(token, teamId);
      toast(t('deleted'), 'success');
      setMetadata(''); setEntityId(''); setSsoUrl(''); setCertificate(''); setClientSecret('');
      setTestPassed(false);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('deleteFailed'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateTxtRecord = async () => {
    if (!token || !domainInput.trim()) return;
    setGeneratingTxt(true);
    setTxtRecord('');
    setDomainVerified(null);
    try {
      const result = await apiFetch<{ txt_record: string; instructions: string }>('/sso/verify-domain', {
        method: 'POST', body: { domain: domainInput.trim() }, token,
      });
      setTxtRecord(result.txt_record);
    } catch (err) {
      toast(err instanceof Error ? err.message : (t('generateTxtFailed') || 'Failed to generate TXT record'), 'error');
    } finally {
      setGeneratingTxt(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!token || !domainInput.trim()) return;
    setVerifyingDomain(true);
    setDomainVerified(null);
    try {
      const result = await apiFetch<{ verified: boolean; message: string }>('/sso/verify-domain/check', {
        method: 'POST', body: { domain: domainInput.trim() }, token,
      });
      setDomainVerified(result.verified);
      if (result.verified) { toast(result.message, 'success'); refetch(); }
      else { toast(result.message, 'error'); }
    } catch (err) {
      toast(err instanceof Error ? err.message : (t('verifyFailed') || 'Verification failed'), 'error');
      setDomainVerified(false);
    } finally {
      setVerifyingDomain(false);
    }
  };

  const ssoLoginUrl = user?.email
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/v1/sso/login?email=${encodeURIComponent(user.email)}`
    : null;

  return {
    // State
    t, token, user, teamId, ssoConfig, loading, refetch, isEnterprise,
    provider, setProvider, metadata, setMetadata, entityId, setEntityId,
    ssoUrl, setSsoUrl, certificate, setCertificate, saving, testing,
    defaultTeamId, setDefaultTeamId, defaultRole, setDefaultRole,
    clientSecret, setClientSecret, roleMapping, setRoleMapping,
    teamMapping, setTeamMapping, roleMappingError, teamMappingError,
    roleEntries, setRoleEntries, teamEntries, setTeamEntries,
    defaultMappingRole, setDefaultMappingRole, fetchingMetadata,
    scimEnabled, setScimEnabled, scimToken, setScimToken,
    showScimToken, setShowScimToken, teams, testPassed, deleting,
    enforcing, showEnforceModal, setShowEnforceModal, adminBypass,
    setAdminBypass, domainInput, setDomainInput, txtRecord,
    generatingTxt, verifyingDomain, domainVerified, selectedTemplate,
    testAndActivateLoading, friendlyError, setFriendlyError,
    // Derived
    hasFormConfig, isConfigured, isEnforced,
    // Handlers
    handleTemplateSelect, handleMetadataChange, handleFetchSamlMetadata,
    handleTestAndActivate, handleSave, handleTest, handleEnforce,
    handleDisable, handleDelete, handleGenerateTxtRecord, handleVerifyDomain,
    ssoLoginUrl,
  };
}
