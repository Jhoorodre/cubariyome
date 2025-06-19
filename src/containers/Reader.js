// src/containers/Reader.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import Container from '../components/Container';

// URL base da sua API Django.
const API_BASE_URL = '/api/v1';

const Reader = () => {
    const { provider_id, content_id, chapter_id } = useParams();
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChapterPages = async () => {
            if (!provider_id || !content_id || !chapter_id) {
                setError("Informações do capítulo ausentes na URL.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            setPages([]);

            try {
                // Chamada para a API REST do backend para buscar as páginas.
                const response = await fetch(`${API_BASE_URL}/content/item/${provider_id}/${content_id}/chapter/${chapter_id}/pages/`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // A API deve retornar um objeto com a lista de páginas. Ex: { pages: [{ page_index: 0, proxy_image_url: '...' }] }
                setPages(data.pages || []);

            } catch (err) {
                console.error("Erro ao buscar as páginas do capítulo na API:", err);
                setError("Não foi possível carregar as páginas. Tente novamente.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChapterPages();
    }, [provider_id, content_id, chapter_id]);

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return <Container><p className="text-red-500 text-center">{error}</p></Container>;
    }

    return (
        <Container>
            <div className="flex flex-col items-center bg-black">
                {pages.length > 0 ? (
                    pages.map((page, index) => (
                        <img
                            key={index}
                            src={page.proxy_image_url} 
                            alt={`Página ${index + 1}`}
                            className="max-w-full"
                        />
                    ))
                ) : (
                    <p className="text-white text-center py-10">Este capítulo não tem páginas ou não pôde ser carregado.</p>
                )}
            </div>
        </Container>
    );
};

export default Reader;