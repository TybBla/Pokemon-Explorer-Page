import { memo } from 'react';
import { buildTypeBackground } from '../constants/pokemonTypes';
import { toggleFavorite } from '../hooks/useFavorites';
import type { Pokemon } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  onOpen: (pokemon: Pokemon) => void;
}

function PokemonCard({ pokemon, isFavorite, onOpen }: PokemonCardProps) {
  const image = pokemon.sprites.official_artwork ?? pokemon.sprites.front_default;
  const number = `#${String(pokemon.id).padStart(3, '0')}`;
  const favoriteLabel = isFavorite
    ? `Remove ${pokemon.name} from favorites`
    : `Add ${pokemon.name} to favorites`;

  return (
    <li className="relative">
      <button
        type="button"
        onClick={() => onOpen(pokemon)}
        style={{ background: buildTypeBackground(pokemon.types) }}
        className="relative flex h-full min-h-60 w-full flex-col items-center justify-center gap-1.5 rounded-xl px-4 py-8 text-white shadow-md transition duration-200 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:translate-y-0 active:scale-[0.98] active:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
      >
        {pokemon.is_custom && (
          <span className="absolute right-2 top-2 rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
            Custom
          </span>
        )}
        {image ? (
          <img
            src={image}
            alt={pokemon.name}
            loading="lazy"
            className="h-28 w-28 object-contain drop-shadow-md"
          />
        ) : (
          <div aria-hidden="true" className="flex h-28 w-28 items-center justify-center text-4xl text-white/60">
            ?
          </div>
        )}
        <span className="text-lg font-semibold capitalize">{pokemon.name}</span>
        <span className="text-sm text-white/80">{number}</span>
        {pokemon.types.length > 0 && (
          <ul aria-label="Types" className="mt-1 flex flex-wrap justify-center gap-1.5">
            {pokemon.types.map((type) => (
              <li key={type} className="rounded-full bg-white/25 px-3 py-1 text-sm capitalize">
                {type}
              </li>
            ))}
          </ul>
        )}
      </button>
      <button
        type="button"
        onClick={() => toggleFavorite(pokemon)}
        aria-pressed={isFavorite}
        aria-label={favoriteLabel}
        className={`absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 outline-none backdrop-blur transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-white ${
          isFavorite ? 'text-yellow-400' : 'text-white/70'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    </li>
  );
}

export default memo(PokemonCard);
