import { requireOAuthConfig } from "./config";
import { googleHealthSecretExists, storeGoogleHealthSecret } from "./google-cloud";

export const GOOGLE_HEALTH_SCOPES = [
  "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
  "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
  "https://www.googleapis.com/auth/googlehealth.sleep.readonly",
  "https://www.googleapis.com/auth/googlehealth.nutrition.readonly",
] as const;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
  token_type: string;
};

type HealthIdentity = {
  healthUserId?: string;
  fitbitUserId?: string;
  googleUserId?: string;
  [key: string]: unknown;
};

export function buildGoogleHealthAuthorizationUrl(state: string) {
  const { clientId, redirectUri } = requireOAuthConfig();
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: GOOGLE_HEALTH_SCOPES.join(" "),
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`;
}

export async function exchangeAuthorizationCode(code: string) {
  const { clientId, clientSecret, redirectUri } = requireOAuthConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with status ${response.status}`);
  }
  return (await response.json()) as TokenResponse;
}

export async function fetchGoogleHealthIdentity(accessToken: string) {
  const response = await fetch("https://health.googleapis.com/v4/users/me/identity", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Google Health identity request failed with status ${response.status}`);
  }
  return (await response.json()) as HealthIdentity;
}

export async function storeGoogleHealthConnection(tokens: TokenResponse, identity: HealthIdentity) {
  if (!tokens.refresh_token) {
    throw new Error("Google did not return a refresh token; revoke consent and reconnect");
  }

  const { clientId, clientSecret } = requireOAuthConfig();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  const refreshTokenExpiresAt = tokens.refresh_token_expires_in
    ? new Date(Date.now() + tokens.refresh_token_expires_in * 1000)
    : null;

  await storeGoogleHealthSecret({
    provider: "google-health",
    clientId,
    clientSecret,
    identity,
    scopes: tokens.scope.split(" "),
    tokenType: tokens.token_type,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessTokenExpiresAt: expiresAt.toISOString(),
    refreshTokenExpiresAt: refreshTokenExpiresAt?.toISOString() ?? null,
    connectedAt: new Date().toISOString(),
  });
}

export async function getGoogleHealthConnectionStatus() {
  return { connected: await googleHealthSecretExists() };
}
