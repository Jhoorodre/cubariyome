// src/components/ProviderCard.js
import React from 'react';
import ProviderIcon from './ProviderIcon'; // Ajuste o caminho se necessário
import { getProviderDisplayName } from '../utils/providerUtils'; // Ajuste o caminho se necessário
import { isOfficialProvider } from '../utils/sourceConstants'; // Ajuste o caminho se necessário

const ProviderCard = React.memo(({ 
    provider, 
    // category, // Não parece ser usado diretamente no card, removido por enquanto
    isEnabled, 
    onToggle, 
    officialOnly,
    allProviderVersions // Lista de todas as versões da API para este provider.name
}) => {
    const isOfficial = isOfficialProvider(provider);

    // Lógica para múltiplas versões movida para cá para encapsulamento
    const hasMultipleVersions = allProviderVersions && allProviderVersions.length > 1;
    const hasAllVersion = hasMultipleVersions && allProviderVersions.some(p => p.language === 'all');
    const specificVersions = hasMultipleVersions 
        ? allProviderVersions.filter(p => p.language !== 'all').map(p => p.language)
        : [];

    // console.log(`ProviderCard render: ${provider.name} - ${provider.language}`);

    return (
        <div className={`p-4 rounded-lg border ${isEnabled ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <ProviderIcon provider={provider} className="h-8 w-8 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white break-words">
                            {getProviderDisplayName(provider)}
                            {isOfficial && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                    ✓ Oficial
                                </span>
                            )}
                            {provider.language === 'all' && hasMultipleVersions && (
                                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                                    🌐 Multi-idioma ({specificVersions.length} versões)
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                            {provider.language === 'all' ? 'Todos os idiomas' : provider.language} • ID: {provider.id}
                            {provider.is_nsfw && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full dark:bg-red-900/30 dark:text-red-400">
                                    +18
                                </span>
                            )}
                        </p>
                        {hasMultipleVersions && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {provider.language === 'all' ? (
                                    <div>
                                        <p className="text-green-600 dark:text-green-400 font-medium">
                                            🌐 Fonte Global - Ativa automaticamente TODAS as versões disponíveis:
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {specificVersions.map(lang => (
                                                <span key={lang} className="px-1.5 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-xs">
                                                    {lang === 'pt' ? '🇧🇷 Português' :
                                                        lang === 'pt-BR' ? '🇧🇷 Português (BR)' :
                                                            lang === 'en' ? '🇺🇸 English' :
                                                                lang === 'es' ? '🇪🇸 Español' : lang}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            💡 Ao ativar esta fonte, você terá acesso a conteúdo em todos os idiomas listados acima
                                        </p>
                                    </div>
                                ) : hasAllVersion ? (
                                    <p className="text-purple-600 dark:text-purple-400">
                                        🌐 Também disponível: versão multi-idioma (ALL)
                                    </p>
                                ) : (
                                    specificVersions.length > 0 && (
                                        <p>
                                            Outras versões: {specificVersions.join(', ')}
                                        </p>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <label className="flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => onToggle(provider)} // Passa o objeto provider inteiro
                        disabled={officialOnly && !isOfficial}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                </label>
            </div>
        </div>
    );
});

export default ProviderCard;