// src/context/LanguageFilterContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getDefaultLanguage, 
  loadLanguagePreference, 
  saveLanguagePreference 
} from '../utils/languageUtils';

const LanguageFilterContext = createContext();

export function useLanguageFilter() {
  const context = useContext(LanguageFilterContext);
  if (!context) {
    throw new Error('useLanguageFilter deve ser usado dentro de um LanguageFilterProvider');
  }
  return context;
}

export function LanguageFilterProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState(getDefaultLanguage());
  const [isLoading, setIsLoading] = useState(true);
  // Carrega a preferência salva ao inicializar
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const savedLanguage = loadLanguagePreference();
        console.log('Idioma carregado do localStorage:', savedLanguage);
        setSelectedLanguage(savedLanguage);
      } catch (error) {
        console.warn('Erro ao carregar preferência de idioma:', error);
        setSelectedLanguage(getDefaultLanguage());
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, []);

  // Função para alterar o idioma selecionado
  const changeLanguage = (language) => {
    setSelectedLanguage(language);
    saveLanguagePreference(language);
  };
  const value = {
    selectedLanguage,
    setSelectedLanguage: changeLanguage, // Usar a função que salva no localStorage
    changeLanguage,
    isLoading
  };

  return (
    <LanguageFilterContext.Provider value={value}>
      {children}
    </LanguageFilterContext.Provider>
  );
}
