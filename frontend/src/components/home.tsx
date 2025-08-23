

import Destination from "./Destination";
import LocationInput from "./Location";
import { useState } from "react";
import axios from "axios";

import type { LocationData } from "./Location";

type RideData = {
  type: string;
  price: string; 
};

export default function HomeComponent() {
  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [rideData, setRideData] = useState<RideData[] | null>(null);
  const [loading, setLoading] = useState(false); // <-- loader state

  const handleSearch = async () => {
    if (!pickup || !destination) {
      alert("Please enter both pickup and destination");
      return;
    }

    setLoading(true); // start loading
    setRideData(null); // clear previous results
    try {
      const res = await axios.post("http://localhost:3000/api/check-availability", {
        pickup,
        destination,
      });
      setRideData(res.data.rides);
    } catch (err) {
      console.error("Error fetching ride data", err);
      alert("Failed to fetch ride data");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-xl flex flex-col gap-6 relative">
        <div className="relative z-50">
          <LocationInput
            onSelect={(loc) => {
              setPickup(loc);
              console.log("Pickup set to:", loc);
            }}
          />
        </div>
        <div className="relative z-50">
          <Destination
            onSelect={(loc) => {
              setDestination(loc);
              console.log("Destination set to:", loc);
            }}
          />
        </div>
        <div className="relative z-50">
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
            disabled={loading} // disable while loading
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {loading && (
          <div className="text-white text-center mt-4">
            Loading rides...
          </div>
        )}

        {rideData && rideData.length > 0 && (
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg mt-6">
            <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
              Available Rides
            </h3>
            <div className="space-y-3">
              {rideData.map((ride, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-800 p-3 rounded-xl hover:bg-gray-700 transition duration-200"
                >
                  <span className="text-gray-100 font-medium">{ride.type}</span>
                  <span className="text-green-400 font-semibold">{ride.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
