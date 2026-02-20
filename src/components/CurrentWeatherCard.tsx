import { type CurrentWeather, getWeatherInfo } from "@/lib/weatherApi";
import { Wind, Droplets, Eye, Gauge, Thermometer, Sun } from "lucide-react";

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  locationName: string;
}

export function CurrentWeatherCard({ weather, locationName }: CurrentWeatherCardProps) {
  const info = getWeatherInfo(weather.weathercode);

  return (
    <div className="space-y-4">
      {/* Main card */}
      <div className="glass-card rounded-3xl p-8 text-center weather-gradient animate-pulse-glow">
        <p className="text-muted-foreground text-sm font-light tracking-widest uppercase mb-2">{locationName}</p>
        <div className="text-8xl mb-4 animate-float">{info.icon}</div>
        <h2 className="text-7xl font-light text-foreground glow-text mb-1">
          {Math.round(weather.temperature)}<span className="text-4xl text-primary">°C</span>
        </h2>
        <p className="text-primary text-lg font-medium tracking-wide mb-1">{info.label}</p>
        <p className="text-muted-foreground text-sm">
          Feels like {Math.round(weather.apparent_temperature)}°C
        </p>
        <p className="text-muted-foreground text-xs mt-2">
          {new Date(weather.time).toLocaleString("en-US", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={<Wind size={18} />} label="Wind" value={`${weather.windspeed} km/h`} />
        <StatCard icon={<Droplets size={18} />} label="Humidity" value={`${weather.humidity}%`} />
        <StatCard icon={<Eye size={18} />} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
        <StatCard icon={<Gauge size={18} />} label="Pressure" value={`${Math.round(weather.pressure)} hPa`} />
        <StatCard icon={<Droplets size={18} />} label="Precip." value={`${weather.precipitation} mm`} />
        <StatCard icon={<Sun size={18} />} label="UV Index" value={`${weather.uv_index}`} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
