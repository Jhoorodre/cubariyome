// src/App.js
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './components/Layout';
import InfoModal from './components/InfoModal';
import WelcomeModal from './components/WelcomeModal';
import RemoteStorageHelp from './components/RemoteStorageHelp';
import './i18n';
import { ThemeContext } from './context/ThemeContext';
import { RemoteStorageContext } from './context/RemoteStorageContext';
import { LanguageFilterProvider } from './context/LanguageFilterContext';
import { remoteStorage } from './utils/remotestorage';

function App() {
  // Gerenciamento de tema otimizado
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (prefersDark ? 'dark' : 'light');
  });

  // Aplicar tema ao DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Estado de conexão RemoteStorage
  const [rsConnected, setRsConnected] = useState(remoteStorage.connected);

  useEffect(() => {
    const handleConnect = () => setRsConnected(true);
    const handleDisconnect = () => setRsConnected(false);

    remoteStorage.on('connected', handleConnect);
    remoteStorage.on('disconnected', handleDisconnect);

    return () => {
      remoteStorage.removeEventListener('connected', handleConnect);
      remoteStorage.removeEventListener('disconnected', handleDisconnect);
    };
  }, []);

  const themeValue = { theme, setTheme };
  const remoteStorageValue = { connected: rsConnected };  return (
    <HashRouter>
      <ThemeContext.Provider value={themeValue}>
        <RemoteStorageContext.Provider value={remoteStorageValue}>
          <LanguageFilterProvider>
            <Layout />
            <RemoteStorageHelp />
            <WelcomeModal />
          </LanguageFilterProvider>
        </RemoteStorageContext.Provider>
      </ThemeContext.Provider>
    </HashRouter>
  );
}

export default App;