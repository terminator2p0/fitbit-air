# Information Architecture

## Navigation

The dashboard uses a quiet, work-focused shell with a compact left navigation on desktop and bottom navigation on mobile.

Primary destinations:

1. Today
2. Sleep
3. Stress & Recovery
4. Activity
5. Heart & Vitals
6. Body
7. Nutrition
8. Trends

Secondary destinations:

- Data & Sync
- Goals & Baselines
- Reminders
- Privacy & Export

## Today

```text
+------------------------------------------------------------------+
| Date | Last sync | Quick log food | Quick check-in               |
+------------------------------------------------------------------+
| Sleep     | Recovery     | Strain      | Nutrition completeness   |
+------------------------------------------------------------------+
| What stands out                                                 |
| - Evidence-backed observation                                   |
| - Evidence-backed observation                                   |
+-----------------------------------+------------------------------+
| Sleep and recovery timeline       | Movement and load            |
+-----------------------------------+------------------------------+
| Meals, caffeine, alcohol, water    | Context and daily check-in   |
+-----------------------------------+------------------------------+
```

The summary row is compact and comparison-oriented. It must not imply that four cards are independent scores; selecting any item opens its components and source data.

## Sleep

- Main sleep and naps timeline.
- Duration, efficiency, wake time, stage distribution, and awakenings.
- Sleep target, rolling debt, bedtime/wake-time consistency.
- Recovery signals aligned to the sleep window.
- Context overlays for caffeine, alcohol, meals, workouts, stress, and illness.
- "Why flagged" drawer for each poor-sleep indicator.

## Stress & Recovery

- Current categorical status and confidence.
- Component table: current value, personal range, contribution, and coverage.
- 28-day HRV, resting heart rate, respiratory rate, temperature, sleep, and load trends.
- Subjective stress, mood, energy, and soreness check-in.
- No diagnosis labels and no unexplained composite value.

## Activity

- Steps, distance, floors, calories, active minutes, and zone minutes.
- Intraday intensity timeline.
- Workout table with duration, zones, distance, and energy.
- Training load trend with formula details.
- VO2 max/cardio fitness long-term trend.

## Heart & Vitals

- Resting and intraday heart rate.
- Heart-rate zones and HRV.
- SpO2, respiratory rate, and skin-temperature deviation.
- Data coverage/wear-time context alongside every chart.
- Source values and timestamps available without surfacing medical interpretations.

## Body

- Weight, body-fat percentage, BMI, and estimated lean mass.
- Raw points plus smoothed trend.
- Source labels for scale, wearable, or manual measurements.
- Formula and assumptions shown for derived values.

## Nutrition

- Mobile-friendly quick log at the top of the page.
- Daily calories, macros, water, caffeine, alcohol, and meal timing.
- Meal timeline and reusable meals.
- Food logging completeness and next reminder.
- Weekly intake and timing patterns.

## Trends

- Metric picker and date range.
- Overlay up to three normalized metrics.
- Compare a selected period with the preceding period or personal baseline.
- Lagged relationship explorer.
- Annotation layer for illness, travel, medication change, and custom notes.
- Data table and export for every visualization.

## Data & Sync

- Google connection status and granted scopes.
- Last successful sync by data domain.
- Available history, records imported, and coverage gaps.
- Reconnect, sync now, backfill, disconnect, and view errors.
- Device/source provenance and explicit missing-versus-zero explanation.

## Reminder flow

```text
Meal window begins
       |
       v
Is a qualifying meal already logged? -- yes --> no reminder
       |
       no
       v
Wait until configured reminder time
       |
       v
Create one reminder event --> dashboard alert + email
       |
       +--> log meal --> complete
       +--> snooze --> reschedule once
       +--> skip --> suppress for this window
```

## Responsive behavior

- Desktop: persistent navigation, two-column analytical layouts where useful.
- Mobile: bottom navigation for the most-used destinations and single-column content.
- Tables collapse to metric/value rows; charts retain fixed, usable heights.
- Quick logging and check-in remain reachable within one action from every primary page.
