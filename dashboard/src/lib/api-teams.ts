// Teams, notifications, broadcasts, alerts, inbound API clients

import { apiFetch } from './api';
import type { Team, TeamMember, TeamDetailResponse, NotificationListResponse, AlertRule, InboundConfig, UserBroadcast } from './api-types';

export const teamsApi = {
  list: (token: string) =>
    apiFetch<Team[]>('/teams', { token }),

  create: (token: string, data: { name: string; description?: string }) =>
    apiFetch<Team>('/teams', { method: 'POST', body: { name: data.name }, token }),

  listMembers: (token: string, teamId: string) =>
    apiFetch<TeamMember[]>(`/teams/${teamId}/members`, { token }),

  getDetail: (token: string, teamId: string) =>
    apiFetch<TeamDetailResponse>(`/teams/${teamId}`, { token }),

  update: (token: string, teamId: string, data: { name?: string; description?: string }) =>
    apiFetch<Team>(`/teams/${teamId}`, { method: 'PATCH', body: data, token }),

  inviteMember: (token: string, teamId: string, data: { email: string; role: string }) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/invite`, { method: 'POST', body: data, token }),

  removeMember: (token: string, teamId: string, memberId: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE', token }),

  updateRole: (token: string, teamId: string, memberId: string, role: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}/role`, { method: 'PUT', body: { role }, token }),

  acceptInvite: (token: string, inviteToken: string) =>
    apiFetch<{ team_id: string; role: string; message: string }>('/teams/accept-invite', { method: 'POST', body: { token: inviteToken }, token }),

  delete: (token: string, teamId: string) =>
    apiFetch<{ deleted: boolean }>(`/teams/${teamId}`, { method: 'DELETE', token }),

  leave: (token: string, teamId: string) =>
    apiFetch<{ left: boolean }>(`/teams/${teamId}/leave`, { method: 'POST', token }),

  transferOwnership: (token: string, teamId: string, newOwnerId: string) =>
    apiFetch<{ transferred: boolean; new_owner_id: string; message: string }>(`/teams/${teamId}/transfer`, { method: 'POST', body: { new_owner_id: newOwnerId }, token }),

  revokeInvite: (token: string, inviteId: string) =>
    apiFetch<{ revoked: boolean }>(`/teams/invites/${inviteId}`, { method: 'DELETE', token }),

  resendInvite: (token: string, inviteId: string) =>
    apiFetch<{ id: string; email: string; role: string; expires_at: string; invite_link: string }>(`/teams/invites/${inviteId}/resend`, { method: 'POST', token }),
};

export const notificationsApi = {
  list: (token: string, params?: { page?: number; type?: string; read?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.read !== undefined) searchParams.set('read', params.read.toString());
    const qs = searchParams.toString();
    return apiFetch<NotificationListResponse>(`/notifications${qs ? `?${qs}` : ''}`, { token });
  },

  getUnreadCount: (token: string) =>
    apiFetch<{ unread_count: number }>('/notifications/unread-count', { token }),

  markAsRead: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT', token }),

  markAllAsRead: (token: string) =>
    apiFetch<{ success: boolean }>('/notifications/read-all', { method: 'PUT', token }),

  deleteNotification: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}`, { method: 'DELETE', token }),
};

export const broadcastsApi = {
  listActive: (token: string, includeDismissed?: boolean) => {
    const qs = includeDismissed ? '?include_dismissed=true' : '';
    return apiFetch<UserBroadcast[]>(`/broadcasts${qs}`, { token });
  },

  dismiss: (token: string, id: string) =>
    apiFetch<{ dismissed: boolean }>(`/broadcasts/${id}/dismiss`, { method: 'POST', token }),

  getUnreadCount: (token: string) =>
    apiFetch<{ unread_count: number }>('/broadcasts/unread-count', { token }),
};

export const alertsApi = {
  list: (token?: string) =>
    apiFetch<AlertRule[]>('/alerts', { token }),

  create: (token: string | undefined, data: { name: string; condition: string; threshold: number; channels: string[] }) =>
    apiFetch<AlertRule>('/alerts', { method: 'POST', body: data, token }),

  update: (token: string | undefined, id: string, data: Partial<{ name: string; condition: string; threshold: number; channels: string[]; is_active: boolean }>) =>
    apiFetch<AlertRule>(`/alerts/${id}`, { method: 'PUT', body: data, token }),

  delete: (token: string | undefined, id: string) =>
    apiFetch<{ success: boolean }>(`/alerts/${id}`, { method: 'DELETE', token }),

  test: (token: string | undefined, id: string) =>
    apiFetch<{ success: boolean }>(`/alerts/${id}/test`, { method: 'POST', token }),
};

export const inboundApi = {
  listConfigs: (token?: string) =>
    apiFetch<InboundConfig[]>('/inbound/configs', { token }),

  createConfig: (token: string | undefined, data: { provider: string; endpoint_id?: string | null; secret: string }) =>
    apiFetch<InboundConfig>('/inbound/configs', { method: 'POST', body: data, token }),

  updateConfig: (token: string | undefined, id: string, data: { secret?: string; endpoint_id?: string | null; enabled?: boolean }) =>
    apiFetch<InboundConfig>(`/inbound/configs/${id}`, { method: 'PUT', body: data, token }),

  deleteConfig: (token: string | undefined, id: string) =>
    apiFetch<{ deleted: boolean }>(`/inbound/configs/${id}`, { method: 'DELETE', token }),
};
