# Varal de elementos — prévia 01

18 de outubro de 2026. Estudo local, sem publicação no GitHub Pages.

## Referência e decisões

A referência é a pasta do Drive já indicada pelo autor. Na retomada, os cinco pacotes de fontes estavam na revisão v08, de 18/10/2026. Essa revisão mantém as 118 ilustrações e as frases aprovadas em 17/10, adaptando o material físico para A4. O catálogo usa as ilustrações e os ícones originais, as fontes DejaVu e a geometria da moldura dupla com hachuras. Fundo creme #F4EEDF e tinta #233C37; sem envelhecimento do papel.

A animação foi considerada concluída e aprovada pelo autor em 17/10/2026. Este trabalho trata do catálogo; a implantação da animação aprovada é uma etapa independente.

## Implementação

- 118 folhetos em HTML, com textos selecionáveis e dimensionáveis.
- Número, estado físico, condição, categoria, símbolo, ilustração, nome, massa e frase do conjunto v08.
- Ilustrações com proporção e transparência preservadas. A preparação web limita-se a tamanho e codificação WebP; fontes originais convertidas para WOFF, com licença incluída.
- Moldura transposta da geometria das fontes, sem geração de novas ilustrações.
- Cordas SVG calculadas a partir dos pregadores. Busca, filtros, alteração de fonte e largura da tela refazem as linhas.
- Inclinação discreta com ponto de suspensão fixo; interação suave somente em dispositivos com ponteiro. Movimento reduzido e leitura simples estabilizam os folhetos.
- Visão de tabela preserva posições, todos os 118 links e o comportamento dos resultados não correspondentes.
- Paletas alternativas afetam os indicadores; categoria e estado também aparecem por escrito.
- Recursos novos incluídos no cache do PWA. Páginas detalhadas dos elementos conservam seu conteúdo anterior; não foi feita nova auditoria científica desses capítulos.

## Arquivos

- `assets/cordel-collection.css` e `assets/cordel-collection.js`: apresentação e cordas.
- `assets/colecao/`: 118 ilustrações, 20 indicadores e dados de referência.
- `estudos/colecao/preparar_varal.py`: prepara recursos e o índice a partir dos cinco ZIPs extraídos.
- `estudos/colecao/proveniencia.json`: caminhos e SHA-256 dos originais e recursos web.
- `estudos/colecao/gerar_previa.py`: gera HTML autônomo do catálogo.
- `estudos/colecao/verificar_varal.cjs`: integração da busca com o desenho das cordas em DOM simulado.

## Conferência

Confirmados: 118 links originais, posições periódicas preservadas, 118 ilustrações distintas, 20 indicadores disponíveis, IDs sem duplicação, referências ARIA válidas, recursos locais e 275 entradas de cache existentes e únicas. A prévia possui imagens e fontes embutidas; seus folhetos abrem as páginas atuais em outra aba.

Verificadas em DOM simulado: busca com acentos, categorias, ausência de resultados, alternância de tabela e recomposição das cordas em 4, 2 e 1 colunas. Sintaxe JavaScript aprovada.

Limite: o ambiente não oferece a ferramenta de navegador prevista pelo fluxo Sites. Não houve teste visual em navegador, instalação real do PWA, leitor de tela ou homologação mobile. O HTML é entregue para revisão; não foi executado servidor alternativo nem realizado deploy.

## Prévia 02 — correção dos indicadores e tabela em cordel

- Quatro recursos WebP vazios foram regenerados a partir dos PNGs originais: sólido/outros metais, líquido/outros metais, sólido/halogênios e não determinado/halogênios. Eles atendem a 14 elementos.
- A preparação de imagens passa a decodificar recursos existentes, regenerar arquivos inválidos, gravar em temporário e só então substituir o destino. A montagem da prévia recusa imagens vazias ou indecodificáveis.
- A tabela recebe a moldura original, as fontes dos folhetos e indicadores de estado em miniatura. Mantém as posições dos 118 elementos, com 18 grupos e sete períodos, além das duas séries de 15 elementos. Rótulos de grupos, períodos e séries ficam fora das células dos elementos.
- A primeira linha e a coluna estreita adicionadas são exclusivamente para rótulos. O posicionamento científico continua em `--col` e `--row`; o deslocamento visual de uma célula é aplicado apenas no CSS.
- O espaço central livre apresenta o emblema aprovado. A troca de modo retorna a rolagem horizontal ao início e atualiza o título do catálogo.
- Conferência: as 138 imagens web foram abertas por dois decodificadores independentes. As 237 imagens embutidas no HTML, incluindo 118 indicadores de estado e a marca, foram verificadas. Nenhuma imagem vazia permanece. Os 118 destinos e posições coincidem com a prévia anterior.
- Navegador real continua pendente. A captura enviada pelo usuário orientou a correção; ela não constitui homologação desta revisão.

## Brisa no varal

- A cada 30 segundos, os folhetos visíveis balançam durante 3,2 a 3,62 segundos, com pequenas diferenças de duração, amplitude e início. A rotação parte da inclinação de repouso e retorna a ela, mantendo o ponto de suspensão no pregador.
- O balanço usa a API de animações do navegador. Não altera posições, textos, desenhos, filtros ou os enlaces dos elementos.
- Mouse sobre o folheto ou foco do teclado interrompem seu movimento. A tabela clássica permanece alinhada.
- Movimento reduzido do sistema ou do painel, leitura simples, aba oculta e saída da página interrompem as animações e o temporizador. Ao retornar ao varal em condições que permitem movimento, começa um novo intervalo de 30 segundos.
- O teste de integração usa relógio simulado: confirmou o primeiro disparo somente aos 30 segundos, repetição do intervalo, rotação limitada e retorno ao repouso, animação somente dos folhetos visíveis e cancelamento por interação e acessibilidade. Essa verificação não substitui a avaliação visual em navegador.

## Revisão 03 — conteúdo da tabela clássica

- Corrigida a prioridade das regras de fonte: regras antigas do índice não sobrescrevem mais a tipografia da tabela em cordel.
- Símbolos e nomes permanecem inteiros, sem quebras entre letras, reticências ou recortes. As células têm largura mínima suficiente e crescem com a ampliação de texto. O espaçamento ampliado recebe espaço adicional.
- Número atômico e estado ficam no cabeçalho; símbolo e nome ocupam linhas próprias. Os 18 grupos, sete períodos e duas séries inferiores conservam as posições anteriores.
- Em telas largas, o catálogo aproveita mais largura disponível. Em telas estreitas, a tabela mantém a leitura por rolagem horizontal dentro da própria região.
- Verificação das métricas das fontes originais: 1.180 combinações de elemento, escala de 80% a 200% e espaçamento normal/ampliado, sem texto maior que o espaço interno previsto. Testes de busca, filtros e brisa aprovados em DOM simulado. A conferência visual em navegador real permanece pendente.
- Cache do PWA atualizado para `cordel-varal-v3`. Preparado para publicação no GitHub Pages a pedido do autor em 18/10/2026.
