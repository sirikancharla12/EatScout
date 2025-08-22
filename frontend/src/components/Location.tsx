

import { useEffect, useState, useRef } from "react";
import { Input } from "../input";
import axios from "axios";

export interface LocationData {
  lat: number;
  lon: number;
  address: string;
}

interface LocationInputProps {
  onSelect: (location: LocationData) => void;
}

export default function LocationInput({ onSelect }: LocationInputProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const apiKey = import.meta.env.VITE_OLAMAPS_API_KEY;

  // Prevent multiple reverse-geocode calls for same coords
  const lastCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // On mount, fetch current location only once
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Skip if same as last coords
        if (
          lastCoordsRef.current &&
          lastCoordsRef.current.lat === latitude &&
          lastCoordsRef.current.lon === longitude
        ) {
          setLoading(false);
          return;
        }

        lastCoordsRef.current = { lat: latitude, lon: longitude };

        try {
          const response = await fetch(
            `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`
          );
          const data = await response.json();
          const address =
            data?.results?.[0]?.formatted_address || "Address not found";

          const loc = { lat: latitude, lon: longitude, address };
          setLocation(loc);
          setQuery(address);
          onSelect(loc);
        } catch (error) {
          console.error("Error fetching address", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 } // cache geolocation for 1 min
    );
  }, [apiKey, onSelect]);

  // Autocomplete suggestions (debounced)
  useEffect(() => {
    if (!isEditing || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
            query
          )}&api_key=${apiKey}`
        );
        const data = await res.json();
        setSuggestions(data.predictions || []);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, isEditing, apiKey]);

  // Check delivery availability (runs only when location changes)
  useEffect(() => {
    if (location) {
      const checkDeliveryAvailability = async () => {
        try {
          const res = await axios.post(
            "http://localhost:3000/api/check-availability",
            {
              location: location.address,
              platform: "swiggy",
            }
          );
          console.log("Availability:", res.data);
        } catch (error) {
          console.error("Error checking availability:", error);
        }
      };
      checkDeliveryAvailability();
    }
  }, [location]);

  // When a suggestion is clicked
  const handleSuggestionClick = async (suggestion: any) => {
    try {
      const placeId = suggestion.place_id;
      const res = await fetch(
        `https://api.olamaps.io/places/v1/details?place_id=${placeId}&api_key=${apiKey}`
      );
      const data = await res.json();
      const result = data?.result;

      if (result) {
        const { formatted_address, geometry } = result;
        const { lat, lng } = geometry.location;
        const loc = { lat, lon: lng, address: formatted_address };
        setLocation(loc);
        setQuery(formatted_address);
        setSuggestions([]);
        setIsEditing(false);
        onSelect(loc);
      }
    } catch (error) {
      console.error("Place details fetch error", error);
    }
  };

  return (
    <div className="relative w-full pb-12">
      <Input
        type="text"
        placeholder="Search location..."
        value={loading ? "Getting location..." : query}
        onFocus={() => setIsEditing(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsEditing(true);
        }}
      />
      {isEditing && suggestions.length > 0 && (
        <ul className="absolute border w-full z-50 max-h-48 overflow-y-auto shadow-md bg-gray-800">
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-900 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
