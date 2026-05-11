/**
 * Visual Regression Tests — HookSniff Dashboard
 *
 * Captures screenshots of key pages and compares them against baseline snapshots.
 * Uses Playwright's built-in `toHaveScreenshot()` for pixel-level comparison.
 *
 * Run:
 *   npm run test:visual              — compare against baselines
 *   npm run test:visual:update       — regenerate baseline snapshots
 *
 * Baseline snapshots are stored in `e2e/visual/__screenshots__/`.
 * First run will fail (no baselines) — run with --update-snapshots to create them.
 */
import { test, expect } from '@playwright/test';

// ─── Auth helper ───
// Set up authenticated state by injecting localStorage/token before page load.
// Adjust based on how your auth works (cookie, localStorage, etc.)
async function setupAuth(page: import('@playwright/test').Page) {
  // Mock the auth token in localStorage (adjust key as needed)
  await page.addInitScript(() => {
    localStorage.setItem('hooksniff_token', 'visual-test-token');
    localStorage.setItem(
      'hooksniff_user',
      JSON.stringify({
        id: '1',
        email: 'visual@test.com',
        name: 'Visual Tester',
        plan: 'pro',
        is_admin: false,
      }),
    );
  });
}

async function setupAdminAuth(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('hooksniff_token', 'visual-admin-token');
    localStorage.setItem(
      'hooksniff_user',
      JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin',
        plan: 'business',
        is_admin: true,
      }),
    );
  });
}

// ─── Dashboard Overview ───

test.describe('Visual — Dashboard Overview', () => {
  test('dashboard home — light mode', async ({ page }) => {
    await setupAuth(page);
    // Force light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for content to render
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-home-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02, // 2% tolerance for minor rendering differences
    });
  });

  test('dashboard home — dark mode', async ({ page }) => {
    await setupAuth(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-home-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Endpoints List ───

test.describe('Visual — Endpoints', () => {
  test('endpoints list page', async ({ page }) => {
    await setupAuth(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard/endpoints');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('endpoints-list.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('endpoints list — dark mode', async ({ page }) => {
    await setupAuth(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en/dashboard/endpoints');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('endpoints-list-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Deliveries ───

test.describe('Visual — Deliveries', () => {
  test('deliveries list page', async ({ page }) => {
    await setupAuth(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard/deliveries');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('deliveries-list.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Settings Page ───

test.describe('Visual — Settings', () => {
  test('settings page', async ({ page }) => {
    await setupAuth(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('settings-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('settings page — dark mode', async ({ page }) => {
    await setupAuth(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('settings-page-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Admin Pages ───

test.describe('Visual — Admin Pages', () => {
  test('admin overview', async ({ page }) => {
    await setupAdminAuth(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('admin-overview.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('admin users', async ({ page }) => {
    await setupAdminAuth(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/admin/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('admin-users.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('admin revenue', async ({ page }) => {
    await setupAdminAuth(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/admin/revenue');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('admin-revenue.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

// ─── Mobile Responsive Views ───

test.describe('Visual — Mobile Responsive', () => {
  test('dashboard — mobile viewport', async ({ page }) => {
    await setupAuth(page);
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13 size
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.03, // Slightly higher tolerance for mobile
    });
  });

  test('endpoints — mobile viewport', async ({ page }) => {
    await setupAuth(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard/endpoints');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('endpoints-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('deliveries — mobile viewport', async ({ page }) => {
    await setupAuth(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard/deliveries');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('deliveries-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('settings — mobile viewport', async ({ page }) => {
    await setupAuth(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('settings-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('landing page — mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('landing-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.03,
    });
  });
});

// ─── Public Pages ───

test.describe('Visual — Public Pages', () => {
  test('landing page — desktop light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('landing-desktop-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('landing page — desktop dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('landing-desktop-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('pricing page', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/pricing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('pricing-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('login page', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
