import { useState } from 'react';
import { Link } from 'react-router-dom';
import PokemonGrid from '../components/PokemonGrid';
import PokemonModal from '../components/PokemonModal';
import { useFavorites } from '../hooks/useFavorites';
import type { Pokemon } from '../types/pokemon';

function FavoritesPage() {
  const favorites = useFavorites();
  const [selected, setSelected] = useState<Pokemon | null>(null);

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-4 py-8">
      {favorites.length === 0 ? (
        <p className="py-16 text-center text-gray-400">
          No favorite Pokémon yet. Mark Pokémon with a star on the{' '}
          <Link
            to="/"
            className="text-blue-400 underline outline-none transition hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-white"
          >
            Pokémon list
          </Link>
          .
        </p>
      ) : (
        <PokemonGrid pokemons={favorites} onOpen={setSelected} />
      )}

      <PokemonModal pokemon={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

export default FavoritesPage;
