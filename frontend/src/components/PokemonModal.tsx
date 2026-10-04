import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { buildTypeBackground } from '../constants/pokemonTypes';
import { toggleFavorite, useFavorites } from '../hooks/useFavorites';
import { usePokemonDetails } from '../hooks/usePokemonDetails';
import type { Pokemon, PokemonSprites } from '../types/pokemon';

interface PokemonModalProps {
  pokemon: Pokemon | null;
  onClose: () => void;
}

interface SpriteEntry {
  label: string;
  url: string;
}

const collectSprites = (sprites: PokemonSprites): SpriteEntry[] => {
  const entries: SpriteEntry[] = [];

  if (sprites.official_artwork) {
    entries.push({ label: 'Artwork', url: sprites.official_artwork });
  }
  if (sprites.front_default) {
    entries.push({ label: 'Front', url: sprites.front_default });
  }
  if (sprites.back_default) {
    entries.push({ label: 'Back', url: sprites.back_default });
  }

  return entries;
};

const formatLabel = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatHeight = (value: number) => `${(value / 10).toFixed(1)} m`;
const formatWeight = (value: number) => `${(value / 10).toFixed(1)} kg`;
const formatStatWidth = (value: number) => `${Math.max(4, Math.round((value / 255) * 100))}%`;

function SpriteGallery({ sprites, name }: { sprites: PokemonSprites; name: string }) {
  const [active, setActive] = useState(0);
  const spriteEntries = collectSprites(sprites);

  if (spriteEntries.length === 0) {
    return (
      <div
        aria-hidden="true"
        className="flex h-48 items-center justify-center rounded-xl bg-white/5 text-6xl text-gray-600"
      >
        ?
      </div>
    );
  }

  const current = spriteEntries[Math.min(active, spriteEntries.length - 1)];

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        key={current.url}
        src={current.url}
        alt={`${formatLabel(name)} — ${current.label.toLowerCase()} sprite`}
        className={`h-48 w-48 object-contain ${current.label === 'Artwork' ? '' : '[image-rendering:pixelated]'}`}
      />
      {spriteEntries.length > 1 && (
        <div role="group" aria-label="Sprite gallery" className="flex gap-2">
          {spriteEntries.map((sprite, index) => (
            <button
              key={sprite.url}
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              className={`flex h-14 w-14 items-center justify-center rounded-lg bg-white/5 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 ${
                index === active ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              <img
                src={sprite.url}
                alt=""
                aria-hidden="true"
                className="h-10 w-10 object-contain [image-rendering:pixelated]"
              />
              <span className="sr-only">{sprite.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PokemonModal({ pokemon, onClose }: PokemonModalProps) {
  return (
    <Dialog.Root open={pokemon !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-40 bg-black/70" />
        {pokemon && <PokemonModalContent pokemon={pokemon} />}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PokemonModalContent({ pokemon }: { pokemon: Pokemon }) {
  const favorites = useFavorites();
  const isFavorite = favorites.some((favorite) => favorite.name === pokemon.name);
  const { data: details, isPending, isError } = usePokemonDetails(pokemon);
  const number = `#${String(pokemon.id).padStart(3, '0')}`;
  const favoriteLabel = isFavorite
    ? `Remove ${pokemon.name} from favorites`
    : `Add ${pokemon.name} to favorites`;

  return (
    <Dialog.Content className="modal-content flex flex-col overflow-y-auto rounded-2xl bg-[#1e1e1e] text-gray-100 shadow-2xl focus:outline-none">
      <div
        className="sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-t-2xl py-4 pl-5 pr-14 text-white"
        style={{ background: buildTypeBackground(pokemon.types) }}
      >
        <Dialog.Close asChild>
          <button
            type="button"
            aria-label="Close details"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white outline-none backdrop-blur transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </Dialog.Close>
        <button
          type="button"
          onClick={() => toggleFavorite(pokemon)}
          aria-pressed={isFavorite}
          aria-label={favoriteLabel}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/40 outline-none backdrop-blur transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-white ${
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
        <Dialog.Title asChild>
          <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
        </Dialog.Title>
        <span className="text-sm text-white/80">{number}</span>
        {pokemon.is_custom && (
          <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
            Custom
          </span>
        )}
        {pokemon.types.length > 0 && (
          <ul aria-label="Types" className="ml-auto flex flex-wrap gap-1.5">
            {pokemon.types.map((type) => (
              <li key={type} className="rounded-full bg-black/30 px-3 py-1 text-sm capitalize">
                {type}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dialog.Description className="sr-only">
        Pokémon details: sprites, base stats, evolution chain and locations.
      </Dialog.Description>

      <div className="flex flex-col gap-5 p-5">
        <SpriteGallery sprites={pokemon.sprites} name={pokemon.name} />

        <dl className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-wide text-gray-500">Height</dt>
            <dd className="text-sm font-semibold">{formatHeight(pokemon.height)}</dd>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-wide text-gray-500">Weight</dt>
            <dd className="text-sm font-semibold">{formatWeight(pokemon.weight)}</dd>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-wide text-gray-500">Base exp.</dt>
            <dd className="text-sm font-semibold">{pokemon.base_experience ?? '—'}</dd>
          </div>
        </dl>

        {pokemon.abilities.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Abilities
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {pokemon.abilities.map((ability) => (
                <li key={ability} className="rounded-full bg-white/10 px-3 py-1 text-sm capitalize">
                  {formatLabel(ability)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {pokemon.stats.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Base stats
            </h3>
            <ul className="space-y-1.5">
              {pokemon.stats.map((stat) => (
                <li key={stat.name} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm capitalize">{formatLabel(stat.name)}</span>
                  <span className="w-10 text-right text-sm tabular-nums text-gray-400">
                    {stat.value}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: formatStatWidth(stat.value) }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!pokemon.is_custom && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Evolution chain
              </h3>
              {isPending && <p className="text-sm text-gray-500">Loading details...</p>}
              {isError && <p className="text-sm text-red-300">Failed to load details.</p>}
              {details &&
                (details.evolutions.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {details.evolutions.map((name) => (
                      <li
                        key={name}
                        className={`rounded-full px-3 py-1 text-sm capitalize ${
                          name === pokemon.name ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-200'
                        }`}
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No evolutions.</p>
                ))}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Locations
              </h3>
              {isPending && <p className="text-sm text-gray-500">Loading details...</p>}
              {isError && <p className="text-sm text-red-300">Failed to load details.</p>}
              {details &&
                (details.locations.length > 0 ? (
                  <ul
                    aria-label="Locations"
                    className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1"
                  >
                    {details.locations.map((location) => (
                      <li
                        key={location}
                        className="rounded-full bg-white/10 px-3 py-1 text-sm capitalize text-gray-200"
                      >
                        {formatLabel(location)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No known locations.</p>
                ))}
            </div>
          </div>
        )}
      </div>
    </Dialog.Content>
  );
}

export default PokemonModal;
