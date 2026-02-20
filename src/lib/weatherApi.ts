export interface Location {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
  humidity: number;
  apparent_temperature: number;
  precipitation: number;
  pressure: number;
  visibility: number;
  uv_index: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  precipitation: number[];
  wind_speed_10m: number[];
  relative_humidity_2m: number[];
}

export interface MarineWeather {
  time: string[];
  wave_height: number[];
  wave_direction: number[];
  wave_period: number[];
  wind_wave_height: number[];
  swell_wave_height: number[];
  ocean_current_velocity?: number[];
}

export const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear Sky", icon: "☀️" },
  1: { label: "Mainly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  53: { label: "Moderate Drizzle", icon: "🌦️" },
  55: { label: "Dense Drizzle", icon: "🌧️" },
  61: { label: "Slight Rain", icon: "🌧️" },
  63: { label: "Moderate Rain", icon: "🌧️" },
  65: { label: "Heavy Rain", icon: "🌧️" },
  71: { label: "Slight Snow", icon: "🌨️" },
  73: { label: "Moderate Snow", icon: "❄️" },
  75: { label: "Heavy Snow", icon: "❄️" },
  77: { label: "Snow Grains", icon: "🌨️" },
  80: { label: "Slight Showers", icon: "🌦️" },
  81: { label: "Moderate Showers", icon: "🌧️" },
  82: { label: "Violent Showers", icon: "⛈️" },
  85: { label: "Slight Snow Showers", icon: "🌨️" },
  86: { label: "Heavy Snow Showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm w/ Hail", icon: "⛈️" },
  99: { label: "Thunderstorm w/ Heavy Hail", icon: "⛈️" },
};

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] ?? { label: "Unknown", icon: "🌡️" };
}

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
  );
  const data = await res.json();
  return data.results ?? [];
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,is_day,uv_index,visibility&wind_speed_unit=kmh&timezone=auto`
  );
  const data = await res.json();
  const c = data.current;
  return {
    temperature: c.temperature_2m,
    windspeed: c.wind_speed_10m,
    winddirection: c.wind_direction_10m,
    weathercode: c.weather_code,
    is_day: c.is_day,
    time: c.time,
    humidity: c.relative_humidity_2m,
    apparent_temperature: c.apparent_temperature,
    precipitation: c.precipitation,
    pressure: c.pressure_msl,
    visibility: c.visibility,
    uv_index: c.uv_index,
  };
}

export async function fetchHourlyForecast(lat: number, lon: number): Promise<HourlyWeather> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&forecast_days=7&wind_speed_unit=kmh&timezone=auto`
  );
  const data = await res.json();
  return data.hourly;
}

export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<HourlyWeather> {
  const res = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&wind_speed_unit=kmh&timezone=auto`
  );
  const data = await res.json();
  const d = data.daily;
  return {
    time: d.time,
    temperature_2m: d.temperature_2m_max,
    precipitation: d.precipitation_sum,
    wind_speed_10m: d.wind_speed_10m_max,
    relative_humidity_2m: d.temperature_2m_min,
  };
}

export async function fetchMarineWeather(lat: number, lon: number): Promise<MarineWeather> {
  const res = await fetch(
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height&forecast_days=7&timezone=auto`
  );
  const data = await res.json();
  return data.hourly;
}
