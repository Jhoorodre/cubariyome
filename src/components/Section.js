// src/components/Section.js
import React from "react";
import MangaCard from "./MangaCard";
import { classNames } from "../utils/strings";
import { useTranslation } from "react-i18next";

const Section = (props) => {
  const { t } = useTranslation();
  
  // A prop `section` agora é o principal meio de passar dados para a seção.
  // Estrutura esperada: { title: "Título", items: [manga1, manga2, ...] }
  const { section, text, subText, textSize, subTextSize } = props;

  // Renderiza uma grade de MangaCards se a prop `section` com `items` for fornecida.
  if (section && section.items) {
    return (
      <section className="w-full flex-grow pt-1 sm:pt-2 px-2 md:px-3 mb-6">
        {section.title && (
          <div className="mb-3">
            <h1
              className={classNames(
                textSize || "text-xl sm:text-2xl",
                "text-black dark:text-white font-semibold leading-tight"
              )}
            >
              {section.title}
            </h1>
          </div>
        )}
        
        {section.items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {section.items.map((manga, index) => (
              <MangaCard
                key={`${manga.provider_id}-${manga.content_id}-${index}`}
                mangaUrl={`#/reader/${manga.provider_id}/${manga.content_id}`}
                coverUrl={manga.thumbnail_url_proxy}
                mangaTitle={manga.title}
                provider_id={manga.provider_id}
                content_id={manga.content_id}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {t("noItemsInSection")}
          </p>
        )}
      </section>
    );
  }

  // Comportamento antigo para renderizar apenas títulos.
  if (text) {
    return (
      <section className="w-full flex-grow pt-1 sm:pt-2 px-2 md:px-3">
        <div className="w-full flex-grow">
          <h1
            className={classNames(
              textSize || "text-2xl sm:text-3xl",
              "text-black dark:text-white font-semibold leading-loose mb-1"
            )}
          >
            {text}
          </h1>
          {subText && (
            <h2
              className={classNames(
                subTextSize || "text-sm sm:text-md",
                "text-gray-600 dark:text-gray-400 font-medium"
              )}
            >
              {subText}
            </h2>
          )}
        </div>
      </section>
    );
  }

  return null;
};

export default Section;