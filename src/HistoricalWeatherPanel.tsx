import { useState } from "react";
import { fetchHistoricalWeather, type HourlyWeather } from "@/lib/weatherApi";
import { Loader2, Calendar } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, Legend,
} from "recharts";

interface HistoricalWeatherPanelProps {
  lat: number;
  lon: number;
}

export function HistoricalWeatherPanel({ lat, lon }: HistoricalWeatherPanelProps) {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-31");
  const [data, setData] = useState<HourlyWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFetch() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchHistoricalWeather(lat, lon, startDate, endDate);
      setData(result);
    } catch {
      setError("Failed to fetch historical data. Try a different date range.");
    } finally {
      setLoading(false);
    }
  }

  const chartData = data?.time.map((t, i) => ({
    date: new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Max Temp (°C)": data.temperature_2m[i],
    "Min Temp (°C)": data.relative_humidity_2m[i],
    "Precip (mm)": data.precipitation[i],
    "Wind (km/h)": data.wind_speed_10m[i],
  }));

  return (
    <div className="space-y-4">
      {/* Date picker controls */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-muted-foreground text-xs mb-1 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-muted-foreground text-xs mb-1 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary text-sm font-medium hover:bg-primary/30 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
            Fetch Data
          </button>
        </div>
        {error && <p className="text-destructive text-xs mt-2">{error}</p>}
      </div>

      {/* Charts */}
      {chartData && chartData.length > 0 && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-foreground text-sm font-medium mb-4">Temperature Range (°C)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(215, 25%, 25%, 0.5)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(200, 15%, 55%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(200, 15%, 55%)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(215,25%,10%)", border: "1px solid hsl(200,40%,30%)", borderRadius: 12 }}
                  labelStyle={{ color: "hsl(200,20%,92%)" }}
                />
                <Legend />
                <Line type="monotone" dataKey="Max Temp (°C)" stroke="hsl(174,60%,45%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Min Temp (°C)" stroke="hsl(210,80%,55%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-foreground text-sm font-medium mb-4">Precipitation (mm)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(215,25%,25%,0.5)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(200,15%,55%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(200,15%,55%)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(215,25%,10%)", border: "1px solid hsl(200,40%,30%)", borderRadius: 12 }} />
                  <Bar dataKey="Precip (mm)" fill="hsl(195,70%,50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-foreground text-sm font-medium mb-4">Max Wind Speed (km/h)</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(215,25%,25%,0.5)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(200,15%,55%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(200,15%,55%)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(215,25%,10%)", border: "1px solid hsl(200,40%,30%)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="Wind (km/h)" stroke="hsl(150,60%,40%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-6xl mb-4">📅</p>
          <p className="text-muted-foreground text-sm">Select a date range and click "Fetch Data" to view historical weather patterns.</p>
        </div>
      )}
    </div>
  );
}
