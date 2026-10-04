import { NavLink } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

const POKEBALL_ICON =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-white ${
    isActive ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
  }`;

function Header() {
  const favorites = useFavorites();

  return (
    <header className="flex flex-col items-center gap-3 pt-8">
      <div className="flex items-center justify-center gap-2">
        <img
          src={POKEBALL_ICON}
          alt=""
          aria-hidden="true"
          className="mt-1.5 h-10 w-10 [image-rendering:pixelated]"
        />
        <h1 className="bg-gradient-to-r from-[#ff6b00] to-[#ff9500] bg-clip-text text-4xl font-bold text-transparent">
          Pokémon Explorer
        </h1>
      </div>
      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-2">
          <li>
            <NavLink to="/" end className={navLinkClassName}>
              Pokémon list
            </NavLink>
          </li>
          <li>
            <NavLink to="/favorites" className={navLinkClassName}>
              Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
