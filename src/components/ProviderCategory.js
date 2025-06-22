// src/components/ProviderCategory.js
import React from 'react';
import ProviderCard from './ProviderCard'; // Ajuste o caminho se necessário

const ProviderCategory = React.memo(({ 
    title, 
    providersInCategory, // Renomeado de 'providers' para evitar confusão com o estado global
    categoryKey, // 'official', 'global', etc.
    allApiProviders, // Lista completa de todas as fontes da API (para passar para ProviderCard)
    enabledProviderIdsSet, // Alterado de enabledProvidersSet para enabledProviderIdsSet
    onProviderToggle,
    officialOnlyToggleState
}) => {
    // console.log(`ProviderCategory render: ${title} - ${providersInCategory.length} items`);
    if (!providersInCategory || providersInCategory.length === 0) return null;
    
    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                {categoryKey === 'official' && '✅ '}
                {categoryKey === 'global' && '🌐 '}
                {categoryKey === 'brazilian' && '🇧🇷 '}
                {categoryKey === 'spanish' && '🇪🇸 '}
                {categoryKey === 'english' && '🇺🇸 '}
                {categoryKey === 'nsfw' && '🔞 '}
                {title}
                <span className="ml-2 text-sm font-normal text-gray-500">({providersInCategory.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providersInCategory.map(provider => (
                    <ProviderCard
                        key={provider.id}
                        provider={provider}
                        isEnabled={enabledProviderIdsSet.has(provider.id)} // Alterado para usar provider.id
                        onToggle={onProviderToggle}
                        officialOnly={officialOnlyToggleState}
                        allProviderVersions={allApiProviders.filter(p => p.name === provider.name)}
                    />
                ))}
            </div>
        </div>
    );
});

export default ProviderCategory;