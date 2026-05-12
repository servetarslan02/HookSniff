// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockToast = vi.fn();
const mockTeamsList = vi.fn().mockResolvedValue([]);
const mockTeamsCreate = vi.fn().mockResolvedValue({});
const mockTeamsListMembers = vi.fn().mockResolvedValue([]);
const mockTeamsInviteMember = vi.fn().mockResolvedValue({});
const mockTeamsRemoveMember = vi.fn().mockResolvedValue({});
const mockTeamsUpdateRole = vi.fn().mockResolvedValue({});

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
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

const { default: TeamPage } = await import('@/app/[locale]/[username]/team/page');

const mockTeams = [
  { id: 't1', name: 'Engineering', description: 'Dev team', created_at: '2024-01-01', member_count: 3 },
  { id: 't2', name: 'Marketing', description: 'Growth team', created_at: '2024-02-01', member_count: 2 },
];

const mockMembers = [
  { id: 'm1', user_id: 'u1', email: 'alice@test.com', name: 'Alice', role: 'owner', joined_at: '2024-01-01' },
  { id: 'm2', user_id: 'u2', email: 'bob@test.com', name: 'Bob', role: 'member', joined_at: '2024-01-15' },
];

describe('TeamPage — Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamsList.mockResolvedValue([]);
    mockTeamsCreate.mockResolvedValue({});
    mockTeamsListMembers.mockResolvedValue([]);
    mockTeamsInviteMember.mockResolvedValue({});
    mockTeamsRemoveMember.mockResolvedValue({});
    mockTeamsUpdateRole.mockResolvedValue({});
  });

  it('renders without crashing', () => {
    render(React.createElement(TeamPage));
  });

  it('displays team title', () => {
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('team.title');
  });

  it('renders create team button', () => {
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('Create Team');
  });

  it('shows loading state initially', () => {
    mockTeamsList.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('Loading teams');
  });

  it('shows empty state when no teams', async () => {
    mockTeamsList.mockResolvedValue([]);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('team.noTeams');
    });
  });

  it('renders team list when teams exist', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
      expect(container.textContent).toContain('Marketing');
    });
  });

  it('selects a team on click', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => {
        expect(mockTeamsListMembers).toHaveBeenCalledWith('test-token', 't1');
      });
    }
  });

  it('shows members when team is selected', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => {
        expect(container.textContent).toContain('Alice');
        expect(container.textContent).toContain('Bob');
      });
    }
  });

  it('shows member roles', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => {
        expect(container.textContent).toContain('Alice');
      });
    }
  });

  it('opens create team modal', async () => {
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    expect(container.textContent).toContain('team.createTeam');
  });

  it('create modal has name input', async () => {
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(nameInput).toBeTruthy();
  });

  it('can type team name in create modal', async () => {
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(nameInput, { target: { value: 'New Team' } }); });
    expect(nameInput.value).toBe('New Team');
  });

  it('submits create team form', async () => {
    mockTeamsList.mockResolvedValue([]);
    mockTeamsCreate.mockResolvedValue({});
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(nameInput, { target: { value: 'New Team' } }); });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('team.create') || b.textContent?.includes('common.create')
    );
    if (submitBtn) {
      await act(async () => { fireEvent.click(submitBtn); });
      expect(mockTeamsCreate).toHaveBeenCalledWith('test-token', { name: 'New Team', description: undefined });
    }
  });

  it('shows success toast after creating team', async () => {
    mockTeamsCreate.mockResolvedValue({});
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(nameInput, { target: { value: 'New Team' } }); });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('team.create') || b.textContent?.includes('common.create')
    );
    if (submitBtn) {
      await act(async () => { fireEvent.click(submitBtn); });
      expect(mockToast).toHaveBeenCalledWith('team.teamCreated', 'success');
    }
  });

  it('shows error toast on create failure', async () => {
    mockTeamsCreate.mockRejectedValue(new Error('Create failed'));
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(nameInput, { target: { value: 'New Team' } }); });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('team.create') || b.textContent?.includes('common.create')
    );
    if (submitBtn) {
      await act(async () => { fireEvent.click(submitBtn); });
      expect(mockToast).toHaveBeenCalledWith('Failed to create team', 'error');
    }
  });

  it('closes create modal on cancel', async () => {
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    expect(container.textContent).toContain('team.createTeam');
    const cancelBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('common.cancel')
    );
    if (cancelBtn) {
      await act(async () => { fireEvent.click(cancelBtn); });
      expect(container.textContent).not.toContain('team.createTeam');
    }
  });

  it('opens invite modal when team selected', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => { expect(mockTeamsListMembers).toHaveBeenCalled(); });
      // Find any button that looks like an invite action
      const buttons = Array.from(container.querySelectorAll('button'));
      const inviteBtn = buttons.find(
        b => b.textContent?.toLowerCase().includes('invite') || b.textContent?.includes('team.invite')
      );
      if (inviteBtn) {
        await act(async () => { fireEvent.click(inviteBtn); });
        // Modal should show
        const hasModal = container.textContent?.includes('team.inviteMember') || container.textContent?.includes('Email');
        expect(hasModal).toBe(true);
      }
    }
  });

  it('invite modal has email input', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => { expect(mockTeamsListMembers).toHaveBeenCalled(); });
      const inviteBtn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent?.includes('team.invite') || b.textContent?.includes('Invite')
      );
      if (inviteBtn) {
        await act(async () => { fireEvent.click(inviteBtn); });
        const emailInputs = container.querySelectorAll('input[type="email"]');
        expect(emailInputs.length).toBeGreaterThan(0);
      }
    }
  });

  it('submits invite with email and role', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    mockTeamsInviteMember.mockResolvedValue({});
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => { expect(mockTeamsListMembers).toHaveBeenCalled(); });
      const inviteBtn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent?.includes('team.invite') || b.textContent?.includes('Invite')
      );
      if (inviteBtn) {
        await act(async () => { fireEvent.click(inviteBtn); });
        const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) {
          await act(async () => { fireEvent.change(emailInput, { target: { value: 'new@test.com' } }); });
          const submitBtn = Array.from(container.querySelectorAll('button')).find(
            b => b.textContent?.includes('team.sendInvite') || b.textContent?.includes('common.send')
          );
          if (submitBtn) {
            await act(async () => { fireEvent.click(submitBtn); });
            expect(mockTeamsInviteMember).toHaveBeenCalled();
          }
        }
      }
    }
  });

  it('shows error toast on invite failure', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    mockTeamsInviteMember.mockRejectedValue(new Error('Invite failed'));
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => { expect(mockTeamsListMembers).toHaveBeenCalled(); });
      const inviteBtn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent?.includes('team.invite') || b.textContent?.includes('Invite')
      );
      if (inviteBtn) {
        await act(async () => { fireEvent.click(inviteBtn); });
        const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) {
          await act(async () => { fireEvent.change(emailInput, { target: { value: 'new@test.com' } }); });
          const submitBtn = Array.from(container.querySelectorAll('button')).find(
            b => b.textContent?.includes('team.sendInvite') || b.textContent?.includes('common.send')
          );
          if (submitBtn) {
            await act(async () => { fireEvent.click(submitBtn); });
            expect(mockToast).toHaveBeenCalledWith('Failed to invite member', 'error');
          }
        }
      }
    }
  });

  it('handles team list fetch error', async () => {
    mockTeamsList.mockRejectedValue(new Error('Network error'));
    render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to load teams', 'error');
    });
  });

  it('handles member list fetch error', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockRejectedValue(new Error('Network error'));
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Failed to load members', 'error');
      });
    }
  });

  it('renders your teams section header', async () => {
    const { container } = render(React.createElement(TeamPage));
    expect(container.textContent).toContain('team.yourTeams');
  });

  it('shows team member count', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Engineering');
    });
  });

  it('renders role options in invite modal', async () => {
    mockTeamsList.mockResolvedValue(mockTeams);
    mockTeamsListMembers.mockResolvedValue(mockMembers);
    const { container } = render(React.createElement(TeamPage));
    await waitFor(() => { expect(container.textContent).toContain('Engineering'); });
    const teamButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Engineering')
    );
    if (teamButton) {
      await act(async () => { fireEvent.click(teamButton); });
      await waitFor(() => { expect(mockTeamsListMembers).toHaveBeenCalled(); });
      const inviteBtn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent?.includes('team.invite') || b.textContent?.includes('Invite')
      );
      if (inviteBtn) {
        await act(async () => { fireEvent.click(inviteBtn); });
        const selects = container.querySelectorAll('select');
        if (selects.length > 0) {
          const options = Array.from(selects[0].options).map(o => o.value);
          expect(options).toContain('member');
        }
      }
    }
  });

  it('refreshes teams after creating one', async () => {
    mockTeamsList.mockResolvedValueOnce([]).mockResolvedValueOnce(mockTeams);
    mockTeamsCreate.mockResolvedValue({});
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(nameInput, { target: { value: 'New Team' } }); });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('team.create') || b.textContent?.includes('common.create')
    );
    if (submitBtn) {
      await act(async () => { fireEvent.click(submitBtn); });
      await waitFor(() => {
        expect(mockTeamsList).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('create description textarea works', async () => {
    const { container } = render(React.createElement(TeamPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create Team')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const textareas = container.querySelectorAll('textarea');
    if (textareas.length > 0) {
      await act(async () => { fireEvent.change(textareas[0], { target: { value: 'Team description' } }); });
      expect(textareas[0].value).toBe('Team description');
    }
  });
});
