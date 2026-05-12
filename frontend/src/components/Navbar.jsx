import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onLoginClick, onRegisterClick, onCreateAdClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="font-aclonica text-3xl font-bold hover:text-orange-700 text-gray-700 tracking-tight">
            Click&amp;Troc
          </span>
          <span className="text-m text-gray-600 italic pl-16">
            le site des petites annonces locales
          </span>
        </Link>

        {/* Bouton déposer une annonce */}
        <button
          onClick={user ? onCreateAdClick : onLoginClick}
          className="bg-gray-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2 rounded-xl"
        >
          déposer mon annonce
        </button>

        {/* Bouton hamburger + user */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:border-blue-600"
          >
            {/* Hamburger */}
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {/* Icône user */}
            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {user ? (
                <span className="text-xs font-bold text-gray-600">
                  {user.firstname?.[0]?.toUpperCase()}
                </span>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )}
            </div>
          </button>

          {/* Menu déroulant */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mes messages
                  </Link>
                  {/* <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mes annonces
                  </Link> */}
                  {/* <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mes favoris
                  </Link>
                  <hr className="my-1 border-gray-100" /> */}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onLoginClick(); setMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => { onRegisterClick(); setMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
