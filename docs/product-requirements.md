# Product Requirements

## 1. Product statement

Build a private, single-user web dashboard that converts Google/Fitbit health data and manual lifestyle logs into understandable daily status, trends, correlations, and gentle reminders.

The main question the product should answer is: **What is affecting how I feel and recover, and what changed compared with my own normal?**

## 2. Confirmed scope

- Web dashboard only; responsive on desktop and mobile browsers.
- Personal, single-user use.
- Google Health API as the primary wearable data source.
- Manual logging for nutrition, alcohol, subjective stress, mood, illness, soreness, and other context.
- Food logging reminders.
- Historical trends, personal baselines, derived indicators, and explainable insights.
- Import/export and deletion of all locally stored data.

## 3. Out of scope

- Native Android or iOS application.
- Health Connect integration.
- Social features, coaching marketplace, clinician portal, or multiple users.
- Medical diagnosis, treatment recommendations, or emergency monitoring.
- A single opaque health score with no explanation.

## 4. Primary dashboard experiences

### Today

- Current wellbeing summary: sleep, recovery, strain, movement, nutrition completeness, and notable deviations.
- A short list of prioritized observations with supporting evidence.
- Food and water quick-log actions.
- Next food reminder and missing-log status.

### Sleep and recovery

- Sleep duration, stages, awakenings, bedtime, wake time, consistency, and sleep debt.
- HRV, resting heart rate, respiratory rate, SpO2, and skin-temperature deviation.
- Personal-baseline comparisons over 7, 28, and 90 days.
- Poor-sleep indicators and likely contributing context, expressed as associations.

### Stress and readiness

- A transparent stress-load indicator based on deviations in HRV, resting heart rate, sleep, respiratory rate, temperature, and recent physical load.
- A readiness indicator that distinguishes physiological strain from training strain where possible.
- User-entered stress, mood, soreness, and illness for calibration.
- Each indicator must list its contributing signals, confidence, and missing data.

### Activity and fitness

- Steps, distance, floors, activity intensity, active and total calories, active zone minutes, and workouts.
- Heart-rate zones and workout details.
- VO2 max/cardio fitness trend.
- Derived training load and acute-versus-chronic load trend when source data is sufficient.

### Body and nutrition

- Weight, body fat, BMI, and estimated lean mass.
- Calories, protein, carbohydrate, fat, water, caffeine, alcohol, and meal timing.
- Logging completeness and streaks without punitive language.
- Associations between nutrition timing/intake and sleep or recovery.

### Trends and relationships

- Daily, weekly, monthly, and custom ranges.
- Personal baseline bands, rolling averages, and change-point annotations.
- Correlation explorer with lag options such as caffeine today versus sleep tonight.
- Clear warnings that correlation does not establish causation.

## 5. Manual logging

The quick-log experience must work comfortably from a phone browser and require minimal typing.

- Food: description, meal type, timestamp, calories, protein, carbohydrates, and fat.
- Water: amount and timestamp.
- Caffeine: amount in mg, source, and timestamp.
- Alcohol: standard drinks or grams, type, and timestamp.
- Daily check-in: perceived stress, mood, energy, soreness, illness, and optional note.
- Reusable meals and recent entries.

Google Health nutrition records will be read and written when practical. App-owned fields such as alcohol units and subjective check-ins remain in the dashboard database.

## 6. Food reminders

- Configurable breakfast, lunch, dinner, and optional snack windows.
- Remind only when no qualifying food log exists for that meal window.
- Snooze for 15, 30, or 60 minutes; skip for the day.
- Respect timezone, quiet hours, travel, and disabled days.
- Show an in-dashboard reminder whenever the dashboard is open.
- Send email reminders when the dashboard is closed; browser push can be added later as an optional PWA capability.
- Never include sensitive health details in email subject lines or lock-screen notification text.

## 7. Insight requirements

- Compare measurements primarily to the user's own rolling baseline.
- Separate observed facts, derived indicators, and interpretations in the interface.
- Show why an insight appeared, the lookback window, and data completeness.
- Use neutral language: "HRV is below your recent range" rather than diagnostic claims.
- Suppress insights when data quality or coverage is insufficient.
- Allow the user to dismiss, mute, or mark an insight as useful.

## 8. Non-functional requirements

- OAuth refresh tokens encrypted at rest; secrets never exposed to browser code.
- HTTPS in every deployed environment.
- Single-user authentication even for a personal deployment.
- Timezone-aware storage with original source timestamps retained.
- Idempotent synchronization, deduplication, retry handling, and source provenance.
- Data export in JSON and CSV and complete account/data deletion.
- Automated backups with a documented restore procedure.
- Accessibility target: WCAG 2.2 AA for core workflows.
- Responsive support for current Chrome, Safari, Firefox, and Edge.
- Daily dashboard load target under two seconds after data is synchronized.
- Audit log for connection, sync, export, and deletion events.

## 9. Success criteria

- A daily review takes less than two minutes.
- Every derived insight can be explained from visible source metrics.
- Food logging takes under 20 seconds for a recent or saved meal.
- At least 95% of scheduled daily syncs complete without manual intervention.
- Missing wearable data is distinguishable from a true zero.
- The dashboard helps identify changes over time without making medical claims.

## 10. Phase 0 acceptance criteria

- Product scope and exclusions are agreed.
- Every requested metric has a source or derivation rule.
- Google Cloud project and OAuth web client are created for the personal account.
- Required Google Health API scopes are enabled and a test authorization succeeds.
- Sample responses are captured for at least activity, sleep, heart, vitals, and body data.
- Reminder delivery channel and deployment model are confirmed.
- Phase 1 can begin without unresolved data-access blockers.
