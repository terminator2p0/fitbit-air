# Personal Health Dashboard

A private, web-only dashboard for understanding Fitbit and Google wearable data in context. The product emphasizes sleep, recovery, stress proxies, activity, nutrition, and long-term patterns rather than workout tracking alone.

## Current status

Phase 0: product definition and data feasibility.

Development is local-first in this Git repository. Cloud deployment begins only after the local dashboard, synchronization, and privacy controls have been reviewed.

The planned primary integration is the Google Health API. Health Connect is intentionally out of scope because this product has no Android application. Data that Google Health does not expose will be entered manually or calculated from available measurements.

## Phase 0 documents

- [Product requirements](docs/product-requirements.md)
- [Metric catalog](docs/metric-catalog.md)
- [Architecture decisions](docs/architecture.md)
- [Information architecture](docs/information-architecture.md)
- [Delivery plan](docs/delivery-plan.md)

## Product boundary

This dashboard provides personal wellness information, trends, and explainable indicators. It does not diagnose conditions, replace professional medical advice, or present correlations as causes.

## Repository workflow

The default branch is `main`. Feature work should use short-lived branches and return through reviewed commits. Local secrets belong in `.env.local`, based on `.env.example`; secret files, local databases, exports, and health-data backups are excluded from Git.

The initial implementation will run locally with the web server and PostgreSQL. The same environment-variable contract and database migrations will later be used for cloud deployment.
