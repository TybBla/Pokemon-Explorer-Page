export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  official_artwork: string | null;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  is_custom: boolean;
}

export interface PokemonInfoResponse {
  data: Pokemon[];
  not_found: string[];
}

export interface PokemonDetails {
  evolutions: string[];
  locations: string[];
}
