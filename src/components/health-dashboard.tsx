"use client";

import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Droplets,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  MoonStar,
  Plus,
  RefreshCw,
  Salad,
  Scale,
  Settings,
  Sparkles,
  TrendingUp,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { activity, observations, summaryMetrics, trendData } from "@/lib/health-data";
import { CloudConnection } from "@/components/cloud-connection";

const navigation = [
  { label: "Today", icon: LayoutDashboard },
  { label: "Sleep", icon: MoonStar },
  { label: "Stress & Recovery", icon: Gauge },
  { label: "Activity", icon: Activity },
  { label: "Heart & Vitals", icon: HeartPulse },
  { label: "Body", icon: Scale },
  { label: "Nutrition", icon: Salad },
  { label: "Trends", icon: TrendingUp },
];

type Drawer = "food" | "checkin" | null;

export function HealthDashboard() {
  const [range, setRange] = useState("7 days");
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [activeNav, setActiveNav] = useState("Today");
  const stepProgress = Math.min(100, (activity.steps / activity.stepGoal) * 100);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><HeartPulse size={18} /></span><span>Fitbit Air</span></div>
        <nav aria-label="Primary navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              key={label}
              onClick={() => setActiveNav(label)}
              type="button"
            >
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" type="button"><Settings size={18} /><span>Settings</span></button>
          <div className="user-row"><CircleUserRound size={28} /><div><strong>Personal</strong><span>Private workspace</span></div></div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">Friday, July 11</p>
            <h1>{activeNav}</h1>
          </div>
          <div className="top-actions">
            <button className="sync-status" type="button" title="Sync health data"><RefreshCw size={15} /><span>Synced 12m ago</span></button>
            <button className="icon-button" type="button" title="Reminders"><Bell size={18} /><span className="notification-dot" /></button>
            <button className="button secondary" onClick={() => setDrawer("checkin")} type="button"><Sparkles size={17} />Check in</button>
            <button className="button primary" onClick={() => setDrawer("food")} type="button"><Plus size={17} />Log food</button>
          </div>
        </header>

        <div className="content">
          <CloudConnection />
          <section className="summary-grid" aria-label="Daily summary">
            {summaryMetrics.map((metric) => (
              <article className={`metric-summary ${metric.tone}`} key={metric.label}>
                <div className="metric-label">{metric.label}<span className="status-pin" /></div>
                <strong>{metric.value}</strong>
                <span>{metric.detail}</span>
              </article>
            ))}
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div><h2>What stands out</h2><p>Compared with your personal 28-day baseline</p></div>
              <button className="text-button" type="button">View all insights</button>
            </div>
            <div className="observations">
              {observations.map((item) => (
                <article className="observation" key={item.title}>
                  <span className={`observation-marker ${item.level}`} />
                  <div className="observation-copy"><h3>{item.title}</h3><p>{item.body}</p><div className="evidence">{item.evidence.map((entry) => <span key={entry}>{entry}</span>)}</div></div>
                  <button className="icon-button subtle" type="button" title={`Open ${item.title}`}><ChevronDown size={17} /></button>
                </article>
              ))}
            </div>
          </section>

          <div className="dashboard-grid">
            <section className="panel trend-panel">
              <div className="section-heading compact">
                <div><h2>Sleep & recovery</h2><p>Signals across the past week</p></div>
                <div className="segmented" aria-label="Date range">
                  {["7 days", "28 days", "90 days"].map((option) => (
                    <button className={range === option ? "selected" : ""} key={option} onClick={() => setRange(option)} type="button">{option}</button>
                  ))}
                </div>
              </div>
              <div className="chart-legend"><span><i className="legend-line sleep" />Sleep</span><span><i className="legend-line hrv" />HRV</span></div>
              <div className="chart-wrap" aria-label="Sleep and HRV trend chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}>
                    <defs><linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#287f8a" stopOpacity={0.24} /><stop offset="100%" stopColor="#287f8a" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="#e6e9e7" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6c7470", fontSize: 12 }} />
                    <YAxis yAxisId="sleep" domain={[5, 9]} axisLine={false} tickLine={false} tick={{ fill: "#6c7470", fontSize: 12 }} />
                    <YAxis yAxisId="hrv" orientation="right" domain={[30, 60]} hide />
                    <Tooltip contentStyle={{ borderRadius: 6, borderColor: "#dfe4e1", fontSize: 12 }} />
                    <Area yAxisId="sleep" type="monotone" dataKey="sleep" stroke="#287f8a" strokeWidth={2} fill="url(#sleepFill)" />
                    <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke="#e07a4f" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="signal-row"><div><span>Sleep debt</span><strong>1h 36m</strong></div><div><span>Regularity</span><strong>84%</strong></div><div><span>HRV baseline</span><strong>46-54 ms</strong></div><div><span>Resting HR</span><strong>+4 bpm</strong></div></div>
            </section>

            <section className="panel movement-panel">
              <div className="section-heading compact"><div><h2>Movement</h2><p>Today at a glance</p></div><Activity size={19} className="section-icon" /></div>
              <div className="steps-row"><div><strong>{activity.steps.toLocaleString()}</strong><span>of {activity.stepGoal.toLocaleString()} steps</span></div><span>{Math.round(stepProgress)}%</span></div>
              <div className="progress"><span style={{ width: `${stepProgress}%` }} /></div>
              <div className="movement-stats"><div><span>Zone minutes</span><strong>{activity.zoneMinutes}</strong></div><div><span>Calories</span><strong>{activity.calories.toLocaleString()}</strong></div><div><span>Distance</span><strong>{activity.distance} mi</strong></div></div>
              <button className="full-row-button" type="button">Open activity details <TrendingUp size={16} /></button>
            </section>

            <section className="panel meals-panel">
              <div className="section-heading compact"><div><h2>Meals & hydration</h2><p>2 meals logged today</p></div><Utensils size={19} className="section-icon" /></div>
              <div className="meal-row"><span className="meal-time">8:12</span><div><strong>Breakfast</strong><span>Oats, yogurt, berries</span></div><b>510 kcal</b></div>
              <div className="meal-row"><span className="meal-time">12:46</span><div><strong>Lunch</strong><span>Reminder due in 14 min</span></div><button className="mini-button" onClick={() => setDrawer("food")} type="button">Log</button></div>
              <div className="hydration"><Droplets size={18} /><div><span>Water</span><strong>1.4 of 2.5 L</strong></div><div className="small-progress"><span style={{ width: "56%" }} /></div><button className="icon-button subtle" type="button" title="Log water"><Plus size={16} /></button></div>
            </section>

            <section className="panel checkin-panel">
              <div className="section-heading compact"><div><h2>Daily context</h2><p>Help calibrate your signals</p></div><CalendarDays size={19} className="section-icon" /></div>
              <div className="context-grid"><div><span>Stress</span><strong>3 / 5</strong></div><div><span>Energy</span><strong>2 / 5</strong></div><div><span>Mood</span><strong>4 / 5</strong></div><div><span>Soreness</span><strong>2 / 5</strong></div></div>
              <button className="full-row-button" onClick={() => setDrawer("checkin")} type="button">Update check-in <Sparkles size={16} /></button>
            </section>
          </div>
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map(({ label, icon: Icon }) => <button className={activeNav === label ? "active" : ""} key={label} onClick={() => setActiveNav(label)} type="button"><Icon size={19} /><span>{label === "Stress & Recovery" ? "Recovery" : label}</span></button>)}
      </nav>

      {drawer && <QuickDrawer mode={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}

function QuickDrawer({ mode, onClose }: { mode: Exclude<Drawer, null>; onClose: () => void }) {
  const isFood = mode === "food";
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="drawer" aria-label={isFood ? "Log food" : "Daily check-in"}>
        <div className="drawer-header"><div><p className="eyebrow">Quick entry</p><h2>{isFood ? "Log food" : "Daily check-in"}</h2></div><button className="icon-button" onClick={onClose} type="button" title="Close"><X size={19} /></button></div>
        {isFood ? <FoodForm onClose={onClose} /> : <CheckinForm onClose={onClose} />}
      </aside>
    </div>
  );
}

function FoodForm({ onClose }: { onClose: () => void }) {
  return <form className="entry-form" onSubmit={(event) => { event.preventDefault(); onClose(); }}><label>Meal<select defaultValue="lunch"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select></label><label>Food or meal<input placeholder="What did you eat?" required /></label><div className="form-pair"><label>Calories<input inputMode="numeric" placeholder="kcal" /></label><label>Protein<input inputMode="numeric" placeholder="grams" /></label></div><label>Time<input defaultValue="12:46" type="time" /></label><div className="drawer-actions"><button className="button secondary" onClick={onClose} type="button">Cancel</button><button className="button primary" type="submit">Save meal</button></div></form>;
}

function CheckinForm({ onClose }: { onClose: () => void }) {
  return <form className="entry-form" onSubmit={(event) => { event.preventDefault(); onClose(); }}>{["Stress", "Energy", "Mood", "Soreness"].map((label) => <fieldset key={label}><legend>{label}</legend><div className="rating">{[1, 2, 3, 4, 5].map((value) => <label key={value}><input defaultChecked={value === 3} name={label} type="radio" value={value} /><span>{value}</span></label>)}</div></fieldset>)}<label>Optional note<textarea placeholder="Anything that may affect today?" rows={4} /></label><div className="drawer-actions"><button className="button secondary" onClick={onClose} type="button">Cancel</button><button className="button primary" type="submit">Save check-in</button></div></form>;
}
