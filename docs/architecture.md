# Architecture Decisions

## ADR-001: Web-only data access

**Decision:** Do not use Health Connect.

Health Connect is an Android on-device data store and requires Android integration to read its records. This product is web-only and will retrieve Fitbit/Pixel wearable data through the cloud-based Google Health API.

**Consequence:** Records that exist only in Health Connect and are not synchronized to Google Health will be unavailable. A future Android companion would be a separate phase, not part of the current product.

## ADR-002: Google Health API first

**Decision:** Build the source adapter against Google Health API v4 and Google OAuth 2.0.

The legacy Fitbit Web API is scheduled to stop syncing in September 2026. The integration layer will still isolate provider-specific mapping so fixtures or a short-lived legacy fallback can be supported during development.

## ADR-003: Local-first development with server-side components

**Decision:** Develop and validate a responsive web frontend, private backend, and database locally before deploying the same system to a private cloud environment.

A browser-only application cannot safely retain OAuth client secrets or reliably run scheduled synchronization and email reminders while closed. The server is therefore responsible for OAuth token storage, data synchronization, derivations, reminders, exports, and backups.

Local development uses `localhost` OAuth redirects, a local PostgreSQL instance, and environment files that are excluded from Git. Cloud deployment will use managed HTTPS, a managed PostgreSQL database, encrypted cloud secrets, and the same versioned database migrations. Real health data and exports must never be committed.

## Proposed implementation stack

- Frontend: Next.js, TypeScript, React, and an accessible component system.
- Backend: Next.js server routes and background worker initially; split service only if operational needs justify it.
- Database: PostgreSQL with typed tables for normalized health records and derived daily summaries.
- Jobs: database-backed scheduled jobs for synchronization, aggregation, and reminders.
- Charts: a React charting library with accessible tabular fallbacks.
- Email: transactional email provider or SMTP configured by environment variables.
- Local runtime: web process, worker, and PostgreSQL, preferably orchestrated with Docker Compose.
- Deployment: private cloud hosting with HTTPS after local acceptance criteria pass.

## Logical data flow

```text
Fitbit/Pixel device -> Fitbit sync -> Google Health API
                                      |
                                      v
                               scheduled importer
                                      |
                   raw source records + sync provenance
                                      |
                         normalized measurements
                                      |
                      daily aggregates and baselines
                                      |
                   indicators, insights, and dashboard

Manual web logs ----------------------^
Reminder scheduler -> dashboard alert / email
```

## Data layers

1. **Source records:** minimally transformed API payloads, source identifiers, timestamps, and ingestion metadata.
2. **Normalized records:** canonical units and categories used across the product.
3. **Daily summaries:** timezone-aware rollups and coverage flags.
4. **Derived indicators:** versioned formulas, inputs, baseline window, confidence, and explanation.
5. **User context:** manual logs, goals, reminder preferences, annotations, and feedback.

## Initial OAuth scopes

- `googlehealth.activity_and_fitness.readonly`
- `googlehealth.health_metrics_and_measurements.readonly`
- `googlehealth.sleep.readonly`
- `googlehealth.nutrition.readonly`
- Nutrition write scope only when Google Health food and hydration logging is implemented.

Request the minimum scopes needed for the active feature set. OAuth refresh tokens must be encrypted and readable only by the backend.

### Personal OAuth constraint

A Google OAuth project in Testing status permits explicitly listed test users, which suits initial personal development, but its refresh token expires after seven days. Phase 0 must test whether moving the personal project to In Production is practical under the current restricted-scope policy. Until then, the dashboard must make token expiry visible and provide a simple reconnect flow.

## Synchronization strategy

- Initial import: request available history in bounded windows and persist cursors/checkpoints.
- Incremental sync: scheduled pull at least four times daily; use webhooks when stable and useful.
- Reconciliation: prefer Google's reconciled stream to match the Fitbit-visible source of truth.
- Idempotency: upsert by provider record identity and retain last-seen/updated metadata.
- Backfill: re-read recent days because Fitbit-derived summaries can change after device sync.
- Time: store UTC timestamps, source offsets, civil dates, and the user's active timezone.

## Security and privacy

- Private authentication and no anonymous dashboard routes.
- HTTPS, secure cookies, CSRF protection, strict content security policy, and rate limiting.
- Encrypt OAuth refresh tokens and backup media.
- Keep secrets in deployment configuration, never source control.
- Avoid sending health measurements to analytics or error-reporting services.
- Redact tokens and health payloads from logs.
- Provide export, disconnect, retention, and permanent deletion controls.

## Reminder design

The server evaluates meal windows in the user's timezone. A reminder job checks whether a qualifying food entry exists, then records a reminder event before sending email to prevent duplicates. The dashboard reads the same event stream for in-app reminders.

Browser push is deferred because reliable push requires notification permission, service-worker support, and browser/platform-specific behavior. Email plus in-dashboard reminders cover the initial personal use case with less fragility.

## Insight safety

- Derived formulas are versioned and testable.
- Every indicator stores its component contributions and data coverage.
- No alert should suggest a disease or claim that one behavior caused another outcome.
- Persistent or concerning readings should be framed as a reason to review source data and, where appropriate, consult a qualified professional.
