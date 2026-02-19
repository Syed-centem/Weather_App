import { useState, useEffect } from "react";
import { fetchHourlyForecast, type HourlyWeather, getWeatherInfo } from "@/lib/weatherApi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ForecastPanelProps {
  lat: number;
  lon: number;
}

export function ForecastPanel({ lat, lon }: ForecastPanelProps) {
  const [data, setData] = useState<HourlyWeather | null>(null);

  useEffect(() => {
    fetchHourlyForecast(lat, lon).then(setData).catch(() => {});
  }, [lat, lon]);

  if (!data) return null;

  const now = new Date();
  const startIdx = data.time.findIndex(t => new Date(t) >= now);
  const next24 = data.time.slice(startIdx, startIdx + 24).map((t, i) => ({
    time: new Date(t).toLocaleTimeString("en-US", { hour: "2-digit" }),
    temp: data.temperature_2m[startIdx + i],
    precip: data.precipitation[startIdx + i],
    wind: data.wind_speed_10m[startIdx + i],
  }));

  // Daily summary (next 7 days)
  const days: { date: string; max: number; min: number; }[] = [];
  for (let d = 0; d < 7; d++) {
    const dayStart = (startIdx + d * 24);
    const temps = data.temperature_2m.slice(dayStart, dayStart + 24).filter(Boolean);
    if (temps.length === 0) continue;
    const date = new Date(data.time[dayStart]);
    days.push({
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      max: Math.round(Math.max(...temps)),
      min: Math.round(Math.min(...temps)),
    });
  }

  return (
    <div className="space-y-4">
      {/* Hourly chart */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-foreground text-sm font-medium mb-4">Next 24 Hours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={next24}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(215,25%,25%,0.5)" />
            <XAxis dataKey="time" tick={{ fill: "hsl(200,15%,55%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(200,15%,55%)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "hsl(215,25%,10%)", border: "1px solid hsl(200,40%,30%)", borderRadius: 12 }} />
            <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="hsl(174,60%,45%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 7-day overview */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-foreground text-sm font-medium mb-4">7-Day Overview</h3>
        <div className="space-y-2">
          {days.map((day, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground text-sm w-36">{day.date}</span>
              <div className="flex items-center gap-3">
                <span className="text-accent text-sm font-medium">{day.max}°</span>
                <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary" style={{ width: `${Math.min(100, ((day.max + 20) / 60) * 100)}%` }} />
                </div>
                <span className="text-muted-foreground text-sm">{day.min}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
