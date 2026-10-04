import { useSyncExternalStore } from 'react';
import type { Pokemon } from '../types/pokemon';

const STORAGE_KEY = 'pokemon-explorer-favorites';

const listeners = new Set<() => void>();
let cache: Pokemon[] | null = null;

const readFavorites = (): Pokemon[] => {
  if (cache === null) {
    try {
      cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Pokemon[];
    } catch {
      cache = [];
    }
  }

  return cache;
};

const notify = () => listeners.forEach((listener) => listener());

const writeFavorites = (favorites: Pokemon[]) => {
  cache = favorites;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Failed to persist favorites', error);
  }

  notify();
};

const isFavorite = (name: string) => readFavorites().some((pokemon) => pokemon.name === name);

export const toggleFavorite = (pokemon: Pokemon) => {
  const favorites = readFavorites();
  const nextFavorites = isFavorite(pokemon.name)
    ? favorites.filter((favorite) => favorite.name !== pokemon.name)
    : [...favorites, pokemon];

  writeFavorites(nextFavorites);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    cache = null;
    listener();
  };

  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

export function useFavorites() {
  return useSyncExternalStore(subscribe, readFavorites, readFavorites);
}
