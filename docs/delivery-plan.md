# Delivery Plan

## Phase 0: Discovery and feasibility

**Status:** In progress

Deliverables:

- Product requirements and product boundary.
- Requested metric availability and derivation catalog.
- Web-only architecture and privacy decisions.
- Google Cloud project, OAuth client, scopes, and successful test authorization.
- Sanitized sample payloads and a data-coverage report for the actual account/device.
- Low-fidelity information architecture for Today, Sleep, Stress & Recovery, Activity, Body, Nutrition, and Trends.

Exit gate: real account data has been retrieved for the five core domains and any unavailable metrics are accepted or assigned a fallback.

## Phase 1: Data foundation

Estimated duration: 2-3 weeks.

- Scaffold the web project, BigQuery data layer, authentication, Python ingestion, and local development environment.
- Implement Google OAuth and encrypted token storage.
- Implement Google Health source adapters, initial backfill, incremental sync, and provenance.
- Add normalized schemas, daily rollups, data coverage, and sync status.
- Add fixture-based integration tests and API contract tests.

Exit gate: at least 90 days of available data syncs idempotently and can be queried by day/domain.

## Phase 2: Dashboard MVP

Estimated duration: 2-3 weeks.

- Build navigation and responsive dashboard shell.
- Ship Today, Sleep & Recovery, Activity, Heart/Vitals, and Body views.
- Add date controls, baseline bands, comparisons, missing-data states, and source details.
- Add manual daily check-in.

Exit gate: the dashboard clearly answers what happened today and how it differs from the user's baseline.

## Phase 3: Nutrition and reminders

Estimated duration: 2 weeks.

- Build food, water, caffeine, alcohol, and meal-time logging.
- Add recent/saved meals and daily nutrition summaries.
- Add configurable meal windows, in-dashboard reminders, email delivery, snooze, and skip.
- Optionally synchronize supported nutrition and hydration records to Google Health.

Exit gate: a saved meal can be logged in under 20 seconds and reminders fire once per eligible meal window.

## Phase 4: Holistic insight engine

Estimated duration: 3-4 weeks.

- Implement sleep regularity, sleep debt, physiological strain, readiness, and poor-sleep flags.
- Implement training load and acute/chronic trends from transparent formulas.
- Add context overlays and lagged correlation exploration.
- Add explanation, confidence, data sufficiency, and feedback controls.

Exit gate: every surfaced insight has visible evidence and passes safety/data-quality rules.

## Phase 5: Hardening and personal production release

Estimated duration: 2-3 weeks.

- Accessibility, cross-browser, timezone, and responsive testing.
- Security review, token rotation/revocation, backup/restore, export, and deletion.
- Monitoring for failed syncs and reminders without exposing health payloads.
- Deployment documentation and recovery runbook.

Exit gate: reliable daily private use with documented restore and disconnect procedures.

## Immediate Phase 0 actions

1. Create or select a Google Cloud project and enable Google Health API.
2. Create a Web Server OAuth client with the local callback URI and add the personal Google account as a test user.
3. Add the four initial read scopes listed in the architecture document.
4. Complete a local test authorization and retrieve identity plus one small sample from each core domain.
5. Record which requested metrics are present for the actual Fitbit device and account.
6. Confirm the eventual private cloud provider after the local dashboard is accepted.
7. Confirm the email destination and preferred breakfast, lunch, and dinner reminder windows.
