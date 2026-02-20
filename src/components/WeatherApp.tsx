import { useState, useEffect } from "react";
import weatherBg from "@/assets/weather-bg.jpg";
import { LocationSearch } from "@/components/LocationSearch";
import { CurrentWeatherCard } from "@/components/CurrentWeatherCard";
import { HistoricalWeatherPanel } from "@/components/HistoricalWeatherPanel";
import { MarineWeatherPanel } from "@/components/MarineWeatherPanel";
import { ForecastPanel } from "@/components/ForecastPanel";
import { fetchCurrentWeather, type CurrentWeather, type Location } from "@/lib/weatherApi";
import { Loader2, CloudSun, History, Waves, TrendingUp } from "lucide-react";

const DEFAULT_LOCATION: Location = {
  id: 1,
  name: "London",
  country: "GB",
  latitude: 51.5074,
  longitude: -0.1278,
};

type Tab = "current" | "forecast" | "historical" | "marine";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "current", label: "Current", icon: <CloudSun size={15} /> },
  { id: "forecast", label: "Forecast", icon: <TrendingUp size={15} /> },
  { id: "historical", label: "Historical", icon: <History size={15} /> },
  { id: "marine", label: "Marine", icon: <Waves size={15} /> },
];

export function WeatherApp() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("current");

  useEffect(() => {
    loadWeather();
  }, [location]);

  async function loadWeather() {
    setLoading(true);
    try {
      const data = await fetchCurrentWeather(location.latitude, location.longitude);
      setWeather(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const locationLabel = `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}, ${location.country}`;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${weatherBg})` }}
      />
      <div className="fixed inset-0 bg-background/75" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground glow-text tracking-wide">SkySense</h1>
            <p className="text-muted-foreground text-xs tracking-widest uppercase">Glass Mystic Weather</p>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 pb-8 max-w-3xl mx-auto w-full">
          {/* Search */}
          <div className="mb-6">
            <LocationSearch onSelect={setLocation} selected={location} />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 glass-card rounded-2xl p-1.5 w-fit">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                  tab === t.id
                    ? "tab-active font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {loading && tab === "current" ? (
            <div className="glass-card rounded-3xl p-16 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-3" size={36} />
              <p className="text-muted-foreground text-sm">Reading the skies...</p>
            </div>
          ) : (
            <>
              {tab === "current" && weather && (
                <CurrentWeatherCard weather={weather} locationName={locationLabel} />
              )}
              {tab === "forecast" && (
                <ForecastPanel lat={location.latitude} lon={location.longitude} />
              )}
              {tab === "historical" && (
                <HistoricalWeatherPanel lat={location.latitude} lon={location.longitude} />
              )}
              {tab === "marine" && (
                <MarineWeatherPanel lat={location.latitude} lon={location.longitude} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
