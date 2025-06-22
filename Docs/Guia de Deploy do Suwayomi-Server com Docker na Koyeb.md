# Guia de Deploy do Suwayomi-Server com Docker na Koyeb

**Por Manus AI**

Este guia abrangente detalha o processo de implantação do Suwayomi-Server utilizando uma imagem Docker na plataforma Koyeb. Ele combina o passo a passo prático de deploy com informações técnicas essenciais sobre a imagem Docker oficial, garantindo um setup completo e funcional.

## 1. Visão Geral do Suwayomi-Server e Docker

O Suwayomi-Server é um servidor de mangás que permite organizar e acessar seu conteúdo. Ele é distribuído como uma imagem Docker, o que simplifica sua implantação em diversos ambientes, incluindo plataformas de nuvem como a Koyeb.

### 1.1. O que é Docker?

Docker é uma plataforma que permite aos desenvolvedores empacotar aplicações e suas dependências em "contêineres" isolados. Esses contêineres são leves, portáteis e garantem que a aplicação funcione de forma consistente em qualquer ambiente, desde o desenvolvimento local até a produção na nuvem.

### 1.2. O que é Koyeb?

Koyeb é uma plataforma de deploy serverless que facilita a implantação de aplicações, incluindo aquelas empacotadas em Docker. Ela oferece escalabilidade automática, integração contínua e gerenciamento simplificado de serviços, tornando-a uma excelente escolha para hospedar o Suwayomi-Server.

### 1.3. Imagem Docker Oficial do Suwayomi-Server

A imagem Docker oficial do Suwayomi-Server (`ghcr.io/suwayomi/suwayomi-server:stable`) é otimizada para execução em contêineres. Ela já inclui todas as dependências necessárias e expõe o servidor na porta `4567` internamente. Os dados do Suwayomi-Server (biblioteca, configurações) são armazenados no diretório `/home/suwayomi/.local/share/Tachidesk` dentro do contêiner. Esta informação é crucial para configurar a persistência de dados.

## 2. Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter:

*   Uma conta no site da [Koyeb](https://www.koyeb.com/). (Recomendado: usar sua conta GitHub para inscrição/login).

## 3. Processo de Deploy na Koyeb

Siga os passos abaixo para implantar seu Suwayomi-Server na Koyeb:

### 3.1. Criar ou Acessar sua Conta na Koyeb

1.  Abra seu navegador e vá para [https://www.koyeb.com/](https://www.koyeb.com/).
2.  Faça login ou inscreva-se (a opção com GitHub é conveniente).

### 3.2. Iniciar a Criação do seu Serviço

1.  No painel principal da Koyeb (dashboard), clique em **"Create Service"**.
2.  Escolha a opção **"Docker Image"**.

### 3.3. Configurar a Imagem Docker

1.  No campo **"Docker Image"**, insira:
    ```
    ghcr.io/suwayomi/suwayomi-server:stable
    ```
2.  A **"Image Tag"** deve ser preenchida automaticamente com `stable`. Se não, digite `stable`.

### 3.4. Configurar os Detalhes do Serviço

1.  **Ports (Portas)**:
    *   Procure a seção "Exposed ports" ou "Configure ports".
    *   **Port (Porta de acesso público)**: Configure como `80`.
    *   **Protocol (Protocolo)**: Selecione `HTTP`.
    *   **Path (Caminho)**: Deixe como `/`.
    *   **Target (Porta interna da aplicação)**: Configure como `4567`.
        *   *Explicação:* O Suwayomi-Server dentro do Docker escuta na porta `4567`. A Koyeb direcionará o tráfego da porta pública (`80`, que será automaticamente gerenciada para HTTPS) para esta porta interna.
    *   Marque a opção **"Public"** ou o ícone de cadeado ao lado da porta `80` para que a Koyeb gerencie o SSL/HTTPS.

2.  **Health Checks (Verificações de Saúde)**:
    *   Configure o "TCP health check" para a porta `4567`.

3.  **Service Name (Nome do Serviço)**: Dê um nome descritivo (ex: `meu-suwayomi-server`). Este nome fará parte da sua URL pública.

4.  **Region (Região)**: Escolha a região mais próxima de você ou de seus usuários (ex: Washington, D.C., Frankfurt).

5.  **Instance Size (Tamanho da Instância)**:
    *   Para uso pessoal, o plano **"Free"** da Koyeb pode ser uma opção inicial (ex: 0.1 vCPU, 512MB RAM, 2GB Disk).
    *   **ATENÇÃO:** O plano gratuito **NÃO SUPORTA VOLUMES PERSISTENTES**. Isso significa que qualquer dado armazenado dentro do contêiner (biblioteca, configurações) **SERÁ PERDIDO** se o serviço for reiniciado, atualizado ou entrar em modo de espera por inatividade. Para persistência de dados, você precisará de um plano pago que suporte volumes.

### 3.5. Configurar o Armazenamento Persistente com Volumes (Para Planos Pagos)

Este passo é **CRUCIAL** para a persistência dos dados do seu Suwayomi-Server. Volumes na Koyeb fornecem armazenamento persistente entre deployments, mas possuem limitações importantes, especialmente por estarem em **Public Preview**.

**⚠️ ALERTA IMPORTANTE: Volumes em Public Preview e Suas Implicações ⚠️**
*   **Status:** Os Volumes da Koyeb estão atualmente em **Public Preview**.
*   **Recomendação de Uso:** São adequados **apenas para testes** no momento.
*   **BACKUP OBRIGATÓRIO:** **FAÇA BACKUP DE TODOS OS DADOS QUE VOCÊ NÃO PODE PERDER AO USAR VOLUMES.** A Koyeb adverte que, por serem locais e vinculados a uma única máquina, os volumes podem falhar. Não há redundância automática, e a tolerância a falhas (incluindo o uso de Snapshots para minimizar perdas) é de sua responsabilidade.
*   **Downtime:** Serviços com volumes anexados podem experienciar downtime durante o processo de redeployment, enquanto o volume é desanexado da versão antiga e anexado à nova.

**Condições e Limitações para Usar Volumes na Koyeb:**

1.  **Tipo de Instância (MUITO IMPORTANTE):** Volumes **SÓ PODEM** ser anexados a instâncias do tipo **"Standard"** ou **"GPU"**. **NÃO SÃO SUPORTADOS** em instâncias "Free" nem em instâncias "eco-*". Isso significa que para usar volumes e ter persistência de dados, você **PRECISARÁ OBRIGATORIAMENTE DE UM PLANO PAGO**.
2.  **Região do Serviço e do Volume:** Volumes estão atualmente disponíveis **apenas nas regiões Washington, D.C. (was) e Frankfurt (fra)**. Seu serviço e o volume devem estar na mesma dessas regiões.
3.  **Tamanho do Volume:** O tamanho de um volume deve ser entre **1 GB e 10 GB**.
4.  **Escala do Serviço:** Volumes atualmente só funcionam com Serviços configurados para rodar com **uma única instância**.
5.  **Mobilidade do Volume:** Uma vez que um volume é anexado a um Serviço, ele **não pode ser desanexado ou movido** para outro Serviço, a menos que o Serviço original seja excluído.

**Como Configurar um Volume (Assumindo Plano e Região Compatíveis):**

1.  Na página de configuração do seu Serviço na Koyeb, procure pela seção **"Volumes"**.
2.  Clique para **"Add Volume"** ou selecione um volume existente.
3.  Configure os detalhes do volume:
    *   **Name (Nome do Volume)**: Dê um nome descritivo (ex: `data-suwayomi-server`).
    *   **Size (Tamanho)**: Escolha um tamanho entre 1GB e 10GB.
    *   **Region (Região)**: Certifique-se que é a mesma do seu serviço.
4.  Configure o **Path in container (Caminho de montagem dentro do contêiner)**:
    *   Digite exatamente:
        ```
        /home/suwayomi/.local/share/Tachidesk
        ```
    *   *Explicação:* Este é o diretório padrão onde o Suwayomi-Server armazena todos os seus dados. Mapear este caminho para um volume persistente garante que seus dados sobrevivam a reinicializações e redeployments.

### 3.6. Iniciar o Deploy

1.  Revise todas as configurações.
2.  Clique no botão **"Deploy"** ou **"Create Service"**.
3.  A Koyeb iniciará o processo de deploy. Você pode acompanhar o progresso e os logs no painel.

### 3.7. Obter sua URL Pública

1.  Após o deploy, a Koyeb exibirá uma **URL pública** (ex: `https://<nome-do-seu-servico>.<nome-da-sua-organizacao-koyeb>.koyeb.app`).
2.  **Copie esta URL e guarde-a**, pois você precisará dela para acessar seu Suwayomi-Server.

## 4. Configurações Avançadas e Variáveis de Ambiente

O Suwayomi-Server em Docker pode ser configurado através de variáveis de ambiente. Estas variáveis sobrescrevem os valores padrão e podem ser definidas na seção de variáveis de ambiente da Koyeb ao configurar seu serviço.

| Variável | Padrão do Servidor | Descrição |
|:---|:---|:---|
| **TZ** | `Etc/UTC` | Fuso horário do contêiner. |
| **BIND_IP** | `0.0.0.0` | Interface na qual o servidor escutará dentro do contêiner. |
| **BIND_PORT** | `4567` | Porta que o Suwayomi escutará. |
| **SOCKS_PROXY_ENABLED** | `false` | Se o Suwayomi se conectará através de um proxy SOCKS5. |
| **SOCKS_PROXY_HOST** | ` ` | Host TCP do proxy SOCKS5. |
| **SOCKS_PROXY_PORT** | ` ` | Porta do proxy SOCKS5. |
| **DOWNLOAD_AS_CBZ** | `false` | Se o mangá deve ser salvo no disco no formato CBZ. |
| **BASIC_AUTH_ENABLED** | `false` | Se o Suwayomi requer Autenticação Básica HTTP para acesso. |
| **BASIC_AUTH_USERNAME** | ` ` | Nome de usuário para login. |
| **BASIC_AUTH_PASSWORD** | ` ` | Senha para login. |
| **DEBUG** | `false` | Habilita logging extra. |
| **WEB_UI_ENABLED** | `true` | Se o servidor deve servir uma interface web. |
| **WEB_UI_FLAVOR** | `WebUI` | "WebUI" ou "Custom". |
| **WEB_UI_CHANNEL** | `stable` | Versão da interface web a ser usada ("bundled", "stable", "preview"). |
| **WEB_UI_UPDATE_INTERVAL** | `23` | Frequência (horas) de verificação de atualizações da interface web (0 para desabilitar). |
| **AUTO_DOWNLOAD_CHAPTERS** | `false` | Se novos capítulos devem ser baixados automaticamente. |
| **AUTO_DOWNLOAD_EXCLUDE_UNREAD** | `true` | Ignorar downloads automáticos de capítulos não lidos. |
| **AUTO_DOWNLOAD_NEW_CHAPTERS_LIMIT** | `0` | Limite de capítulos baixados não lidos (0 para desabilitar). |
| **AUTO_DOWNLOAD_IGNORE_REUPLOADS** | `false` | Decidir se reenvios devem ser ignorados durante o download automático. |
| **EXTENSION_REPOS** | `[]` | Repositórios de extensão adicionais. |
| **MAX_SOURCES_IN_PARALLEL** | `6` | Quantas fontes podem fazer requisições em paralelo (1-20). |
| **UPDATE_EXCLUDE_UNREAD** | `true` | Excluir mangás não lidos das atualizações. |
| **UPDATE_EXCLUDE_STARTED** | `true` | Excluir mangás não iniciados das atualizações. |
| **UPDATE_EXCLUDE_COMPLETED** | `true` | Excluir mangás concluídos das atualizações. |
| **UPDATE_INTERVAL** | `12` | Intervalo (horas) para atualização global (0 para desabilitar). |
| **UPDATE_MANGA_INFO** | `false` | Se as informações do mangá devem ser atualizadas junto com os capítulos. |
| **BACKUP_TIME** | `00:00` | Hora do dia para backup automático. |
| **BACKUP_INTERVAL** | `1` | Intervalo (dias) para backup automático (0 para desabilitar). |
| **BACKUP_TTL** | `14` | Tempo (dias) para manter arquivos de backup. |
| **FLARESOLVERR_ENABLED** | `false` | Se o FlareSolverr está habilitado. |
| **FLARESOLVERR_URL** | `http://localhost:8191` | URL da instância do FlareSolverr. |
| **FLARESOLVERR_TIMEOUT** | `60` | Tempo limite (segundos) para o FlareSolverr. |
| **FLARESOLVERR_SESSION_NAME** | `suwayomi` | Nome da sessão para o FlareSolverr. |
| **FLARESOLVERR_SESSION_TTL** | `15` | Tempo de vida para a sessão do FlareSolverr. |
| **OPDS_USE_BINARY_FILE_SIZES** | `false` | Se os tamanhos dos arquivos devem ser exibidos em binário. |
| **OPDS_ITEMS_PER_PAGE** | `50` | Quantos itens mostrar por página (10-5000). |

*Nota: Para a maioria das configurações, você não precisará usar variáveis de ambiente, pois as configurações podem ser alteradas através da interface web do Suwayomi-Server após o deploy.*

## 5. Visualização de Logs

Os logs do Suwayomi-Server são enviados para `stdout` dentro do contêiner Docker. Na Koyeb, você pode visualizar os logs diretamente no painel do seu serviço, o que é útil para monitorar o status e depurar problemas. Se você estiver executando o Docker localmente, pode usar `docker logs --tail=1000 <nome do contêiner>`.

**Autor:** Manus AI
**Última Atualização:** 22 de junho de 2025

