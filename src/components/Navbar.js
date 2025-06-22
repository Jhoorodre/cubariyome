// src/components/Navbar.js
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { classNames } from '../utils/strings';
import ThemeSwitcher from './ThemeSwitcher';
import BlackholeMail from './BlackholeMail';
import InfoModal from './InfoModal';

const Navbar = React.memo(() => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Memoizar a configuração de navegação
  const navigation = useMemo(() => [
    { nameKey: 'discover', href: '/' },
    { nameKey: 'saved', href: '/saved' },
    { nameKey: 'history', href: '/history' },
    { nameKey: 'sources', href: '/sources' },
    { nameKey: 'settings', href: '/settings' },
  ], []);

  const handleSearch = useCallback((event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      history.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, history]);
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  return (
    <nav className="bg-gray-200 dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo e Botão Mobile */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-gray-800 dark:text-white">Gikamura</span>
            </Link>
          </div>

          {/* Links de Navegação Desktop */}
          <div className="hidden sm:block flex-1 ml-6">
            <div className="flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white',
                    'px-3 py-2 rounded-md text-sm font-medium'
                  )}
                >
                  {t(item.nameKey)}
                </Link>
              ))}
            </div>
          </div>

          {/* Campo de Busca e Controles Desktop */}
          <div className="hidden sm:flex items-center">
            <div className="mr-4">
              <input
                type="search"
                name="search"
                placeholder={t('searchPlaceholder')}
                className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearch}
              />
            </div>
            <BlackholeMail />
            <ThemeSwitcher />
            <InfoModal />
          </div>

          {/* Controles Mobile */}
          <div className="flex items-center sm:hidden">
            <BlackholeMail />
            <ThemeSwitcher />
            <InfoModal />
            <button
              onClick={toggleMobileMenu}
              className="ml-2 p-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-200 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700">
              {/* Campo de Busca Mobile */}
              <div className="mb-3">
                <input
                  type="search"
                  name="search-mobile"
                  placeholder={t('searchPlaceholder')}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearch}
                />
              </div>
              
              {/* Links de Navegação Mobile */}
              {navigation.map((item) => (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                >
                  {t(item.nameKey)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;