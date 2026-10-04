import type { Pokemon, PokemonDetails, PokemonInfoResponse } from '../types/pokemon';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const INFO_URL = `${API_BASE_URL}/api/info`;
const CUSTOM_URL = `${API_BASE_URL}/api/custom`;

export const PAGE_SIZE = 24;
export const DEFAULT_CUSTOM_TYPE = 'normal';

interface NamedResource {
  name: string;
}

interface EvolutionLink {
  species: NamedResource;
  evolves_to: EvolutionLink[];
}

const withDefaultCustomType = (pokemon: Pokemon): Pokemon =>
  pokemon.is_custom && pokemon.types.length === 0
    ? { ...pokemon, types: [DEFAULT_CUSTOM_TYPE] }
    : pokemon;

const getJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchAllNames = async (): Promise<string[]> => {
  const data = await getJson<{ results: NamedResource[] }>(`${POKEAPI_URL}/pokemon?limit=100000`);

  return data.results.map(({ name }) => name);
};

export const fetchNamesByType = async (type: string): Promise<string[]> => {
  const data = await getJson<{ pokemon: { pokemon: NamedResource }[] }>(
    `${POKEAPI_URL}/type/${type}`,
  );

  return data.pokemon.map((entry) => entry.pokemon.name);
};

export const fetchCustomNames = async (): Promise<string[]> => {
  const customPokemons = await getJson<NamedResource[]>(CUSTOM_URL, {
    headers: {
      Accept: 'application/json',
      'X-SUPER-SECRET-KEY': import.meta.env.VITE_SUPER_SECRET_KEY,
    },
  });

  return customPokemons.map(({ name }) => name);
};

export const fetchPokemonInfo = async (names: string[]): Promise<PokemonInfoResponse> => {
  const response = await getJson<PokemonInfoResponse>(INFO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ names }),
  });

  return { ...response, data: response.data.map(withDefaultCustomType) };
};

const collectEvolutionNames = (link: EvolutionLink): string[] => [
  link.species.name,
  ...link.evolves_to.flatMap(collectEvolutionNames),
];

const fetchEvolutionChain = async (name: string): Promise<string[]> => {
  const species = await getJson<{ evolution_chain: { url: string } | null }>(
    `${POKEAPI_URL}/pokemon-species/${name}`,
  );

  if (!species.evolution_chain) {
    return [];
  }

  const chain = await getJson<{ chain: EvolutionLink }>(species.evolution_chain.url);

  return collectEvolutionNames(chain.chain);
};

const fetchEncounterAreas = async (name: string): Promise<string[]> => {
  const encounters = await getJson<{ location_area: NamedResource }[]>(
    `${POKEAPI_URL}/pokemon/${name}/encounters`,
  );

  return encounters.map(({ location_area }) => location_area.name);
};

export const fetchPokemonDetails = async (pokemon: Pokemon): Promise<PokemonDetails> => {
  if (pokemon.is_custom) {
    return { evolutions: [], locations: [] };
  }

  const [evolutions, locations] = await Promise.all([
    fetchEvolutionChain(pokemon.name),
    fetchEncounterAreas(pokemon.name),
  ]);

  return { evolutions, locations };
};
