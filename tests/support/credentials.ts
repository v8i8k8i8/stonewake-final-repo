// Credentials come only from environment variables (local: VS Code started via
// start-with-env.ps1; CI: GitHub Actions secrets). Never hardcode them here.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set. See README "Setup".`);
  }
  return value;
}

export function userEmail(): string {
  return requireEnv('STONEWAKE_EMAIL');
}

export function userPassword(): string {
  return requireEnv('STONEWAKE_PASSWORD');
}

export function apiKey(): string {
  return requireEnv('STONEWAKE_API_KEY');
}
