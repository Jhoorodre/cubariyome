// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { classNames } from '../utils/strings';
import ThemeSwitcher from './ThemeSwitcher'; // Supondo que você tenha este componente

const navigation = [
  { nameKey: 'discover', href: '/' },
  { nameKey: 'saved', href: '/saved' },
  { nameKey: 'history', href: '/history' },
  { nameKey: 'settings', href: '/settings' },
];

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchQuery) {
      history.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-gray-200 dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo e Links de Navegação */}
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-gray-800 dark:text-white">Cubari</span>
            </Link>
            <div className="hidden sm:block sm:ml-6">
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
          </div>
          
          {/* Campo de Busca e Tema */}
          <div className="flex items-center">
            <div className="mr-4">
              <input
                type="search"
                name="search"
                placeholder={t('searchPlaceholder')}
                className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
              />
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
