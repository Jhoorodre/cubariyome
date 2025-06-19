// src/components/MangaCard.js
import React, { useState, useEffect, useRef, memo } from "react";
import observer from "../utils/observer";
import { HeartIcon, XIcon } from "@heroicons/react/solid";
import { SpinIcon } from "./Spinner";
import Card from "./Card";
import { classNames } from "../utils/strings";
import { globalHistoryHandler } from "../utils/remotestorage";
import { useTranslation } from "react-i18next";

function MangaCard(props) {
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const componentRef = useRef(true); // Para verificar se o componente está montado

  // Props esperadas:
  // mangaUrl (string): URL interna para a rota do leitor (ex: "#/reader/mangalivre/manga-slug").
  // coverUrl (string): URL da imagem de capa, já pronta para uso (fornecida pelo proxy do backend).
  // mangaTitle (string): Título do mangá.
  // provider_id (string): ID da fonte (ex: "mangalivre").
  // content_id (string): ID do conteúdo/mangá (ex: "manga-slug").
  // saved (boolean, opcional): Indica se o mangá está salvo/favoritado.
  // showRemoveButton (boolean, opcional): Exibe o botão 'X' para remover do histórico.
  // storageCallback (function, opcional): Função para ser chamada após uma ação no storage, para atualizar a UI.

  const {
    mangaUrl,
    coverUrl,
    mangaTitle,
    provider_id,
    content_id,
    showRemoveButton,
    storageCallback,
  } = props;
  
  const [saved, setSaved] = useState(props.saved);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Efeito para carregar o estado inicial de 'saved' do storage, se não for passado via props.
  useEffect(() => {
    // Se a prop 'saved' não for fornecida, consultamos o storage
    if (props.saved === undefined && content_id && provider_id) {
      // Usamos a função correta 'isSeriesPinned'
      globalHistoryHandler.isSeriesPinned(content_id, provider_id)
        .then((isPinned) => {
          // O resultado (isPinned) é um booleano, então podemos usá-lo diretamente
          if (componentRef.current) { // Garante que o componente ainda está montado
            setSaved(isPinned);
          }
        });
    } else {
        // Se a prop 'saved' for fornecida, usamos o valor dela
        if (componentRef.current) { // Garante que o componente ainda está montado
            setSaved(props.saved);
        }
    }
    // Cleanup function para marcar o componente como desmontado
    return () => {
        componentRef.current = false;
    };
  }, [props.saved, content_id, provider_id]); // Atualiza as dependências do hook

  // Efeito para o lazy-loading da imagem de capa.
  useEffect(() => {
    const currentCardRef = cardRef.current;
    if (currentCardRef && coverUrl) {
      observer.observe(currentCardRef);
    }
    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, [coverUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || isRemoving || !content_id || !provider_id) return;

    setIsSaving(true);
    const newSavedState = !saved;
    // Salva o estado atualizado no remoteStorage
    await globalHistoryHandler.pinSeries(content_id, provider_id, newSavedState, { title: mangaTitle, coverUrl: coverUrl, url: mangaUrl });
    
    setSaved(newSavedState);
    setIsSaving(false);
    if (storageCallback) storageCallback();
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || isRemoving || !content_id || !provider_id) return;

    setIsRemoving(true);
    await globalHistoryHandler.removeSeries(content_id, provider_id);
    setIsRemoving(false);
    if (storageCallback) storageCallback();
  };

  return (
    <Card>
      <a
        ref={cardRef}
        href={mangaUrl || "#"}
        // A 'coverUrl' agora já é a URL do proxy, vinda da API
        data-background-image={coverUrl ? `linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0.75) 100%), url("${coverUrl}")` : ""}
        className="block group relative p-4 pb-2 overflow-hidden aspect-w-7 aspect-h-10 rounded-lg bg-gray-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 shadow-lg"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={() => {
          if (cardRef.current && cardRef.current.style.backgroundImage === "") {
            cardRef.current.style.backgroundImage = cardRef.current.dataset.backgroundImage;
          }
        }}
      >
        <div className="absolute top-2 right-2 flex space-x-1">
          {props.views !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 bg-opacity-80">
              <EyeIcon className="h-4 w-4 mr-1" />
              {props.views}
            </span>
          )}
          {props.likes !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 bg-opacity-80">
              <HeartIcon className="h-4 w-4 mr-1" />
              {props.likes}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent bg-opacity-50">
          <h3 className="text-md font-semibold text-white truncate group-hover:whitespace-normal group-hover:overflow-visible">
            {mangaTitle || t("fallback.title")}
          </h3>
          {props.간단한설명 && (
            <p className="mt-1 text-sm text-gray-300 hidden group-hover:block">
              {props.간단한설명}
            </p>
          )}
        </div>
        {saved && (
          <div className="absolute top-2 left-2">
            <HeartIcon className="h-6 w-6 text-red-500" />
          </div>
        )}
      </a>
    </Card>
  );
}

export default memo(MangaCard);