# Relatório Técnico Detalhado: Cubari.moe, Proxy Cubari e Guya.moe

Este relatório visa fornecer uma análise aprofundada sobre Cubari.moe, o conceito de Proxy Cubari e Guya.moe, abrangendo suas funcionalidades, arquitetura, tecnologias subjacentes e a interconexão entre esses serviços.

## 1. Cubari.moe: O Leitor de Mangá e Proxy de Imagem

Cubari.moe é uma plataforma online que funciona primariamente como um proxy de imagem e um leitor de mangá otimizado. Sua principal função é exibir conteúdo visual (especialmente imagens de mangás) proveniente de outras fontes na internet, apresentando-o em uma interface de leitura aprimorada e configurável. É crucial entender que o Cubari.moe não hospeda os arquivos de imagem diretamente; ele atua como um intermediário, buscando as imagens de seus locais de origem e as servindo através de sua própria interface.

### 1.1. Documentação e Funcionamento

De acordo com a documentação disponível (notavelmente em wotaku.wiki), o Cubari.moe opera lendo um arquivo JSON. Este arquivo contém os links diretos para as imagens do mangá, bem como metadados adicionais (como títulos de capítulos, números de volume, etc.). Para que o sistema funcione, as imagens precisam ser hospedadas em um serviço externo (como o Image Chest, sugerido na documentação), e o arquivo JSON deve ser gerado e formatado corretamente.

#### 1.1.1. Estrutura de Arquivos e Metadados

Para a correta ingestão de dados pelo Cubari, a organização dos arquivos e pastas é padronizada:

- **Nomenclatura de Pastas**: As pastas que contêm os capítulos do mangá devem seguir o formato `V# Ch# Título`. O número do volume (`V#`) e o título do capítulo são opcionais, mas o número do capítulo (`Ch#`) é um requisito obrigatório para a identificação e ordenação.

- **Ordenação de Imagens**: As imagens dentro de cada pasta de capítulo devem ser nomeadas de forma que, quando ordenadas alfabeticamente, sigam a sequência correta de leitura (ex: `page001.jpg`, `page002.jpg`, etc.).

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

#### 1.1.2. Script Kaguya: Geração do JSON

Para automatizar a criação do arquivo JSON necessário para o Cubari, é utilizado um script baseado em Python chamado Kaguya. Este script facilita o processo de coleta de informações e links das imagens, formatando-os no JSON que o Cubari consome. O fluxo de trabalho do script Kaguya inclui:

1. **Instalação do Python**: O script requer uma instalação Python (versão 3.6.5+ é recomendada).
2. **Execução**: O script é executado via linha de comando (`python kaguya.py`).
3. **Entrada de Dados**: O usuário fornece o caminho para a pasta do mangá organizada conforme a estrutura descrita acima.
4. **Opções de Upload**: O script oferece opções para processar todos os capítulos, apenas novos capítulos, capítulos específicos, ou apenas atualizar metadados no GitHub.

Após a execução bem-sucedida, o script Kaguya gera três arquivos principais:

- **`titulo_do_quadrinho.json`**: Este é o arquivo JSON principal que o Cubari.moe lê. Ele contém todos os links dos capítulos e os metadados associados, permitindo que o leitor exiba o mangá de forma organizada.

- **`imgchest_upload_record.txt`**: Um registro das pastas que foram carregadas com sucesso. Este arquivo é útil para rastrear o progresso e identificar capítulos que falharam no upload, permitindo que sejam processados novamente.

- **`cubari_urls.txt`**: Um log de todos os uploads realizados através do script Kaguya, fornecendo um histórico das operações.

### 1.2. Análise do Código (Repositório eNV25/cubari)

O repositório GitHub eNV25/cubari oferece uma perspectiva sobre os componentes de dados e automação associados ao Cubari.moe. Embora não seja o código-fonte completo do leitor em si (que está em reescrita e não é open-source no momento), ele revela a natureza orientada a dados da plataforma.

#### 1.2.1. Conteúdo do Repositório

- **README.md**: Fornece uma breve introdução e exemplos de links para o Cubari.moe.

- **Arquivos .json** (ex: `onepiece.json`, `onepiece_cover.json`): A presença desses arquivos JSON corrobora a informação de que o Cubari.moe consome dados estruturados. Esses arquivos são os dados que o Cubari.moe interpreta para apresentar o mangá, contendo a sequência de capítulos, URLs das imagens e outros metadados de leitura.

- **Scripts .sh** (ex: `onepiecechapters.sh`, `tcbscans.sh`): A existência de scripts shell indica a automação na preparação e coleta de dados. É provável que esses scripts sejam utilizados para:
  - `onepiecechapters.sh`: Organizar e processar capítulos de mangás específicos (como One Piece), garantindo que estejam no formato compatível com o Cubari.
  - `tcbscans.sh`: Coletar e integrar scans de grupos de scanlation (como TCB Scans), reforçando o papel do Cubari como um agregador de conteúdo de fontes externas.

#### 1.2.2. Implicações da Análise do Código

- **Natureza do Cubari**: O repositório confirma que o Cubari.moe é uma ferramenta que consome dados estruturados (JSON) para apresentar mangás. Ele não é um host de conteúdo, mas sim um leitor que se integra com fontes de dados externas.

- **Automação**: Os scripts shell sugerem um nível de automação na preparação e atualização do conteúdo. Isso é fundamental para manter o Cubari.moe atualizado com os lançamentos de mangás.

- **Flexibilidade**: A abordagem baseada em JSON permite que o Cubari seja flexível e possa ser adaptado para ler mangás de diversas fontes, desde que os dados sejam formatados corretamente.

## 2. Proxy Cubari: Implementação e Detalhes Técnicos

O termo "Proxy Cubari" pode se referir tanto à funcionalidade de proxy de imagem do Cubari.moe quanto a implementações separadas de proxies que se integram ao ecossistema Cubari. O repositório subject-f/cubarimoe no GitHub é um exemplo prático de um projeto que implementa um proxy de imagem compatível com o leitor Cubari.

### 2.1. Pré-requisitos e Instalação (Baseado em subject-f/cubarimoe)

Este projeto demonstra as tecnologias e etapas necessárias para configurar um proxy Cubari:

**Pré-requisitos:**
- `git`: Para clonagem do repositório.
- `python 3.6.5+`: Linguagem de programação principal.
- `pip`: Gerenciador de pacotes Python.
- `virtualenv`: Para isolamento de dependências.

**Etapas de Instalação (Resumidas):**
1. Criação de um ambiente virtual (`virtualenv`).
2. Clonagem do código-fonte do cubarimoe para o ambiente virtual.
3. Ativação do ambiente virtual.
4. Instalação das dependências listadas em `requirements.txt`.
5. Configuração de uma SECRET_KEY para segurança.
6. Geração de ativos padrão (`python3 init.py`).
7. Criação de um usuário administrador (`python3 manage.py createsuperuser`).
8. Execução do servidor de desenvolvimento (`python3 manage.py runserver`).

### 2.2. Tecnologias e Estrutura

A análise dos pré-requisitos e do processo de instalação revela as seguintes tecnologias e aspectos estruturais:

- **Python**: É a linguagem central para a lógica do proxy, processamento de imagens e interação com o leitor Cubari.

- **Framework Web (Django/Flask)**: A presença de `manage.py` e comandos como `runserver` e `createsuperuser` sugere fortemente o uso de um framework web Python (como Django ou Flask) para gerenciar rotas, banco de dados e a lógica do servidor.

- **Proxy de Imagem**: O projeto atua como um intermediário. Ele intercepta requisições de imagens, as processa (otimização, redimensionamento, adição de cabeçalhos) e as serve ao cliente. Isso é vital para o Cubari.moe, que não armazena imagens diretamente.

- **Integração com o Leitor Cubari**: O proxy é projetado para funcionar em conjunto com a interface de leitura do Cubari.moe, formatando as URLs das imagens de forma que o leitor possa interpretá-las facilmente.

**Arquivos Relevantes:**
- `requirements.txt`: Lista todas as bibliotecas Python necessárias, oferecendo insights sobre as tecnologias específicas (ex: bibliotecas de processamento de imagem, frameworks web).
- `config.json`: Provavelmente contém configurações do proxy, como URLs de fontes de imagem ou chaves de API.
- `proxy/`: Diretório que provavelmente contém a lógica central do proxy.
- `reader/`: Pode conter arquivos relacionados à integração com o leitor Cubari ou componentes da interface do usuário.

### 2.3. Funcionamento do Proxy

O proxy Cubari, neste contexto, age como uma ponte entre as fontes de imagem originais (onde as imagens de mangá são hospedadas) e o leitor Cubari.moe. Quando o leitor Cubari solicita uma imagem, a requisição é direcionada ao proxy. O proxy, por sua vez, busca a imagem da fonte original, realiza qualquer processamento necessário e a entrega ao leitor. Esse mecanismo permite que o Cubari.moe ofereça uma experiência de leitura consistente e otimizada, independentemente da localização original das imagens.

## 3. Guya.moe: Aplicação Prática e Integração com Cubari

Guya.moe é um site dedicado à leitura da série de mangá Kaguya-sama: Love is War. Sua característica mais notável é a utilização do Cubari como seu leitor de mangá principal. O próprio site do Guya.moe afirma: "Este site executa o Cubari: nosso leitor de mangá rápido, moderno e configurável, desenvolvido para Kaguya com recursos que você nunca viu em outro lugar."

### 3.1. Motivações e Recursos do Guya.moe

O Guya.moe foi criado por fãs e para fãs, com o objetivo de oferecer uma experiência de leitura superior, diferenciando-se de outras plataformas:

- **Ausência de Anúncios**: O site é totalmente livre de anúncios, priorizando a experiência do usuário sobre o lucro.

- **Leitor Personalizado (Cubari)**: A equipe do Guya.moe desenvolveu o Cubari especificamente para suas necessidades, permitindo recursos avançados e uma leitura otimizada para Kaguya-sama.

- **Pesquisa de Texto Completo**: Um recurso inovador que permite aos usuários pesquisar qualquer texto dentro de todo o mangá, facilitando a localização de cenas ou diálogos específicos.

- **Garantia de Qualidade**: O Guya.moe seleciona e hospeda apenas as scanlations em inglês de mais alta qualidade, garantindo uma experiência de leitura superior.

### 3.2. Relação com Traduções Oficiais e Não Oficiais

O Guya.moe hospeda traduções não oficiais, e a equipe justifica essa escolha por várias razões:

- **Atraso das Edições Oficiais**: As edições oficiais impressas e digitais muitas vezes não acompanham o ritmo dos lançamentos semanais, e não há lançamento simultâneo para Kaguya-sama em plataformas como MangaPlus.

- **Combate à Pirataria de Baixa Qualidade**: Ao oferecer uma alternativa de alta qualidade e sem anúncios, o Guya.moe busca desviar o tráfego de sites de pirataria que lucram com conteúdo de baixa qualidade e anúncios intrusivos.

- **Promoção do Conteúdo Oficial**: Apesar de fornecer o conteúdo gratuitamente, o Guya.moe incentiva ativamente os leitores a apoiar o autor e os tradutores oficiais, acreditando que a disponibilidade de traduções semanais mantém o interesse e impulsiona as vendas dos volumes oficiais.

## 4. Conclusão

Cubari.moe, o conceito de Proxy Cubari e Guya.moe representam um ecossistema interconectado focado na otimização da experiência de leitura de mangás online. Cubari.moe atua como um leitor e proxy de imagem, consumindo dados JSON para apresentar o conteúdo. O "Proxy Cubari" refere-se a implementações que servem como intermediários para fornecer imagens ao leitor Cubari, com projetos open-source demonstrando as tecnologias Python e frameworks web envolvidos. Guya.moe é um exemplo proeminente da aplicação prática do Cubari, utilizando-o para oferecer uma plataforma de leitura de mangá de alta qualidade, sem anúncios e com recursos avançados, impulsionada pela comunidade de fãs. A sinergia entre esses componentes permite uma distribuição eficiente e uma experiência de usuário aprimorada para o consumo de mangás online.