# Mapa do código do Cordel dos Elementos

## Entrada e navegação

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da página inicial, catálogo dos 118 elementos, controles e diálogos. |
| `assets/app.js` | Busca e combinação dos filtros de categoria e estado físico. |
| `assets/home.js` | Menu compartilhado da página inicial e das fichas, fechamento e restauração de foco. |
| `assets/experience.js` | Troca Varal/Tabela, sorteio de elemento, instalação e registro do service worker. |
| `assets/book-intro.js` | Reprodução da abertura, encerramento, pular e recuperação em caso de falha. |
| `assets/book-intro.css` | Apresentação e transições da abertura. |

## Identidade visual e acessibilidade

| Arquivo | Responsabilidade |
| --- | --- |
| `assets/style.css` | Base visual, componentes compartilhados, menu e rodapé. |
| `assets/cordel-collection.css` | Folhetos do Varal, tabela clássica, legenda e adaptação por largura. |
| `assets/cordel-collection.js` | Cordões, marcadores de grupos/períodos, legenda interativa, card de exemplo e setas. |
| `assets/accessibility.js` | Preferências, temas, tamanho do texto, movimento, leitura e carregamento do VLibras. |

As regras CSS permanecem na ordem original. Há ajustes posteriores que sobrescrevem declarações anteriores; removê-los ou agrupá-los por aparência sem revisar a cascata pode mudar o site.

## Fichas e impressão

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `elementos/<nome>/index.html` | Conteúdo estático da ficha, referências e dados incorporados do elemento. |
| `assets/element-model.js` | Formatação científica, conversão de unidades e critérios de comparação. |
| `assets/element-page.js` | Interações da ficha e composição do folheto A4 com as artes aprovadas. |
| `assets/element-page.css` | Layout da ficha, controles e regras de impressão. |
| `assets/colecao/` | Ilustrações e ícones usados nos cards. |
| `assets/folhetos/cenas/` | Quadros aprovados de impressão; não substituir por imagens do catálogo. |

Os tratamentos específicos de elementos e de artes permanecem preservados. Uma eventual simplificação dessa composição exige outra tarefa, com comparação visual e autorização; não faz parte da organização de escrita.

## Dados e geração

| Arquivo | Responsabilidade |
| --- | --- |
| `assets/elementos.json` | Dados científicos de base. |
| `data/elementos-editoriais.json` | Identidade editorial, estados físicos e referências. |
| `data/contextos-elementos.json` | Textos de contexto das fichas. |
| `assets/elementos-fichas.json` | Modelo consolidado usado nas comparações. |
| `data/folhetos-impressao-manifesto.json` | Relação de folhetos e artes de impressão. |
| `scripts/build-elements.py` | Gera as 118 fichas sem mudar as rotas existentes. |
| `scripts/validate-elements.py` | Verifica dados, relações ARIA, rotas e recursos offline. |

## Distribuição e verificação

`sw.js` mantém os recursos locais para uso offline e controla a atualização dos arquivos. `manifest.webmanifest` descreve a instalação. Os testes ficam em `tests/`; os fluxos de execução ficam em `.github/workflows/`. Resultados e capturas temporárias ficam em `dist/` e não são fontes do site.

Alterações puramente editoriais no código devem passar pelo comparador de preservação e pelos testes de regressão. Alterações de funcionamento precisam indicar o problema, a mudança e a verificação executada.

A cópia do link em `assets/element-page.js` mantém a alternativa manual quando a API de clipboard rejeita a operação ou não responde em três segundos. Essa correção de comportamento é posterior à formatação mecânica.

Os workflows separam escrita, motores Playwright e navegadores nativos. Para a auditoria completa de motores, inicie `python3 tests/compat-server.py 8765 --bind 127.0.0.1`: esse servidor de testes simula falha real das conexões GET e permite provar o atendimento pelo service worker. Ele não faz parte do site publicado.
