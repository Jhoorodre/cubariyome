// src/App.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import preval from 'preval.macro';
import { HashRouter } from 'react-router-dom'; // PASSO 1: Importar o HashRouter
import Router from './Router';
import { ThemeContext } from './context/ThemeContext';
import { RemoteStorageContext } from './context/RemoteStorageContext';
import rs from './utils/remotestorage';
import Layout from './components/Layout'; // Importa o novo Layout
import './i18n'; // Garante que a configuração de internacionalização seja carregada

function App() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.theme || 'dark');
  const [isStorageConnected, setStorageConnected] = useState(false);
  const buildTimestamp = preval`module.exports = new Date().getTime();`;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.theme = theme;
  }, [theme]);

  useEffect(() => {
    rs.on('connected', () => setStorageConnected(true));
    rs.on('disconnected', () => setStorageConnected(false));
  }, []);

  return (
    // PASSO 2: Envolver a aplicação com o HashRouter
    <HashRouter>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <RemoteStorageContext.Provider value={{ rs, isStorageConnected }}>
            <div className="bg-gray-100 dark:bg-gray-800 dark:text-white min-h-screen">
              <Layout />
            </div>
          </RemoteStorageContext.Provider>
        </ThemeContext.Provider>
    </HashRouter>
  );
}

export default App;