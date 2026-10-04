interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div role="search" className="mx-auto w-full max-w-md">
      <label htmlFor="pokemon-search" className="sr-only">
        Search Pokémon
      </label>
      <input
        id="pokemon-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Pokémon..."
        autoComplete="off"
        className="w-full rounded-full bg-[#1e1e1e] px-5 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none transition focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default SearchBar;
