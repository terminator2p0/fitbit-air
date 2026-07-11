# Google Cloud Setup

## Services

Use one Google Cloud project for:

- Google Health API and OAuth consent.
- BigQuery health storage and analytics.
- Secret Manager for OAuth credentials.
- Cloud Run for the web dashboard and Python ingestion job.
- Cloud Scheduler for synchronization and reminders in a later phase.

Enable these APIs:

```text
Google Health API
BigQuery API
Secret Manager API
Cloud Run Admin API
Cloud Build API
Artifact Registry API
```

## BigQuery

The Python worker creates a dataset named `fitbit_air` by default and manages these initial tables:

- `raw_health_events`: complete source payloads, partitioned by `event_date` and clustered by data type and event ID.
- `sync_state`: the successful high-water mark for every Google Health data type.

Staging tables are created for each batch and merged by stable event ID. A checkpoint advances only after its merge succeeds.

Use the `US` multi-region unless another location is deliberately selected. Keep every related BigQuery and Cloud Run resource in a compatible location.

## Secret Manager

Create an empty secret named `google-health-oauth`. The OAuth callback adds a new secret version containing the client ID, client secret, refresh token, access token, scopes, expiry, and Google Health identity.

The web service account needs:

- `roles/secretmanager.secretVersionAdder` on this secret.
- `roles/secretmanager.secretAccessor` to report connection status.

The Python ingestion service account needs:

- `roles/secretmanager.secretAccessor` on this secret.
- BigQuery Job User on the project.
- BigQuery Data Editor on the `fitbit_air` dataset.

## Google Health OAuth

1. Enable Google Health API.
2. Configure the Google Auth Platform audience as External and add the personal Google account as a test user.
3. Add these scopes:

```text
https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly
https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly
https://www.googleapis.com/auth/googlehealth.sleep.readonly
https://www.googleapis.com/auth/googlehealth.nutrition.readonly
```

4. Create a Web application OAuth client.
5. Add `http://localhost:3000/api/auth/google-health/callback` as an authorized redirect URI.
6. Put the client ID and secret in `.env.local`; never commit that file.

## Local environment

```dotenv
APP_URL=http://localhost:3000
APP_TIMEZONE=America/New_York
GOOGLE_CLOUD_PROJECT=your-project-id
BIGQUERY_DATASET=fitbit_air
BIGQUERY_LOCATION=US
GOOGLE_HEALTH_TOKEN_SECRET=google-health-oauth
GOOGLE_HEALTH_CLIENT_ID=your-client-id
GOOGLE_HEALTH_CLIENT_SECRET=your-client-secret
GOOGLE_HEALTH_REDIRECT_URI=http://localhost:3000/api/auth/google-health/callback
```

Authenticate local server and Python processes with Application Default Credentials. Production uses attached service accounts and Secret Manager environment references instead of local credentials.

## Cost controls

- Create a Google Cloud budget with email alerts before scheduled ingestion is enabled.
- Require partition filters on derived high-volume tables.
- Query selected columns rather than `SELECT *`.
- Use batch load jobs and staging merges rather than per-record streaming inserts.
- Configure Cloud Run minimum instances as zero.
- Choose a retention policy before storing high-frequency heart rate indefinitely.
