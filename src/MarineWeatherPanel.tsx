import { useState, useEffect } from "react";
import { fetchMarineWeather, type MarineWeather } from "@/lib/weatherApi";
import { Loader2, Waves, Wind, Navigation } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface MarineWeatherPanelProps {
  lat: number;
  lon: number;
}

function getCompassDir(deg: number) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getSeaState(waveHeight: number) {
  if (waveHeight < 0.1) return { label: "Calm", color: "text-primary" };
  if (waveHeight < 0.5) return { label: "Smooth", color: "text-primary" };
  if (waveHeight < 1.25) return { label: "Slight", color: "text-accent" };
  if (waveHeight < 2.5) return { label: "Moderate", color: "text-yellow-400" };
  if (waveHeight < 4.0) return { label: "Rough", color: "text-orange-400" };
  return { label: "Very Rough", color: "text-destructive" };
}

export function MarineWeatherPanel({ lat, lon }: MarineWeatherPanelProps) {
  const [data, setData] = useState<MarineWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [lat, lon]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchMarineWeather(lat, lon);
      setData(result);
    } catch {
      setError("Marine data is not available for this location. Try a coastal city.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-3" size={32} />
        <p className="text-muted-foreground text-sm">Loading marine data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-4xl mb-3">🌊</p>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const now = new Date();
  const currentIdx = data.time.findIndex(t => new Date(t) >= now) - 1;
  const idx = Math.max(0, currentIdx);

  const currentWave = data.wave_height[idx];
  const currentDir = data.wave_direction[idx];
  const currentPeriod = data.wave_period[idx];
  const swellHeight = data.swell_wave_height[idx];
  const windWave = data.wind_wave_height[idx];
  const seaState = getSeaState(currentWave);

  // Next 24h chart data
  const chartData = data.time.slice(idx, idx + 24).map((t, i) => ({
    time: new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    "Wave Height (m)": data.wave_height[idx + i]?.toFixed(2),
    "Swell (m)": data.swell_wave_height[idx + i]?.toFixed(2),
    "Wind Wave (m)": data.wind_wave_height[idx + i]?.toFixed(2),
  }));

  return (
    <div className="space-y-4">
      {/* Current marine summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-5 text-center weather-gradient col-span-2 sm:col-span-1">
          <Waves className="text-accent mx-auto mb-2" size={28} />
          <p className="text-3xl font-light text-foreground glow-text">{currentWave?.toFixed(1)}<span className="text-lg text-primary">m</span></p>
          <p className="text-xs text-muted-foreground mt-1">Wave Height</p>
          <p className={`text-xs font-medium mt-1 ${seaState.color}`}>{seaState.label}</p>
        </div>
        <MarineStatCard icon={<Navigation size={20} />} label="Wave Direction" value={`${Math.round(currentDir)}° ${getCompassDir(currentDir)}`} />
        <MarineStatCard icon={<Wind size={20} />} label="Wave Period" value={`${currentPeriod?.toFixed(1)}s`} />
        <MarineStatCard icon={<Waves size={20} />} label="Swell Height" value={`${swellHeight?.toFixed(2)}m`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MarineStatCard icon={<Waves size={18} />} label="Wind Wave Height" value={`${windWave?.toFixed(2)}m`} />
        <MarineStatCard icon={<Navigation size={18} />} label="Sea State" value={seaState.label} valueClass={seaState.color} />
      </div>

      {/* Charts */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-foreground text-sm font-medium mb-4">Wave Forecast — Next 24 Hours</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(215,25%,25%,0.5)" />
            <XAxis dataKey="time" tick={{ fill: "hsl(200,15%,55%)", fontSize: 10 }} interval={3} />
            <YAxis tick={{ fill: "hsl(200,15%,55%)", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "hsl(215,25%,10%)", border: "1px solid hsl(200,40%,30%)", borderRadius: 12 }} />
            <Line type="monotone" dataKey="Wave Height (m)" stroke="hsl(174,60%,45%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Swell (m)" stroke="hsl(195,70%,50%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Wind Wave (m)" stroke="hsl(150,60%,40%)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MarineStatCard({ icon, label, value, valueClass = "text-foreground" }: {
  icon: React.ReactNode; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}
