import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '../config'; // Importando do arquivo de configuração
import { OFFICIAL_LICENSED_PROVIDERS, KNOWN_SAFE_BRAZILIAN_PROVIDERS } from '../utils/sourceConstants';

const ProviderContext = createContext();

const fetchAllProvidersAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/content-providers/list/`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro HTTP ${response.status} ao buscar providers: ${errorText}`);
      throw new Error(`Erro HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.providers || data || [];
  } catch (error) {
    console.error("Exceção ao buscar providers para inicialização do contexto:", error);
    throw error; // Re-throw para ser pego pelo chamador
  }
};

export const ProviderContextProvider = ({ children }) => {
  const [allApiProviders, setAllApiProviders] = useState([]);
  const [enabledProviderIdsOrder, setEnabledProviderIdsOrder] = useState([]);
  const [officialOnly, setOfficialOnly] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [errorContext, setErrorContext] = useState(null);

  // Efeito principal de inicialização do contexto
  useEffect(() => {
    const initializeContext = async () => {
      setIsLoadingContext(true);
      setErrorContext(null);
      console.log("[ProviderContext] Iniciando initializeContext...");

      try {
        const fetchedProviders = await fetchAllProvidersAPI();
        
        // FILTRO ESTRITO: só mantém providers cujo language seja permitido
        const allowedLanguages = ['all', 'pt', 'pt-BR', 'es', 'es-419', 'en'];
        const allowedProviders = fetchedProviders.filter(p => allowedLanguages.includes(p.language));
        // Log para depuração
        const langsCount = {};
        allowedProviders.forEach(p => { langsCount[p.language] = (langsCount[p.language] || 0) + 1; });
        console.log('[ProviderContext] Providers por idioma após filtro ESTRITO:', langsCount);
        setAllApiProviders(allowedProviders);
        console.log("[ProviderContext] All API Providers filtrados (estrito):", allowedProviders.length);

        const storedOrderString = localStorage.getItem('enabledProvidersOrder');
        const storedOfficialOnlyString = localStorage.getItem('officialOnly');
        const hasVisited = localStorage.getItem('hasVisitedSources') === 'true';

        let initialOrder = [];
        if (storedOrderString) {
          try {
            initialOrder = JSON.parse(storedOrderString);
          } catch (e) {
            console.error("Erro ao parsear storedOrderString do localStorage:", e);
            localStorage.removeItem('enabledProvidersOrder'); // Limpa valor inválido
          }
        }
        
        let initialOfficialOnly = false;
        if (storedOfficialOnlyString) {
          try {
            initialOfficialOnly = JSON.parse(storedOfficialOnlyString);
          } catch (e) {
            console.error("Erro ao parsear storedOfficialOnlyString do localStorage:", e);
            localStorage.removeItem('officialOnly'); // Limpa valor inválido
          }
        }
        
        setOfficialOnly(initialOfficialOnly); // Define o estado officialOnly com base no localStorage ou default

        if (!storedOrderString && !hasVisited) { // Primeira visita REAL da aplicação
          console.log("[ProviderContext] Primeira visita detectada. Configurando defaults para enabledProviderIdsOrder.");
          const defaultOfficialPtBrProviderIds = [];
          OFFICIAL_LICENSED_PROVIDERS.forEach(officialName => {
            const ptBrVersion = fetchedProviders.find(
              p => p.name === officialName && (p.language === 'pt-BR' || p.language === 'pt')
            );
            if (ptBrVersion && ptBrVersion.id) {
              if (!defaultOfficialPtBrProviderIds.includes(ptBrVersion.id)) {
                defaultOfficialPtBrProviderIds.push(ptBrVersion.id);
              }
            }
          });

          if (defaultOfficialPtBrProviderIds.length > 0) {
            console.log("[ProviderContext] Definindo providers padrão:", defaultOfficialPtBrProviderIds);
            setEnabledProviderIdsOrder(defaultOfficialPtBrProviderIds);
            // O useEffect abaixo persistirá isso no localStorage
          } else {
             setEnabledProviderIdsOrder([]); // Garante que seja um array vazio se nenhum default for encontrado
          }
          localStorage.setItem('hasVisitedSources', 'true');
        } else {
          // Se não for primeira visita, usa o que foi carregado do localStorage (ou array vazio se nada/inválido)
          setEnabledProviderIdsOrder(initialOrder);
        }
        
        console.log("[ProviderContext] Finalizando initializeContext. isLoadingContext será false.");
        setErrorContext(null); // Limpa erro se tudo ocorreu bem
      } catch (error) {
        console.error("[ProviderContext] Erro durante initializeContext:", error);
        setErrorContext(error.message || "Erro ao inicializar o contexto de provedores.");
      } finally {
        setIsLoadingContext(false);
      }
    };

    initializeContext();
  }, []); // Roda apenas uma vez na montagem do contexto

  // Persistir enabledProviderIdsOrder no localStorage
  useEffect(() => {
    // Só persiste se o contexto não estiver carregando (evita salvar estado intermediário/inicial vazio)
    if (!isLoadingContext) { 
      try {
        console.log("[ProviderContext] Persistindo enabledProviderIdsOrder:", enabledProviderIdsOrder);
        localStorage.setItem('enabledProvidersOrder', JSON.stringify(enabledProviderIdsOrder));
      } catch (error) {
        console.error("Erro ao salvar 'enabledProvidersOrder' no localStorage:", error);
      }
    }
  }, [enabledProviderIdsOrder, isLoadingContext]);

  // Persistir officialOnly no localStorage
  useEffect(() => {
    if (!isLoadingContext) {
      try {
        console.log("[ProviderContext] Persistindo officialOnly:", officialOnly);
        localStorage.setItem('officialOnly', JSON.stringify(officialOnly));
      } catch (error) {
        console.error("Erro ao salvar 'officialOnly' no localStorage:", error);
      }
    }
  }, [officialOnly, isLoadingContext]);

  const enabledProviderIdsSet = useMemo(() => new Set(enabledProviderIdsOrder), [enabledProviderIdsOrder]);

  const updateEnabledProvidersList = useCallback((newOrderArray) => {
    setEnabledProviderIdsOrder(newOrderArray);
  }, []);

  const removeProvider = useCallback((providerIdToRemove) => {
    setEnabledProviderIdsOrder(currentOrder => currentOrder.filter(id => id !== providerIdToRemove));
  }, []);

  const reorderProviders = useCallback((newOrderArray) => {
    setEnabledProviderIdsOrder(newOrderArray);
  }, []);

  const value = useMemo(() => ({
    allApiProviders,
    enabledProviderIdsOrder,
    enabledProviderIdsSet,
    officialOnly,
    setOfficialOnly,
    syncStatus,
    setSyncStatus,
    isLoadingContext,
    errorContext,
    updateEnabledProvidersList,
    removeProvider,
    reorderProviders,
  }), [
    allApiProviders,
    enabledProviderIdsOrder, 
    enabledProviderIdsSet, 
    officialOnly, 
    syncStatus, 
    isLoadingContext, 
    errorContext,
    setOfficialOnly, // Incluído para que o consumidor possa alterá-lo
    setSyncStatus,   // Incluído
    updateEnabledProvidersList,
    removeProvider,
    reorderProviders
  ]);

  if (isLoadingContext && !errorContext) {
     console.log("[ProviderContext] Renderizando null (ou um Spinner global) enquanto o contexto carrega.");
     // Poderia retornar um spinner global aqui se o app inteiro dependesse disso antes de mostrar qualquer coisa.
     // Por enquanto, os componentes consumidores verificarão isLoadingContext.
  }
  
  if (errorContext) {
      console.log("[ProviderContext] Renderizando mensagem de erro global do contexto.");
      // Poderia retornar uma UI de erro global aqui.
  }

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProviderContext = () => useContext(ProviderContext);
