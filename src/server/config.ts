const requiredOAuthVariables = [
  "GOOGLE_HEALTH_CLIENT_ID",
  "GOOGLE_HEALTH_CLIENT_SECRET",
  "GOOGLE_HEALTH_REDIRECT_URI",
  "TOKEN_ENCRYPTION_KEY",
] as const;

export function getServerConfig() {
  const isFirestoreEmulated = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  return {
    appUrl: process.env.APP_URL ?? "http://localhost:3000",
    googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT ?? "demo-fitbit-air",
    firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID ?? "(default)",
    googleHealthClientId: process.env.GOOGLE_HEALTH_CLIENT_ID,
    googleHealthClientSecret: process.env.GOOGLE_HEALTH_CLIENT_SECRET,
    googleHealthRedirectUri:
      process.env.GOOGLE_HEALTH_REDIRECT_URI ??
      "http://localhost:3000/api/auth/google-health/callback",
    tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
    isFirestoreEmulated,
    firestoreEnabled:
      isFirestoreEmulated ||
      process.env.FIRESTORE_ENABLED === "true" ||
      Boolean(process.env.K_SERVICE),
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
    encryptionKey: config.tokenEncryptionKey as string,
  };
}
