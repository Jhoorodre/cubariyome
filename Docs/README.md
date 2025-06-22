# Cubari Proxy

Uma aplicação web moderna e gratuita para leitura de obras, criada para oferecer a melhor experiência de navegação possível. O Cubari Proxy conecta você às suas fontes favoritas de conteúdo através de uma interface limpa, rápida e intuitiva, completamente em português brasileiro. Construído com uma arquitetura distribuída, separando frontend, backend (API Gateway), microserviço de fontes e armazenamento de dados do usuário.

## ✨ O que é o Cubari Proxy?

O Cubari Proxy é como um "navegador especial" para obras que:
- **Reúne várias fontes de conteúdo** em um só lugar, obtidas através de um microserviço dedicado.
- **Remove anúncios** e oferece uma experiência limpa.
- **Funciona em qualquer dispositivo** - celular, tablet ou computador.
- **Salva seu progresso** automaticamente na nuvem, em um armazenamento que você controla.
- **É completamente gratuito** e sem propagandas.

## 🌟 Principais Funcionalidades

### 📚 **Navegação Simples**
- **Descoberta**: Veja as obras mais populares e novos lançamentos.
- **Busca Inteligente**: Encontre qualquer obra em segundos.
- **Favoritos**: Salve suas obras preferidas.
- **Histórico**: Continue lendo de onde parou.

### 🎨 **Interface Moderna**
- **Tema Escuro/Claro**: Escolha o que for mais confortável para você.
- **Design Responsivo**: Funciona perfeitamente em qualquer tela.
- **Carregamento Rápido**: Otimizado para economizar seus dados.

### ☁️ **Backup na Nuvem (5apps)**
- **Sincronização Automática**: Seus favoritos e histórico salvos na nuvem.
- **Acesso de Qualquer Lugar**: Continue lendo em qualquer dispositivo.
- **Segurança Total**: Seus dados protegidos e privados.
- **100% Gratuito**: Sem custos para o usuário.

## 📖 Fontes de Conteúdo Disponíveis

A lista de fontes de conteúdo disponíveis é obtida dinamicamente através do backend (API Gateway), que se comunica com o microserviço Suwayomi-Server. As fontes listadas abaixo são exemplos e podem variar dependendo da configuração do Suwayomi-Server.

### 🔥 **Fontes Oficiais**

* **MANGA Plus by SHUEISHA**: Publicadora oficial da Shueisha, uma das maiores editoras de mangá do Japão.
* **Comikey**: Uma plataforma conhecida por licenciar e traduzir oficialmente mangás, manhuas e webtoons.
* **MangaToon (Limited)**: É uma plataforma que licencia conteúdo diretamente dos criadores e estúdios.
* **Webtoons**: Uma das maiores plataformas de publicação de webcomics, com muito conteúdo original e licenciado.

### 🌍 **Idiomas Suportados**

Atualmente, a disponibilidade de idiomas depende das extensões configuradas no Suwayomi-Server. Estamos trabalhando para adicionar mais fontes em português brasileiro e outros idiomas.

## ☁️ Como Funciona o Backup na Nuvem (5apps)

### 🤔 **O que é o 5apps?**

O 5apps é um serviço **gratuito** que oferece armazenamento na nuvem seguindo o padrão **remoteStorage**. Pense nele como um "Google Drive" especialmente feito para aplicações web que respeitam sua privacidade. É a **fonte da verdade** para os dados do usuário (biblioteca, histórico, configurações).

### 🔐 **Por que é Seguro?**

- **Seus dados são seus**: Apenas você tem acesso aos seus favoritos e histórico.
- **Criptografia**: Tudo é protegido durante a transmissão.
- **Sem rastreamento**: O 5apps não monitora o que você lê.
- **Código aberto**: Toda a tecnologia é transparente e auditável.

### 📱 **Como Configurar (Passo a Passo)**

1. **Acesse as Configurações** no Cubari Proxy.
2. **Clique em "Connect"** na seção "Armazenamento Remoto".
3. **Escolha "5apps"** como seu provedor.
4. **Crie uma conta gratuita** no 5apps (se não tiver).
5. **Autorize a conexão** e pronto!

### ✨ **Benefícios do Backup**

- **Sincronização Automática**: Favoritos e histórico salvos automaticamente.
- **Acesso Universal**: Continue lendo em qualquer dispositivo.
- **Sem Perda de Dados**: Mesmo se limpar o navegador, seus dados estão seguros.
- **Offline**: Funciona mesmo sem internet (dados ficam sincronizados quando voltar online).

## 💻 Para Desenvolvedores

### 🚀 **Tecnologias Utilizadas**

Este projeto utiliza uma combinação de tecnologias para o frontend, backend e microserviços:

*   **Frontend:** React 16.13.1, TypeScript, Tailwind CSS, Headless UI, i18next.
*   **Backend (API Gateway):** Django, Python.
*   **Banco de Dados (para Backend):** PostgreSQL (recomendado para deploy, usado para caching e dados operacionais do backend).
*   **Microserviço de Fontes:** Suwayomi-Server.
*   **Containerização:** Docker (para Suwayomi-Server).
*   **Deploy:** Vercel (para Frontend e Backend Serverless), Koyeb (para Suwayomi-Server).
*   **Armazenamento de Dados do Usuário:** remoteStorage (implementado via 5apps).

### 📁 **Estrutura do Projeto**

O projeto é um monorepo com a seguinte estrutura principal:

```
cubariyome/
├── src/                 # Código do Frontend (React)
│   ├── components/      # Componentes reutilizáveis da UI
│   ├── containers/      # Páginas principais da aplicação
│   ├── context/         # Contextos React (ProviderContext, etc.)
│   ├── hooks/           # Hooks personalizados
│   ├── locales/         # Traduções
│   ├── services/        # Serviços (GraphQLService, ProviderService)
│   ├── style/           # Estilos globais CSS
│   ├── types/           # Definições de tipos (TypeScript)
│   └── utils/           # Utilitários e helpers
├── gateway_service/     # Código do Backend (Django API Gateway)
│   ├── api/             # Aplicação Django 'api'
│   ├── backend/         # Configurações principais do projeto Django
│   ├── logs/            # Logs
│   ├── manage.py        # Utilitário de linha de comando do Django
│   ├── requirements.txt # Dependências Python
│   └── ... outros arquivos de configuração/deploy ...
├── Docs/                # Documentação do projeto
├── public/              # Arquivos estáticos do Frontend
├── .gitignore           # Arquivos e diretórios ignorados pelo Git
├── package.json         # Dependências e scripts do Frontend
├── tsconfig.json        # Configuração TypeScript
├── vercel.json          # Configuração de Deploy no Vercel
└── ... outros arquivos de configuração ...
```

## 🛠️ Instalação e Desenvolvimento Local

### **Pré-requisitos**
- Node.js 14+ instalado
- npm ou yarn
- Python 3.8+ instalado
- pip ou pipenv/poetry (recomendado para gerenciar dependências Python)
- Docker (para rodar o Suwayomi-Server localmente, opcional mas recomendado)

### **Configuração do Backend (Django)**

1.  Navegue até a pasta do backend:
    ```bash
    cd gateway_service
    ```
2.  Crie e ative um ambiente virtual Python (recomendado):
    ```bash
    # Usando venv
    python -m venv .venv
    ./.venv/Scripts/activate # No Windows
    # source .venv/bin/activate # No macOS/Linux
    ```
3.  Instale as dependências Python:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure as variáveis de ambiente necessárias para o Django (por exemplo, em um arquivo `.env` na pasta `gateway_service`). Pelo menos a `SECRET_KEY` é obrigatória.
5.  Execute as migrações do banco de dados (SQLite para desenvolvimento local):
    ```bash
    python manage.py migrate
    ```
6.  (Opcional) Crie um superusuário:
    ```bash
    python manage.py createsuperuser
    ```

### **Configuração do Frontend (React)**

1.  Navegue de volta para a raiz do projeto e depois para a pasta do frontend:
    ```bash
    cd ..
    cd src
    ```
2.  Instale as dependências Node.js:
    ```bash
    npm install # ou yarn install
    ```

### **Configuração do Suwayomi-Server (Local)**

Para desenvolvimento local, você precisará ter uma instância do Suwayomi-Server rodando. A forma mais fácil é usando Docker:

1.  Consulte a documentação oficial do Suwayomi-Server para obter a imagem Docker e instruções de execução.
2.  Execute o contêiner Docker do Suwayomi-Server, expondo a porta necessária (geralmente 8080 ou 80).
3.  Certifique-se de que a URL do Suwayomi-Server local esteja configurada corretamente no backend Django (provavelmente via variável de ambiente).

### **Executando Localmente**

1.  Inicie o backend Django (na pasta `gateway_service` com o ambiente virtual ativado):
    ```bash
    python manage.py runserver
    ```
2.  Inicie o frontend React (na pasta `src`):
    ```bash
    npm start # ou yarn start
    ```
3.  Certifique-se de que o Suwayomi-Server esteja rodando e acessível pelo backend Django.

## 🌐 Deploy e Configuração

Este projeto é um monorepo projetado para ser implantado com o frontend e o backend (API Gateway) no **Vercel**, enquanto o microserviço **Suwayomi-Server** é implantado separadamente (conforme roadmap, no **Koyeb**).

### **Deploy no Vercel (Frontend + Backend Serverless)**

1.  **Conecte** seu repositório Git ao Vercel.
2.  O Vercel detectará o monorepo. Você precisará configurar:
    *   **Root Directory:** Deixe vazio ou aponte para a raiz do monorepo.
    *   **Build & Output Settings:** Configure as configurações de build para o frontend (`src`) e o backend (`gateway_service`) como Serverless Functions. Isso geralmente é feito através do arquivo `vercel.json` na raiz do projeto.
3.  **Banco de Dados (PostgreSQL):** Para o backend Django funcionar no Vercel, você **precisa** usar um banco de dados PostgreSQL **externo/hospedado**. O SQLite (`db.sqlite3`) **não funciona** em ambientes Serverless persistentes.
    *   Você pode usar o serviço de banco de dados PostgreSQL do Vercel ou outro provedor (AWS RDS, Supabase, ElephantSQL, etc.).
    *   Consulte o guia **[Guia: Configurando PostgreSQL do Vercel com Django](Docs/vercel_postgresql_guide.md)** para detalhes sobre como configurar o banco de dados e as variáveis de ambiente no Vercel e no seu `settings.py` do Django.
4.  **Variáveis de Ambiente:** Configure todas as variáveis de ambiente necessárias para o Django (SECRET_KEY, credenciais do banco de dados, URL do Suwayomi-Server, etc.) nas configurações do projeto Vercel.
5.  **Deploy Automático:** Após a configuração inicial, o Vercel fará o deploy automaticamente a cada push para as branches configuradas.

### **Deploy do Suwayomi-Server (Koyeb ou Similar)**

O Suwayomi-Server deve ser implantado separadamente. O roadmap sugere o Koyeb, mas outras plataformas que suportam contêineres Docker também podem ser usadas.

1.  Prepare o Suwayomi-Server para deploy (geralmente uma imagem Docker).
2.  Implante o contêiner Docker na plataforma escolhida (Koyeb, Railway, etc.).
3.  Obtenha a URL pública do Suwayomi-Server implantado.
4.  Configure esta URL como uma variável de ambiente no seu projeto Vercel (para o backend Django saber onde encontrar o Suwayomi).

### **Alternativa de Deploy: VPS**

Como alternativa ao Vercel Serverless para o backend, você pode implantar o backend Django em uma **VPS (Virtual Private Server)**. Nesta configuração:

*   Você pode instalar o PostgreSQL diretamente na VPS ou conectar a um serviço externo.
*   O Suwayomi-Server ainda seria implantado separadamente (na mesma VPS ou em outro serviço).
*   O frontend React pode ser construído e servido estaticamente pela mesma VPS ou continuar no Vercel apontando para a API do backend na VPS.

Esta opção oferece mais controle, mas exige mais gerenciamento manual do servidor.

## ❓ Dúvidas Frequentes

### **Como habilitar opções de filtragem de conteúdo?**
Consulte as configurações da aplicação para opções de filtragem de conteúdo.

### **Meus favoritos sumiram, o que fazer?**
- Configure o **backup na nuvem** para evitar perda de dados.
- Verifique se está logado no mesmo provedor (5apps).
- Limpar cache do navegador pode causar perda de dados locais.

### **O site não está carregando obras**
- Verifique sua conexão com a internet.
- Algumas fontes (via Suwayomi-Server) podem estar temporariamente indisponíveis.
- Verifique se o backend (API Gateway) e o Suwayomi-Server estão rodando e acessíveis.
- Tente uma fonte diferente.

### **Como contribuir com o projeto?**
1. Faça um **Fork** do repositório.
2. Crie uma **branch** para sua funcionalidade.
3. Faça suas mudanças e **commit**.
4. Envie um **Pull Request**.
5. Aguarde a revisão da equipe.

## 🤝 Comunidade e Suporte

### **Precisa de Ajuda?**
- **Chat de Feedback**: Use o ícone de chat no site.
- **Discord**: [Entre em nossa comunidade](https://discord.gg/wwD2xTbQxe).
- **GitHub Issues**: Reporte bugs e problemas técnicos.

### **Projetos Relacionados**
- [**Cubari.moe**](https://cubari.moe/) - Projeto original e inspiração
- [**Paperback**](https://paperback.moe/) - App oficial para iOS
- [**5apps**](https://5apps.com/) - Serviço de armazenamento na nuvem
- [**Suwayomi-Server**](https://github.com/Suwayomi/Suwayomi-Server) - Microserviço de fontes utilizado

## 📱 Dicas de Uso

### **Melhor Experiência**
- **Configure o backup** para não perder seus dados.
- **Use tema escuro** para leitura noturna.
- **Adicione aos favoritos** do navegador para acesso rápido.
- Consulte as configurações da aplicação para opções de filtragem de conteúdo.

### **Economizar Dados**
- O site é otimizado para usar poucos dados móveis.
- Imagens são comprimidas automaticamente.
- Cache inteligente reduz downloads repetidos.

## 🔧 Notas Técnicas

### **Para Desenvolvedores**

```javascript
// Para habilitar opções de filtragem de conteúdo localmente durante desenvolvimento no frontend
localStorage.setItem("hentai", true);
```

### **Problemas Comuns**
- **Erro de dependências Node.js**: Use `npm install --legacy-peer-deps` se encontrar problemas com versões de dependências.
- **WebSocket bloqueado**: Extensões do navegador ou firewalls podem interferir.
- **Build falha**: Verifique versões do Node.js (recomendado 14+) e Python.
- **Problemas de conexão com Backend/Suwayomi**: Verifique as URLs configuradas e se os serviços estão rodando e acessíveis.

---

Este projeto é **independente** e **distinto** do cubari.moe principal. Desenvolvido com foco em fontes de qualidade e experiência do usuário.

**⚠️ Importante**: Este projeto não hospeda nem distribui conteúdo protegido por direitos autorais. Funciona apenas como uma interface para fontes já disponíveis publicamente na internet, através da integração com o Suwayomi-Server.

---

**🎯 Missão**: Oferecer a melhor experiência de leitura de obras em português brasileiro, de forma gratuita e acessível para todos.
