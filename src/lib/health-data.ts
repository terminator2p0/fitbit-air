export type DailyTrend = {
  date: string;
  sleep: number;
  hrv: number;
  restingHeartRate: number;
  strain: number;
};

export const trendData: DailyTrend[] = [
  { date: "Sat", sleep: 7.4, hrv: 49, restingHeartRate: 58, strain: 42 },
  { date: "Sun", sleep: 7.9, hrv: 52, restingHeartRate: 57, strain: 36 },
  { date: "Mon", sleep: 6.8, hrv: 45, restingHeartRate: 60, strain: 63 },
  { date: "Tue", sleep: 7.2, hrv: 47, restingHeartRate: 59, strain: 54 },
  { date: "Wed", sleep: 6.4, hrv: 41, restingHeartRate: 62, strain: 72 },
  { date: "Thu", sleep: 7.1, hrv: 44, restingHeartRate: 61, strain: 59 },
  { date: "Today", sleep: 6.7, hrv: 39, restingHeartRate: 64, strain: 68 },
];

export const summaryMetrics = [
  { label: "Sleep", value: "6h 42m", detail: "48m below target", tone: "attention" },
  { label: "Recovery", value: "Moderate", detail: "HRV below baseline", tone: "neutral" },
  { label: "Strain", value: "Elevated", detail: "3 signals contributing", tone: "attention" },
  { label: "Nutrition", value: "2 of 3", detail: "Lunch not logged", tone: "positive" },
] as const;

export const observations = [
  {
    title: "Recovery signals are softer than usual",
    body: "HRV is 15% below your 28-day range while resting heart rate is 4 bpm above it.",
    evidence: ["HRV 39 ms", "RHR 64 bpm", "92% coverage"],
    level: "attention",
  },
  {
    title: "Your sleep timing stayed consistent",
    body: "Bedtime was within 18 minutes of your usual time, despite shorter total sleep.",
    evidence: ["Bedtime 11:18 PM", "6h 42m asleep"],
    level: "positive",
  },
  {
    title: "Late caffeine may be worth watching",
    body: "Yesterday's last caffeine entry was 7 hours before sleep. This is context, not a causal finding.",
    evidence: ["85 mg at 4:12 PM", "Sleep at 11:21 PM"],
    level: "neutral",
  },
] as const;

export const activity = {
  steps: 6842,
  stepGoal: 9000,
  zoneMinutes: 18,
  calories: 1840,
  distance: 3.1,
};
