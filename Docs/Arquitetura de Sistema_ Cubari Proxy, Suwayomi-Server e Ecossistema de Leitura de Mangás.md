# Arquitetura de Sistema: Cubari Proxy, Suwayomi-Server e Ecossistema de Leitura de Mangás

Este documento apresenta uma visão abrangente da arquitetura do sistema Cubari Proxy, Suwayomi-Server e seus componentes relacionados, com foco na integração, fluxo de dados e otimizações. Ele também incorpora um roadmap de implementação e oportunidades de melhoria para o projeto.

## 1. Visão Geral da Arquitetura

A arquitetura proposta para o ecossistema de leitura de mangás é um modelo distribuído e centrado no usuário, que combina a flexibilidade de um frontend moderno com a robustez de um backend de API Gateway e a eficiência de um servidor de fontes de conteúdo. A privacidade e o controle do usuário sobre seus dados são prioridades, utilizando um sistema de armazenamento remoto como fonte da verdade para informações pessoais.

### 1.1. Componentes Principais

*   **Frontend (React na Vercel):** Atua como a interface principal do usuário. É responsável por gerenciar a interação do usuário, exibir o conteúdo e orquestrar o acesso aos dados. Ele se conecta a um serviço de armazenamento remoto controlado pelo usuário para dados de biblioteca e histórico.

*   **Backend (Django na Vercel):** Funciona como um **API Gateway** e **Tradutor Inteligente**. Sua função é receber requisições do frontend, traduzi-las para o formato adequado (principalmente GraphQL para o Suwayomi-Server), e proteger o acesso a serviços externos. É um componente *stateless* em relação aos dados do usuário, ou seja, não armazena permanentemente informações pessoais do usuário, mas pode retransmitir comandos de sincronização e atuar como um cache para dados de fontes.

*   **Banco de Dados (PostgreSQL - Cache):** Utilizado pelo backend Django primariamente como um **cache** para respostas do Suwayomi-Server. Isso acelera as requisições subsequentes e reduz a carga sobre o Suwayomi-Server, evitando chamadas repetidas. Não é a fonte da verdade para dados de usuário.

*   **Suwayomi-Server (na Koyeb):** Um **Fornecedor Externo Especializado** que se encarrega de buscar dados e imagens diretamente das fontes de mangá. Ele expõe uma API GraphQL e mantém uma base de dados interna para gerenciar as fontes e o estado de 




### 1.2. Fluxo de Trabalho na Prática

Vamos detalhar como os componentes interagem em cenários comuns, como a busca de conteúdo e a adição de itens à biblioteca do usuário.

#### 1.2.1. Fluxo de Busca de Conteúdo (O Frontend Usa o Porteiro para Falar com o Fornecedor)

Este fluxo ilustra o papel do Django como um proxy de cache para o Suwayomi-Server:

1.  O usuário inicia uma busca por um título no frontend (React).
2.  O componente React envia uma requisição para o **API Gateway em Django** (ex: `GET /api/v1/content-discovery/search`).
3.  O backend **Django** recebe a requisição. Ele primeiro verifica em seu **cache (PostgreSQL)** se a busca já foi realizada recentemente.
4.  Se a informação não estiver em cache, o Django traduz o pedido em uma requisição **GraphQL** para o **Suwayomi-Server**.
5.  O **Suwayomi-Server** busca o mangá na fonte de conteúdo e retorna os resultados para o Django.
6.  O **Django** armazena o resultado no cache (PostgreSQL) para otimizar futuras requisições e, em seguida, envia a resposta final para o **frontend React**.
7.  O React recebe a lista de resultados e a exibe para o usuário.

#### 1.2.2. Fluxo de Adição à Biblioteca (Sincronização Híbrida)

Este fluxo demonstra a combinação de controle do usuário com funcionalidades do servidor, aproveitando o Remote Storage como fonte da verdade e o Suwayomi-Server para funcionalidades operacionais:

1.  O usuário encontra um mangá na busca e decide adicioná-lo à sua biblioteca.
2.  A aplicação React executa **duas ações principais** em paralelo ou em sequência:
    *   **Ação Primária (Fonte da Verdade):** O frontend se conecta diretamente à API do **Remote Storage (ex: 5apps)** e salva os metadados completos do mangá. Isso garante que o usuário mantenha a posse total e permanente de seus dados de biblioteca.
    *   **Ação Secundária (Sincronização Funcional):** O frontend faz uma requisição para o backend **Django** (ex: `POST /api/v1/suwayomi/manga/update_in_library/`) com o ID do mangá e o status `inLibrary: true`.
3.  O backend **Django** recebe essa chamada de sincronização e a repassa como uma mutação GraphQL (`updateManga` ou `updateUserManga`) para o **Suwayomi-Server**.
4.  O **Suwayomi-Server** recebe a mutação e marca o mangá em sua própria base de dados interna como "favorito". É crucial entender que o Suwayomi-Server não armazena dados pessoais do usuário, apenas a associação necessária para tarefas futuras, como a verificação automática de novos capítulos para mangás na biblioteca.
5.  Ambos, Django e Suwayomi-Server, retornam uma resposta de sucesso, e o React atualiza a interface do usuário, indicando que o item foi adicionado à biblioteca.

### 1.3. Vantagens da Arquitetura Proposta

Esta arquitetura oferece múltiplos benefícios:

*   **Privacidade e Controle (User-Centric):** Os dados pessoais do usuário (biblioteca, progresso de leitura) são armazenados no **Remote Storage**, um serviço sob o controle direto do usuário. A aplicação não armazena permanentemente esses dados sensíveis.
*   **Funcionalidades Avançadas:** A sincronização do estado "favorito" com o Suwayomi-Server (de forma anonimizada, utilizando apenas o ID do conteúdo) permite a implementação de recursos poderosos, como a verificação automática de novos capítulos no backend, sem comprometer a privacidade dos dados do usuário.
*   **Segurança e Abstração:** A infraestrutura do Suwayomi-Server fica completamente oculta para o frontend. O navegador do usuário interage apenas com o API Gateway do Django, que anonimiza os endpoints e atua como proxy para imagens, prevenindo a exposição de URLs ou chaves sensíveis.
*   **Escalabilidade e Otimização de Custos:** O backend Django é *stateless* em relação aos dados do usuário, eliminando a necessidade de um banco de dados robusto para armazenar bibliotecas crescentes. Ele utiliza um PostgreSQL apenas para caching, o que simplifica a manutenção e reduz os custos de escalabilidade.

## 2. Roadmap de Implementação

Este roadmap detalha o plano de implementação para o Cubari Proxy, alinhado com a arquitetura moderna proposta. Ele é dividido em fases, com objetivos claros e tarefas específicas.

### 2.1. Legenda de Status

*   🔲 **Pendente**: Tarefa ainda não iniciada.
*   🔄 **Em Andamento**: Tarefa atualmente em desenvolvimento.
*   ✅ **Concluído**: Tarefa implementada e testada.
*   ⚠️ **Bloqueado**: Tarefa impedida por dependências não resolvidas.
*   🚫 **Cancelado**: Tarefa não será implementada.
*   💡 **Ideia**: Nova ideia ou sugestão a ser considerada.

### 2.2. Fase 1: Backend e Infraestrutura Base

**Objetivo**: Estabelecer a fundação do backend e serviços necessários para o funcionamento do Cubari Proxy.
**Responsável**: Equipe Backend
**Tempo Estimado Total da Fase**: 2-3 semanas

#### 2.2.1. Configuração do Backend Principal (Django + PostgreSQL)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Crítica
*   **Tempo Estimado**: 1 semana
*   **Tarefas**:
    *   [ ] Definir modelos de dados para o backend (ex: para caching de mangás, capítulos, mas não dados de usuário que serão via Remote Storage). *Nota: O sistema de cache do Django pode ser utilizado para isso.*
    *   [ ] Configurar projeto Django.
    *   [ ] Configurar banco de dados PostgreSQL (para caching e dados operacionais do backend). *Nota: Atualmente, o foco é em cache in-memory, mas o PostgreSQL pode ser uma melhoria futura para persistência de cache.*
    *   [ ] Criar APIs para facilitar a interação com metadados de mangás (ex: busca, detalhes), mas **não** para gerenciar a biblioteca do usuário de forma persistente, que será via Remote Storage.
    *   [ ] Configurar CORS e segurança básica.
    *   [ ] Deploy inicial na Vercel (ou plataforma similar para Django).
*   **Entregáveis**: Backend funcional com endpoints para interagir com dados de mangás, facilitando a integração com Remote Storage para dados de biblioteca e histórico.

#### 2.2.2. Configuração do Suwayomi-Server como Microserviço

*   **Status**: 🔲 Pendente
*   **Prioridade**: Crítica
*   **Tempo Estimado**: 3-4 dias
*   **Tarefas**:
    *   [ ] Preparar o Suwayomi-Server para deploy.
    *   [ ] Configurar e realizar deploy do Suwayomi-Server na Koyeb (ou plataforma similar).
    *   [ ] Garantir que o servidor Suwayomi esteja acessível e funcional.
    *   [ ] Definir como o backend Django irá se comunicar com o Suwayomi-Server (chamadas diretas GraphQL via HTTP POST).
*   **Entregáveis**: Instância do Suwayomi-Server rodando e acessível.

#### 2.2.3. API Gateway/Proxy (Django) para Suwayomi

*   **Status**: 🔲 Pendente
*   **Prioridade**: Alta
*   **Tempo Estimado**: 2-3 dias
*   **Tarefas**:
    *   [ ] Definir e implementar os endpoints REST anonimizados no Django, que atuarão como proxy para a API GraphQL do Suwayomi-Server, conforme detalhado na seção de API.
    *   [ ] Para cada endpoint implementado:
        *   [ ] Implementar a lógica de recebimento da requisição e validação dos parâmetros de entrada.
        *   [ ] Construir a chamada GraphQL apropriada para o Suwayomi-Server.
        *   [ ] Enviar a requisição ao Suwayomi-Server e tratar a resposta, incluindo erros HTTP e erros específicos do GraphQL.
        *   [ ] Formatar a resposta do Suwayomi para o formato JSON anonimizado, incluindo o mapeamento de dados e IDs.
    *   [ ] Implementar tratamento de erros robusto e **informativo** e logging para todas as interações com o Suwayomi-Server.
    *   [ ] Configurar e implementar autenticação/autorização para as chamadas ao Suwayomi-Server, se aplicável (ex: API keys, tokens). *Nota: Atualmente, o Suwayomi é acessível diretamente pela URL configurada, mas a segurança deve ser considerada para produção.*
    *   [ ] Implementar estratégias de caching (ex: `django.core.cache`) para as respostas dos endpoints.
*   **Entregáveis**: Endpoints no backend Django para interagir com o Suwayomi-Server de forma segura e controlada, utilizando GraphQL, com proxy de imagens e caching.

### 2.3. Fase 2: Integração Frontend-Backend e Funcionalidades Essenciais

**Objetivo**: Conectar o frontend React existente com o novo backend Django e implementar as funcionalidades básicas de um leitor de mangás, utilizando Remote Storage para dados do usuário.
**Responsável**: Equipe Frontend & Backend
**Tempo Estimado Total da Fase**: 3-4 semanas

#### 2.3.1. Configuração do Armazenamento de Dados do Usuário (Remote Storage)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Crítica
*   **Tempo Estimado**: 3-4 dias
*   **Tarefas**:
    *   [ ] Garantir que o frontend React possa se conectar e sincronizar dados (biblioteca, histórico, configurações) com o Remote Storage (ex: 5apps).
    *   [ ] Implementar a interface no frontend para que o usuário configure sua conta do Remote Storage.
    *   [ ] Assegurar que as operações de salvar/carregar biblioteca e histórico utilizem o Remote Storage.
    *   [ ] O backend Django **não** gerenciará estado de usuário ou autenticação; toda a persistência de dados do usuário é via Remote Storage.
*   **Entregáveis**: Usuários conseguem configurar e usar o Remote Storage para salvar e sincronizar seus dados de leitura entre dispositivos.

#### 2.3.2. Funcionalidade de Busca de Mangás

*   **Status**: 🔲 Pendente
*   **Prioridade**: Crítica
*   **Tempo Estimado**: 1 semana
*   **Tarefas**:
    *   [ ] Criar interface de busca no frontend.
    *   [ ] Frontend envia requisição de busca para o backend Django.
    *   [ ] Backend Django repassa a busca para o Suwayomi-Server (via API Gateway/Proxy).
    *   [ ] Exibir resultados da busca no frontend.
    *   [ ] Permitir seleção de fontes (se aplicável, via Suwayomi).
*   **Entregáveis**: Usuários conseguem buscar mangás de diversas fontes.

#### 2.3.3. Visualização de Detalhes do Mangá e Capítulos

*   **Status**: 🔲 Pendente
*   **Prioridade**: Crítica
*   **Tempo Estimado**: 1 semana
*   **Tarefas**:
    *   [ ] Frontend solicita detalhes de um mangá específico ao backend Django.
    *   [ ] Backend Django obtém informações do Suwayomi-Server.
    *   [ ] Exibir informações do mangá (capa, sinopse, autor, etc.) e lista de capítulos.
*   **Entregáveis**: Usuários conseguem ver detalhes e capítulos de um mangá.

#### 2.3.4. Leitor de Mangá

*   **Status**: 🔲 Pendente
*   **Prioridade**: Crítica
*   **Tempo Estimado**: 1 semana
*   **Tarefas**:
    *   [ ] Frontend solicita páginas de um capítulo ao backend Django.
    *   [ ] Backend Django obtém as páginas do Suwayomi-Server e fornece URLs de proxy.
    *   [ ] Implementar interface de leitura no frontend (navegação entre páginas, zoom, etc.).
*   **Entregáveis**: Usuários conseguem ler capítulos de mangás.

#### 2.3.5. Biblioteca Pessoal (Favoritos)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Alta
*   **Tempo Estimado**: 4-5 dias
*   **Tarefas**:
    *   [ ] Permitir que usuários adicionem/removam mangás à sua biblioteca pessoal.
    *   [ ] Frontend interage diretamente com o Remote Storage para salvar e gerenciar a biblioteca do usuário.
    *   [ ] O backend Django **não** armazena dados da biblioteca no PostgreSQL; pode, no máximo, prover endpoints que facilitem a interação com metadados de mangás, mas não a biblioteca em si.
    *   [ ] Exibir a lista de mangás salvos no frontend, carregada do Remote Storage.
*   **Entregáveis**: Usuários conseguem gerenciar sua biblioteca de mangás, com dados armazenados e sincronizados via Remote Storage.

#### 2.3.6. Histórico de Leitura

*   **Status**: 🔲 Pendente
*   **Prioridade**: Alta
*   **Tempo Estimado**: 3-4 dias
*   **Tarefas**:
    *   [ ] Registrar automaticamente os capítulos lidos pelo usuário.
    *   [ ] Frontend interage diretamente com o Remote Storage para salvar e gerenciar o histórico de leitura.
    *   [ ] O backend Django **não** armazena dados de histórico no PostgreSQL; pode, no máximo, prover endpoints relacionados a capítulos, mas não o histórico do usuário.
    *   [ ] Exibir o histórico de leitura no frontend, carregado do Remote Storage.
*   **Entregáveis**: Usuários conseguem ver seu histórico de leitura, com dados armazenados e sincronizados via Remote Storage.

### 2.4. Fase 3: Features de Alta Prioridade

**Objetivo**: Implementar funcionalidades cruciais que melhoram significativamente a experiência do usuário, adaptando-as à nova arquitetura.
**Responsável**: Equipe Frontend & Backend
**Tempo Estimado Total da Fase**: 2-3 semanas

#### 2.4.1. Melhoria da Integração com Remote Storage (Ex: 5apps)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Alta
*   **Tempo Estimado**: 1 semana
*   **Objetivo**: Melhorar a experiência do usuário com o sistema de backup e sincronização na nuvem via Remote Storage.
*   **Tarefas**:
    *   **Backend (Django)**:
        *   [ ] Investigar e, se benéfico, implementar rotas no Django que possam facilitar a configuração inicial ou interações específicas com o Remote Storage (ex: proxy para CORS, endpoints de ajuda para configuração), sem armazenar dados do usuário.
        *   [ ] Garantir que qualquer token de acesso ou configuração sensível relacionada ao Remote Storage seja gerenciada de forma segura, preferencialmente no lado do cliente ou com mecanismos que não exijam que o backend Django os armazene permanentemente.
    *   **Frontend**:
        *   [ ] Criar componente `RemoteStorageHelp.js` para guiar o usuário na configuração.
        *   [ ] Posicionar botão flutuante fixo na tela.
        *   [ ] Implementar modal explicativo passo-a-passo.
        *   [ ] Melhorar Página de Configurações: Reorganizar seção, adicionar explicações claras, indicadores de status.
*   **Entregáveis**: Sistema de backup/sincronização mais intuitivo e robusto.

#### 2.4.2. Migração para Extensões em Português Brasileiro (via Suwayomi)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Alta
*   **Tempo Estimado**: 1-2 semanas (depende da configuração do Suwayomi e da interface no frontend)
*   **Objetivo**: Priorizar e facilitar o acesso a conteúdo em português brasileiro.
*   **Tarefas**:
    *   **Backend (Suwayomi)**:
        *   [ ] Garantir que o Suwayomi-Server esteja configurado com as extensões PT-BR desejadas (Union Mangás, Manga Livre, etc.).
        *   [ ] Verificar se o Suwayomi permite configurar preferências de idioma por fonte ou globalmente.
    *   **Backend (Django)**:
        *   [ ] Se o frontend enviar preferências de idioma/fonte (lidas do Remote Storage do usuário), o backend Django pode usar essas informações para customizar as chamadas ao Suwayomi-Server.
    *   **Frontend**:
        *   [ ] Interface para o usuário selecionar fontes preferenciais ou idioma (salvas no Remote Storage).
        *   [ ] Ajustar `src/sources/Sources.ts` e `SourceUtils.ts` para interagir com o backend Django, que por sua vez interage com Suwayomi, em vez de configurar fontes diretamente no frontend. A lógica de fontes agora reside primariamente no Suwayomi.
        *   [ ] Atualizar traduções em `src/locales/ptBR/translation.json`.
*   **Entregáveis**: Aplicação prioriza fontes em PT-BR e permite fácil configuração.

### 2.5. Fase 4: Features de Média Prioridade

**Objetivo**: Adicionar funcionalidades que enriquecem a experiência do usuário.
**Responsável**: Equipe Frontend & Backend
**Tempo Estimado Total da Fase**: 2-3 semanas

#### 2.5.1. Interface Mobile Aprimorada

*   **Status**: 🔲 Pendente
*   **Prioridade**: Média
*   **Tempo Estimado**: 1 semana
*   **Objetivo**: Melhorar a experiência em dispositivos móveis.
*   **Tarefas (Frontend)**:
    *   [ ] Implementar gestos de navegação (swipe em carrosséis, pull-to-refresh).
    *   [ ] Otimizar layout para mobile (cards maiores, navegação bottom sheet, botões de ação maiores).
    *   [ ] Melhorar performance mobile (lazy loading, imagens otimizadas).
*   **Entregáveis**: Interface mais fluida e adaptada para mobile.

#### 2.5.2. Sistema de Busca Avançada

*   **Status**: 🔲 Pendente
*   **Prioridade**: Média
*   **Tempo Estimado**: 1 semana
*   **Objetivo**: Implementar filtros avançados na busca.
*   **Tarefas**:
    *   **Backend (Django & Suwayomi)**:
        *   [ ] Verificar quais filtros o Suwayomi-Server suporta por fonte.
        *   [ ] Backend Django deve ser capaz de passar esses filtros para o Suwayomi.
    *   **Frontend**:
        *   [ ] Interface para filtros (gêneros, status, ano, etc.).
        *   [ ] Implementar lógica para aplicar filtros na busca.
        *   [ ] Considerar sugestões automáticas. O histórico de busca, se implementado, será armazenado localmente no cliente ou via Remote Storage, e não no backend Django, para manter a privacidade e consistência dos dados do usuário.
*   **Entregáveis**: Busca mais poderosa e personalizável.

#### 2.5.3. Sistema de Estatísticas (Dados do Usuário via Remote Storage)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Média
*   **Tempo Estimado**: 4-5 dias
*   **Objetivo**: Mostrar estatísticas de leitura para o usuário, processadas no frontend a partir dos dados do Remote Storage.
*   **Tarefas**:
    *   **Frontend**:
        *   [ ] Desenvolver lógica no frontend para ler dados de histórico e biblioteca do Remote Storage.
        *   [ ] Processar esses dados no cliente para gerar estatísticas (mangás lidos, tempo gasto estimado, gêneros favoritos).
        *   [ ] Desenvolver dashboard pessoal para exibir estatísticas.
        *   [ ] Criar gráficos e visualizações.
        *   [ ] (Opcional) Sistema de metas e conquistas (dados também no Remote Storage).
    *   **Backend (Django)**:
        *   [ ] Não envolvido no armazenamento ou processamento direto dos dados de estatísticas do usuário. Pode fornecer dados agregados anônimos globais, se desejado no futuro, mas não estatísticas pessoais.
*   **Entregáveis**: Painel de estatísticas para o usuário, com dados processados no cliente a partir do Remote Storage.

#### 2.5.4. Modo de Leitura Noturna

*   **Status**: 🔲 Pendente
*   **Prioridade**: Média
*   **Tempo Estimado**: 2-3 dias
*   **Objetivo**: Implementar modo de leitura específico com configurações de brilho, contraste e filtros.
*   **Tarefas (Frontend)**:
    *   [ ] Implementar tema escuro para a interface de leitura.
    *   [ ] Adicionar controles para brilho (se possível via CSS/JS), filtro de cor (ex: sépia).
    *   [ ] (Opcional) Programação automática baseada no horário ou tema do sistema.
*   **Entregáveis**: Modo de leitura confortável para ambientes escuros.

### 2.6. Fase 5: Features de Baixa Prioridade

**Objetivo**: Adicionar funcionalidades complementares e melhorias de longo prazo.
**Responsável**: Equipe Frontend & Backend
**Tempo Estimado Total da Fase**: A definir

#### 2.6.1. Sistema de Notificações (Novos Capítulos)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Baixa
*   **Tempo Estimado**: 1 semana
*   **Objetivo**: Notificar usuários sobre novos capítulos de mangás favoritos.
*   **Tarefas**:
    *   **Backend (Django)**:
        *   [ ] Implementar um sistema que permita ao frontend registrar interesse em notificações para determinados mangás (ex: enviando IDs de mangás, sem associar a um usuário específico, mas a um token de dispositivo ou identificador anônimo). O backend pode então usar o Suwayomi-Server para verificar atualizações e enviar notificações (via Firebase Cloud Messaging ou similar).
    *   **Frontend**:
        *   [ ] Implementar registro de dispositivo para notificações.
        *   [ ] Interface para gerenciar preferências de notificação.
*   **Entregáveis**: Usuários recebem notificações sobre novos capítulos.

#### 2.6.2. Exportação/Importação de Dados (Remote Storage)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Baixa
*   **Tempo Estimado**: 3-4 dias
*   **Objetivo**: Permitir que os usuários exportem e importem seus dados de leitura.
*   **Tarefas (Frontend)**:
    *   [ ] Implementar funcionalidade de exportação de dados (JSON, CSV) do Remote Storage.
    *   [ ] Implementar funcionalidade de importação de dados para o Remote Storage.
*   **Entregáveis**: Maior controle do usuário sobre seus dados.

#### 2.6.3. Integração com Serviços de Tracking (MyAnimeList, AniList)

*   **Status**: 🔲 Pendente
*   **Prioridade**: Baixa
*   **Tempo Estimado**: 1 semana
*   **Objetivo**: Sincronizar o progresso de leitura com plataformas de tracking.
*   **Tarefas**:
    *   **Backend (Django)**:
        *   [ ] Implementar integração com APIs de tracking (MyAnimeList, AniList) para sincronizar o progresso de leitura.
        *   [ ] O backend atuaria como um proxy seguro para essas APIs, recebendo tokens do frontend e realizando as chamadas.
    *   **Frontend**:
        *   [ ] Interface para o usuário conectar suas contas de tracking.
        *   [ ] Lógica para enviar atualizações de progresso para o backend.
*   **Entregáveis**: Progresso de leitura sincronizado com plataformas externas.

## 3. Análise e Oportunidades de Melhoria

Esta seção aborda problemas identificados e oportunidades de melhoria no código e na arquitetura, visando aumentar a robustez, performance e manutenibilidade do projeto.

### 3.1. Problemas Identificados

#### 3.1.1. Ausência Total de Testes Automatizados

Esta é a questão mais crítica. A falta de testes automatizados em ambos, backend e frontend, introduz um alto risco de regressões e dificulta a manutenção e a evolução do projeto.

*   **No Backend (Django):** O arquivo `gateway_service/api/tests.py` está vazio. Isso significa que a API Gateway, uma peça central, não possui garantias de funcionamento após modificações.
*   **No Frontend (React):** Não há uma estrutura de testes (como Jest ou React Testing Library) configurada. Componentes complexos e hooks com lógica de dados podem falhar em cenários específicos.

#### 3.1.2. Tratamento de Erros Genérico no Backend

O tratamento de erros na API Gateway é excessivamente genérico, retornando um status `500 Internal Server Error` para qualquer exceção. Isso impede que o frontend distinga a causa raiz do problema (falha de conexão com Suwayomi-Server, resposta malformada, erro interno do gateway), dificultando o debug e a exibição de mensagens úteis ao usuário.

#### 3.1.3. Variáveis de Ambiente e Configurações "Hardcoded"

A URL da API Gateway, por exemplo, pode estar "hardcoded" no código (`src/config.ts`). Isso não é ideal para diferentes ambientes (desenvolvimento, produção) e compromete a segurança. O ideal é que todas as configurações sensíveis e específicas de ambiente sejam lidas de variáveis de ambiente (ex: via `.env`).

### 3.2. Oportunidades de Melhoria

#### 3.2.1. Refatoração de Hooks Complexos (Frontend)

Hooks customizados como `useDiscoverData.js` e `useMangaData.js` centralizam uma grande quantidade de lógica. Dividi-los em hooks menores e mais focados pode melhorar a legibilidade, a reutilização e a testabilidade do código. A lógica de fetching de dados, por exemplo, poderia ser abstraída para um hook genérico.

#### 3.2.2. Otimização de Performance em Listas Longas (Frontend)

Páginas que exibem muitos itens (ex: "Salvos", "Histórico") podem sofrer de lentidão. A implementação de **virtualização de listas** (com bibliotecas como `react-window` ou `react-virtualized`) renderiza apenas os itens visíveis na tela, melhorando drasticamente a performance para grandes volumes de dados.

#### 3.2.3. Fortalecimento da Tipagem com TypeScript (Frontend)

Embora o projeto já utilize TypeScript, o uso pode ser aprofundado para capturar mais erros em tempo de compilação. Isso inclui evitar o tipo `any` sempre que possível e criar tipos e interfaces mais detalhados para as respostas da API GraphQL, habilitando autocomplete e verificação de tipos em todo o frontend.

#### 3.2.4. Estratégia de Gerenciamento de Estado Global (Frontend)

O uso da Context API para gerenciamento de estado é funcional, mas para estados complexos e cache de dados da API, soluções mais robustas como **Zustand** ou **Redux Toolkit (com RTK Query)** podem simplificar a lógica de fetching, cache e atualização de dados do servidor, além de oferecerem ferramentas de depuração mais avançadas.

## 4. Relatório Técnico Detalhado: Cubari.moe, Proxy Cubari e Guya.moe

Esta seção aprofunda a compreensão sobre o ecossistema Cubari, explorando suas funcionalidades, arquitetura, tecnologias subjacentes e a interconexão entre esses serviços.

### 4.1. Cubari.moe: O Leitor de Mangá e Proxy de Imagem

Cubari.moe é uma plataforma online que funciona primariamente como um proxy de imagem e um leitor de mangá otimizado. Sua principal função é exibir conteúdo visual (especialmente imagens de mangás) proveniente de outras fontes na internet, apresentando-o em uma interface de leitura aprimorada e configurável. É crucial entender que o Cubari.moe não hospeda os arquivos de imagem diretamente; ele atua como um intermediário, buscando as imagens de seus locais de origem e as servindo através de sua própria interface.

#### 4.1.1. Documentação e Funcionamento

De acordo com a documentação disponível (notavelmente em wotaku.wiki), o Cubari.moe opera lendo um arquivo JSON. Este arquivo contém os links diretos para as imagens do mangá, bem como metadados adicionais (como títulos de capítulos, números de volume, etc.). Para que o sistema funcione, as imagens precisam ser hospedadas em um serviço externo (como o Image Chest, sugerido na documentação), e o arquivo JSON deve ser gerado e formatado corretamente.

##### 4.1.1.1. Estrutura de Arquivos e Metadados

Para a correta ingestão de dados pelo Cubari, a organização dos arquivos e pastas é padronizada:

*   **Nomenclatura de Pastas**: As pastas que contêm os capítulos do mangá devem seguir o formato `V# Ch# Título`. O número do volume (`V#`) e o título do capítulo são opcionais, mas o número do capítulo (`Ch#`) é um requisito obrigatório para a identificação e ordenação.

*   **Ordenação de Imagens**: As imagens dentro de cada pasta de capítulo devem ser nomeadas de forma que, quando ordenadas alfabeticamente, sigam a sequência correta de leitura (ex: `page001.jpg`, `page002.jpg`, etc.).

**Exemplo de Estrutura de Diretórios:**

```
Comic_Folder/
├── info.txt                           # Arquivo de metadados gerais do mangá
├── V01 Ch001 Primeiro Capítulo/       # Pasta do primeiro capítulo
│   ├── page001.jpg
│   ├── page002.jpg
│   └── ...
└── V01 Ch002 Segundo Capítulo/       # Pasta do segundo capítulo
    ├── page001.jpg
    └── ...
```

O arquivo `info.txt` na pasta raiz do mangá pode conter metadados adicionais sobre a série como um todo.

##### 4.1.1.2. Script Kaguya: Geração do JSON

Para automatizar a criação do arquivo JSON necessário para o Cubari, é utilizado um script baseado em Python chamado Kaguya. Este script facilita o processo de coleta de informações e links das imagens, formatando-os no JSON que o Cubari consome. O fluxo de trabalho do script Kaguya inclui:

1.  **Instalação do Python**: O script requer uma instalação Python (versão 3.6.5+ é recomendada).
2.  **Execução**: O script é executado via linha de comando (`python kaguya.py`).
3.  **Entrada de Dados**: O usuário fornece o caminho para a pasta do mangá organizada conforme a estrutura descrita acima.
4.  **Opções de Upload**: O script oferece opções para processar todos os capítulos, apenas novos capítulos, capítulos específicos, ou apenas atualizar metadados no GitHub.

Após a execução bem-sucedida, o script Kaguya gera três arquivos principais:

*   **`titulo_do_quadrinho.json`**: Este é o arquivo JSON principal que o Cubari.moe lê. Ele contém todos os links dos capítulos e os metadados associados, permitindo que o leitor exiba o mangá de forma organizada.

*   **`imgchest_upload_record.txt`**: Um registro das pastas que foram carregadas com sucesso. Este arquivo é útil para rastrear o progresso e identificar capítulos que falharam no upload, permitindo que sejam processados novamente.

*   **`cubari_urls.txt`**: Um log de todos os uploads realizados através do script Kaguya, fornecendo um histórico das operações.

#### 4.1.2. Análise do Código (Repositório eNV25/cubari)

O repositório GitHub eNV25/cubari oferece uma perspectiva sobre os componentes de dados e automação associados ao Cubari.moe. Embora não seja o código-fonte completo do leitor em si (que está em reescrita e não é open-source no momento), ele revela a natureza orientada a dados da plataforma.

##### 4.1.2.1. Conteúdo do Repositório

*   **README.md**: Fornece uma breve introdução e exemplos de links para o Cubari.moe.

*   **Arquivos .json** (ex: `onepiece.json`, `onepiece_cover.json`): A presença desses arquivos JSON corrobora a informação de que o Cubari.moe consome dados estruturados. Esses arquivos são os dados que o Cubari.moe interpreta para apresentar o mangá, contendo a sequência de capítulos, URLs das imagens e outros metadados de leitura.

*   **Scripts .sh** (ex: `onepiecechapters.sh`, `tcbscans.sh`): A existência de scripts shell indica a automação na preparação e coleta de dados. É provável que esses scripts sejam utilizados para organizar e processar capítulos de mangás específicos e coletar e integrar scans de grupos de scanlation.

##### 4.1.2.2. Implicações da Análise do Código

*   **Natureza do Cubari**: O repositório confirma que o Cubari.moe é uma ferramenta que consome dados estruturados (JSON) para apresentar mangás. Ele não é um host de conteúdo, mas sim um leitor que se integra com fontes de dados externas.

*   **Automação**: Os scripts shell sugerem um nível de automação na preparação e atualização do conteúdo, fundamental para manter o Cubari.moe atualizado.

*   **Flexibilidade**: A abordagem baseada em JSON permite que o Cubari seja flexível e possa ser adaptado para ler mangás de diversas fontes, desde que os dados sejam formatados corretamente.

### 4.2. Proxy Cubari: Implementação e Detalhes Técnicos

O termo "Proxy Cubari" pode se referir tanto à funcionalidade de proxy de imagem do Cubari.moe quanto a implementações separadas de proxies que se integram ao ecossistema Cubari. O repositório subject-f/cubarimoe no GitHub é um exemplo prático de um projeto que implementa um proxy de imagem compatível com o leitor Cubari.

#### 4.2.1. Pré-requisitos e Instalação (Baseado em subject-f/cubarimoe)

Este projeto demonstra as tecnologias e etapas necessárias para configurar um proxy Cubari:

**Pré-requisitos:**
*   `git`: Para clonagem do repositório.
*   `python 3.6.5+`: Linguagem de programação principal.
*   `pip`: Gerenciador de pacotes Python.
*   `virtualenv`: Para isolamento de dependências.

**Etapas de Instalação (Resumidas):**
1.  Criação de um ambiente virtual (`virtualenv`).
2.  Clonagem do código-fonte do cubarimoe para o ambiente virtual.
3.  Ativação do ambiente virtual.
4.  Instalação das dependências listadas em `requirements.txt`.
5.  Configuração de uma SECRET_KEY para segurança.
6.  Geração de ativos padrão (`python3 init.py`).
7.  Criação de um usuário administrador (`python3 manage.py createsuperuser`).
8.  Execução do servidor de desenvolvimento (`python3 manage.py runserver`).

#### 4.2.2. Tecnologias e Estrutura

A análise dos pré-requisitos e do processo de instalação revela as seguintes tecnologias e aspectos estruturais:

*   **Python**: É a linguagem central para a lógica do proxy, processamento de imagens e interação com o leitor Cubari.

*   **Framework Web (Django/Flask)**: A presença de `manage.py` e comandos como `runserver` e `createsuperuser` sugere fortemente o uso de um framework web Python (como Django ou Flask) para gerenciar rotas, banco de dados e a lógica do servidor.

*   **Proxy de Imagem**: O projeto atua como um intermediário. Ele intercepta requisições de imagens, as processa (otimização, redimensionamento, adição de cabeçalhos) e as serve ao cliente. Isso é vital para o Cubari.moe, que não armazena imagens diretamente.

*   **Integração com o Leitor Cubari**: O proxy é projetado para funcionar em conjunto com a interface de leitura do Cubari.moe, formatando as URLs das imagens de forma que o leitor possa interpretá-las facilmente.

**Arquivos Relevantes:**
*   `requirements.txt`: Lista todas as bibliotecas Python necessárias.
*   `config.json`: Provavelmente contém configurações do proxy.
*   `proxy/`: Diretório que provavelmente contém a lógica central do proxy.
*   `reader/`: Pode conter arquivos relacionados à integração com o leitor Cubari ou componentes da interface do usuário.

#### 4.2.3. Funcionamento do Proxy

O proxy Cubari, neste contexto, age como uma ponte entre as fontes de imagem originais (onde as imagens de mangá são hospedadas) e o leitor Cubari.moe. Quando o leitor Cubari solicita uma imagem, a requisição é direcionada ao proxy. O proxy, por sua vez, busca a imagem da fonte original, realiza qualquer processamento necessário e a entrega ao leitor. Esse mecanismo permite que o Cubari.moe ofereça uma experiência de leitura consistente e otimizada, independentemente da localização original das imagens.

### 4.3. Guya.moe: Aplicação Prática e Integração com Cubari

Guya.moe é um site dedicado à leitura da série de mangá Kaguya-sama: Love is War. Sua característica mais notável é a utilização do Cubari como seu leitor de mangá principal. O próprio site do Guya.moe afirma: "Este site executa o Cubari: nosso leitor de mangá rápido, moderno e configurável, desenvolvido para Kaguya com recursos que você nunca viu em outro lugar."

#### 4.3.1. Motivações e Recursos do Guya.moe

O Guya.moe foi criado por fãs e para fãs, com o objetivo de oferecer uma experiência de leitura superior, diferenciando-se de outras plataformas:

*   **Ausência de Anúncios**: O site é totalmente livre de anúncios, priorizando a experiência do usuário sobre o lucro.

*   **Leitor Personalizado (Cubari)**: A equipe do Guya.moe desenvolveu o Cubari especificamente para suas necessidades, permitindo recursos avançados e uma leitura otimizada para Kaguya-sama.

*   **Pesquisa de Texto Completo**: Um recurso inovador que permite aos usuários pesquisar qualquer texto dentro de todo o mangá, facilitando a localização de cenas ou diálogos específicos.

*   **Garantia de Qualidade**: O Guya.moe seleciona e hospeda apenas as scanlations em inglês de mais alta qualidade, garantindo uma experiência de leitura superior.

#### 4.3.2. Relação com Traduções Oficiais e Não Oficiais

O Guya.moe hospeda traduções não oficiais, e a equipe justifica essa escolha por várias razões:

*   **Atraso das Edições Oficiais**: As edições oficiais impressas e digitais muitas vezes não acompanham o ritmo dos lançamentos semanais, e não há lançamento simultâneo para Kaguya-sama em plataformas como MangaPlus.

*   **Combate à Pirataria de Baixa Qualidade**: Ao oferecer uma alternativa de alta qualidade e sem anúncios, o Guya.moe busca desviar o tráfego de sites de pirataria que lucram com conteúdo de baixa qualidade e anúncios intrusivos.

*   **Promoção do Conteúdo Oficial**: Apesar de fornecer o conteúdo gratuitamente, o Guya.moe incentiva ativamente os leitores a apoiar o autor e os tradutores oficiais, acreditando que a disponibilidade de traduções semanais mantém o interesse e impulsiona as vendas dos volumes oficiais.

## 5. Conclusão

Cubari.moe, o conceito de Proxy Cubari e Guya.moe representam um ecossistema interconectado focado na otimização da experiência de leitura de mangás online. Cubari.moe atua como um leitor e proxy de imagem, consumindo dados JSON para apresentar o conteúdo. O "Proxy Cubari" refere-se a implementações que servem como intermediários para fornecer imagens ao leitor Cubari, com projetos open-source demonstrando as tecnologias Python e frameworks web envolvidos. Guya.moe é um exemplo proeminente da aplicação prática do Cubari, utilizando-o para oferecer uma plataforma de leitura de mangá de alta qualidade, sem anúncios e com recursos avançados, impulsionada pela comunidade de fãs. A sinergia entre esses componentes permite uma distribuição eficiente e uma experiência de usuário aprimorada para o consumo de mangás online.

**Autor:** Manus AI
**Última Atualização:** 22 de junho de 2025

