# Google Health Ingestion

The ingestion worker refreshes the stored Google OAuth token, retrieves reconciled Google Health records, and loads them idempotently into date-partitioned BigQuery tables.

## Local tests

Tests use only the Python standard library and do not require cloud credentials:

```bash
pnpm test:python
```

## Runtime configuration

- `GOOGLE_CLOUD_PROJECT`: Google Cloud project ID.
- `BIGQUERY_DATASET`: dataset name, default `fitbit_air`.
- `BIGQUERY_LOCATION`: dataset location, default `US`.
- `GOOGLE_HEALTH_TOKEN_SECRET`: Secret Manager secret, default `google-health-oauth`.
- `INITIAL_LOOKBACK_DAYS`: first synchronization window, default 30.

Application Default Credentials are used locally and the attached service account is used on Cloud Run.

## Data flow

1. Read the latest OAuth payload from Secret Manager.
2. Exchange the refresh token for a short-lived access token.
3. Read the previous checkpoint for each Google Health data type.
4. Follow every `nextPageToken` from the reconciled endpoint.
5. Load a temporary BigQuery staging table.
6. Merge by stable event ID into the partitioned raw table.
7. Advance the checkpoint only after a successful merge.

## Cloud Run Job

Build the container from this directory and configure the job with a service account that can access the OAuth secret, create BigQuery jobs, and edit data in the target dataset. Cloud Scheduler can trigger the job after the first manual synchronization succeeds.
