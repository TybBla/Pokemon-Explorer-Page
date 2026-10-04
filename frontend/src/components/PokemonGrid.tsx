import PokemonCard from './PokemonCard';
import { useFavorites } from '../hooks/useFavorites';
import type { Pokemon } from '../types/pokemon';

interface PokemonGridProps {
  pokemons: Pokemon[];
  onOpen: (pokemon: Pokemon) => void;
}

function PokemonGrid({ pokemons, onOpen }: PokemonGridProps) {
  const favorites = useFavorites();
  const favoriteNames = new Set(favorites.map(({ name }) => name));

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pokemons.map((pokemon) => (
        <PokemonCard
          key={`${pokemon.is_custom}-${pokemon.id}`}
          pokemon={pokemon}
          isFavorite={favoriteNames.has(pokemon.name)}
          onOpen={onOpen}
        />
      ))}
    </ul>
  );
}

export default PokemonGrid;
