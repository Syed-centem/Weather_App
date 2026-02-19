import { useState, useRef, useEffect } from "react";
import { searchLocations, type Location } from "@/lib/weatherApi";
import { MapPin, Search, Loader2 } from "lucide-react";

interface LocationSearchProps {
  onSelect: (location: Location) => void;
  selected: Location | null;
}

export function LocationSearch({ onSelect, selected }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchLocations(val);
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 400);
  }

  function handleSelect(loc: Location) {
    onSelect(loc);
    setQuery(`${loc.name}, ${loc.country}`);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <div className="glass-card rounded-2xl flex items-center gap-3 px-4 py-3 mystic-border">
        <MapPin className="text-primary shrink-0" size={18} />
        <input
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-light"
          placeholder="Search city, country..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading ? (
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        ) : (
          <Search size={16} className="text-muted-foreground" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass-card rounded-2xl overflow-hidden mystic-border">
          {results.map((loc) => (
            <button
              key={loc.id}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors"
              onClick={() => handleSelect(loc)}
            >
              <MapPin size={14} className="text-primary shrink-0" />
              <span className="text-sm text-foreground">{loc.name}</span>
              {loc.admin1 && <span className="text-xs text-muted-foreground">{loc.admin1}</span>}
              <span className="text-xs text-muted-foreground ml-auto">{loc.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
