// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { name: 'Test', email: 'test@test.com', plan: 'free' }, apiKey: 'sk_test_123', logout: vi.fn() }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

const mockTeamsList = vi.fn();
const mockTeamsCreate = vi.fn();
const mockTeamsListMembers = vi.fn();
const mockTeamsInviteMember = vi.fn();
const mockTeamsRemoveMember = vi.fn();
const mockTeamsUpdateRole = vi.fn();

vi.mock('@/lib/api', () => ({
  teamsApi: {
    list: mockTeamsList,
    create: mockTeamsCreate,
    listMembers: mockTeamsListMembers,
    inviteMember: mockTeamsInviteMember,
    removeMember: mockTeamsRemoveMember,
    updateRole: mockTeamsUpdateRole,
  },
}));

const { default: TeamPage } = await import('@/app/[locale]/dashboard/team/page');

const MOCK_TEAMS = [
  { id: 't1', name: 'Team Alpha', description: 'Alpha team desc', created_at: '2024-01-15', member_count: 3 },
  { id: 't2', name: 'Team Beta', description: 'Beta team', created_at: '2024-02-20', member_count: 1 },
];

const MOCK_MEMBERS = [
  { id: 'm1', user_id: 'u1', email: 'alice@example.com', name: 'Alice', role: 'owner', joined_at: '2024-01-15' },
  { id: 'm2', user_id: 'u2', email: 'bob@example.com', name: 'Bob', role: 'admin', joined_at: '2024-01-20' },
  { id: 'm3', user_id: 'u3', email: 'charlie@example.com', name: 'Charlie', role: 'member', joined_at: '2024-02-01' },
];

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamsList.mockResolvedValue(MOCK_TEAMS);
    mockTeamsCreate.mockResolvedValue({ id: 't3', name: 'New Team' });
    mockTeamsListMembers.mockResolvedValue(MOCK_MEMBERS);
    mockTeamsInviteMember.mockResolvedValue({});
    mockTeamsRemoveMember.mockResolvedValue({});
    mockTeamsUpdateRole.mockResolvedValue({});
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

  it('displays page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('team.title');
  });

  it('displays team names from API', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Team Alpha');
    expect(container!.textContent).toContain('Team Beta');
  });

  it('displays team descriptions', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Alpha team desc');
  });

  it('displays member counts', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('3 members');
    expect(container!.textContent).toContain('1 members');
  });

  it('shows loading state initially', async () => {
    let container: HTMLElement;
    // Make fetch hang
    mockTeamsList.mockReturnValue(new Promise(() => {}));
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Loading teams...');
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

  it('handles fetch teams error', async () => {
    mockTeamsList.mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      render(React.createElement(TeamPage));
    });
    expect(mockToast).toHaveBeenCalledWith('Failed to load teams', 'error');
  });

  it('selects a team and fetches members', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    // Click on first team
    const teamButtons = container!.querySelectorAll('button');
    const teamButton = Array.from(teamButtons).find(b => b.textContent?.includes('Team Alpha'));
    expect(teamButton).toBeTruthy();
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    expect(mockTeamsListMembers).toHaveBeenCalledWith('test-token', 't1');
  });

  it('displays members after selecting team', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Alice');
      expect(container!.textContent).toContain('alice@example.com');
      expect(container!.textContent).toContain('Bob');
      expect(container!.textContent).toContain('Charlie');
    });
  });

  it('displays member roles in select dropdowns', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      const selects = container!.querySelectorAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('shows "no members" message when members list is empty', async () => {
    mockTeamsListMembers.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('No members yet');
    });
  });

  it('handles fetch members error', async () => {
    mockTeamsListMembers.mockRejectedValueOnce(new Error('Fail'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to load members', 'error');
    });
  });

  it('shows "Select a team" placeholder when no team selected', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Select a team to view details');
  });

  it('opens create team modal', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const createBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Create Team'));
    await act(async () => {
      fireEvent.click(createBtn!);
    });
    expect(container!.textContent).toContain('team.createTitle');
    expect(container!.textContent).toContain('Team Name');
    expect(container!.textContent).toContain('Description (optional)');
  });

  it('fills and submits create team form', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    // Open modal
    const createBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Create Team'));
    await act(async () => {
      fireEvent.click(createBtn!);
    });
    // Fill name
    const inputs = container!.querySelectorAll('input[type="text"]');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'New Team' } });
    });
    // Fill description
    await act(async () => {
      fireEvent.change(inputs[1], { target: { value: 'Team description' } });
    });
    // Submit
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.createTeamBtn'));
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      expect(mockTeamsCreate).toHaveBeenCalledWith('test-token', {
        name: 'New Team',
        description: 'Team description',
      });
      expect(mockToast).toHaveBeenCalledWith('team.teamCreated', 'success');
    });
  });

  it('closes create modal on cancel', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const createBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Create Team'));
    await act(async () => {
      fireEvent.click(createBtn!);
    });
    const cancelBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Cancel');
    await act(async () => {
      fireEvent.click(cancelBtn!);
    });
    expect(container!.textContent).not.toContain('team.createTitle');
  });

  it('handles create team API error', async () => {
    mockTeamsCreate.mockRejectedValueOnce(new Error('API Error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const createBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Create Team'));
    await act(async () => {
      fireEvent.click(createBtn!);
    });
    const inputs = container!.querySelectorAll('input[type="text"]');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'Fail Team' } });
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.createTeamBtn'));
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to create team', 'error');
    });
  });

  it('disables create button when name is empty', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const createBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Create Team'));
    await act(async () => {
      fireEvent.click(createBtn!);
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.createTeamBtn'));
    expect(submitBtn).toHaveProperty('disabled', true);
  });

  it('opens invite modal after selecting team', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    // Select team
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    // Click invite
    const inviteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Invite'));
    await act(async () => {
      fireEvent.click(inviteBtn!);
    });
    expect(container!.textContent).toContain('team.inviteTitle');
    expect(container!.textContent).toContain('Email');
  });

  it('fills and submits invite form', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    // Select team
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    // Open invite modal
    const inviteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Invite'));
    await act(async () => {
      fireEvent.click(inviteBtn!);
    });
    // Fill email
    const emailInput = container!.querySelector('input[type="email"]');
    await act(async () => {
      fireEvent.change(emailInput!, { target: { value: 'newuser@example.com' } });
    });
    // Submit
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.sendInvite'));
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      expect(mockTeamsInviteMember).toHaveBeenCalledWith('test-token', 't1', {
        email: 'newuser@example.com',
        role: 'member',
      });
      expect(mockToast).toHaveBeenCalledWith('team.invitationSent', 'success');
    });
  });

  it('handles invite API error', async () => {
    mockTeamsInviteMember.mockRejectedValueOnce(new Error('Invite failed'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    const inviteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Invite'));
    await act(async () => {
      fireEvent.click(inviteBtn!);
    });
    const emailInput = container!.querySelector('input[type="email"]');
    await act(async () => {
      fireEvent.change(emailInput!, { target: { value: 'fail@example.com' } });
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.sendInvite'));
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to invite member', 'error');
    });
  });

  it('disables invite button when email is empty', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    const inviteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Invite'));
    await act(async () => {
      fireEvent.click(inviteBtn!);
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.sendInvite'));
    expect(submitBtn).toHaveProperty('disabled', true);
  });

  it('closes invite modal on cancel', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    const inviteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Invite'));
    await act(async () => {
      fireEvent.click(inviteBtn!);
    });
    const cancelBtn = Array.from(container!.querySelectorAll('button')).filter(b => b.textContent === 'Cancel');
    await act(async () => {
      fireEvent.click(cancelBtn[cancelBtn.length - 1]!);
    });
    expect(container!.textContent).not.toContain('team.inviteTitle');
  });

  it('changes member role', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      const selects = container!.querySelectorAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });
    const selects = container!.querySelectorAll('select');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: 'admin' } });
    });
    expect(mockTeamsUpdateRole).toHaveBeenCalledWith('test-token', 't1', 'm1', 'admin');
  });

  it('handles role change error', async () => {
    mockTeamsUpdateRole.mockRejectedValueOnce(new Error('Role error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      const selects = container!.querySelectorAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });
    const selects = container!.querySelectorAll('select');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: 'member' } });
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to update role', 'error');
    });
  });

  it('removes a member', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      const removeBtns = Array.from(container!.querySelectorAll('button')).filter(b => b.textContent === 'Remove');
      expect(removeBtns.length).toBeGreaterThanOrEqual(1);
    });
    const removeBtns = Array.from(container!.querySelectorAll('button')).filter(b => b.textContent === 'Remove');
    await act(async () => {
      fireEvent.click(removeBtns[0]);
    });
    expect(mockTeamsRemoveMember).toHaveBeenCalledWith('test-token', 't1', 'm1');
    expect(mockToast).toHaveBeenCalledWith('team.memberRemoved', 'success');
  });

  it('handles remove member error', async () => {
    mockTeamsRemoveMember.mockRejectedValueOnce(new Error('Remove error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      const removeBtns = Array.from(container!.querySelectorAll('button')).filter(b => b.textContent === 'Remove');
      expect(removeBtns.length).toBeGreaterThanOrEqual(1);
    });
    const removeBtns = Array.from(container!.querySelectorAll('button')).filter(b => b.textContent === 'Remove');
    await act(async () => {
      fireEvent.click(removeBtns[0]);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to remove member', 'error');
    });
  });

  it('highlights selected team in list', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    // The selected team button should have the highlight class
    expect(teamButton!.className).toContain('bg-brand-50');
  });

  it('refreshes teams after creating a team', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const createBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Create Team'));
    await act(async () => {
      fireEvent.click(createBtn!);
    });
    const inputs = container!.querySelectorAll('input[type="text"]');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'New Team' } });
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.createTeamBtn'));
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      // Should have called list twice: once on mount, once after create
      expect(mockTeamsList).toHaveBeenCalledTimes(2);
    });
  });

  it('refreshes members after inviting', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    const inviteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Invite'));
    await act(async () => {
      fireEvent.click(inviteBtn!);
    });
    const emailInput = container!.querySelector('input[type="email"]');
    await act(async () => {
      fireEvent.change(emailInput!, { target: { value: 'x@y.com' } });
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('team.sendInvite'));
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      // listMembers called once on team select, once after invite
      expect(mockTeamsListMembers).toHaveBeenCalledTimes(2);
    });
  });

  it('shows invite modal role options (admin, member only - no owner)', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    const inviteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Invite'));
    await act(async () => {
      fireEvent.click(inviteBtn!);
    });
    // The invite role select should have options but not "owner"
    const selects = container!.querySelectorAll('select');
    const inviteSelect = selects[selects.length - 1]; // last select is the invite role
    const options = inviteSelect.querySelectorAll('option');
    const optionTexts = Array.from(options).map(o => o.textContent);
    expect(optionTexts).toContain('Admin');
    expect(optionTexts).toContain('Member');
    expect(optionTexts).not.toContain('Owner');
  });

  it('displays joined dates for members', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TeamPage));
      container = result.container;
    });
    const teamButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Team Alpha'));
    await act(async () => {
      fireEvent.click(teamButton!);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Joined');
    });
  });
});
