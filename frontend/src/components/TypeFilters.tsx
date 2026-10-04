import { POKEMON_TYPES, getTypeColor } from '../constants/pokemonTypes';

interface TypeFiltersProps {
  selectedTypes: string[];
  onToggle: (type: string) => void;
}

function TypeFilters({ selectedTypes, onToggle }: TypeFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filter by type"
      className="flex flex-wrap justify-center gap-1.5 p-1 lg:flex-nowrap"
    >
      {POKEMON_TYPES.map((type) => {
        const isSelected = selectedTypes.includes(type);

        return (
          <button
            key={type}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(type)}
            style={{ backgroundColor: getTypeColor(type) }}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize text-white outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-400 ${
              isSelected ? 'ring-2 ring-white' : 'opacity-80'
            }`}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}

export default TypeFilters;
