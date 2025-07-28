

import { useEffect, useState } from "react";
import { Input } from "../input";

interface Location {
  lat: number;
  lon: number;
  address: string;
}


export default function LocationInput() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            //  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
             `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          console.log(data);
console.log(data.address); // See all the detailed fields

         
          setLocation({
            lat: latitude,
            lon: longitude,
            address: data.display_name || "Address not found",
          });
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
       {
      enableHighAccuracy: true,
        timeout: 10000,
    maximumAge: 0,
    }
    );
  }, []);

  return (
    <Input
      type="text"
      placeholder="location"
      value={
        loading
          ? "Getting Location..."
          : location?.address || "Failed to get location"
      }
      readOnly
    />
  );
}



// import { useEffect, useState } from "react";
// import { Input } from "../input";

// interface Location {
//   lat: number;
//   lon: number;
//   address: string;
// }

// export default function LocationInput() {
//   const [location, setLocation] = useState<Location | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [query, setQuery] = useState("");
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const apiKey = import.meta.env.VITE_LOCATIONIQ_API_KEY;

//   // 1. Auto-fetch on mount
//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         try {
//           const response = await fetch(
//             `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`
//           );
//           const data = await response.json();
//           const address = data.display_name || "Address not found";

//           setLocation({
//             lat: latitude,
//             lon: longitude,
//             address,
//           });
//           setQuery(address);
//         } catch (error) {
//           console.error("Error fetching address", error);
//         } finally {
//           setLoading(false);
//         }
//       },
//       (error) => {
//         console.error("Geolocation error:", error);
//         setLoading(false);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       }
//     );
//   }, []);

//   // 2. Fetch suggestions on query change
//   useEffect(() => {
//     const delayDebounce = setTimeout(async () => {
//       if (query.length < 3) {
//         setSuggestions([]);
//         return;
//       }

//       try {
//         const res = await fetch(
//           `https://us1.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(
//             query
//           )}&limit=5&format=json`
//         );
//         const data = await res.json();
//         setSuggestions(data);
//       } catch (error) {
//         console.error("Autocomplete error:", error);
//       }
//     }, 500); // debounce

//     return () => clearTimeout(delayDebounce);
//   }, [query]);

//   // 3. When a suggestion is clicked
//   const handleSuggestionClick = (suggestion: any) => {
//     setLocation({
//       lat: parseFloat(suggestion.lat),
//       lon: parseFloat(suggestion.lon),
//       address: suggestion.display_name,
//     });
//     setQuery(suggestion.display_name);
//     setSuggestions([]);
//   };

//   return (
//     <div className="relative w-full">
//       <Input
//         type="text"
//         placeholder="Search location..."
//         value={loading ? "Getting location..." : query}
//         onChange={(e) => setQuery(e.target.value)}
//       />

//       {suggestions.length > 0 && (
//         <ul className="absolute border w-full z-10 max-h-48 overflow-y-auto shadow">
//           {suggestions.map((suggestion, idx) => (
//             <li
//               key={idx}
//               className="p-2 hover:bg-purple-100 cursor-pointer text-sm"
//               onClick={() => handleSuggestionClick(suggestion)}
//             >
//               {suggestion.display_name}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
