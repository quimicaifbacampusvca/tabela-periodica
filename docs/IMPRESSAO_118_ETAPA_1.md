# Cordel dos Elementos — Estrutura dos 118 folhetos impressos

## Etapa 1 — folha impressa sem ilustrações complementares

Este pacote prepara os **118 folhetos em A4 (uma página por elemento)**, mantendo a
arte principal da coleção e **reservando dois espaços vazios** para cenas a serem
produzidas e validadas individualmente.

A identidade gráfica de cada folheto segue a matriz adotada por estado:
- Sólido: linguagem baseada em composição clara e estruturada (Maurício de Sousa).
- Gasoso: linhas mais cinéticas, arejamento e assimetria (Angeli).
- Líquido: fluidez, curvas e formas orgânicas (Ziraldo).
- Não determinado: hachura, contraste e investigação (Flávio Colin).

A referência é interpretada em princípios editoriais originais; não se copiam
personagens, artes existentes nem a assinatura de outro artista. O termo
"não determinado" designa uma lacuna de caracterização experimental, **não um estado físico**.

## Componentes preservados

1. Cabeçalho do Cordel, assinatura e número do folheto.
2. Faixa temática, título do elemento, símbolo, ilustração original e frase aprovada.
3. Blocos com massa, grupo/período, configuração eletrônica e indicadores científicos.
4. Título e texto de "01 · No cotidiano" (ou "Em investigação") e "02 · Da origem à obtenção".
5. Molduras e áreas dos quadros 01 e 02, **sem imagens nessa fase**.
6. Rodapé institucional e aviso de interpretação de dados.

A publicação **não foi autorizada** nesta etapa. Não realizar merge das branches
de impressão na branch que alimenta o GitHub Pages antes da homologação visual.

## Convenção para as próximas artes

Para o elemento de número Z em três dígitos:
- quadro 01: `assets/folhetos/cenas/ZZZ-01.webp`
- quadro 02: `assets/folhetos/cenas/ZZZ-02.webp`

O arquivo `data/folhetos-impressao-manifesto.json` contém 236 registros de cenas
com `image: null`. Posteriormente, a imagem aprovada ocupará **somente**
`.ep-print-story-art[data-scene="ZZZ-01"]` ou `ZZZ-02`, sem alterar o layout.

**Não gerar ilustrações genéricas ou decorativas para preencher as áreas.**

## Geração e verificação

O workflow `Gerar 118 folhetos A4 sem cenas complementares` produz:
- arquivo ZIP com os 118 PDFs individuais, ordenados por número atômico;
- caderno único com as 118 páginas A4;
- relatório JSON de geração.

Rodar `node tests/verificar-folhetos-sem-cenas.cjs` para verificar a estrutura.
A geração usa Chromium e `puppeteer-core`. `pypdf` verifica quantidade de páginas
e tamanho do papel em **todos os 118 arquivos**, não apenas em amostras.

Antes da homologação, conferir manualmente pelo menos um exemplar de cada
estado físico, nomes longos e avisos de propriedades não medidas.
