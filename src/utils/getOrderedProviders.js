// src/utils/getOrderedProviders.js

/**
 * Ordena uma lista de provedores de acordo com uma ordem customizada e nomes ativos.
 * @param {Array} allAvailableProviders - Lista de todos os objetos de provedor disponíveis da API, ou a lista já filtrada de ativos.
 * @param {Array} activeProviderNames - Array de NOMES de provedores que estão ativos (usado para filtrar allAvailableProviders se necessário, ou para garantir que estamos ordenando os corretos).
 * @param {Array} customOrderNames - Array de NOMES de provedores na ordem customizada pelo usuário.
 * @returns {Array} - Lista de objetos de provedor ativos e ordenados.
 */
export const getOrderedActiveProviders = (providersToOrder, activeProviderNames, customOrderNames) => {
    // Se providersToOrder já é a lista de ativos, não precisamos filtrar por activeProviderNames novamente.
    // Se providersToOrder é a lista completa da API, então precisamos filtrar.
    // Para flexibilidade, vamos assumir que providersToOrder pode ser qualquer uma das duas.
    // Primeiro, garantimos que estamos lidando apenas com provedores que deveriam estar ativos.
    
    let activeProvidersDetails;
    if (providersToOrder.length === activeProviderNames.length && providersToOrder.every(p => activeProviderNames.includes(p.name))) {
        // providersToOrder já parece ser a lista de ativos
        activeProvidersDetails = [...providersToOrder];
    } else {
        // Filtra providersToOrder para conter apenas os que estão em activeProviderNames
        activeProvidersDetails = providersToOrder.filter(p => 
            activeProviderNames.includes(p.name)
        );
    }

    if (!activeProvidersDetails || activeProvidersDetails.length === 0) {
        return [];
    }
    if (!customOrderNames || customOrderNames.length === 0) {
        // Se não há ordem customizada, retorna os ativos na ordem em que estão (ou aplicar um fallback)
        return activeProvidersDetails.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
    }

    const sortedActiveProviders = [...activeProvidersDetails].sort((a, b) => {
        const indexA = customOrderNames.indexOf(a.name);
        const indexB = customOrderNames.indexOf(b.name);

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        if (indexA !== -1) {
            return -1;
        }
        if (indexB !== -1) {
            return 1;
        }
        return (a.name || '').localeCompare(b.name || '');
    });

    return sortedActiveProviders;
};