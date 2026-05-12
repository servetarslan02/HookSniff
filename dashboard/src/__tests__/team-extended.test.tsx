// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockTeamsList = vi.fn();
const mockTeamsCreate = vi.fn();
const mockTeamsListMembers = vi.fn();
const mockTeamsInviteMember = vi.fn();
const mockTeamsRemoveMember = vi.fn();
const mockTeamsUpdateRole = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/api', () => ({
  teamsApi: {
    list: (...args: any[]) => mockTeamsList(...args),
    create: (...args: any[]) => mockTeamsCreate(...args),
    listMembers: (...args: any[]) => mockTeamsListMembers(...args),
    inviteMember: (...args: any[]) => mockTeamsInviteMember(...args),
    removeMember: (...args: any[]) => mockTeamsRemoveMember(...args),
    updateRole: (...args: any[]) => mockTeamsUpdateRole(...args),
  },
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: TeamPage } = await import('@/app/[locale]/[username]/team/page');

const mockTeams = [
  { id: 't1', name: 'Engineering', description: 'Dev team', member_count: 3, created_at: '2024-01-01T00:00:00Z' },
  { id: 't2', name: 'Marketing', description: null, member_count: 1, created_at: '2024-02-01T00:00:00Z' },
];

const mockMembers = [
  { id: 'm1', name: 'Alice', email: 'alice@test.com', role: 'owner', joined_at: '2024-01-01T00:00:00Z' },
  { id: 'm2', name: null, email: 'bob@test.com', role: 'member', joined_at: '2024-01-15T00:00:00Z' },
];

describe('TeamPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsCreate.mockResolvedValue({});
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    mockTeamsInviteMember.mockResolvedValue({});
    mockTeamsRemoveMember.mockResolvedValue({});
    mockTeamsUpdateRole.mockResolvedValue({});
  });

  // === Render ===
  it('renders without crashing', () => {
    render(React.createElement(TeamPage));
  });

  it('displays title', () => {
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('team.title');
  });

  it('renders create team button', () => {
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('+ Create Team');
  });

  // === Team list ===
  it('renders team list', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
      expect(container.textContent).toContain('Marketing');
    });
  });

  it('renders team description', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Dev team');
    });
  });

  it('renders member count', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('3 members');
    });
  });

  it('renders your teams section', () => {
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('team.yourTeams');
  });

  // === Empty state ===
  it('shows empty state when no teams', async () => {
    mockTeamsList.mockResolvedValue([]);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('team.noTeams');
    });
  });

  // === Select team ===
  it('shows team detail when team is selected', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(mockTeamsListMembers).toHaveBeenCalledWith('test-token', 't1');
    });
  });

  it('renders members after selecting team', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Alice');
      expect(container.textContent).toContain('bob@test.com');
    });
  });

  it('renders member role', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      const selects = container.querySelectorAll('select');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows placeholder when no team selected', () => {
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('Select a team to view details');
  });

  it('shows empty members message', async () => {
    mockTeamsListMembers.mockResolvedValue([]);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('No members yet');
    });
  });

  // === Invite button ===
  it('renders invite button when team selected', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('+ Invite');
    });
  });

  // === Create team modal ===
  it('opens create team modal', async () => {
    const { container } = render(React.createElement(TeamPage));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Create Team')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('team.createTitle');
  });

  it('renders team name input in modal', async () => {
    const { container } = render(React.createElement(TeamPage));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Create Team')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('Team Name');
  });

  it('renders description input in modal', async () => {
    const { container } = render(React.createElement(TeamPage));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Create Team')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('Description (optional)');
  });

  it('closes create modal on cancel', async () => {
    const { container } = render(React.createElement(TeamPage));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Create Team')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Cancel')
    );

    await act(async () => {
      fireEvent.click(cancelButton!);
    });

    expect(container.textContent).not.toContain('team.createTitle');
  });

  it('creates team on submit', async () => {
    const { container } = render(React.createElement(TeamPage));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Create Team')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const inputs = container.querySelectorAll('input');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'New Team' } });
      fireEvent.change(inputs[1], { target: { value: 'A new team' } });
    });

    const submitButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('team.createTeamBtn')
    );

    await act(async () => {
      fireEvent.click(submitButton!);
    });

    expect(mockTeamsCreate).toHaveBeenCalledWith('test-token', {
      name: 'New Team',
      description: 'A new team',
    });
  });

  it('shows success toast after creating team', async () => {
    const { container } = render(React.createElement(TeamPage));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Create Team')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const inputs = container.querySelectorAll('input');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'New Team' } });
    });

    const submitButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('team.createTeamBtn')
    );

    await act(async () => {
      fireEvent.click(submitButton!);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('team.teamCreated', 'success');
    });
  });

  it('shows error toast on create failure', async () => {
    mockTeamsCreate.mockRejectedValue(new Error('Create failed'));
    const { container } = render(React.createElement(TeamPage));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Create Team')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const inputs = container.querySelectorAll('input');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'New Team' } });
    });

    const submitButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('team.createTeamBtn')
    );

    await act(async () => {
      fireEvent.click(submitButton!);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to create team', 'error');
    });
  });

  // === Invite modal ===
  it('opens invite modal', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('+ Invite');
    });

    const inviteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Invite')
    );

    await act(async () => {
      fireEvent.click(inviteButton!);
    });

    expect(container.textContent).toContain('team.inviteTitle');
  });

  it('renders email input in invite modal', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    const inviteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Invite')
    );

    await act(async () => {
      fireEvent.click(inviteButton!);
    });

    expect(container.textContent).toContain('Email');
  });

  it('renders role select in invite modal', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    const inviteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Invite')
    );

    await act(async () => {
      fireEvent.click(inviteButton!);
    });

    expect(container.textContent).toContain('Role');
  });

  it('invites member', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    const inviteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ Invite')
    );

    await act(async () => {
      fireEvent.click(inviteButton!);
    });

    const emailInputs = container.querySelectorAll('input[type="email"]');
    await act(async () => {
      fireEvent.change(emailInputs[emailInputs.length - 1], { target: { value: 'new@test.com' } });
    });

    const sendInviteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('team.sendInvite')
    );

    await act(async () => {
      fireEvent.click(sendInviteButton!);
    });

    expect(mockTeamsInviteMember).toHaveBeenCalledWith('test-token', 't1', {
      email: 'new@test.com',
      role: 'member',
    });
  });

  // === Remove member ===
  it('renders remove button for each member', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      const removeButtons = Array.from(container.querySelectorAll('button')).filter(
        (b) => b.textContent?.includes('Remove')
      );
      expect(removeButtons.length).toBe(2);
    });
  });

  it('removes member on click', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Alice');
    });

    const removeButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Remove')
    );

    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    expect(mockTeamsRemoveMember).toHaveBeenCalledWith('test-token', 't1', 'm1');
  });

  // === Role change ===
  it('changes member role', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Alice');
    });

    const roleSelects = container.querySelectorAll('select');
    await act(async () => {
      fireEvent.change(roleSelects[0], { target: { value: 'admin' } });
    });

    expect(mockTeamsUpdateRole).toHaveBeenCalledWith('test-token', 't1', 'm1', 'admin');
  });

  // === Loading state ===
  it('shows loading state', () => {
    mockTeamsList.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('Loading teams');
  });

  // === Selected team highlighting ===
  it('shows selected team description', async () => {
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });

    const teamButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Engineering')
    );

    await act(async () => {
      fireEvent.click(teamButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Dev team');
    });
  });
});
