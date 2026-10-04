import { useState } from 'react';
import PokemonGrid from '../components/PokemonGrid';
import PokemonModal from '../components/PokemonModal';
import SearchBar from '../components/SearchBar';
import TypeFilters from '../components/TypeFilters';
import { useDebounce } from '../hooks/useDebounce';
import { usePokemonList } from '../hooks/usePokemonList';
import type { Pokemon } from '../types/pokemon';

function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const debouncedSearch = useDebounce(search);
  const { data, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = usePokemonList(
    debouncedSearch,
    selectedTypes,
  );
  const pokemons = data?.pages.flatMap((page) => page.data) ?? [];

  const toggleType = (type: string) =>
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-4 py-8">
      <SearchBar value={search} onChange={setSearch} />
      <TypeFilters selectedTypes={selectedTypes} onToggle={toggleType} />

      {isError && (
        <p role="alert" className="rounded-lg bg-red-950 px-4 py-2 text-sm text-red-300">
          Failed to load Pokémon. Please try again later.
        </p>
      )}

      {isPending && (
        <div className="flex justify-center py-12">
          <div
            role="status"
            aria-label="Loading Pokémon"
            className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500"
          />
        </div>
      )}

      {!isPending && !isError && pokemons.length === 0 && (
        <p className="py-16 text-center text-gray-400">No Pokémon found.</p>
      )}

      {pokemons.length > 0 && <PokemonGrid pokemons={pokemons} onOpen={setSelected} />}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mx-auto rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white outline-none transition hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}

      <PokemonModal pokemon={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

export default HomePage;
