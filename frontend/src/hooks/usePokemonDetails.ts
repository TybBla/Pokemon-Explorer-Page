import { useQuery } from '@tanstack/react-query';
import { fetchPokemonDetails } from '../api/pokemon';
import type { Pokemon } from '../types/pokemon';

export function usePokemonDetails(pokemon: Pokemon | null) {
  return useQuery({
    queryKey: ['pokemon-details', pokemon?.name],
    queryFn: () => fetchPokemonDetails(pokemon as Pokemon),
    enabled: pokemon !== null && !pokemon.is_custom,
    staleTime: 60_000,
  });
}
