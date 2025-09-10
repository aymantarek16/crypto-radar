"use client";

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
}

export default function SearchBar({ query, setQuery }: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center w-full sm:w-80 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg"
    >
      <input
        type="text"
        placeholder="Search coin..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-500"
      />
    </form>
  );
}
