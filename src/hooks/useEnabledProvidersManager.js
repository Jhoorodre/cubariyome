// src/hooks/useEnabledProvidersManager.js
import { useState, useEffect, useCallback } from 'react';
import { 
    OFFICIAL_LICENSED_PROVIDERS, 
    BRAZILIAN_PROVIDER_NAMES,
    // EXPECTED_OFFICIAL_PROVIDERS_COUNT // Não diretamente usado aqui, mas no useProviderFetching
} from '../utils/sourceConstants'; // Ajuste o caminho se necessário

const SYNC_FEEDBACK_DURATION = 2000;

export const useEnabledProvidersManager = (
    allProviders, // Lista completa de OBJETOS provider da API (do useProviderFetching)
    initialEnabledProviderIdsSet, // AGORA é um Set de IDs
    initialProviderIdsOrderArray, // AGORA é um Array de IDs
    initialOfficialOnlyState
) => {
    const [enabledProviderIds, setEnabledProviderIds] = useState(initialEnabledProviderIdsSet || new Set());
    const [enabledProviderIdsOrder, setEnabledProviderIdsOrder] = useState(initialProviderIdsOrderArray || []);
    const [officialOnly, setOfficialOnly] = useState(initialOfficialOnlyState || false);
    const [syncStatus, setSyncStatus] = useState('');

    useEffect(() => setEnabledProviderIds(initialEnabledProviderIdsSet || new Set()), [initialEnabledProviderIdsSet]);
    useEffect(() => setEnabledProviderIdsOrder(initialProviderIdsOrderArray || []), [initialProviderIdsOrderArray]);
    useEffect(() => setOfficialOnly(initialOfficialOnlyState || false), [initialOfficialOnlyState]);

    // getSpecificVersionsForProvider agora retorna objetos provider completos
    const getSpecificVersionsForProvider = useCallback((providerName) => {
        const specificSupportedLanguages = ['pt', 'pt-BR', 'en', 'es'];
        return (allProviders || [])
            .filter(p => p.name === providerName && specificSupportedLanguages.includes(p.language));
            // .map(p => ({ name: p.name, language: p.language, id: p.id })); // Retorna o objeto completo
    }, [allProviders]);

    const persistAndNotify = useCallback((newEnabledIdsSet, newIdsOrderArray, actionDetails) => {
        localStorage.setItem('enabledProviders', JSON.stringify([...newEnabledIdsSet])); // Salva IDs
        localStorage.setItem('enabledProvidersOrder', JSON.stringify(newIdsOrderArray)); // Salva IDs
        console.log('[useEnabledProvidersManager] Disparando evento providersChanged', {
            enabledProviderIds: [...newEnabledIdsSet],
            providerIdOrder: newIdsOrderArray,
            ...actionDetails
        });
        window.dispatchEvent(new CustomEvent('providersChanged', { 
            detail: { 
                enabledProviderIds: [...newEnabledIdsSet],
                providerIdOrder: newIdsOrderArray, // Renomeado para clareza
                ...actionDetails 
            } 
        }));
        setSyncStatus('success');
        setTimeout(() => setSyncStatus(''), SYNC_FEEDBACK_DURATION);
    }, []);

    const handleProviderToggle = useCallback((clickedProviderObject) => {
        const clickedProviderId = clickedProviderObject.id;
        const clickedProviderName = clickedProviderObject.name;
        const clickedLanguage = clickedProviderObject.language;
        
        const newEnabledIds = new Set(enabledProviderIds);
        let newOrderIds = [...enabledProviderIdsOrder];
        let actionLog = '';

        const isCurrentlyEnabled = newEnabledIds.has(clickedProviderId);

        if (isCurrentlyEnabled) { // DESABILITANDO o provider específico clicado
            newEnabledIds.delete(clickedProviderId);
            newOrderIds = newOrderIds.filter(id => id !== clickedProviderId);
            actionLog = `➖ DESATIVANDO: ${clickedProviderName} (${clickedLanguage} - ID: ${clickedProviderId}).`;

            // Se a versão GLOBAL 'all' foi explicitamente clicada para desativar,
            // desativamos todas as suas específicas também.
            if (clickedLanguage === 'all') {
                const specificVersions = getSpecificVersionsForProvider(clickedProviderName);
                specificVersions.forEach(version => {
                    newEnabledIds.delete(version.id);
                    newOrderIds = newOrderIds.filter(id => id !== version.id);
                });
                actionLog = `🌐 DESATIVANDO FONTE GLOBAL ${clickedProviderName} e suas ${specificVersions.length} versões específicas.`;
            }
        } else { // HABILITANDO o provider específico clicado
            newEnabledIds.add(clickedProviderId);
            if (!newOrderIds.includes(clickedProviderId)) {
                newOrderIds.push(clickedProviderId);
            }
            actionLog = `➕ ATIVANDO: ${clickedProviderName} (${clickedLanguage} - ID: ${clickedProviderId}).`;

            // Se a versão GLOBAL 'all' foi explicitamente clicada para ativar,
            // ativamos todas as suas específicas também.
            if (clickedLanguage === 'all') {
                const specificVersions = getSpecificVersionsForProvider(clickedProviderName);
                specificVersions.forEach(version => {
                    newEnabledIds.add(version.id);
                    if (!newOrderIds.includes(version.id)) {
                        newOrderIds.push(version.id);
                    }
                });
                actionLog = `🌐 ATIVANDO FONTE GLOBAL ${clickedProviderName}. Suas ${specificVersions.length} versões específicas (${specificVersions.map(v=>v.language).join(', ') || 'Nenhuma'}) também foram ativadas.`;
            }
        }
        
        setEnabledProviderIds(newEnabledIds);
        setEnabledProviderIdsOrder(newOrderIds);
        persistAndNotify(newEnabledIds, newOrderIds, { 
            changedProviderId: clickedProviderId, // Passando ID
            action: newEnabledIds.has(clickedProviderId) ? 'enabled' : 'disabled' 
        });
        console.log(actionLog);

    }, [allProviders, enabledProviderIds, enabledProviderIdsOrder, getSpecificVersionsForProvider, persistAndNotify]);

    const updateEnabledProvidersList = useCallback((providerIdArray, actionType = 'manualUpdate') => {
        const newEnabledIdsSet = new Set(providerIdArray);
        setEnabledProviderIds(newEnabledIdsSet);
        setEnabledProviderIdsOrder(providerIdArray); 
        
        if (providerIdArray.length > 0) {
            localStorage.removeItem('userDisabledAll');
        } else {
            localStorage.setItem('userDisabledAll', 'true');
        }
        persistAndNotify(newEnabledIdsSet, providerIdArray, { action: actionType });
        console.log(`🔄 ${actionType}: Ativados ${newEnabledIdsSet.size} providers (por ID).`);
    }, [persistAndNotify]);

    const handleOfficialOnlyToggleManager = useCallback(() => {
        const newValue = !officialOnly;
        setOfficialOnly(newValue);
        localStorage.setItem('officialOnly', newValue.toString());

        if (newValue) {
            // Ativar apenas os IDs das fontes oficiais (primeira ocorrência de cada nome oficial)
            const officialProviderIds = [];
            const addedNames = new Set();
            (allProviders || []).forEach(p => {
                if (OFFICIAL_LICENSED_PROVIDERS.includes(p.name) && !addedNames.has(p.name)) {
                    officialProviderIds.push(p.id); // Adiciona o ID da primeira instância encontrada da fonte oficial
                    addedNames.add(p.name);
                }
            });
            
            setEnabledProviderIds(new Set(officialProviderIds));
            setEnabledProviderIdsOrder(officialProviderIds);
            persistAndNotify(new Set(officialProviderIds), officialProviderIds, { action: 'officialModeToggled', officialOnly: newValue });
            console.log('🔒 Modo oficial ativado - habilitando IDs de fontes oficiais:', officialProviderIds);
        } else {
            console.log('🔓 Modo oficial desativado.');
            setSyncStatus('success'); 
            setTimeout(() => setSyncStatus(''), SYNC_FEEDBACK_DURATION);
        }
    }, [officialOnly, allProviders, persistAndNotify]);
    
    const totalEnabled = enabledProviderIds.size;

    return {
        enabledProviderIds,
        enabledProviderIdsOrder,
        setEnabledProviderIdsOrder, 
        officialOnly,
        syncStatus,
        totalEnabled,
        handleProviderToggle,
        updateEnabledProvidersList,
        handleOfficialOnlyToggleManager,
        persistEnabledState: () => persistAndNotify(enabledProviderIds, enabledProviderIdsOrder, {action: 'manualPersist'}) 
    };
};