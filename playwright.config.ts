import { defineConfig } from '@playwright/test';

// Public product URLs; override with environment variables if needed.
const APP_URL = process.env.STONEWAKE_APP_URL || 'https://app.stonewake.ai';
const API_URL = process.env.STONEWAKE_API_URL || 'https://api.stonewake.ai';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'api', testMatch: 'api.spec.ts', use: { baseURL: API_URL } },
    { name: 'ui', testMatch: 'ui.spec.ts', use: { baseURL: APP_URL } },
  ],
});
