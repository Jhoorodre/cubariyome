// src/components/MangaCard.js
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { HeartIcon, XIcon } from "@heroicons/react/solid";
import { SpinIcon } from "./Spinner";
import { classNames } from "../utils/strings";
import { globalHistoryHandler } from "../utils/remotestorage";
import { resolveImageUrl } from "../utils/imageUtils";
import { useTranslation } from "react-i18next";
import observer from "../utils/observer";

function MangaCard(props) {
  const { t } = useTranslation();
  const {
    mangaUrl,
    coverUrl,
    mangaTitle,
    provider_id,
    content_id,
    showRemoveButton = false,
    storageCallback,
    providerName,
    showProvider = true,
  } = props;

  const componentRef = useRef(true);
  const cardRef = useRef(null);

  const [saved, setSaved] = useState(props.saved);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isImageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    componentRef.current = true;
    if (props.saved === undefined && content_id && provider_id) {
      setIsSaving(true);
      globalHistoryHandler.isSeriesPinned(content_id, provider_id)
        .then((isPinned) => {
          if (componentRef.current) setSaved(isPinned);
        })
        .finally(() => {
          if (componentRef.current) setIsSaving(false);
        });
    } else if (componentRef.current) {
      setSaved(props.saved);
    }
    return () => {
      componentRef.current = false;
    };
  }, [props.saved, content_id, provider_id]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  useEffect(() => {
    const currentCardRef = cardRef.current;
    if (currentCardRef && coverUrl) {
      const resolvedImageUrl = resolveImageUrl(coverUrl);
      if (resolvedImageUrl) {
        const img = new Image();
        img.src = resolvedImageUrl;
        img.onload = handleImageLoad;
      }
      observer.observe(currentCardRef);
    }
    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, [coverUrl]);

  const handleAction = useCallback(async (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || isRemoving || !content_id || !provider_id) return;

    if (action === 'save') {
      setIsSaving(true);
      const newSavedState = !saved;
      await globalHistoryHandler.pinSeries(content_id, provider_id, newSavedState, { title: mangaTitle, coverUrl: coverUrl, url: mangaUrl });
      if (componentRef.current) {
        setSaved(newSavedState);
        setIsSaving(false);
      }
    } else if (action === 'remove') {
      setIsRemoving(true);
      await globalHistoryHandler.removeSeries(content_id, provider_id);
      if (componentRef.current) setIsRemoving(false);
    }

    if (storageCallback) storageCallback();
  }, [saved, isSaving, isRemoving, content_id, provider_id, mangaTitle, coverUrl, mangaUrl, storageCallback]);
  
  const handleClick = useCallback(() => {
    if (content_id && provider_id) {
      globalHistoryHandler.pushSeries(content_id, provider_id, { title: mangaTitle, coverUrl: coverUrl, url: mangaUrl });
    }
  }, [content_id, provider_id, mangaTitle, coverUrl, mangaUrl]);

  return (
    <div className="aspect-[2/3] w-full h-full relative group">
      <a
        ref={cardRef}
        href={mangaUrl}
        onClick={handleClick}
        className={classNames(
          "block w-full h-full bg-cover bg-center rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out group-hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500",
          !isImageLoaded ? "bg-gray-200 dark:bg-gray-700 animate-pulse" : ""        )}
        data-background-image={coverUrl ? `url("${resolveImageUrl(coverUrl)}")` : ""}      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg"></div>
        
        {/* Badge da fonte no topo (quando habilitado) */}
        {showProvider && providerName && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white backdrop-blur-sm border border-white/20">
              {providerName}
            </span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white text-sm font-bold leading-tight line-clamp-3">
            {mangaTitle || "..."}
          </h3>
        </div>
      </a>

      <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          title={saved ? t('tooltipRemoveFromFavorites') : t('tooltipAddToFavorites')}
          className={classNames(
            "p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors",
            saved ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500" : "bg-gray-900/60 text-white hover:bg-gray-700 focus:ring-gray-500"
          )}
          onClick={(e) => handleAction(e, 'save')}
        >
          {isSaving ? <SpinIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
        </button>
        {showRemoveButton && (
          <button
            title={t('tooltipRemoveFromHistory')}
            className="p-1.5 bg-gray-900/60 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
            onClick={(e) => handleAction(e, 'remove')}
          >
            {isRemoving ? <SpinIcon className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(MangaCard);