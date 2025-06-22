import React from 'react';
import { createRoot } from 'react-dom/client'; // Importação atualizada para React 18+
import './style/index.css';
import App from './App';
import './i18n';
import { ProviderContextProvider } from './context/ProviderContext';

const container = document.getElementById('root');
const root = createRoot(container); // Cria a raiz usando a nova API

root.render(
  <React.StrictMode>
    <ProviderContextProvider>
      <App />
    </ProviderContextProvider>
  </React.StrictMode>
);
