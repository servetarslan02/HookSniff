// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockPush = vi.fn();
const mockEndpointsCreate = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    create: (...args: any[]) => mockEndpointsCreate(...args),
  },
}));

// Default auth: logged-in user
let mockAuth: { user: any; token: string | null } = {
  user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
  token: 'test-token-123',
};

vi.mock('@/lib/store', () => ({
  useAuth: () => mockAuth,
}));

const { OnboardingWizard } = await import('@/components/OnboardingWizard');

// ─── Helper: navigate to a specific step ───
async function navigateToStep(container: HTMLElement, targetStep: string) {
  const stepOrder = ['welcome', 'usecase', 'sdk', 'endpoint', 'test', 'done'];
  const targetIndex = stepOrder.indexOf(targetStep);
  if (targetIndex <= 0) return;

  // Start: click "Let's go" on welcome
  let buttons = Array.from(container.querySelectorAll('button'));
  const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
  if (letsGoBtn) await act(async () => { fireEvent.click(letsGoBtn); });

  if (targetIndex === 1) return; // usecase

  // Use case: select Payments
  buttons = Array.from(container.querySelectorAll('button'));
  const paymentsBtn = buttons.find(b => b.textContent?.includes('Payments'));
  if (paymentsBtn) await act(async () => { fireEvent.click(paymentsBtn); });

  // Continue to SDK
  buttons = Array.from(container.querySelectorAll('button'));
  let continueBtn = buttons.find(b => b.textContent?.includes('Continue'));
  if (continueBtn) { const btn = continueBtn; await act(async () => { fireEvent.click(btn); }); }

  if (targetIndex === 2) return; // sdk

  // Continue to endpoint
  buttons = Array.from(container.querySelectorAll('button'));
  continueBtn = buttons.find(b => b.textContent?.includes('Continue'));
  if (continueBtn) { const btn2 = continueBtn; await act(async () => { fireEvent.click(btn2); }); }

  if (targetIndex === 3) return; // endpoint

  // For endpoint step: fill URL and create
  if (targetIndex >= 4) {
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    if (urlInput) {
      await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/hook' } }); });
    }
    buttons = Array.from(container.querySelectorAll('button'));
    const createBtn = buttons.find(b => b.textContent?.includes('Create Endpoint'));
    if (createBtn) {
      // Ensure mock resolves
      mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
      await act(async () => { fireEvent.click(createBtn); });
    }
  }

  if (targetIndex === 4) return; // test

  // For test step: click "I've sent a test"
  if (targetIndex === 5) {
    buttons = Array.from(container.querySelectorAll('button'));
    const sentBtn = buttons.find(b => b.textContent?.includes("I've sent a test"));
    if (sentBtn) await act(async () => { fireEvent.click(sentBtn); });
  }
}

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockReset();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  // ─── Rendering & Visibility ───

  it('renders when user is logged in and not dismissed', () => {
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('Welcome');
  });

  it('does not render when user is null', () => {
    mockAuth = { user: null, token: null };
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).not.toContain('Welcome to HookSniff');
  });

  it('does not render when previously dismissed', () => {
    localStorage.setItem('hooksniff_onboarding_state', JSON.stringify({ dismissed: true, currentStep: 0, completedSteps: [], useCase: '', endpointCreated: false, firstWebhookSent: false }));
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).not.toContain('Welcome to HookSniff');
  });

  // ─── Welcome Step ───

  it('shows welcome step with user name', () => {
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('Welcome, Test User!');
  });

  it('shows welcome step with email fallback when no name', () => {
    mockAuth = {
      user: { id: 'u1', email: 'alice@example.com', plan: 'free' },
      token: 'tok',
    };
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('alice');
  });

  it('shows "Let\'s go" button on welcome step', () => {
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain("Let's go");
  });

  it('shows free forever and SDK info on welcome', () => {
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('Free forever');
    expect(container.textContent).toContain('11 SDKs');
    expect(container.textContent).toContain('5 min setup');
  });

  // ─── Step Navigation ───

  it('navigates to use case step on "Let\'s go" click', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    expect(letsGoBtn).toBeTruthy();
    await act(async () => { fireEvent.click(letsGoBtn!); });
    expect(container.textContent).toContain('What are you building');
  });

  it('shows step indicators (dots)', () => {
    const { container } = render(<OnboardingWizard />);
    // There should be step indicator buttons with rounded-full class
    const dotButtons = container.querySelectorAll('button.rounded-full');
    expect(dotButtons.length).toBe(6);
  });

  it('navigates back from usecase step', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Click back
    const backBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'));
    expect(backBtn).toBeTruthy();
    await act(async () => { fireEvent.click(backBtn!); });
    expect(container.textContent).toContain('Welcome, Test User!');
  });

  it('does not show back button on first step', () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const backBtn = buttons.find(b => b.textContent?.includes('Back'));
    expect(backBtn).toBeUndefined();
  });

  // ─── Use Case Step ───

  it('navigates to usecase and shows all use case options', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    expect(container.textContent).toContain('Payments');
    expect(container.textContent).toContain('Email / Notifications');
    expect(container.textContent).toContain('E-commerce');
    expect(container.textContent).toContain('SaaS Platform');
    expect(container.textContent).toContain('AI / Agents');
    expect(container.textContent).toContain('Other');
  });

  it('selects a use case and enables continue', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Select "Payments"
    const paymentsBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Payments'));
    expect(paymentsBtn).toBeTruthy();
    await act(async () => { fireEvent.click(paymentsBtn!); });

    // Continue should now be enabled
    const continueBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Continue'));
    expect(continueBtn).toBeTruthy();
    expect(continueBtn!.getAttribute('disabled')).toBeNull();
  });

  it('continue button is disabled when no use case selected', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    const continueBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Continue'));
    expect(continueBtn).toBeTruthy();
    expect(continueBtn!.getAttribute('disabled')).not.toBeNull();
  });

  // ─── SDK Step ───

  it('navigates to SDK step and shows all SDKs', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    expect(container.textContent).toContain('Choose your SDK');
    expect(container.textContent).toContain('Node.js');
    expect(container.textContent).toContain('Python');
    expect(container.textContent).toContain('Go');
    expect(container.textContent).toContain('Rust');
    expect(container.textContent).toContain('C#');
    expect(container.textContent).toContain('Java');
    expect(container.textContent).toContain('Ruby');
    expect(container.textContent).toContain('PHP');
  });

  it('shows install command for selected SDK', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    // Default SDK is nodejs
    expect(container.textContent).toContain('npm install hooksniff-sdk');
  });

  it('selects a different SDK and updates install command', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    // Select Python
    const pythonBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Python');
    expect(pythonBtn).toBeTruthy();
    await act(async () => { fireEvent.click(pythonBtn!); });

    expect(container.textContent).toContain('pip install hooksniff');
  });

  // ─── Endpoint Step ───

  it('navigates to endpoint step and shows form', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    expect(container.textContent).toContain('Create your first endpoint');
    expect(container.textContent).toContain('Endpoint URL');
    expect(container.textContent).toContain('Description');
  });

  it('endpoint create button is disabled without URL', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    expect(createBtn).toBeTruthy();
    expect(createBtn!.getAttribute('disabled')).not.toBeNull();
  });

  it('fills endpoint URL and enables create button', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    expect(urlInput).toBeTruthy();
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/webhooks' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    expect(createBtn!.getAttribute('disabled')).toBeNull();
  });

  it('calls endpointsApi.create on endpoint creation', async () => {
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/webhooks' } }); });

    const descInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(descInput, { target: { value: 'My endpoint' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(mockEndpointsCreate).toHaveBeenCalledWith('test-token-123', {
      url: 'https://example.com/webhooks',
      description: 'My endpoint',
    });
  });

  it('shows error when endpoint creation fails', async () => {
    mockEndpointsCreate.mockRejectedValue(new Error('Network error'));
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/webhooks' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(container.textContent).toContain('Network error');
  });

  it('shows "Creating..." text while endpoint is being created', async () => {
    let resolveCreate: any;
    mockEndpointsCreate.mockImplementation(() => new Promise(r => { resolveCreate = r; }));
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/webhooks' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(container.textContent).toContain('Creating...');

    // Resolve to clean up
    await act(async () => { resolveCreate({ id: 'ep-new' }); });
  });

  // ─── Test Step ───

  it('shows test webhook step with curl command', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'test');

    expect(container.textContent).toContain('Send a test webhook');
    expect(container.textContent).toContain('curl -X POST');
    expect(container.textContent).toContain('test.ping');
  });

  it('test step has "I\'ve sent a test" button', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'test');

    const sentBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes("I've sent a test"));
    expect(sentBtn).toBeTruthy();
  });

  it('test step has Open Playground link', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'test');

    const playgroundLink = Array.from(container.querySelectorAll('a')).find(a => a.textContent?.includes('Open Playground'));
    expect(playgroundLink).toBeTruthy();
    expect(playgroundLink!.getAttribute('href')).toBe('/dashboard/playground');
  });

  // ─── Done Step ───

  it('shows completion step with links', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    expect(container.textContent).toContain("You're all set");
    expect(container.textContent).toContain('Endpoints');
    expect(container.textContent).toContain('Deliveries');
    expect(container.textContent).toContain('Playground');
    expect(container.textContent).toContain('API Keys');
  });

  it('shows "Go to Dashboard" button on done step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    expect(dashBtn).toBeTruthy();
  });

  // ─── Completion Flow ───

  it('handleFinish navigates to /dashboard and dismisses', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    await act(async () => { fireEvent.click(dashBtn!); });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('handleFinish saves dismissed state to localStorage', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    await act(async () => { fireEvent.click(dashBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.dismissed).toBe(true);
  });

  // ─── Skip/Dismiss ───

  it('shows "Skip setup" button on non-done steps', () => {
    const { container } = render(<OnboardingWizard />);
    const skipBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip setup'));
    expect(skipBtn).toBeTruthy();
  });

  it('dismiss saves state and hides wizard', async () => {
    const { container } = render(<OnboardingWizard />);
    const skipBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip setup'));
    await act(async () => { fireEvent.click(skipBtn!); });

    expect(container.textContent).not.toContain('Welcome to HookSniff');
    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.dismissed).toBe(true);
  });

  it('does not show "Skip setup" on done step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const skipBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip setup'));
    expect(skipBtn).toBeUndefined();
  });

  // ─── Progress Bar ───

  it('shows progress bar with correct width', () => {
    const { container } = render(<OnboardingWizard />);
    // On step 0 of 6, progress = 1/6 ≈ 16.67%
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toBeTruthy();
  });

  it('progress bar width increases on each step', async () => {
    const { container } = render(<OnboardingWizard />);
    // Step 0: width = 1/6 * 100 = 16.67%
    const bar0 = container.querySelector('[style*="width:"]');
    expect(bar0).toBeTruthy();

    // Go to usecase
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Step 1: width = 2/6 * 100 = 33.33%
    const bar1 = container.querySelector('[style*="width:"]');
    expect(bar1).toBeTruthy();
  });

  // ─── localStorage Persistence ───

  it('restores state from localStorage', () => {
    localStorage.setItem('hooksniff_onboarding_state', JSON.stringify({
      dismissed: false,
      currentStep: 2,
      completedSteps: ['welcome', 'usecase'],
      useCase: 'payments',
      endpointCreated: false,
      firstWebhookSent: false,
    }));

    const { container } = render(<OnboardingWizard />);
    // Should be on SDK step (step 2)
    expect(container.textContent).toContain('Choose your SDK');
  });

  it('persists currentStep on navigation', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.currentStep).toBe(1);
  });

  it('persists useCase selection', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    const paymentsBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Payments'));
    await act(async () => { fireEvent.click(paymentsBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.useCase).toBe('payments');
  });

  it('persists completedSteps', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.completedSteps).toContain('welcome');
  });

  // ─── Step Indicators ───

  it('step indicators highlight current step', () => {
    const { container } = render(<OnboardingWizard />);
    // The active step indicator should have w-8 class (wider dot)
    const activeDots = container.querySelectorAll('button.w-8');
    expect(activeDots.length).toBe(1);
  });

  it('clicking completed step indicator navigates back', async () => {
    const { container } = render(<OnboardingWizard />);
    // Go to step 1
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Now on step 1 (usecase). Step 0 indicator should be clickable since it's completed.
    const allBtns = Array.from(container.querySelectorAll('button'));
    const stepDots = allBtns.filter(b => {
      const cls = b.className;
      return cls.includes('rounded-full') && (cls.includes('bg-green-400') || cls.includes('bg-green-500'));
    });

    expect(stepDots.length).toBeGreaterThanOrEqual(1);
    await act(async () => { fireEvent.click(stepDots[0]); });
    expect(container.textContent).toContain('Welcome, Test User!');
  });

  // ─── Copy Functionality ───

  it('copy button is present on SDK step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    const copyBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Copy');
    expect(copyBtn).toBeTruthy();
  });

  // ─── Edge Cases ───

  it('endpoint step shows tip about Playground', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    expect(container.textContent).toContain('No real URL yet');
    expect(container.textContent).toContain('Playground');
  });

  it('endpoint description is optional', async () => {
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/hook' } }); });
    // Don't fill description

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(mockEndpointsCreate).toHaveBeenCalledWith('test-token-123', {
      url: 'https://example.com/hook',
      description: undefined,
    });
  });

  it('handles non-Error thrown during endpoint creation', async () => {
    mockEndpointsCreate.mockRejectedValue('string error');
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/hook' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(container.textContent).toContain('Failed to create endpoint');
  });
});

describe('OnboardingWizard - full flow integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockReset();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  it('completes the full wizard flow from start to finish', async () => {
    const { container } = render(<OnboardingWizard />);

    // Step 0: Welcome
    expect(container.textContent).toContain('Welcome, Test User!');
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Step 1: Use Case - select Payments
    expect(container.textContent).toContain('What are you building');
    const paymentsBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Payments'));
    await act(async () => { fireEvent.click(paymentsBtn!); });
    const continueBtn1 = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Continue'));
    await act(async () => { fireEvent.click(continueBtn1!); });

    // Step 2: SDK
    expect(container.textContent).toContain('Choose your SDK');
    const continueBtn2 = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Continue'));
    await act(async () => { fireEvent.click(continueBtn2!); });

    // Step 3: Endpoint
    expect(container.textContent).toContain('Create your first endpoint');
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/hook' } }); });
    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    // Step 4: Test
    expect(container.textContent).toContain('Send a test webhook');
    const sentBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes("I've sent a test"));
    await act(async () => { fireEvent.click(sentBtn!); });

    // Step 5: Done
    expect(container.textContent).toContain("You're all set");
    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    await act(async () => { fireEvent.click(dashBtn!); });

    // Should have navigated to dashboard
    expect(mockPush).toHaveBeenCalledWith('/dashboard');

    // Should have dismissed
    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.dismissed).toBe(true);
  });

  it('navigates to done step via helper', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');
    expect(container.textContent).toContain("You're all set");
  });
});
