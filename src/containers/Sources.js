// src/containers/Sources.js
import React, { useState, useCallback, useMemo } from 'react'; // Removido useEffect daqui, se não for mais usado para outra coisa
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import ProviderIcon from '../components/ProviderIcon';
import { getProviderDisplayName } from '../utils/providerUtils';
import { useLanguageFilter } from '../context/LanguageFilterContext';
import { useProviderContext } from '../context/ProviderContext';
import { 
    OFFICIAL_LICENSED_PROVIDERS, 
    KNOWN_SAFE_BRAZILIAN_PROVIDERS, 
} from '../utils/sourceConstants';
import ProviderCategory from '../components/ProviderCategory';
// import { useProviderFetching } from '../hooks/useProviderFetching'; // REMOVIDO
import { useProviderDisplayLogic } from '../hooks/useProviderDisplayLogic';

const Sources = () => {
    const { t } = useTranslation();
    const { selectedLanguage, setSelectedLanguage } = useLanguageFilter();
    const { 
        allApiProviders,      // Vem do contexto
        isLoadingContext,     // Vem do contexto (substitui isLoading de useProviderFetching)
        errorContext,         // Vem do contexto (substitui error de useProviderFetching)
        enabledProviderIdsOrder,
        enabledProviderIdsSet,
        updateEnabledProvidersList, 
        reorderProviders,
        officialOnly,
        setOfficialOnly,
        syncStatus,
        setSyncStatus
    } = useProviderContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // useProviderDisplayLogic agora usa allApiProviders do contexto
    const { 
        filteredProvidersForUI, 
        categorizedData
    } = useProviderDisplayLogic(allApiProviders || [], selectedLanguage, searchTerm);

    // Filtra providers para UI conforme officialOnly
    const filteredProvidersForUIOfficial = officialOnly
        ? (filteredProvidersForUI || []).filter(p => OFFICIAL_LICENSED_PROVIDERS.includes(p.name))
        : (filteredProvidersForUI || []);
    const categorizedDataOfficial = officialOnly
        ? { official: (categorizedData.official || []), global: [], brazilian: [], spanish: [], english: [], nsfw: [] }
        : categorizedData;

    const totalEnabled = enabledProviderIdsOrder.length;
    
    const [draggedProviderId, setDraggedProviderId] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const getOrderedEnabledObjects = useCallback(() => {
        if (!enabledProviderIdsOrder || enabledProviderIdsOrder.length === 0 || !allApiProviders || allApiProviders.length === 0) {
            return [];
        }
        return enabledProviderIdsOrder.map(providerId => {
            const provider = (allApiProviders || []).find(p => p.id === providerId);
            return provider;
        }).filter(Boolean);
    }, [enabledProviderIdsOrder, allApiProviders]);
    
    const orderedEnabledProvidersForDisplay = useMemo(() => {
        const allEnabled = getOrderedEnabledObjects();
        if (officialOnly) {
            return allEnabled.filter(provider => OFFICIAL_LICENSED_PROVIDERS.includes(provider.name));
        }
        return allEnabled;
    }, [getOrderedEnabledObjects, officialOnly, allApiProviders]);

    const actualTotalEnabledDisplay = orderedEnabledProvidersForDisplay.length;

    const handleDrop = useCallback((e, dropIndex) => {
        e.preventDefault();
        if (draggedProviderId === null) return;
        const newOrderIds = [...enabledProviderIdsOrder];
        const draggedIndex = newOrderIds.indexOf(draggedProviderId);
        if (draggedIndex === -1) {
            setDraggedProviderId(null);
            setDragOverIndex(null);
            return;
        }
        const [item] = newOrderIds.splice(draggedIndex, 1);
        newOrderIds.splice(dropIndex, 0, item);
        reorderProviders(newOrderIds);
        setDraggedProviderId(null);
        setDragOverIndex(null);
    }, [draggedProviderId, enabledProviderIdsOrder, reorderProviders]);

    const handleDragStart = useCallback((e, providerId) => {
        setDraggedProviderId(providerId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e, index) => {
        e.preventDefault();
        if (index !== dragOverIndex) {
            setDragOverIndex(index);
        }
    }, [dragOverIndex]);

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedProviderId(null);
        setDragOverIndex(null);
    }, []);

    const handleProviderToggle = useCallback((providerToToggle) => {
        const providerId = providerToToggle.id;
        const isGlobal = providerToToggle.language === 'all';
        if (isGlobal) {
            // Ativa/desativa todas as versões desse provider global
            const allVersions = allApiProviders.filter(p => p.name === providerToToggle.name);
            const allVersionIds = allVersions.map(p => p.id);
            const isAnyEnabled = allVersionIds.some(id => enabledProviderIdsSet.has(id));
            if (isAnyEnabled) {
                // Desativa todas as versões
                updateEnabledProvidersList(enabledProviderIdsOrder.filter(id => !allVersionIds.includes(id)));
            } else {
                // Ativa todas as versões (mantendo ordem atual e sem duplicar)
                const newOrder = [...enabledProviderIdsOrder];
                allVersionIds.forEach(id => {
                    if (!newOrder.includes(id)) newOrder.push(id);
                });
                updateEnabledProvidersList(newOrder);
            }
        } else {
            // Comportamento padrão para providers não-globais
            if (enabledProviderIdsSet.has(providerId)) {
                updateEnabledProvidersList(enabledProviderIdsOrder.filter(id => id !== providerId));
            } else {
                updateEnabledProvidersList([...enabledProviderIdsOrder, providerId]);
            }
        }
    }, [enabledProviderIdsOrder, enabledProviderIdsSet, updateEnabledProvidersList, allApiProviders]);

    const handleOfficialOnlyToggleManager = () => {
        setOfficialOnly(!officialOnly);
        setSyncStatus('success'); 
        setTimeout(() => setSyncStatus(null), 2000);
    };
    
    // Usa categorizedDataOfficial que já foi filtrada
    const { official, global, brazilian, spanish, english, nsfw } = categorizedDataOfficial;
    
    // Lógica de carregamento e erro agora usa isLoadingContext e errorContext
    if (isLoadingContext) return <Spinner />;
    if (errorContext) return <Container><p className="text-red-500 text-center py-10">Erro ao carregar fontes: {errorContext}</p></Container>;

    return (
        <Container className="sources-container pb-0">
            <Section text={t('sources.title')} />

            {/* Barra de Busca e Filtros */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sources-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            🔍 {t('sources.searchPlaceholder')}
                        </label>
                        <input
                            id="sources-search"
                            type="text"
                            placeholder={t('sources.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="sources-category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📂 {t('sources.filterByCategory')}
                        </label>
                        <select
                            id="sources-category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">🌍 Todas as categorias</option>
                            <option value="official">✅ Fontes Oficiais</option>
                            <option value="global">🌐 Fontes Globais</option>
                            <option value="brazilian">🇧🇷 Fontes Brasileiras</option>
                            <option value="spanish">🇪🇸 Fontes Espanhol</option>
                            <option value="english">🇺🇸 Fontes Inglês</option>
                            <option value="nsfw">🔞 NSFW Disponível</option>
                        </select>
                    </div>
                </div>
                {searchTerm && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        📊 Encontrados: {filteredProvidersForUIOfficial.length} fontes para "{searchTerm}"
                    </div>
                )}
            </div>
            
            {/* Estatísticas e Controles Gerais */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2"> 📊 {t('sources.statistics')} </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <p>{t('sources.stats.total')}: {allApiProviders.length}</p>
                            <p>{t('sources.stats.enabled')}: {actualTotalEnabledDisplay} ({totalEnabled} IDs no contexto)</p> {/* Mostra ambos para depuração se necessário */}
                            <p>{t('sources.stats.official')}: {official.length}</p>
                            <p>Fontes globais: {global.length}</p>
                            <p>{t('sources.stats.brazilian')}: {brazilian.length}</p>
                            <p>Fontes inglês: {english.length}</p>
                            <p>Fontes espanhol: {spanish.length}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2"> 🌐 {t('sources.preferredLanguage')} </h3>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => {
                                setSelectedLanguage(e.target.value);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">🌍 Todos os idiomas</option>
                            <option value="pt">🇧🇷 Português</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="es">🇪🇸 Español</option>
                        </select>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-right"> ⚙️ {t('sources.controls')} </h3>
                        <div className="space-y-3">
                            <label className="flex items-center cursor-pointer justify-end">
                                <span className="mr-2 text-sm text-gray-700 dark:text-gray-300"> {t('sources.officialOnly')} </span>
                                <input type="checkbox" checked={officialOnly} onChange={handleOfficialOnlyToggleManager} className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                            </label>
                            <div className="space-y-2 text-right">
                                <button
                                    onClick={() => {
                                        const visibleProviderIds = filteredProvidersForUIOfficial.map(p => p.id);
                                        updateEnabledProvidersList([...new Set([...enabledProviderIdsOrder, ...visibleProviderIds])]);
                                    }}
                                    className="block w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 text-right"
                                >
                                    {t('sources.enableAll')}
                                </button>
                                <button
                                    onClick={() => {                                        
                                        const brazilianProviderIds = (allApiProviders || []) 
                                            .filter(p => p.language === 'pt' || p.language === 'pt-BR' || KNOWN_SAFE_BRAZILIAN_PROVIDERS.includes(p.name))
                                            .map(p => p.id);
                                        updateEnabledProvidersList([...new Set([...enabledProviderIdsOrder, ...brazilianProviderIds])]);
                                    }}
                                    className="block w-full text-sm text-green-600 hover:text-green-700 dark:text-green-400 text-right"
                                >
                                    {t('sources.enableBrazilian')}
                                </button>
                                <button
                                    onClick={() => {
                                        const officialProviderIds = (allApiProviders || [])
                                            .filter(p => OFFICIAL_LICENSED_PROVIDERS.includes(p.name))
                                            .map(p => p.id);
                                        updateEnabledProvidersList([...new Set([...enabledProviderIdsOrder, ...officialProviderIds])]);
                                    }}
                                    className="block w-full text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 text-right"
                                >
                                    {t('sources.enableOfficial')}
                                </button>
                                <button
                                    onClick={() => { updateEnabledProvidersList([]); }}
                                    className="block w-full text-sm text-red-600 hover:text-red-700 dark:text-red-400 text-right"
                                >
                                    {t('sources.disableAll')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ... (avisos de officialOnly e syncStatus) ... */}
                 {officialOnly && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-700">
                        <p className="text-sm text-green-800 dark:text-green-400">
                            ✅ {t('sources.officialModeActive')}
                        </p>
                    </div>
                )}
                {syncStatus && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-700">
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            {syncStatus === 'success' ? '✅ Sincronização bem-sucedida!' : `⚠️ ${syncStatus}`}
                        </p>
                    </div>
                )}
            </div>
            
            {/* Seção Dinâmica: Fontes Ativadas */}
            {actualTotalEnabledDisplay > 0 && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
                            ✅ Fontes Ativadas
                            <span className="ml-2 px-2 py-1 text-sm bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                                {actualTotalEnabledDisplay}
                            </span>
                        </h3>
                        <button
                            onClick={() => {
                                if (officialOnly) {
                                    // Se officialOnly, desativa apenas os oficiais que estão na lista de exibição
                                    const officialIdsToKeep = enabledProviderIdsOrder.filter(id => 
                                        !orderedEnabledProvidersForDisplay.some(p => p.id === id)
                                    );
                                    updateEnabledProvidersList(officialIdsToKeep);
                                } else {
                                    updateEnabledProvidersList([]);
                                }
                            }}
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
                        >
                            🗑️ Desativar todas ({officialOnly ? 'oficiais visíveis' : 'todas'})
                        </button>
                    </div>
                    
                    {officialOnly && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-700">
                            <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                ⚠️ <strong>Modo oficial ativo</strong>: Apenas fontes oficiais ativadas são listadas aqui e usadas na aba Descobrir.
                            </p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orderedEnabledProvidersForDisplay.map((provider, index) => (
                            <div 
                                key={provider.id + '-enabled'}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, provider.id)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`relative flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 cursor-move h-[60px] 
                                    ${draggedProviderId === provider.id ? 'opacity-50 scale-95 border-blue-400 dark:border-blue-500' : 'border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500'} 
                                    ${dragOverIndex === index ? 'border-l-4 border-l-blue-500 dark:border-l-blue-400' : ''}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                                        {index + 1}
                                    </div>
                                    <ProviderIcon provider={provider} className="h-6 w-6" />
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                            {getProviderDisplayName(provider)}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {provider.language === 'all' ? 'Global' : provider.language}
                                            {provider.is_nsfw && ' • +18'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing">
                                        {/* Ícone de arrastar */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                    </div>
                                    <button
                                        onClick={() => handleProviderToggle(provider)}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 transition-colors"
                                        title="Desativar fonte"
                                    >
                                        ❌
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lista de Fontes por Categoria */}
            {!officialOnly ? (
                <>
                    {(selectedCategory === 'all' || selectedCategory === 'official') && <ProviderCategory title="Fontes Oficiais" providersInCategory={official} categoryKey="official" allApiProviders={allApiProviders} enabledProviderIdsSet={enabledProviderIdsSet} onProviderToggle={handleProviderToggle} officialOnlyToggleState={officialOnly}/>} 
                    {(selectedCategory === 'all' || selectedCategory === 'global') && <ProviderCategory title="Fontes Globais" providersInCategory={global} categoryKey="global" allApiProviders={allApiProviders} enabledProviderIdsSet={enabledProviderIdsSet} onProviderToggle={handleProviderToggle} officialOnlyToggleState={officialOnly}/>} 
                    {(selectedCategory === 'all' || selectedCategory === 'brazilian') && <ProviderCategory title="Fontes Brasileiras" providersInCategory={brazilian} categoryKey="brazilian" allApiProviders={allApiProviders} enabledProviderIdsSet={enabledProviderIdsSet} onProviderToggle={handleProviderToggle} officialOnlyToggleState={officialOnly}/>} 
                    {(selectedCategory === 'all' || selectedCategory === 'spanish') && <ProviderCategory title="Fontes Espanhol" providersInCategory={spanish} categoryKey="spanish" allApiProviders={allApiProviders} enabledProviderIdsSet={enabledProviderIdsSet} onProviderToggle={handleProviderToggle} officialOnlyToggleState={officialOnly}/>} 
                    {(selectedCategory === 'all' || selectedCategory === 'english') && <ProviderCategory title="Fontes Inglês" providersInCategory={english} categoryKey="english" allApiProviders={allApiProviders} enabledProviderIdsSet={enabledProviderIdsSet} onProviderToggle={handleProviderToggle} officialOnlyToggleState={officialOnly}/>} 
                    {(selectedCategory === 'all' || selectedCategory === 'nsfw') && <ProviderCategory title="NSFW Disponível" providersInCategory={nsfw} categoryKey="nsfw" allApiProviders={allApiProviders} enabledProviderIdsSet={enabledProviderIdsSet} onProviderToggle={handleProviderToggle} officialOnlyToggleState={officialOnly}/>} 
                </>
            ) : (
                <ProviderCategory title="Fontes Oficiais Disponíveis" providersInCategory={official} categoryKey="official" allApiProviders={allApiProviders} enabledProviderIdsSet={enabledProviderIdsSet} onProviderToggle={handleProviderToggle} officialOnlyToggleState={officialOnly}/>
            )}
            
            {filteredProvidersForUIOfficial.length === 0 && searchTerm && (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">
                        😔 Nenhuma fonte encontrada para "{searchTerm}"
                    </p>
                </div>
            )}
        </Container>
    );
};

export default Sources;
