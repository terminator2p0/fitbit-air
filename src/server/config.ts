const requiredOAuthVariables = [
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_HEALTH_CLIENT_ID",
  "GOOGLE_HEALTH_CLIENT_SECRET",
  "GOOGLE_HEALTH_REDIRECT_URI",
] as const;

export function getServerConfig() {
  return {
    appUrl: process.env.APP_URL ?? "http://localhost:3000",
    googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT,
    bigQueryDataset: process.env.BIGQUERY_DATASET ?? "fitbit_air",
    bigQueryLocation: process.env.BIGQUERY_LOCATION ?? "US",
    googleHealthTokenSecret:
      process.env.GOOGLE_HEALTH_TOKEN_SECRET ?? "google-health-oauth",
    googleHealthClientId: process.env.GOOGLE_HEALTH_CLIENT_ID,
    googleHealthClientSecret: process.env.GOOGLE_HEALTH_CLIENT_SECRET,
    googleHealthRedirectUri:
      process.env.GOOGLE_HEALTH_REDIRECT_URI ??
      "http://localhost:3000/api/auth/google-health/callback",
  };
}

export function getMissingOAuthVariables() {
  return requiredOAuthVariables.filter((variable) => !process.env[variable]);
}

export function requireOAuthConfig() {
  const missing = getMissingOAuthVariables();
  if (missing.length > 0) {
    throw new Error(`Missing Google Health configuration: ${missing.join(", ")}`);
  }

  const config = getServerConfig();
  return {
    clientId: config.googleHealthClientId as string,
    clientSecret: config.googleHealthClientSecret as string,
    redirectUri: config.googleHealthRedirectUri,
    projectId: config.googleCloudProject as string,
    tokenSecret: config.googleHealthTokenSecret,
  };
}
