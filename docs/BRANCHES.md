# Publicação e construção

A branch principal e publicada continua sendo `tabelaifbavca`. A branch `construção` preserva a versão completa para manutenção e desenvolvimento.

## `tabelaifbavca`: arquivos utilizados pelo site

- `index.html` e `404.html`.
- `elementos/`: as 118 fichas publicadas.
- `assets/`: estilos, scripts, fontes e respectivas licenças, imagens e vídeo usados pelo site, incluindo os 236 quadros aprovados.
- `manifest.webmanifest`, `sw.js` e `.nojekyll`: instalação, funcionamento offline e publicação estática.

A separação manteve 523 arquivos nessa branch. Todos os 521 caminhos enumerados pelo service worker foram conferidos após a separação. O vídeo de abertura é carregado sob demanda e a licença da fonte permanece junto aos arquivos de fonte.

## `construção`: manutenção e histórico de trabalho

Esta branch reúne os mesmos arquivos de utilização e também dados de origem, geradores, testes, workflows de verificação, estudos, documentação e ferramentas de formatação. Conserva o PDF de referência da legenda e as duas versões antigas da abertura. A base científica `assets/elementos.json` e o conjunto de preparação `assets/colecao/dados.json` são usados na construção, sem requisições desses arquivos pelo site publicado.

Os 71 arquivos retirados da branch publicada permanecem aqui e no histórico Git. Nenhuma arte aprovada foi excluída.

## Procedimento de manutenção

1. Trabalhar em `construção` ou em uma branch derivada dela.
2. Seguir `CONTRIBUTING.md` e o mapa `docs/ESTRUTURA-DO-CODIGO.md`.
3. Executar formatação, validações e testes antes da publicação.
4. Transferir para `tabelaifbavca` somente as alterações dos arquivos de utilização. Não fazer merge integral de `construção` sobre a branch publicada: isso reintroduziria ferramentas e estudos.
5. Conferir dependências e lista do service worker sempre que adicionar ou retirar um arquivo utilizado pelo navegador.

Os workflows ficam em `construção` e verificam essa branch. A publicação utiliza a configuração existente do GitHub Pages para `tabelaifbavca`.
