// src/containers/Saved.js
import React, { useState, useEffect, useCallback } from "react";
import MangaCard from "../components/MangaCard";
import Container from "../components/Container";
import Section from "../components/Section";
import { globalHistoryHandler, purgePreviousCache } from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';

const Saved = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [providers, setProviders] = useState(new Map()); // Mapa de provider_id -> nome

  // Carrega a lista de providers para mapear IDs para nomes
  useEffect(() => {
    const fetchProviders = async () => {      try {
        const response = await fetch(`${API_BASE_URL}/content-providers/list/`);
        if (!response.ok) throw new Error('Falha ao buscar provedores');
        const data = await response.json();
        const allProviders = data.providers || data;
        
        // Cria um mapa de ID -> nome do provider
        const providerMap = new Map();
        allProviders.forEach(provider => {
          providerMap.set(provider.id, provider.name);
        });
        
        setProviders(providerMap);
        console.log(`Saved: ${providerMap.size} providers carregados para mapeamento`);
      } catch (err) {
        console.error('Erro ao carregar providers para favoritos:', err);
      }
    };

    fetchProviders();
  }, []);

  const updateItems = useCallback(() => {
    setReady(false);
    globalHistoryHandler.getAllPinnedSeries().then((fetchedItems) => {
        const mappedItems = fetchedItems.map(item => ({
          ...item,
          provider_id: item.source,
          content_id: item.slug,
          mangaUrl: `#/reader/${item.source}/${item.slug}`,
          saved: true // Informa ao MangaCard que este item já está salvo
        }));
        setItems(mappedItems);
        setReady(true);
    });
  }, []);

  useEffect(() => {
    purgePreviousCache();
    updateItems();
  }, [updateItems]);

  if (!ready) {
    return <div className="flex h-screen"><div className="m-auto"><Spinner /></div></div>;
  }

  return (
    <Container>
      <Section text={t('favorites')} subText={t('savedSubtext')} />
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">          {items.map((item) => (
            <MangaCard
              key={`saved-${item.timestamp}-${item.content_id}-${item.provider_id}`}
              content_id={item.content_id}
              provider_id={item.provider_id}
              coverUrl={item.coverUrl}
              mangaTitle={item.title}
              mangaUrl={item.mangaUrl}
              providerName={providers.get(item.provider_id) || 'Fonte desconhecida'}
              showProvider={true}
              saved={item.saved}
              storageCallback={updateItems}
            />
          ))}
        </div>      ) : (
        <Section text={t('emptyFavoritesTitle')} subText={t('emptyFavoritesSubtext')} />
      )}
    </Container>
  );
}

export default Saved;