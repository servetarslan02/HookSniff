// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockTeamsList = vi.fn().mockResolvedValue([
  { id: 't1', name: 'Team 1', description: 'Test team', created_at: '2024-01-01', member_count: 2 },
]);
const mockTeamsListMembers = vi.fn().mockResolvedValue([
  { id: 'm1', user_id: 'u1', email: 'member@test.com', name: 'Member', role: 'member', joined_at: '2024-01-01' },
]);

vi.mock('@/lib/api', () => ({
  teamsApi: {
    list: mockTeamsList,
    create: vi.fn().mockResolvedValue({}),
    listMembers: mockTeamsListMembers,
    inviteMember: vi.fn().mockResolvedValue({}),
    removeMember: vi.fn().mockResolvedValue({}),
    updateRole: vi.fn().mockResolvedValue({}),
  },
}));

const { default: TeamPage } = await import('@/app/[locale]/dashboard/team/page');

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamsList.mockResolvedValue([
      { id: 't1', name: 'Team 1', description: 'Test team', created_at: '2024-01-01', member_count: 2 },
    ]);
    mockTeamsListMembers.mockResolvedValue([
      { id: 'm1', user_id: 'u1', email: 'member@test.com', name: 'Member', role: 'member', joined_at: '2024-01-01' },
    ]);
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(TeamPage));
    });
  });

  it('fetches teams on mount', async () => {
    await act(async () => {
      render(React.createElement(TeamPage));
    });
    expect(mockTeamsList).toHaveBeenCalledWith('test-token');
  });

  it('displays team title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('team.title');
  });

  it('shows empty state when no teams', async () => {
    mockTeamsList.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('team.noTeams');
  });
});
