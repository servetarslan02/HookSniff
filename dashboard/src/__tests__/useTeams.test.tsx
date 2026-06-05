// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1' } }),
}));

vi.mock('@/lib/api', () => ({
  teamsApi: {
    list: vi.fn().mockResolvedValue([]),
    listMembers: vi.fn().mockResolvedValue([]),
    getDetail: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({ id: 't1', name: 'Test' }),
    update: vi.fn().mockResolvedValue({}),
    inviteMember: vi.fn().mockResolvedValue({ success: true }),
    removeMember: vi.fn().mockResolvedValue({ success: true }),
    updateRole: vi.fn().mockResolvedValue({ success: true }),
    acceptInvite: vi.fn().mockResolvedValue({ team_id: 't1', role: 'viewer' }),
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    leave: vi.fn().mockResolvedValue({ left: true }),
    transferOwnership: vi.fn().mockResolvedValue({ transferred: true }),
    revokeInvite: vi.fn().mockResolvedValue({ revoked: true }),
    resendInvite: vi.fn().mockResolvedValue({ id: 'inv1' }),
  },
}));

import {
  useTeams, useTeamMembers, useTeamDetail,
  useCreateTeam, useUpdateTeam, useInviteTeamMember,
  useRemoveTeamMember, useUpdateTeamMemberRole,
  useAcceptTeamInvite, useDeleteTeam, useLeaveTeam,
  useTransferOwnership, useRevokeInvite, useResendInvite,
} from '@/hooks/useTeams';
import { teamsApi } from '@/lib/api';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useTeams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches teams list', async () => {
    (teamsApi.list as any).mockResolvedValue([{ id: 't1', name: 'Team A' }]);
    const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('normalizes non-array response to empty array', async () => {
    (teamsApi.list as any).mockResolvedValue(null);
    const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('useTeamMembers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches members when teamId provided', async () => {
    (teamsApi.listMembers as any).mockResolvedValue([{ id: 'm1', email: 'a@b.com' }]);
    const { result } = renderHook(() => useTeamMembers('t1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.listMembers).toHaveBeenCalledWith('test-token', 't1');
  });

  it('does not fetch when teamId is null', () => {
    const { result } = renderHook(() => useTeamMembers(null), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(false);
    expect(teamsApi.listMembers).not.toHaveBeenCalled();
  });
});

describe('useTeamDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches team detail', async () => {
    (teamsApi.getDetail as any).mockResolvedValue({ team: { id: 't1' }, members: [] });
    const { result } = renderHook(() => useTeamDetail('t1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.getDetail).toHaveBeenCalledWith('test-token', 't1');
  });
});

describe('Team mutations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useCreateTeam calls teamsApi.create', async () => {
    const { result } = renderHook(() => useCreateTeam(), { wrapper: createWrapper() });
    result.current.mutate({ name: 'New Team' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.create).toHaveBeenCalledWith('test-token', { name: 'New Team' });
  });

  it('useUpdateTeam calls teamsApi.update', async () => {
    const { result } = renderHook(() => useUpdateTeam(), { wrapper: createWrapper() });
    result.current.mutate({ teamId: 't1', data: { name: 'Updated' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.update).toHaveBeenCalledWith('test-token', 't1', { name: 'Updated' });
  });

  it('useInviteTeamMember calls teamsApi.inviteMember', async () => {
    const { result } = renderHook(() => useInviteTeamMember(), { wrapper: createWrapper() });
    result.current.mutate({ teamId: 't1', data: { email: 'a@b.com', role: 'viewer' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.inviteMember).toHaveBeenCalledWith('test-token', 't1', { email: 'a@b.com', role: 'viewer' });
  });

  it('useRemoveTeamMember calls teamsApi.removeMember', async () => {
    const { result } = renderHook(() => useRemoveTeamMember(), { wrapper: createWrapper() });
    result.current.mutate({ teamId: 't1', memberId: 'm1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.removeMember).toHaveBeenCalledWith('test-token', 't1', 'm1');
  });

  it('useUpdateTeamMemberRole calls teamsApi.updateRole', async () => {
    const { result } = renderHook(() => useUpdateTeamMemberRole(), { wrapper: createWrapper() });
    result.current.mutate({ teamId: 't1', memberId: 'm1', role: 'admin' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.updateRole).toHaveBeenCalledWith('test-token', 't1', 'm1', 'admin');
  });

  it('useAcceptTeamInvite calls teamsApi.acceptInvite', async () => {
    const { result } = renderHook(() => useAcceptTeamInvite(), { wrapper: createWrapper() });
    result.current.mutate('invite-token-123');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.acceptInvite).toHaveBeenCalledWith('test-token', 'invite-token-123');
  });

  it('useDeleteTeam calls teamsApi.delete', async () => {
    const { result } = renderHook(() => useDeleteTeam(), { wrapper: createWrapper() });
    result.current.mutate('t1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.delete).toHaveBeenCalledWith('test-token', 't1');
  });

  it('useLeaveTeam calls teamsApi.leave', async () => {
    const { result } = renderHook(() => useLeaveTeam(), { wrapper: createWrapper() });
    result.current.mutate('t1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.leave).toHaveBeenCalledWith('test-token', 't1');
  });

  it('useTransferOwnership calls teamsApi.transferOwnership', async () => {
    const { result } = renderHook(() => useTransferOwnership(), { wrapper: createWrapper() });
    result.current.mutate({ teamId: 't1', newOwnerId: 'u2' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.transferOwnership).toHaveBeenCalledWith('test-token', 't1', 'u2');
  });

  it('useRevokeInvite calls teamsApi.revokeInvite', async () => {
    const { result } = renderHook(() => useRevokeInvite(), { wrapper: createWrapper() });
    result.current.mutate('inv1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.revokeInvite).toHaveBeenCalledWith('test-token', 'inv1');
  });

  it('useResendInvite calls teamsApi.resendInvite', async () => {
    const { result } = renderHook(() => useResendInvite(), { wrapper: createWrapper() });
    result.current.mutate('inv1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(teamsApi.resendInvite).toHaveBeenCalledWith('test-token', 'inv1');
  });
});
