import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import {
  DEFAULT_CUSTOM_TYPE,
  PAGE_SIZE,
  fetchAllNames,
  fetchCustomNames,
  fetchNamesByType,
  fetchPokemonInfo,
} from '../api/pokemon';
import type { PokemonInfoResponse } from '../types/pokemon';

interface PokemonPage extends PokemonInfoResponse {
  nextOffset?: number;
}

const emptyResponse: PokemonInfoResponse = { data: [], not_found: [] };

const fetchCachedNames = (queryClient: QueryClient, key: string[], fetcher: () => Promise<string[]>) =>
  queryClient.fetchQuery({ queryKey: key, queryFn: fetcher, staleTime: Infinity });

const fetchCustomNamesSafely = (queryClient: QueryClient) =>
  fetchCachedNames(queryClient, ['custom-names'], fetchCustomNames).catch(() => []);

const filterByTypes = async (
  queryClient: QueryClient,
  customNames: string[],
  names: string[],
  types: string[],
) => {
  if (types.length === 0) {
    return names;
  }

  const namesByType = await Promise.all(
    types.map((type) => fetchCachedNames(queryClient, ['type-names', type], () => fetchNamesByType(type))),
  );
  const allowedNames = new Set(namesByType.flat());

  if (types.includes(DEFAULT_CUSTOM_TYPE)) {
    customNames.forEach((name) => allowedNames.add(name));
  }

  return names.filter((name) => allowedNames.has(name));
};

const fetchFilteredNames = async (queryClient: QueryClient, search: string, types: string[]) => {
  const [customNames, pokeApiNames] = await Promise.all([
    fetchCustomNamesSafely(queryClient),
    fetchCachedNames(queryClient, ['pokemon-names'], fetchAllNames),
  ]);
  const allNames = [...customNames, ...pokeApiNames];
  const matchingNames = search ? allNames.filter((name) => name.includes(search)) : allNames;

  return filterByTypes(queryClient, customNames, matchingNames, types);
};

export function usePokemonList(search: string, types: string[]) {
  const queryClient = useQueryClient();
  const normalizedSearch = search.trim().toLowerCase();

  return useInfiniteQuery({
    queryKey: ['pokemon', normalizedSearch, [...types].sort()],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<PokemonPage> => {
      const filteredNames = await fetchFilteredNames(queryClient, normalizedSearch, types);
      const pageNames = filteredNames.slice(pageParam, pageParam + PAGE_SIZE);
      const hasMore = filteredNames.length > pageParam + PAGE_SIZE;
      const response = pageNames.length > 0 ? await fetchPokemonInfo(pageNames) : emptyResponse;

      return { ...response, nextOffset: hasMore ? pageParam + PAGE_SIZE : undefined };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}
