export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const STORAGE_KEY = 'hooksniff_onboarding_state';

export interface OnboardingState {
  dismissed: boolean;
  currentStep: number;
  completedSteps: string[];
  useCase: string;
  endpointCreated: boolean;
  firstWebhookSent: boolean;
}

export function loadState(): OnboardingState {
  if (typeof window === 'undefined') return { dismissed: false, currentStep: 0, completedSteps: [], useCase: '', endpointCreated: false, firstWebhookSent: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignored */ }
  return { dismissed: false, currentStep: 0, completedSteps: [], useCase: '', endpointCreated: false, firstWebhookSent: false };
}

export function saveState(state: OnboardingState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignored */ }
}

export const SDKS = [
  { id: 'nodejs', label: 'Node.js', install: 'npm install hooksniff-sdk' },
  { id: 'python', label: 'Python', install: 'pip install hooksniff' },
  { id: 'go', label: 'Go', install: 'go get github.com/hooksniff/hooksniff-go' },
  { id: 'rust', label: 'Rust', install: 'cargo add hooksniff' },
  { id: 'csharp', label: 'C#', install: 'dotnet add package HookSniff' },
  { id: 'java', label: 'Java', install: '<dependency>\n  <groupId>dev.hooksniff</groupId>\n  <artifactId>hooksniff-sdk</artifactId>\n</dependency>' },
  { id: 'ruby', label: 'Ruby', install: 'gem install hooksniff' },
  { id: 'php', label: 'PHP', install: 'composer require hooksniff/hooksniff-php' },
  { id: 'swift', label: 'Swift', install: '.package(url: "https://github.com/hooksniff/hooksniff-swift", from: "0.1.0")' },
  { id: 'kotlin', label: 'Kotlin', install: 'implementation("dev.hooksniff:hooksniff:0.3.0")' },
  { id: 'elixir', label: 'Elixir', install: '{:hooksniff, "~> 0.2.0"}' },
];
