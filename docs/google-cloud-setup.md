# Google Cloud Setup

## Services

Use one Google Cloud project for:

- Google Health API access and OAuth consent.
- Firestore Standard application storage.
- Cloud Run deployment in the production phase.
- Secret Manager for OAuth and encryption secrets in production.
- Cloud Scheduler for synchronization and reminder jobs in a later phase.

## Firestore

1. In Google Cloud Console, open Firestore and create a **Firestore Standard** database in Native mode.
2. Use the `(default)` database so the project receives Firestore's free quota.
3. Select a US location appropriate for a personal US deployment. This decision cannot be casually changed later.
4. Do not enable browser/client SDK access. The committed rules deny all browser reads and writes.
5. The Next.js server accesses Firestore through Firebase Admin and Application Default Credentials.

Local development uses the emulator and the demo project ID, so no service-account key is required. Install Java 21 or later before starting the current Firestore emulator:

```bash
pnpm emulators
```

## Google Health API and OAuth

1. Enable Google Health API in the same project.
2. Configure the Google Auth Platform audience as External and add the personal Google account as a test user.
3. Add these read scopes:

```text
https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly
https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly
https://www.googleapis.com/auth/googlehealth.sleep.readonly
https://www.googleapis.com/auth/googlehealth.nutrition.readonly
```

4. Create an OAuth client of type **Web application**.
5. Add `http://localhost:3000/api/auth/google-health/callback` as an authorized redirect URI.
6. Put the client ID and secret in `.env.local`; never commit that file.

## Local environment

```dotenv
APP_URL=http://localhost:3000
APP_TIMEZONE=America/New_York
GOOGLE_CLOUD_PROJECT=demo-fitbit-air
FIRESTORE_DATABASE_ID=(default)
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIRESTORE_ENABLED=false
GOOGLE_HEALTH_CLIENT_ID=your-client-id
GOOGLE_HEALTH_CLIENT_SECRET=your-client-secret
GOOGLE_HEALTH_REDIRECT_URI=http://localhost:3000/api/auth/google-health/callback
TOKEN_ENCRYPTION_KEY=base64-encoded-32-byte-key
```

Generate the local encryption key with:

```bash
openssl rand -base64 32
```

## Production identity

Cloud Run should use a dedicated service account with the minimum Firestore permissions. OAuth secrets and `TOKEN_ENCRYPTION_KEY` move to Secret Manager. Do not upload a service-account JSON key to the repository or Cloud Run image.

## Cost controls

- Create a small Google Cloud budget with email alerts before enabling additional services.
- Keep the default Firestore database to qualify for free quota.
- Configure Cloud Run minimum instances as zero for the personal deployment.
- Add retention rules before storing high-frequency heart-rate records indefinitely.
