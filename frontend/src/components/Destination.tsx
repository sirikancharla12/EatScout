
import { useEffect, useState, useRef } from "react";
import { Input } from "../input";

interface LocationData {
  lat: number;
  lon: number;
  address: string;
}

interface DestinationProps {
  onSelect: (location: LocationData) => void;
}

export default function Destination({ onSelect }: DestinationProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const apiKey = import.meta.env.VITE_OLAMAPS_API_KEY;
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isEditing || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Cancel any ongoing request before starting a new one
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${apiKey}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSuggestions(data?.predictions || []);
      } catch (error) {
        if (typeof error === "object" && error !== null && "name" in error && (error as any).name !== "AbortError") {
          console.error("Autocomplete error:", error);
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, isEditing, apiKey]);

  const handleSuggestionClick = async (suggestion: any) => {
    try {
      const res = await fetch(
        `https://api.olamaps.io/places/v1/details?place_id=${suggestion.place_id}&api_key=${apiKey}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const result = data?.result;

      if (result?.geometry?.location) {
        const locationObj: LocationData = {
          lat: result.geometry.location.lat,
          lon: result.geometry.location.lng,
          address: result.formatted_address,
        };
        onSelect(locationObj);
        setQuery(locationObj.address);
        setSuggestions([]);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Place details fetch error", error);
    }
  };

  return (
    <div className="relative w-full pb-12">
      <Input
        type="text"
        placeholder="Enter your destination..."
        value={query}
        onFocus={() => setIsEditing(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsEditing(true);
        }}
      />

      {isEditing && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 border w-full z-50 max-h-48 overflow-y-auto shadow-md bg-gray-800">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-900 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(s)}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
