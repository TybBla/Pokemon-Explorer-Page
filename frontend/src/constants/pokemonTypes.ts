export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const POKEMON_TYPES = Object.keys(TYPE_COLORS);

const FALLBACK_COLOR = '#6B7280';

export const getTypeColor = (type: string) => TYPE_COLORS[type] ?? FALLBACK_COLOR;

export const buildTypeBackground = (types: string[]) => {
  const colors = types.slice(0, 2).map(getTypeColor);

  return colors.length === 2
    ? `linear-gradient(to right, ${colors[0]}, ${colors[1]})`
    : colors[0] ?? FALLBACK_COLOR;
};
