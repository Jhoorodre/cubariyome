// src/containers/Search.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Container from '../components/Container';
import MangaCard from '../components/MangaCard';
import Spinner from '../components/Spinner';
import Section from '../components/Section';

// URL base da sua API Django.
const API_BASE_URL = '/api/v1';

const Search = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    
    // Usa o hook do React Router para obter o termo de busca da URL.
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query') || '';

    useEffect(() => {
        // A função de busca agora é executada sempre que a 'query' na URL mudar.
        const performSearch = async () => {
            if (!query) {
                setResults([]);
                setSearchPerformed(false);
                return;
            }

            setIsLoading(true);
            setSearchPerformed(true);
            setResults([]); // Limpa resultados antigos

            try {
                // ÚNICA chamada para a API! O backend faz o trabalho pesado.
                const response = await fetch(`${API_BASE_URL}/content-discovery/search?query=${encodeURIComponent(query)}&type=SEARCH`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // O backend já nos retorna uma lista de resultados agregados.
                setResults(data.results || []);

            } catch (error) {
                console.error("Erro ao buscar na API do backend:", error);
                // Você pode adicionar um estado de erro para mostrar na UI.
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [query]);

    return (
        <Container>
            {/* O formulário/input de busca principal provavelmente será movido para o Header/Navbar. */}
            
            {isLoading && <Spinner />}

            {!isLoading && searchPerformed && results.length === 0 && (
                <Section
                    text={t('noResults')}
                    subText={t('noResultsSubtitle')}
                />
            )}

            {!isLoading && results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.map((manga, index) => (
                        <MangaCard
                            key={`${manga.provider_id}-${manga.content_id}-${index}`}
                            provider_id={manga.provider_id}
                            content_id={manga.content_id}
                            mangaUrl={`#/reader/${manga.provider_id}/${manga.content_id}`}
                            coverUrl={manga.thumbnail_url_proxy}
                            mangaTitle={manga.title}
                            sourceName={manga.provider_id} 
                        />
                    ))}
                </div>
            )}
        </Container>
    );
};

export default Search;