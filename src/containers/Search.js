import React, { PureComponent } from "react";
import MangaCard from "../components/MangaCard";
import Spinner from "../components/Spinner";
import ScrollableCarousel from "../components/ScrollableCarousel";
import Section from "../components/Section";
import Container from "../components/Container";
import { withTranslation } from 'react-i18next';

const recommendedSources = ["MangaKatana", "Manga4Life", "Guya"];

class SearchClass extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searching: false,
    };
    this.inputRef = React.createRef();
    this.runningQueries = new Set();
  }

  handleInput = (event) => {
    if (event.key === "Enter" && event.target.value) {
      let query = {
        title: event.target.value,
      };
      this.runningQueries.clear();
      this.props.searchHandler("", {});
      this.setState(
        {
          searching: true,
        },
        () => {
          this.runSearchQuery(query);
        }
      );
    }
  };

  sourceQueryHelper = (sourceName, source, queryTask) => {
    this.runningQueries.add(queryTask);
    let hasMore = false;
    source
      .getSearchResults({ ...queryTask.query }, queryTask.metadata)
      .then((e) => {
        if (this.runningQueries.has(queryTask) && this.inputRef.current) {
          let results = (e.results || []).map((manga) => {
            manga.mangaUrlizer = source.getMangaUrl;
            manga.slug = manga.mangaId || manga.id;
            manga.coverUrl = manga.image;
            manga.mangaTitle = manga.title.text || manga.title;
            manga.source = source;
            manga.sourceName = sourceName;
            return manga;
          });
          let previousResults = this.props.searchResults[sourceName];
          queryTask.metadata = e.metadata;
          hasMore = queryTask.metadata && results.length;
          this.props.searchHandler(queryTask.query.title, {
            ...this.props.searchResults,
            [sourceName]: [
              ...(previousResults ? previousResults : []),
              ...results,
            ],
          });
        }
      })
      .finally(() => {
        if (this.runningQueries.has(queryTask) && this.inputRef.current) {
          if (hasMore) {
            this.sourceQueryHelper(sourceName, source, queryTask);
          } else {
            this.runningQueries.delete(queryTask);
            this.setState({
              searching: this.runningQueries.size ? true : false,
            });
          }
        }
      });
  };

  runSearchQuery = (query) => {
    Object.entries(this.props.sources).forEach(([sourceName, source]) => {
      const queryTask = {
        source,
        query,
        metadata: undefined,
      };
      this.sourceQueryHelper(sourceName, source, queryTask);
    });
  };

  componentDidMount = () => {
    this.props.setPath("Search");
    setTimeout(() => {
      if (this.inputRef.current) {
        this.inputRef.current.focus();
      }
    }, 100);
  };

  render() {
    const { t } = this.props;
    const items = [];
    Object.entries(this.props.searchResults).forEach(([source, results]) => {
      if (results && results.length) {
        const count = results.length;
        const translationKey = 'resultsCount';
        const translatedText = t(translationKey, { count });
        console.log(`DEBUG: Source: ${source}, Count: ${count}, Key: ${translationKey}, Translated: ${translatedText}`); // Adicionado para depuração
        items.push(
          <Section
            key={`search-${source}`}
            text={source}
            subText={
              (recommendedSources.includes(source) ? t('recommendedPrefix') : "") +
              translatedText // Usando a variável depurada
            }
          />
        );
        items.push(
          <ScrollableCarousel key={`search-${source}-carousel`} expandable={true}>
            {results.map((item) => (
              <MangaCard
                key={"search-" + source.name + (item.slug)}
                mangaUrlizer={item.mangaUrlizer}
                slug={item.slug}
                coverUrl={item.coverUrl}
                mangaTitle={item.mangaTitle}
                sourceName={item.sourceName}
                source={item.source}
              />
            ))}
          </ScrollableCarousel>
        );
      }
    });

    return (
      <Container>
        <input
          className="w-full mt-8 px-4 py-4 text-xl sm:text-2xl text-black bg-gray-200 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none shadow-md"
          ref={this.inputRef}
          onKeyPress={this.handleInput}
          type="text"
          defaultValue={this.props.searchQuery}
          placeholder={t('searchPlaceholder')}
        />
        {items.length ? <Container>{items}</Container> : undefined}
        {this.state.searching ? (
          <Spinner />
        ) : items.length ? undefined : this.props.searchQuery ? (
          <Section
            key="results"
            text={t('noResults')}
            subText={t('noResultsSubtitle')}
          />
        ) : undefined}
      </Container>
    );
  }
}

export default withTranslation()(SearchClass);
