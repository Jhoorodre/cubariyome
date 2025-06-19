// src/containers/Discover.js

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Section from '../components/Section';
import Spinner from '../components/Spinner';
import Container from '../components/Container';

// A URL base da nossa API Django que está rodando localmente
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const Discover = () => {
    const { t } = useTranslation();
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDiscoverData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 1. Buscar a lista de provedores
                const providersResponse = await fetch(`${API_BASE_URL}/content-providers/list/`);
                if (!providersResponse.ok) throw new Error(`Erro ao buscar provedores: ${providersResponse.statusText}`);
                const providers = await providersResponse.json();

                // Filtra apenas provedores em pt-BR para a página inicial
                const targetProviders = providers.filter(p => p.language === 'pt-BR' && !p.is_nsfw);

                // 2. Para cada provedor, buscar mangás populares (usando uma busca genérica)
                const sectionsPromises = targetProviders.map(async (provider) => {
                    const mangaResponse = await fetch(`${API_BASE_URL}/content-discovery/search/?query=a&provider_id=${provider.id}`);
                    if (!mangaResponse.ok) {
                        console.error(`Falha ao buscar dados para ${provider.name}`);
                        return null; 
                    }
                    const mangaData = await mangaResponse.json();

                    // Mapeia os resultados para o formato que o MangaCard espera
                    const items = mangaData.results.map(manga => ({
                        ...manga,
                        mangaUrl: `#/details/${manga.provider_id}/${manga.content_id}`, // Rota para os detalhes
                        coverUrl: manga.thumbnail_url_proxy // A API agora deve retornar a URL completa do proxy
                    }));
                    
                    if (items.length > 0) {
                        return {
                            id: provider.id,
                            title: `Populares em ${provider.name}`,
                            items: items
                        };
                    }
                    return null;
                });

                // 3. Aguarda todas as buscas e atualiza o estado
                const resolvedSections = (await Promise.all(sectionsPromises)).filter(Boolean);
                setSections(resolvedSections);

            } catch (err) {
                console.error("Erro na página Descobrir:", err);
                setError("Não foi possível carregar o conteúdo da página de descoberta.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDiscoverData();
    }, []);

    if (isLoading) {
        return <div className="flex h-screen"><div className="m-auto"><Spinner /></div></div>;
    }

    if (error) {
        return <Container><p className="text-red-500 text-center py-10">{error}</p></Container>;
    }

    return (
        <Container>
            {sections.map((section) => (
                <Section
                    key={section.id}
                    section={section}
                />
            ))}
        </Container>
    );
};

export default Discover;