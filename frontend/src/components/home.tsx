import LocationInput from "./Location";
import SearchBar from "./Searchbar";

export default function HomeComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-6 bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h1 className="text-white text-2xl font-semibold text-center">Compare Food Delivery Prices</h1>
        <LocationInput />
        <SearchBar />
      </div>
    </div>
  );
}
