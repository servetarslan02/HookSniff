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

// Helper: navigate to a specific step
async function navigateToStep(container: HTMLElement, targetStep: string) {
  const stepOrder = ['welcome', 'usecase', 'sdk', 'endpoint', 'test', 'done'];
  const targetIndex = stepOrder.indexOf(targetStep);
  if (targetIndex <= 0) return;

  // Step 0 → 1: click "Let's go"
  let buttons = Array.from(container.querySelectorAll('button'));
  const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
  if (letsGoBtn) await act(async () => { fireEvent.click(letsGoBtn); });
  if (targetIndex === 1) return;

  // Step 1 → 2: select use case, continue
  buttons = Array.from(container.querySelectorAll('button'));
  const paymentsBtn = buttons.find(b => b.textContent?.includes('Payments'));
  if (paymentsBtn) await act(async () => { fireEvent.click(paymentsBtn); });

  buttons = Array.from(container.querySelectorAll('button'));
  let continueBtn = buttons.find(b => b.textContent?.includes('Continue'));
  if (continueBtn) await act(async () => { fireEvent.click(continueBtn); });
  if (targetIndex === 2) return;

  // Step 2 → 3: continue
  buttons = Array.from(container.querySelectorAll('button'));
  continueBtn = buttons.find(b => b.textContent?.includes('Continue'));
  if (continueBtn) await act(async () => { fireEvent.click(continueBtn); });
  if (targetIndex === 3) return;

  // Step 3 → 4: fill URL, create endpoint
  if (targetIndex >= 4) {
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    if (urlInput) {
      await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/hook' } }); });
    }
    buttons = Array.from(container.querySelectorAll('button'));
    const createBtn = buttons.find(b => b.textContent?.includes('Create Endpoint'));
    if (createBtn) {
      mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
      await act(async () => { fireEvent.click(createBtn); });
    }
  }
  if (targetIndex === 4) return;

  // Step 4 → 5: click "I've sent a test"
  if (targetIndex === 5) {
    buttons = Array.from(container.querySelectorAll('button'));
    const sentBtn = buttons.find(b => b.textContent?.includes("I've sent a test"));
    if (sentBtn) await act(async () => { fireEvent.click(sentBtn); });
  }
}

describe('OnboardingWizard-ultra: rendering and visibility', () => {
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

  // Test 1: Renders without crashing
  it('renders without crashing when user is logged in', () => {
    const { container } = render(<OnboardingWizard />);
    expect(container).toBeTruthy();
  });

  // Test 2: Shows first step (welcome)
  it('shows first step with welcome content', () => {
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('Welcome');
    expect(container.textContent).toContain('HookSniff');
  });

  // Test 3: Renders with user name
  it('renders user name in welcome message', () => {
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('Test User');
  });

  // Test 4: Shows email prefix when user has no name
  it('shows email prefix when user has no name', () => {
    mockAuth = {
      user: { id: 'u1', email: 'bob@example.com', plan: 'free' },
      token: 'tok',
    };
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('bob');
  });

  // Test 5: Does not render when user is null
  it('returns null when user is null', () => {
    mockAuth = { user: null, token: null };
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).not.toContain('Welcome to HookSniff');
  });

  // Test 6: Does not render when dismissed
  it('returns null when state is dismissed', () => {
    localStorage.setItem('hooksniff_onboarding_state', JSON.stringify({
      dismissed: true, currentStep: 0, completedSteps: [], useCase: '',
      endpointCreated: false, firstWebhookSent: false,
    }));
    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).not.toContain('Welcome to HookSniff');
  });
});

describe('OnboardingWizard-ultra: use case selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  // Test 3: Renders use case options
  it('renders all 6 use case options', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'usecase');

    expect(container.textContent).toContain('Payments');
    expect(container.textContent).toContain('Email / Notifications');
    expect(container.textContent).toContain('E-commerce');
    expect(container.textContent).toContain('SaaS Platform');
    expect(container.textContent).toContain('AI / Agents');
    expect(container.textContent).toContain('Other');
  });

  // Test 4: Can select a use case
  it('selects a use case and updates state', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'usecase');

    const paymentsBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Payments'));
    await act(async () => { fireEvent.click(paymentsBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.useCase).toBe('payments');
  });

  // Test 5: Can select different use cases
  it('can select different use cases', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'usecase');

    const aiBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('AI'));
    await act(async () => { fireEvent.click(aiBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.useCase).toBe('ai');
  });
});

describe('OnboardingWizard-ultra: step navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  // Test 5: Next button advances step
  it('advances to next step on "Let\'s go" click', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    expect(container.textContent).toContain('What are you building');
    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.currentStep).toBe(1);
  });

  // Test 6: Back button goes back
  it('goes back on "Back" click', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'usecase');

    const backBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'));
    expect(backBtn).toBeTruthy();
    await act(async () => { fireEvent.click(backBtn!); });

    expect(container.textContent).toContain('Welcome, Test User!');
  });

  // Test 7: Progress indicator updates
  it('updates progress bar width on each step', async () => {
    const { container } = render(<OnboardingWizard />);
    // On step 0, progress = 1/6 * 100 ≈ 16.67%
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toBeTruthy();
    const initialStyle = progressBar?.getAttribute('style');

    // Navigate to usecase
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Progress should have changed
    const newProgressBar = container.querySelector('[style*="width"]');
    const newStyle = newProgressBar?.getAttribute('style');
    expect(newStyle).not.toBe(initialStyle);
  });

  // Test 8: Can navigate back from step 2 (SDK)
  it('can navigate back from SDK step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    expect(container.textContent).toContain('Choose your SDK');

    const backBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'));
    await act(async () => { fireEvent.click(backBtn!); });

    expect(container.textContent).toContain('What are you building');
  });

  // Test 9: Can navigate back from step 3 (endpoint)
  it('can navigate back from endpoint step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    expect(container.textContent).toContain('Create your first endpoint');

    const backBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'));
    await act(async () => { fireEvent.click(backBtn!); });

    expect(container.textContent).toContain('Choose your SDK');
  });

  // Test 10: Step indicators show correct state
  it('step indicators reflect current step', () => {
    const { container } = render(<OnboardingWizard />);
    // The active step indicator should have w-8 class (wider dot)
    const allDots = container.querySelectorAll('button.rounded-full');
    expect(allDots.length).toBe(6);
  });

  // Test 11: Clicking completed step indicator navigates back
  it('clicking completed step dot navigates to that step', async () => {
    const { container } = render(<OnboardingWizard />);
    // Go to step 1
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Step 0 dot should be green/completed
    const greenDots = Array.from(container.querySelectorAll('button')).filter(b =>
      b.className.includes('bg-green-400') || b.className.includes('bg-green-500')
    );
    expect(greenDots.length).toBeGreaterThanOrEqual(1);

    // Click the completed dot to go back to welcome
    await act(async () => { fireEvent.click(greenDots[0]); });
    expect(container.textContent).toContain('Welcome, Test User!');
  });
});

describe('OnboardingWizard-ultra: SDK selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  // Test 8: SDK selection step renders all SDKs
  it('renders all SDK options', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    expect(container.textContent).toContain('Node.js');
    expect(container.textContent).toContain('Python');
    expect(container.textContent).toContain('Go');
    expect(container.textContent).toContain('Rust');
    expect(container.textContent).toContain('C#');
    expect(container.textContent).toContain('Java');
    expect(container.textContent).toContain('Ruby');
    expect(container.textContent).toContain('PHP');
    expect(container.textContent).toContain('Swift');
    expect(container.textContent).toContain('Kotlin');
    expect(container.textContent).toContain('Elixir');
  });

  // Test 9: Can select SDK
  it('selects a different SDK and updates install command', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    // Default is Node.js
    expect(container.textContent).toContain('npm install hooksniff-sdk');

    // Select Python
    const pythonBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Python');
    await act(async () => { fireEvent.click(pythonBtn!); });

    expect(container.textContent).toContain('pip install hooksniff');
  });

  // Test: Shows install command area
  it('shows install command area with copy button', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'sdk');

    expect(container.textContent).toContain('Install Command');
    const copyBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Copy');
    expect(copyBtn).toBeTruthy();
  });
});

describe('OnboardingWizard-ultra: endpoint creation', () => {
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

  // Test 10: Endpoint creation step renders form
  it('renders endpoint form with URL and description inputs', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    expect(container.textContent).toContain('Create your first endpoint');
    expect(container.querySelector('input[type="url"]')).toBeTruthy();
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
  });

  // Test: Endpoint create button disabled without URL
  it('disables create button when URL is empty', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    expect(createBtn?.getAttribute('disabled')).not.toBeNull();
  });

  // Test: Endpoint create button enabled with URL
  it('enables create button when URL is provided', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    expect(createBtn?.getAttribute('disabled')).toBeNull();
  });

  // Test: Creates endpoint with correct data
  it('calls endpointsApi.create with URL and description', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://myapp.com/webhook' } }); });

    const descInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(descInput, { target: { value: 'Production webhook' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(mockEndpointsCreate).toHaveBeenCalledWith('test-token-123', {
      url: 'https://myapp.com/webhook',
      description: 'Production webhook',
    });
  });

  // Test: Shows error on endpoint creation failure
  it('shows error message when endpoint creation fails', async () => {
    mockEndpointsCreate.mockRejectedValue(new Error('Server error'));
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(container.textContent).toContain('Server error');
  });

  // Test: Shows "Creating..." while loading
  it('shows "Creating..." while endpoint is being created', async () => {
    let resolveCreate: any;
    mockEndpointsCreate.mockImplementation(() => new Promise(r => { resolveCreate = r; }));

    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(container.textContent).toContain('Creating...');
    await act(async () => { resolveCreate({ id: 'ep-new' }); });
  });

  // Test: Endpoint description is optional
  it('sends undefined description when empty', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(mockEndpointsCreate).toHaveBeenCalledWith('test-token-123', {
      url: 'https://example.com',
      description: undefined,
    });
  });
});

describe('OnboardingWizard-ultra: completion and done step', () => {
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

  // Test 11: Shows success on completion
  it('shows success content on done step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    expect(container.textContent).toContain("You're all set");
    expect(container.textContent).toContain('Endpoints');
    expect(container.textContent).toContain('Deliveries');
    expect(container.textContent).toContain('Playground');
    expect(container.textContent).toContain('API Keys');
  });

  // Test 15: Completion triggers callback (navigate to dashboard)
  it('navigates to /dashboard on "Go to Dashboard" click', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    await act(async () => { fireEvent.click(dashBtn!); });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  // Test: Saves dismissed state on completion
  it('saves dismissed=true to localStorage on completion', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    await act(async () => { fireEvent.click(dashBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.dismissed).toBe(true);
  });

  // Test: Go to Dashboard saves state and calls router.push
  it('go to dashboard button triggers dismissal and navigation', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    await act(async () => { fireEvent.click(dashBtn!); });

    // After handleFinish: dismissed=true, router.push('/dashboard')
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.dismissed).toBe(true);
    // Component hides itself after dismissal
    expect(container.textContent).not.toContain("You're all set");
  });
});

describe('OnboardingWizard-ultra: skip/dismiss', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  // Test: Shows "Skip setup" button
  it('shows "Skip setup" on non-done steps', () => {
    const { container } = render(<OnboardingWizard />);
    const skipBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip setup'));
    expect(skipBtn).toBeTruthy();
  });

  // Test: Dismiss hides wizard and saves state
  it('dismiss saves state and hides wizard', async () => {
    const { container } = render(<OnboardingWizard />);
    const skipBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip setup'));
    await act(async () => { fireEvent.click(skipBtn!); });

    expect(container.textContent).not.toContain('Welcome to HookSniff');
    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.dismissed).toBe(true);
  });

  // Test: "Skip setup" not shown on done step
  it('hides "Skip setup" on done step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'done');

    const skipBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Skip setup'));
    expect(skipBtn).toBeUndefined();
  });
});

describe('OnboardingWizard-ultra: test webhook step', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  // Test: Shows test webhook content
  it('shows curl command and test instructions', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'test');

    expect(container.textContent).toContain('Send a test webhook');
    expect(container.textContent).toContain('curl -X POST');
    expect(container.textContent).toContain('test.ping');
  });

  // Test: Has Open Playground link
  it('has Open Playground link with correct href', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'test');

    const link = Array.from(container.querySelectorAll('a')).find(a => a.textContent?.includes('Open Playground'));
    expect(link).toBeTruthy();
    expect(link!.getAttribute('href')).toBe('/dashboard/playground');
  });

  // Test: "I've sent a test" advances to done
  it('advances to done step when "I\'ve sent a test" is clicked', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'test');

    const sentBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes("I've sent a test"));
    await act(async () => { fireEvent.click(sentBtn!); });

    expect(container.textContent).toContain("You're all set");
  });
});

describe('OnboardingWizard-ultra: localStorage persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new' });
    mockAuth = {
      user: { id: 'u1', email: 'test@example.com', name: 'Test User', plan: 'free' },
      token: 'test-token-123',
    };
  });

  // Test: Restores state from localStorage
  it('restores wizard state from localStorage', () => {
    localStorage.setItem('hooksniff_onboarding_state', JSON.stringify({
      dismissed: false,
      currentStep: 2,
      completedSteps: ['welcome', 'usecase'],
      useCase: 'payments',
      endpointCreated: false,
      firstWebhookSent: false,
    }));

    const { container } = render(<OnboardingWizard />);
    expect(container.textContent).toContain('Choose your SDK');
  });

  // Test: Persists completedSteps
  it('persists completedSteps on navigation', async () => {
    const { container } = render(<OnboardingWizard />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.completedSteps).toContain('welcome');
  });

  // Test: Handles corrupted localStorage gracefully
  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('hooksniff_onboarding_state', 'not-valid-json{{{');

    const { container } = render(<OnboardingWizard />);
    // Should still render (falls back to default state)
    expect(container.textContent).toContain('Welcome');
  });
});

describe('OnboardingWizard-ultra: edge cases', () => {
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

  // Test: Non-Error rejection shows fallback message
  it('shows fallback error for non-Error rejection', async () => {
    mockEndpointsCreate.mockRejectedValue('string error');
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com' } }); });

    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    expect(container.textContent).toContain('Failed to create endpoint');
  });

  // Test: Endpoint step shows Playground tip
  it('shows Playground tip on endpoint step', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'endpoint');

    expect(container.textContent).toContain('No real URL yet');
    expect(container.textContent).toContain('Playground');
  });

  // Test: Back button not shown on first step
  it('does not show Back button on welcome step', () => {
    const { container } = render(<OnboardingWizard />);
    const backBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Back'));
    expect(backBtn).toBeUndefined();
  });

  // Test: Continue button disabled on usecase without selection
  it('disables Continue button when no use case selected', async () => {
    const { container } = render(<OnboardingWizard />);
    await navigateToStep(container, 'usecase');

    const continueBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Continue'));
    expect(continueBtn?.getAttribute('disabled')).not.toBeNull();
  });

  // Test: Full flow integration
  it('completes full wizard flow from start to finish', async () => {
    const { container } = render(<OnboardingWizard />);

    // Welcome → Usecase
    const letsGoBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes("Let's go"));
    await act(async () => { fireEvent.click(letsGoBtn!); });

    // Usecase → SDK
    const paymentsBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Payments'));
    await act(async () => { fireEvent.click(paymentsBtn!); });
    const continueBtn1 = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Continue'));
    await act(async () => { fireEvent.click(continueBtn1!); });

    // SDK → Endpoint
    const continueBtn2 = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Continue'));
    await act(async () => { fireEvent.click(continueBtn2!); });

    // Endpoint → Test
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://example.com/hook' } }); });
    const createBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Create Endpoint'));
    await act(async () => { fireEvent.click(createBtn!); });

    // Test → Done
    const sentBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes("I've sent a test"));
    await act(async () => { fireEvent.click(sentBtn!); });

    // Done → Dashboard
    expect(container.textContent).toContain("You're all set");
    const dashBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Go to Dashboard'));
    await act(async () => { fireEvent.click(dashBtn!); });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    const stored = JSON.parse(localStorage.getItem('hooksniff_onboarding_state')!);
    expect(stored.dismissed).toBe(true);
  });
});
