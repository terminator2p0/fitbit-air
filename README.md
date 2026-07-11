# Personal Health Dashboard

A private, web-only dashboard for understanding Fitbit and Google wearable data in context. The product emphasizes sleep, recovery, stress proxies, activity, nutrition, and long-term patterns rather than workout tracking alone.

## Current status

Phase 0: product definition and data feasibility.

Development is local-first in this Git repository. Cloud deployment begins only after the local dashboard, synchronization, and privacy controls have been reviewed.

The primary integration is the Google Health API. Health Connect is intentionally out of scope because this product has no Android application. Python ingestion stores reconciled wearable data in BigQuery; data that Google Health does not expose will be entered manually or calculated from available measurements.

## Phase 0 documents

- [Product requirements](docs/product-requirements.md)
- [Metric catalog](docs/metric-catalog.md)
- [Architecture decisions](docs/architecture.md)
- [Information architecture](docs/information-architecture.md)
- [Google Cloud setup](docs/google-cloud-setup.md)
- [Delivery plan](docs/delivery-plan.md)

## Product boundary

This dashboard provides personal wellness information, trends, and explainable indicators. It does not diagnose conditions, replace professional medical advice, or present correlations as causes.

## Repository workflow

The default branch is `main`. Feature work should use short-lived branches and return through reviewed commits. Local secrets belong in `.env.local`, based on `.env.example`; secret files, local databases, exports, and health-data backups are excluded from Git.

The implementation runs locally as a Next.js web server plus a Python ingestion worker. BigQuery stores health data and Secret Manager stores OAuth credentials.

## Local development

1. Install dependencies with `pnpm install`.
2. Create `.env.local` from `.env.example`.
3. Authenticate Application Default Credentials for Google Cloud.
4. Start the dashboard with `pnpm dev`.
5. Run Python tests with `pnpm test:python`.

The Python sync runs only after Google Health OAuth succeeds and the OAuth payload exists in Secret Manager.
