# Documentação da API Suwayomi-Server e Cubari Proxy

Este documento serve como um guia abrangente para a API do Suwayomi-Server e o Cubari Proxy (backend Django), detalhando endpoints REST, operações GraphQL e a interação entre eles. O objetivo é fornecer uma referência clara e completa para desenvolvedores que interagem com essas interfaces.

## 1. Visão Geral da Arquitetura de API

A arquitetura da API é composta por duas camadas principais:

*   **Suwayomi-Server (GraphQL API):** O servidor principal que interage diretamente com as fontes de conteúdo (mangás). Ele expõe uma API GraphQL para consulta e manipulação de dados.
*   **Cubari Proxy (Django REST API Gateway):** Um backend Django que atua como um *API Gateway* e *proxy* para o Suwayomi-Server. Ele oferece endpoints REST anonimizados, simplificando a interação para o frontend e adicionando funcionalidades como caching e proxy de imagens. Este gateway também facilita a sincronização com o Suwayomi-Server para funcionalidades como notificações de novos capítulos, sem armazenar dados sensíveis do usuário de forma persistente.

O diagrama a seguir ilustra o fluxo de comunicação:

```
[Frontend (React)] <--- REST API (Cubari Proxy) ---> [GraphQL API (Suwayomi-Server)]
```

## 2. Endpoints REST do Cubari Proxy (API Gateway)

Os endpoints a seguir são expostos pelo Cubari Proxy (backend Django) e são a interface primária para o frontend. Eles atuam como um intermediário para as operações do Suwayomi-Server, anonimizando as chamadas e adicionando camadas de segurança e otimização.

### 2.1. Provedores de Conteúdo

#### 2.1.1. Listar Provedores de Conteúdo

*   **Endpoint Anonimizado:** `GET /api/v1/content-providers/list`
*   **Funcionalidade Real:** Lista todas as fontes (sources) disponíveis no Suwayomi-Server, que representam os provedores de conteúdo (ex: MangaLivre).
*   **Query GraphQL Suwayomi Equivalente:** Esta operação é um proxy para a query `GET_SOURCES_LIST` do Suwayomi-Server. A resposta do Suwayomi é mapeada para o formato JSON esperado pelo frontend.

    ```graphql
    query GET_SOURCES_LIST {
      sources {
        nodes {
          id
          name
          displayName
          lang
          iconUrl
          isNsfw
          isConfigurable
          supportsLatest
          extension {
            pkgName
            repo
            __typename
          }
          __typename
        }
        __typename
      }
    }
    ```

*   **Parâmetros da Requisição:** Nenhum.
*   **Resposta Esperada (Exemplo JSON):**

    ```json
    [
      {
        "id": "5183927995038089800", // ID real do Suwayomi
        "name": "MangaLivre",
        "language": "pt-BR",
        "icon_url_proxy": "/api/v1/icon-proxy/5183927995038089800/mangalivre.png/",
        "is_nsfw": false,
        "type": "HttpSource"
      }
      // ... outros provedores
    ]
    ```

*   **Notas Adicionais:**
    *   O `id` retornado é o ID real do Suwayomi, usado internamente pelo proxy para chamadas subsequentes.
    *   `icon_url_proxy` é a URL para buscar o ícone através do nosso backend, garantindo que o frontend não precise acessar diretamente o Suwayomi-Server para imagens.

#### 2.1.2. Proxy de Ícones de Provedores

*   **Endpoint Anonimizado:** `GET /api/v1/icon-proxy/<provider_id>/<icon_filename>/`
    *   `<provider_id>`: O ID do provedor (fonte) retornado por `/content-providers/list`.
    *   `<icon_filename>`: O nome do arquivo do ícone (ex: `mangalivre.png`).
*   **Funcionalidade Real:** Serve a imagem do ícone de um provedor específico, fazendo proxy da URL original fornecida pelo Suwayomi-Server.
*   **Lógica Interna:** O Cubari Proxy cacheia a `original_icon_url` (ex: `http://<suwayomi_host>/image/source/5183927995038089800.png`) associada ao `provider_id`. Esta view busca essa URL cacheada e faz um `GET` para ela, retornando o conteúdo da imagem diretamente ao cliente.
*   **Resposta Esperada:** Conteúdo da imagem (ex: `image/png`).

### 2.2. Descoberta e Detalhes de Conteúdo

#### 2.2.1. Busca de Conteúdo (Mangás)

*   **Endpoint Anonimizado:** `GET /api/v1/content-discovery/search`
*   **Funcionalidade Real:** Busca mangás no Suwayomi-Server com base em um termo de busca ou lista mangás populares/em destaque.
*   **Parâmetros de Query (Query Params):**
    *   `query` (String, opcional): Termo de busca para o título do mangá. Se omitido, a busca por mangás populares/em destaque é realizada.
    *   `page` (Int, opcional, default=1): Número da página para paginação dos resultados.
    *   `type` (String, obrigatório): Define o tipo de busca. Valores possíveis:
        *   `"POPULAR"`: Para buscar mangás populares (quando `query` é omitido).
        *   `"SEARCH"`: Para buscar mangás por termo (quando `query` é fornecido).
*   **Lógica Interna:** O Cubari Proxy traduz esta requisição REST para a mutação GraphQL `fetchSourceManga` do Suwayomi-Server. O `source` para a mutação é inferido ou configurado no backend. A paginação é controlada pelo parâmetro `page`.

    ```graphql
    mutation GET_SOURCE_MANGAS_FETCH($input: FetchSourceMangaInput!) {
      fetchSourceManga(input: $input) {
        hasNextPage
        mangas {
          id
          title
          thumbnailUrl
          thumbnailUrlLastFetched
          inLibrary
          initialized
          sourceId
          __typename
        }
        __typename
      }
    }
    ```

*   **Variáveis de Exemplo para a Mutação GraphQL (baseado em `PAYLOADS.txt`):**

    ```json
    {
      "input": {
        "type": "POPULAR",
        "source": "4630910107107422596", // Exemplo de sourceId
        "page": 1
      }
    }
    ```

*   **Resposta Esperada (Exemplo JSON):**

    ```json
    {
      "results": [
        {
          "provider_id": "5183927995038089800", // sourceId do Suwayomi
          "content_id": "12345", // id do Manga no Suwayomi
          "title": "Título do Mangá Encontrado",
          "thumbnail_url_proxy": "/api/v1/thumbnail-proxy/5183927995038089800/12345/",
          // ... outros campos mapeados (autor, status, etc.)
        }
      ],
      "has_more": true
    }
    ```

*   **Notas Adicionais:** O backend usará `provider_id` como `sourceId` e `content_id` como `id` nas chamadas subsequentes para detalhes, capítulos, etc. É recomendado implementar caching para buscas frequentes no backend Django para otimizar a performance.

#### 2.2.2. Detalhes do Item de Conteúdo

*   **Endpoint Anonimizado:** `GET /api/v1/content/item/<provider_id>/<content_id>/detail/`
    *   `<provider_id>`: ID do provedor (fonte) do Suwayomi.
    *   `<content_id>`: ID do conteúdo (mangá) no Suwayomi.
*   **Funcionalidade Real:** Busca informações detalhadas de um mangá específico no Suwayomi-Server, incluindo metadados (autor, descrição, gênero, status) e a lista de capítulos.
*   **Query GraphQL Suwayomi Equivalente:** Esta operação pode ser mapeada para diferentes queries GraphQL dependendo da necessidade (ex: `GET_MANGA_SCREEN` para detalhes completos ou `GET_MANGA_READER` para dados essenciais de leitura). O Cubari Proxy seleciona a query mais apropriada e mapeia os campos para a resposta REST.

    **Exemplo de Query (`GET_MANGA_SCREEN`):**
    ```graphql
    query GET_MANGA_SCREEN($id: Int!) {
      manga(id: $id) {
        id
        title
        thumbnailUrl
        thumbnailUrlLastFetched
        inLibrary
        initialized
        sourceId
        genre
        lastFetchedAt
        inLibraryAt
        status
        artist
        author
        description
        realUrl
        source {
          id
          displayName
          __typename
        }
        chapters {
          totalCount
          __typename
        }
        trackRecords {
          totalCount
          nodes {
            id
            trackerId
            __typename
          }
          __typename
        }
        __typename
      }
    }
    ```

*   **Variáveis de Exemplo para a Mutação GraphQL (baseado em `PAYLOADS.txt`):**

    ```json
    {
      "id": 87 // Exemplo de mangaId
    }
    ```

*   **Parâmetros da Requisição (Path):** `provider_id`, `content_id`.
*   **Resposta Esperada (Exemplo JSON):**

    ```json
    {
      "id": "12345", // content_id
      "provider_id": "5183927995038089800",
      "title": "Título do Mangá",
      "author": "Nome do Autor",
      "artist": "Nome do Artista",
      "description": "Sinopse do mangá...",
      "genres": ["Ação", "Aventura"],
      "status": "Em andamento",
      "url_suwayomi": "http://original.source.com/manga/123",
      "thumbnail_url_proxy": "/api/v1/thumbnail-proxy/5183927995038089800/12345/",
      "chapters": [
        {
          "id": "67890", // ID do capítulo no Suwayomi
          "name": "Capítulo 1: O Início",
          "chapter_number": 1,
          "scanlator": "Grupo Scanlator",
          "uploaded_at": "2023-10-26T10:00:00Z" // Convertido de timestamp
          // ... outros campos do capítulo
        }
      ]
    }
    ```

*   **Notas Adicionais:** O `provider_id` no path é usado para consistência e pode ser usado para validação ou logging, mas a query GraphQL `manga(id: Int!)` usa apenas o ID do mangá. Caching no backend é recomendado para otimizar o desempenho.

#### 2.2.3. Proxy de Miniaturas de Conteúdo

*   **Endpoint Anonimizado:** `GET /api/v1/thumbnail-proxy/<provider_id>/<content_id>/`
    *   `<provider_id>`: ID do provedor (fonte) do Suwayomi.
    *   `<content_id>`: ID do conteúdo (mangá) no Suwayomi.
*   **Funcionalidade Real:** Serve a imagem da miniatura (thumbnail/cover) de um item de conteúdo.
*   **Lógica Interna:** O Cubari Proxy faz uma query GraphQL (`manga(id: $content_id) { thumbnailUrl }`) para obter o caminho relativo da miniatura no Suwayomi. Concatena com a `SUWAYOMI_BASE_URL` para formar a URL completa, faz um `GET` para essa URL e retorna o conteúdo da imagem. A URL completa da imagem é cacheada para evitar refazer a query GraphQL em requisições futuras para a mesma miniatura.
*   **Resposta Esperada:** Conteúdo da imagem (ex: `image/jpeg`).

### 2.3. Leitura de Conteúdo

#### 2.3.1. Páginas do Capítulo

*   **Endpoint Anonimizado:** `GET /api/v1/content/item/<provider_id>/<content_id>/chapter/<chapter_id>/pages/`
    *   `<provider_id>`: ID do provedor (fonte) do Suwayomi.
    *   `<content_id>`: ID do conteúdo (mangá) no Suwayomi.
    *   `<chapter_id>`: ID do capítulo no Suwayomi.
*   **Funcionalidade Real:** Busca a lista de URLs das páginas para um capítulo específico.
*   **Query GraphQL Suwayomi Equivalente (Mutação):** O backend chama a mutação `fetchChapterPages`.

    ```graphql
    mutation FetchChapterPages($input: FetchChapterPagesInput!) { # input é {"chapterId": chapterId}
      fetchChapterPages(input: $input) {
        pages # Lista de URLs das imagens das páginas
      }
    }
    ```

*   **Variáveis de Exemplo para a Mutação GraphQL (baseado em `PAYLOADS.txt`):**

    ```json
    {
      "input": {
        "chapterId": 513 // Exemplo de chapterId
      }
    }
    ```

*   **Parâmetros da Requisição (Path):** `provider_id`, `content_id`, `chapter_id`.
*   **Resposta Esperada (Exemplo JSON):**

    ```json
    {
      "pages": [
        {
          "page_index": 0,
          "proxy_image_url": "/api/v1/page-image-proxy/5183927995038089800/12345/67890/0/"
        },
        {
          "page_index": 1,
          "proxy_image_url": "/api/v1/page-image-proxy/5183927995038089800/12345/67890/1/"
        }
      ]
    }
    ```

*   **Notas Adicionais:** As URLs retornadas (`proxy_image_url`) apontam para o endpoint de proxy de imagem de página. O backend cacheia a lista de URLs de páginas reais (`internal_urls`) retornadas pelo Suwayomi para uso pelo `ChapterPageImageProxyView`.

#### 2.3.2. Proxy de Imagens de Páginas de Capítulos

*   **Endpoint Anonimizado:** `GET /api/v1/page-image-proxy/<provider_id>/<content_id>/<chapter_id>/<page_index_str>/`
    *   `<provider_id>`: ID do provedor (fonte) do Suwayomi.
    *   `<content_id>`: ID do conteúdo (mangá) no Suwayomi.
    *   `<chapter_id>`: ID do capítulo no Suwayomi.
    *   `<page_index_str>`: Índice da página (base 0) dentro do capítulo.
*   **Funcionalidade Real:** Serve a imagem de uma página específica de um capítulo.
*   **Lógica Interna:** O Cubari Proxy busca no cache a lista de URLs de páginas reais (`internal_urls`) para o capítulo. Seleciona a URL da página correspondente ao `page_index_str`. Se a URL for relativa, concatena com `SUWAYOMI_BASE_URL`. Faz um `GET` para a URL da imagem e retorna o conteúdo.
*   **Resposta Esperada:** Conteúdo da imagem (ex: `image/jpeg`).

### 2.4. Gerenciamento de Biblioteca e Progresso do Usuário (Sincronização com Suwayomi)

Esta seção detalha os endpoints que interagem com as funcionalidades de gerenciamento de biblioteca (favoritos) e progresso de leitura do usuário diretamente no Suwayomi-Server. É importante notar que o Suwayomi-Server mantém um estado interno para essas funcionalidades, que pode ser sincronizado com os dados do usuário armazenados no Remote Storage (gerenciado pelo frontend).

#### 2.4.1. Atualizar Progresso do Capítulo

*   **Endpoint Anonimizado:** `POST /api/v1/suwayomi/chapter/update_progress/`
*   **Funcionalidade Real:** Marca um capítulo como lido/não lido e/ou atualiza a última página lida no Suwayomi-Server.
*   **Mutação GraphQL Suwayomi Equivalente:**

    ```graphql
    mutation UpdateChapterProgress($chapterId: Int!, $read: Boolean, $lastPageRead: Int) {
      updateChapterProgress(input: {id: $chapterId, read: $read, lastPageRead: $lastPageRead}) {
        id
        isRead
        lastPageRead
        isBookmarked
        name
        chapterNumber
      }
    }
    ```

*   **Corpo da Requisição (JSON):**

    ```json
    {
      "chapterId": 123,       // (Int, Obrigatório) ID do capítulo no Suwayomi
      "read": true,           // (Boolean, Opcional) Marcar como lido ou não lido
      "lastPageRead": 10      // (Int, Opcional) Última página lida
    }
    ```

*   **Resposta Esperada (Exemplo JSON):**

    ```json
    {
      "id": 123,
      "isRead": true,
      "lastPageRead": 10,
      "isBookmarked": false,
      "name": "Capítulo Exemplo",
      "chapterNumber": 10.0
    }
    ```

*   **Notas Adicionais:** Pelo menos um dos campos `read` ou `lastPageRead` deve ser fornecido.

#### 2.4.2. Atualizar Status de "Na Biblioteca" (Favorito) do Mangá

*   **Endpoint Anonimizado:** `POST /api/v1/suwayomi/manga/update_in_library/`
*   **Funcionalidade Real:** Adiciona ou remove um mangá da biblioteca (favoritos) do usuário no Suwayomi-Server.
*   **Mutação GraphQL Suwayomi Equivalente:**

    ```graphql
    mutation UpdateMangaInLibrary($mangaId: Int!, $inLibrary: Boolean!) {
      updateUserManga(input: {mangaId: $mangaId, inLibrary: $inLibrary}) {
        id
        title
        inLibrary
      }
    }
    ```

*   **Corpo da Requisição (JSON):**

    ```json
    {
      "mangaId": 456,         // (Int, Obrigatório) ID do mangá no Suwayomi
      "inLibrary": true       // (Boolean, Obrigatório) true para adicionar, false para remover
    }
    ```

*   **Resposta Esperada (Exemplo JSON):**

    ```json
    {
      "id": 456,
      "title": "Título do Mangá Exemplo",
      "inLibrary": true
    }
    ```

#### 2.4.3. Listar Mangás Favoritados (Na Biblioteca)

*   **Endpoint Anonimizado:** `GET /api/v1/suwayomi/mangas/favorites/`
*   **Funcionalidade Real:** Lista todos os mangás que o usuário marcou como "na biblioteca" (favoritos) no Suwayomi-Server.
*   **Query GraphQL Suwayomi Equivalente:**

    ```graphql
    query GetFavoriteMangas {
      userMangas(filter: {inLibrary: true}) {
        nodes {
          id
          title
          thumbnailUrl
          inLibrary
          status
          author
          description
        }
      }
    }
    ```

*   **Parâmetros da Requisição:** Nenhum.
*   **Resposta Esperada (Exemplo JSON):**

    ```json
    {
      "nodes": [
        {
          "id": 456,
          "title": "Título do Mangá Exemplo",
          "thumbnailUrl": "/api/v1/thumbnail-proxy/source_id_placeholder/456/", // Exemplo, o backend constrói isso
          "inLibrary": true,
          "status": "COMPLETED",
          "author": "Autor Exemplo",
          "description": "Descrição breve do mangá favorito..."
        }
        // ... outros mangás favoritados
      ]
    }
    ```

*   **Notas Adicionais:** O `thumbnailUrl` retornado pelo Suwayomi é relativo. O Cubari Proxy constrói a URL de proxy completa (ex: `/api/v1/thumbnail-proxy/<source_id_do_manga>/<manga_id>/`) antes de enviar a resposta ao frontend.

## 3. Operações GraphQL Diretas do Suwayomi-Server (Sem Mapeamento REST Direto)

Além dos endpoints REST do Cubari Proxy, o Suwayomi-Server expõe uma série de operações GraphQL que podem ser úteis para interações mais diretas ou para funcionalidades que não possuem um mapeamento REST explícito no proxy. Estas operações são frequentemente usadas internamente pelo Suwayomi-Server ou por clientes que se conectam diretamente a ele.

### 3.1. `GET_ABOUT`

*   **Descrição:** Busca informações sobre a versão do servidor e da interface web (WebUI), incluindo build, canais de atualização e links para GitHub/Discord.
*   **Como Usar:** Para verificar as versões atuais do software. Nenhuma variável é necessária.
*   **Query GraphQL:**

    ```graphql
    fragment ABOUT_WEBUI on AboutWebUI {
      channel
      tag
      __typename
    }

    query GET_ABOUT {
      aboutServer {
        buildTime
        buildType
        discord
        github
        name
        revision
        version
        __typename
      }
      aboutWebUI {
        ...ABOUT_WEBUI
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.2. `GET_CATEGORIES_LIBRARY`

*   **Descrição:** Retorna a lista de todas as categorias da sua biblioteca (ex: "Default").
*   **Como Usar:** Útil para construir a navegação da biblioteca. A variável `order` define a ordenação.
*   **Query GraphQL:**

    ```graphql
    fragment CATEGORY_BASE_FIELDS on CategoryType {
      id
      name
      default
      order
      __typename
    }

    fragment CATEGORY_META_FIELDS on CategoryMetaType {
      categoryId
      key
      value
      __typename
    }

    fragment CATEGORY_LIBRARY_FIELDS on CategoryType {
      ...CATEGORY_BASE_FIELDS
      meta {
        ...CATEGORY_META_FIELDS
        __typename
      }
      mangas {
        totalCount
        __typename
      }
      __typename
    }

    fragment PAGE_INFO on PageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
      __typename
    }

    query GET_CATEGORIES_LIBRARY($after: Cursor, $before: Cursor, $condition: CategoryConditionInput, $filter: CategoryFilterInput, $first: Int, $last: Int, $offset: Int, $order: [CategoryOrderInput!]) {
      categories(
        after: $after
        before: $before
        condition: $condition
        filter: $filter
        first: $first
        last: $last
        offset: $offset
        order: $order
      ) {
        nodes {
          ...CATEGORY_LIBRARY_FIELDS
          __typename
        }
        pageInfo {
          ...PAGE_INFO
          __typename
        }
        totalCount
        __typename
      }
    }
    ```

*   **Variáveis:**

    ```json
    {
      "order": [
        {
          "by": "ORDER"
        }
      ]
    }
    ```

### 3.3. `GET_CATEGORY_MANGAS`

*   **Descrição:** Busca todos os mangás que pertencem a uma categoria específica da biblioteca. ID 0 para categoria "Default".
*   **Como Usar:** Forneça o `id` da categoria para listar seus mangás.
*   **Query GraphQL:**

    ```graphql
    fragment MANGA_BASE_FIELDS on MangaType {
      id
      title
      thumbnailUrl
      thumbnailUrlLastFetched
      inLibrary
      initialized
      sourceId
      __typename
    }

    fragment MANGA_CHAPTER_STAT_FIELDS on MangaType {
      id
      unreadCount
      downloadCount
      bookmarkCount
      hasDuplicateChapters
      chapters {
        totalCount
        __typename
      }
      __typename
    }

    fragment MANGA_CHAPTER_NODE_FIELDS on MangaType {
      firstUnreadChapter {
        id
        sourceOrder
        isRead
        mangaId
        __typename
      }
      lastReadChapter {
        id
        sourceOrder
        lastReadAt
        __typename
      }
      latestReadChapter {
        id
        sourceOrder
        lastReadAt
        __typename
      }
      latestFetchedChapter {
        id
        fetchedAt
        __typename
      }
      latestUploadedChapter {
        id
        uploadDate
        __typename
      }
      __typename
    }

    fragment MANGA_LIBRARY_FIELDS on MangaType {
      ...MANGA_BASE_FIELDS
      ...MANGA_CHAPTER_STAT_FIELDS
      ...MANGA_CHAPTER_NODE_FIELDS
      genre
      lastFetchedAt
      inLibraryAt
      status
      artist
      author
      description
      source {
        id
        displayName
        __typename
      }
      trackRecords {
        totalCount
        nodes {
          id
          trackerId
          __typename
        }
        __typename
      }
      __typename
    }

    fragment PAGE_INFO on PageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
      __typename
    }

    query GET_CATEGORY_MANGAS($id: Int!) {
      category(id: $id) {
        id
        mangas {
          nodes {
            ...MANGA_LIBRARY_FIELDS
            __typename
          }
          pageInfo {
            ...PAGE_INFO
            __typename
          }
          totalCount
          __typename
        }
        __typename
      }
    }
    ```

*   **Variáveis:**

    ```json
    {
      "id": 0 // Exemplo de categoryId (0 para "Default")
    }
    ```

### 3.4. `GET_DOWNLOAD_STATUS`

*   **Descrição:** Recupera o status de download atual do servidor, incluindo a fila de capítulos sendo baixados.
*   **Como Usar:** Para monitorar o progresso dos downloads. Nenhuma variável é necessária.
*   **Query GraphQL:**

    ```graphql
    fragment DOWNLOAD_TYPE_FIELDS on DownloadType {
      chapter {
        id
        name
        sourceOrder
        isDownloaded
        __typename
      }
      manga {
        id
        title
        downloadCount
        __typename
      }
      progress
      state
      tries
      __typename
    }

    fragment DOWNLOAD_STATUS_FIELDS on DownloadStatus {
      state
      queue {
        ...DOWNLOAD_TYPE_FIELDS
        __typename
      }
      __typename
    }

    query GET_DOWNLOAD_STATUS {
      downloadStatus {
        ...DOWNLOAD_STATUS_FIELDS
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.5. `GET_GLOBAL_METADATAS`

*   **Descrição:** Retorna metadados globais armazenados no servidor.
*   **Como Usar:** Pode ser usada para buscar configurações ou dados gerais que não estão associados a um recurso específico. Variáveis de paginação e filtro podem ser aplicadas.
*   **Query GraphQL:**

    ```graphql
    fragment GLOBAL_METADATA on GlobalMetaType {
      key
      value
      __typename
    }

    fragment PAGE_INFO on PageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
      __typename
    }

    query GET_GLOBAL_METADATAS($after: Cursor, $before: Cursor, $condition: MetaConditionInput, $filter: MetaFilterInput, $first: Int, $last: Int, $offset: Int, $order: [MetaOrderInput!]) {
      metas(
        after: $after
        before: $before
        condition: $condition
        filter: $filter
        first: $first
        last: $last
        offset: $offset
        order: $order
      ) {
        nodes {
          ...GLOBAL_METADATA
          __typename
        }
        pageInfo {
          ...PAGE_INFO
          __typename
        }
        totalCount
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.6. `GET_LAST_UPDATE_TIMESTAMP`

*   **Descrição:** Retorna o timestamp da última vez que a biblioteca foi atualizada.
*   **Como Usar:** Útil para verificar quando a última sincronização da biblioteca ocorreu.
*   **Query GraphQL:**

    ```graphql
    query GET_LAST_UPDATE_TIMESTAMP {
      lastUpdateTimestamp {
        timestamp
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.7. `GET_LIBRARY_MANGA_COUNT`

*   **Descrição:** Retorna a contagem total de mangás na sua biblioteca.
*   **Como Usar:** Uma query simples para obter o número total de entradas na biblioteca, sem precisar buscar a lista completa.
*   **Query GraphQL:**

    ```graphql
    query GET_LIBRARY_MANGA_COUNT {
      mangas(condition: {inLibrary: true}) {
        totalCount
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.8. `GET_SERVER_SETTINGS`

*   **Descrição:** Recupera todas as configurações do servidor Suwayomi.
*   **Como Usar:** Útil para verificar ou exibir as configurações atuais do backend, como portas, proxies, caminhos de download, etc.
*   **Query GraphQL:**

    ```graphql
    fragment SERVER_SETTINGS on SettingsType {
      ip
      port
      socksProxyEnabled
      socksProxyVersion
      socksProxyHost
      socksProxyPort
      socksProxyUsername
      socksProxyPassword
      webUIFlavor
      initialOpenInBrowserEnabled
      webUIInterface
      electronPath
      webUIChannel
      webUIUpdateCheckInterval
      downloadAsCbz
      downloadsPath
      autoDownloadNewChapters
      excludeEntryWithUnreadChapters
      autoDownloadNewChaptersLimit
      autoDownloadIgnoreReUploads
      extensionRepos
      maxSourcesInParallel
      excludeUnreadChapters
      excludeNotStarted
      excludeCompleted
      globalUpdateInterval
      updateMangas
      basicAuthEnabled
      basicAuthUsername
      basicAuthPassword
      debugLogsEnabled
      systemTrayEnabled
      maxLogFileSize
      maxLogFiles
      maxLogFolderSize
      backupPath
      backupTime
      backupInterval
      backupTTL
      localSourcePath
      flareSolverrEnabled
      flareSolverrUrl
      flareSolverrTimeout
      flareSolverrSessionName
      flareSolverrSessionTtl
      flareSolverrAsResponseFallback
      __typename
    }

    query GET_SERVER_SETTINGS {
      settings {
        ...SERVER_SETTINGS
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.9. `GET_TRACKERS_SETTINGS`

*   **Descrição:** Lista os serviços de tracking (ex: MyAnimeList, AniList) e informa se o usuário está logado em cada um.
*   **Como Usar:** Para gerenciar integrações com serviços de tracking.
*   **Query GraphQL:**

    ```graphql
    fragment PAGE_INFO on PageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
      __typename
    }

    fragment TRACKER_BASE_FIELDS on TrackerType {
      id
      name
      icon
      isLoggedIn
      isTokenExpired
      __typename
    }

    fragment TRACKER_SETTING_FIELDS on TrackerType {
      ...TRACKER_BASE_FIELDS
      authUrl
      __typename
    }

    query GET_TRACKERS_SETTINGS {
      trackers {
        totalCount
        pageInfo {
          ...PAGE_INFO
          __typename
        }
        nodes {
          ...TRACKER_SETTING_FIELDS
          __typename
        }
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.10. `GET_UPDATE_STATUS`

*   **Descrição:** Obtém o status atual das atualizações da biblioteca, incluindo informações sobre trabalhos em andamento e categorias/mangás atualizados.
*   **Como Usar:** Monitore o progresso das atualizações da sua biblioteca. Nenhuma variável é necessária.
*   **Query GraphQL:**

    ```graphql
    fragment UPDATER_JOB_INFO_FIELDS on UpdaterJobsInfoType {
      isRunning
      totalJobs
      finishedJobs
      skippedCategoriesCount
      skippedMangasCount
      __typename
    }

    fragment UPDATER_CATEGORY_FIELDS on CategoryUpdateType {
      status
      category {
        id
        name
        __typename
      }
      __typename
    }

    fragment UPDATER_MANGA_FIELDS on MangaUpdateType {
      status
      manga {
        id
        title
        thumbnailUrl
        __typename
      }
      __typename
    }

    fragment UPDATER_STATUS_FIELDS on LibraryUpdateStatus {
      jobsInfo {
        ...UPDATER_JOB_INFO_FIELDS
        __typename
      }
      categoryUpdates {
        ...UPDATER_CATEGORY_FIELDS
        __typename
      }
      mangaUpdates {
        ...UPDATER_MANGA_FIELDS
        __typename
      }
      __typename
    }

    query GET_UPDATE_STATUS {
      libraryUpdateStatus {
        ...UPDATER_STATUS_FIELDS
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.11. `GET_WEBUI_UPDATE_STATUS`

*   **Descrição:** Verifica o status da atualização da interface web (WebUI), incluindo informações de versão e progresso.
*   **Como Usar:** Utilizado para verificar se há uma nova versão da WebUI disponível e o status de download/instalação. Nenhuma variável é necessária.
*   **Query GraphQL:**

    ```graphql
    fragment WEBUI_UPDATE_INFO on WebUIUpdateInfo {
      channel
      tag
      __typename
    }

    fragment WEBUI_UPDATE_STATUS on WebUIUpdateStatus {
      info {
        ...WEBUI_UPDATE_INFO
        __typename
      }
      progress
      state
      __typename
    }

    query GET_WEBUI_UPDATE_STATUS {
      getWebUIUpdateStatus {
        ...WEBUI_UPDATE_STATUS
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.12. `GET_CHAPTERS_MANGA`

*   **Descrição:** Lista os capítulos de um mangá, ideal para a tela de detalhes do mangá.
*   **Como Usar:** Forneça o `mangaId` na condição e defina a ordem. No exemplo, a ordem é descendente (`DESC`).
*   **Query GraphQL:**

    ```graphql
    fragment CHAPTER_BASE_FIELDS on ChapterType {
      id
      name
      mangaId
      scanlator
      realUrl
      sourceOrder
      chapterNumber
      __typename
    }

    fragment CHAPTER_STATE_FIELDS on ChapterType {
      id
      isRead
      isDownloaded
      isBookmarked
      __typename
    }

    fragment CHAPTER_LIST_FIELDS on ChapterType {
      ...CHAPTER_BASE_FIELDS
      ...CHAPTER_STATE_FIELDS
      fetchedAt
      uploadDate
      lastReadAt
      __typename
    }

    fragment PAGE_INFO on PageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
      __typename
    }

    query GET_CHAPTERS_MANGA($after: Cursor, $before: Cursor, $condition: ChapterConditionInput, $filter: ChapterFilterInput, $first: Int, $last: Int, $offset: Int, $order: [ChapterOrderInput!]) {
      chapters(
        after: $after
        before: $before
        condition: $condition
        filter: $filter
        first: $first
        last: $last
        offset: $offset
        order: $order
      ) {
        nodes {
          ...CHAPTER_LIST_FIELDS
          __typename
        }
        pageInfo {
          ...PAGE_INFO
          __typename
        }
        totalCount
        __typename
      }
    }
    ```

*   **Variáveis:**

    ```json
    {
      "condition": {
        "mangaId": 87 // Exemplo de mangaId
      },
      "order": [
        {
          "by": "SOURCE_ORDER",
          "byType": "DESC"
        }
      ]
    }
    ```

### 3.13. `GET_MANGA_READER`

*   **Descrição:** Busca os dados essenciais de um mangá necessários para a tela de leitura (reader).
*   **Como Usar:** Forneça o `id` do mangá que será lido.
*   **Query GraphQL:**

    ```graphql
    fragment MANGA_BASE_FIELDS on MangaType {
      id
      title
      thumbnailUrl
      thumbnailUrlLastFetched
      inLibrary
      initialized
      sourceId
      __typename
    }

    fragment MANGA_META_FIELDS on MangaMetaType {
      mangaId
      key
      value
      __typename
    }

    fragment SOURCE_BASE_FIELDS on SourceType {
      id
      name
      displayName
      __typename
    }

    fragment MANGA_READER_FIELDS on MangaType {
      ...MANGA_BASE_FIELDS
      genre
      source {
        ...SOURCE_BASE_FIELDS
        __typename
      }
      meta {
        ...MANGA_META_FIELDS
        __typename
      }
      chapters {
        totalCount
        __typename
      }
      trackRecords {
        totalCount
        __typename
      }
      __typename
    }

    query GET_MANGA_READER($id: Int!) {
      manga(id: $id) {
        ...MANGA_READER_FIELDS
        __typename
      }
    }
    ```

*   **Variáveis:**

    ```json
    {
      "id": 87 // Exemplo de mangaId
    }
    ```

### 3.14. `GET_CHAPTERS_READER`

*   **Descrição:** Semelhante à `GET_CHAPTERS_MANGA`, mas busca campos adicionais úteis para a tela de leitura, como `lastPageRead` e `pageCount`.
*   **Como Usar:** Forneça o `mangaId` para listar os capítulos com dados específicos do leitor.
*   **Query GraphQL:**

    ```graphql
    fragment CHAPTER_BASE_FIELDS on ChapterType {
      id
      name
      mangaId
      scanlator
      realUrl
      sourceOrder
      chapterNumber
      __typename
    }

    fragment CHAPTER_STATE_FIELDS on ChapterType {
      id
      isRead
      isDownloaded
      isBookmarked
      __typename
    }

    fragment CHAPTER_READER_FIELDS on ChapterType {
      ...CHAPTER_BASE_FIELDS
      ...CHAPTER_STATE_FIELDS
      uploadDate
      lastPageRead
      pageCount
      __typename
    }

    fragment PAGE_INFO on PageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
      __typename
    }

    query GET_CHAPTERS_READER($after: Cursor, $before: Cursor, $condition: ChapterConditionInput, $filter: ChapterFilterInput, $first: Int, $last: Int, $offset: Int, $order: [ChapterOrderInput!]) {
      chapters(
        after: $after
        before: $before
        condition: $condition
        filter: $filter
        first: $first
        last: $last
        offset: $offset
        order: $order
      ) {
        nodes {
          ...CHAPTER_READER_FIELDS
          __typename
        }
        pageInfo {
          ...PAGE_INFO
          __typename
        }
        totalCount
        __typename
      }
    }
    ```

*   **Variáveis:**

    ```json
    {
      "condition": {
        "mangaId": 87 // Exemplo de mangaId
      },
      "order": [
        {
          "by": "SOURCE_ORDER",
          "byType": "DESC"
        }
      ]
    }
    ```

### 3.15. `GET_SOURCES_LIST`

*   **Descrição:** Retorna a lista de todas as fontes (provedores de conteúdo) disponíveis no Suwayomi-Server.
*   **Como Usar:** Para obter uma lista de fontes para exibição ou seleção.
*   **Query GraphQL:**

    ```graphql
    fragment SOURCE_BASE_FIELDS on SourceType {
      id
      name
      displayName
      __typename
    }

    fragment SOURCE_LIST_FIELDS on SourceType {
      ...SOURCE_BASE_FIELDS
      lang
      iconUrl
      isNsfw
      isConfigurable
      supportsLatest
      extension {
        pkgName
        repo
        __typename
      }
      __typename
    }

    query GET_SOURCES_LIST {
      sources {
        nodes {
          ...SOURCE_LIST_FIELDS
          __typename
        }
        __typename
      }
    }
    ```

*   **Variáveis:** `{}`

### 3.16. `GET_SOURCE_BROWSE`

*   **Descrição:** Permite navegar e filtrar o conteúdo de uma fonte específica, incluindo filtros disponíveis.
*   **Como Usar:** Para explorar o conteúdo de uma fonte e aplicar filtros de busca.
*   **Query GraphQL:**

    ```graphql
    fragment SOURCE_BASE_FIELDS on SourceType {
      id
      name
      displayName
      __typename
    }

    fragment SOURCE_META_FIELDS on SourceMetaType {
      sourceId
      key
      value
      __typename
    }

    fragment SOURCE_BROWSE_FIELDS on SourceType {
      ...SOURCE_BASE_FIELDS
      isConfigurable
      supportsLatest
      meta {
        ...SOURCE_META_FIELDS
        __typename
      }
      filters {
        ... on CheckBoxFilter {
          type: __typename
          CheckBoxFilterDefault: default
          name
        }
        ... on HeaderFilter {
          type: __typename
          name
        }
        ... on SelectFilter {
          type: __typename
          SelectFilterDefault: default
          name
          values
        }
        ... on TriStateFilter {
          type: __typename
          TriStateFilterDefault: default
          name
        }
        ... on TextFilter {
          type: __typename
          TextFilterDefault: default
          name
        }
        ... on SortFilter {
          type: __typename
          SortFilterDefault: default {
            ascending
            index
            __typename
          }
          options {
            ascending
            index
            __typename
          }
        }
        __typename
      }
      __typename
    }

    query GET_SOURCE_BROWSE($id: String!) {
      source(id: $id) {
        ...SOURCE_BROWSE_FIELDS
        __typename
      }
    }
    ```

*   **Variáveis:**

    ```json
    {
      "id": "4630910107107422596" // Exemplo de sourceId
    }
    ```

---

**Autor:** Manus AI
**Última Atualização:** 22 de junho de 2025

