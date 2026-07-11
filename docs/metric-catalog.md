# Metric Catalog

## Availability legend

- **Direct**: expected from the Google Health API when the device records it.
- **Derived**: calculated by this dashboard from direct or manual data.
- **Manual**: entered in this dashboard, with optional Google Health synchronization.
- **Conditional**: depends on device support, wear time, Fitbit processing, or available source fields.

## Activity

| Metric | Source | Status | Dashboard treatment |
| --- | --- | --- | --- |
| Steps | Google Health `steps` | Direct | Daily total, intraday pattern, baseline |
| Distance | `distance` | Direct | Daily and workout distance |
| Active calories | `active-energy-burned` | Direct | Daily and interval totals |
| Total calories | `total-calories` | Direct | Daily rollup |
| Floors | `floors` | Conditional | Daily rollup; device must support elevation |
| Activity intensity | `activity-level`, `active-minutes` | Direct | Sedentary/light/moderate/very active time |
| Workouts | `exercise` | Direct | Type, duration, energy, distance, and available details |
| Active zone minutes | `active-zone-minutes` | Direct | Daily total and intensity distribution |

## Heart and recovery

| Metric | Source | Status | Dashboard treatment |
| --- | --- | --- | --- |
| Heart rate | `heart-rate` | Direct | Intraday chart and contextual summaries |
| Resting heart rate | `daily-resting-heart-rate` | Direct | Baseline deviation and trend |
| Heart-rate zones | `daily-heart-rate-zones`, `time-in-heart-rate-zone` | Direct | Zone totals and workout distribution |
| HRV | `daily-heart-rate-variability`, `heart-rate-variability` | Conditional | Nightly summary, intraday when available, personal baseline |

## Sleep

| Metric | Source | Status | Dashboard treatment |
| --- | --- | --- | --- |
| Sleep duration | `sleep` | Direct | Main sleep, naps, time asleep |
| Sleep stages | `sleep` | Conditional | Awake/light/deep/REM when device supplies stages |
| Wake time | `sleep` | Direct | Actual wake time and rolling distribution |
| Sleep regularity | Sleep start/end times | Derived | Variability and midpoint consistency over 7/28 days |
| Sleep debt | Sleep duration and user target | Derived | Rolling deficit with configurable target |
| Poor-sleep indicators | Sleep plus recovery metrics | Derived | Duration, fragmentation, efficiency, timing, stages, physiology |

## Vitals

| Metric | Source | Status | Dashboard treatment |
| --- | --- | --- | --- |
| SpO2 | `daily-oxygen-saturation`, `oxygen-saturation` | Conditional | Nightly summary and deviations; no diagnosis |
| Respiratory rate | `daily-respiratory-rate`, `respiratory-rate-sleep-summary` | Conditional | Sleep average and personal baseline |
| Skin temperature | `daily-sleep-temperature-derivations` | Conditional | Deviation from personal baseline, not core temperature |

## Body

| Metric | Source | Status | Dashboard treatment |
| --- | --- | --- | --- |
| Weight | `weight` | Direct/manual | Trend and smoothed average |
| Body fat | `body-fat` | Conditional/manual | Trend with source/device shown |
| BMI | Weight and profile height | Derived | Weight kg / height m squared |
| Lean mass | Weight and body-fat percentage | Derived/conditional | Weight x (1 - body-fat fraction); label as estimate |

## Fitness and load

| Metric | Source | Status | Dashboard treatment |
| --- | --- | --- | --- |
| VO2 max/cardio fitness | `daily-vo2-max`, `vo2-max`, `run-vo2-max` | Conditional | Value, category, estimation status, long-term trend |
| Active zone minutes | `active-zone-minutes` | Direct | Daily/weekly load component |
| Training/cardio load | Exercise duration, HR zones, AZM | Derived | Explainable TRIMP-style load; not Fitbit's proprietary score |
| Acute/chronic load | Derived training load | Derived | 7-day load versus 28-day baseline, with cautious language |

## Nutrition and context

| Metric | Source | Status | Dashboard treatment |
| --- | --- | --- | --- |
| Water | `hydration-log` | Direct/manual | Quick log and daily target |
| Calories | `nutrition-log` | Direct/manual | Daily total and meal distribution |
| Macros | `nutrition-log` | Direct/manual | Protein, carbohydrates, and fat |
| Caffeine | Nutrition nutrient or manual log | Conditional/manual | mg and timing; evening exposure indicator |
| Alcohol | Dashboard manual log | Manual | Standard drinks or grams and timing |
| Meal timing | Nutrition log interval and meal type | Direct/manual | First/last meal, eating window, meal regularity |
| Perceived stress | Dashboard daily check-in | Manual | 1-5 scale and notes |
| Mood, energy, soreness | Dashboard daily check-in | Manual | 1-5 scales and trend associations |
| Illness, travel, medication change | Dashboard tags | Manual | Context overlays; medication details optional |

## Derived holistic indicators

### Physiological strain

Inputs: HRV deviation, resting-heart-rate deviation, sleep duration/fragmentation, respiratory-rate deviation, skin-temperature deviation, SpO2 availability, and user-reported stress or illness.

Output: low, moderate, or elevated with contributing factors and confidence. This is a wellness proxy, not a diagnosis or the Fitbit proprietary stress score.

### Recovery/readiness

Inputs: sleep sufficiency, sleep regularity, HRV, resting heart rate, recent training load, and subjective energy/soreness.

Output: a 0-100 display may be used only if the components and their weights remain visible. During early versions, a categorical indicator is preferred to avoid false precision.

### Poor-sleep flags

- Short sleep relative to target.
- High wake-after-sleep-onset or low sleep efficiency.
- Bedtime/wake-time shift relative to baseline.
- Elevated overnight heart rate or respiratory rate.
- Depressed HRV relative to baseline.
- Temperature deviation, late caffeine/alcohol, late meal, or late intense workout as contextual associations.

### Data quality

Every daily view will calculate coverage by source and distinguish unavailable, not worn, not synchronized, and true zero whenever the API permits it.
