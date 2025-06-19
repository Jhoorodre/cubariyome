// src/containers/History.js
import React, { useState, useEffect, useCallback } from "react";
import MangaCard from "../components/MangaCard";
import Container from "../components/Container";
import Section from "../components/Section";
import { globalHistoryHandler } from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import { useTranslation } from 'react-i18next';

const History = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  const updateItems = useCallback(() => {
    globalHistoryHandler.getAllUnpinnedSeries().then((fetchedItems) => {
        const mappedItems = fetchedItems.map(item => ({
          ...item,
          provider_id: item.source,
          content_id: item.slug,
          mangaUrl: `#/reader/${item.source}/${item.slug}`
        }));
        setItems(mappedItems);
        setReady(true);
    });
  }, []);

  useEffect(() => {
    updateItems();
  }, [updateItems]);

  if (!ready) {
    return <Spinner />;
  }

  return (
    <Container>
      <Section 
        text={t('historyPageTitle')} 
        subText={t('historySubtext', { maxItems: globalHistoryHandler.max, currentCount: items.length })}
      />
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <MangaCard
              key={`history-${item.timestamp}-${item.content_id}-${item.provider_id}`}
              content_id={item.content_id}
              provider_id={item.provider_id}
              coverUrl={item.coverUrl}
              mangaTitle={item.title}
              mangaUrl={item.mangaUrl}
              showRemoveButton={true}
              storageCallback={updateItems}
            />
          ))}
        </div>
      ) : (
        <Section text={t('emptyHistoryTitle')} subText={t('emptyHistorySubtext')} />
      )}
    </Container>
  );
}

export default History;