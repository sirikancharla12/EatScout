import LocationInput from "./Location";
import SearchBar from "./Searchbar";

export default function HomeComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-xl flex flex-col gap-6 relative">
        {/* Location input with dropdown */}
        <div className="relative z-50">
          <LocationInput />
        </div>

        {/* Search bar lower in stack */}
        <div className="relative z-10">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
