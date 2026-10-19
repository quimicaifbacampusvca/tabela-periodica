# Fichas individuais — Cordel dos Elementos

As 118 rotas existentes passam a apresentar folhetos com seis capítulos: conexões,
estrutura do átomo, propriedades, obtenção, posição periódica e fontes. A página
inicial e a animação aprovada não são geradas nem alteradas por este trabalho.

## Conteúdo e manutenção

- `assets/elementos.json`: base científica recebida com o projeto.
- `data/elementos-editoriais.json`: adaptação dos dados, frases, fontes e referências
  visuais da coleção aprovada v08. Estados físicos a 25 °C e 1 atm.
- `data/contextos-elementos.json`: textos contextuais para os 118 elementos,
  substituindo curiosidades antigas com rankings, estatísticas sem data ou afirmações
  inadequadas. Não pretende ser uma história completa de descoberta de cada elemento.
- `scripts/build-elements.py`: gera apenas as fichas e o JSON de comparação.
- `scripts/templates/`: cabeçalho, diálogos compartilhados e moldura da coleção.
- `assets/element-model.js`: regras de apresentação e comparação, sem dependências.
- `assets/element-page.js` e `.css`: melhoria progressiva e estilo das fichas.

Recriar e validar:

```sh
python scripts/build-elements.py
python scripts/validate-elements.py
node scripts/test-element-model.cjs
node scripts/test-element-interactions.cjs
```

Os textos e dados permanecem no HTML, incluindo configuração completa, propriedades,
explicações e referências. A navegação por capítulos e os detalhes expansíveis não
dependem de JavaScript. O comparador carrega um JSON local compartilhado, incluído no
cache do PWA. Não há chamadas externas para essas interações. VLibras continua sendo
um recurso externo, carregado sob demanda pelo painel existente.

## Convenções científicas

- Prótons e elétrons são contados para o átomo neutro. Nêutrons dependem do isótopo;
  não são calculados arredondando uma massa atômica média.
- As configurações abreviadas são expandidas a partir dos gases nobres. A soma dos
  elétrons deve corresponder a Z. Para Z ≥ 104, a configuração aparece como previsão.
- Camadas são agrupamentos por n, não trajetórias desenhadas nem distâncias reais.
  O paládio recebe uma nota específica sobre n = 4 e sua posição no período 5.
- Os lantanídeos e actinídeos pertencem aos períodos 6 e 7. As colunas gráficas das
  linhas destacadas não são reaproveitadas como números de grupo. O bloco é rotulado
  como a convenção da coleção; não resolve a discussão de composição do grupo 3.
- Estados desconhecidos da coleção continuam desconhecidos. Um estado previsto
  não é convertido em estado macroscópico confirmado.
- Valores ausentes são apresentados como ausentes, sem substituição por zero.
- Comparações de raio exigem a mesma definição (covalente ou van der Waals). Fontes
  diferentes dentro de uma definição são explicitadas. P09 é identificado como
  conjunto de raios covalentes calculados.
- Temperaturas são convertidas por K = °C + 273,15. Barras partem de 0 K. Carbono,
  arsênio, astato, frâncio e elementos Z ≥ 100 não recebem comparação direta de
  temperaturas. Há notas para hélio e formas de P, S, Se e Bk.
- Primeira ionização: 1 eV por átomo equivale a 96,48533212331002 kJ/mol. Conversões
  são formatação de leitura e não adicionam precisão aos dados de origem.
- As descrições de obtenção de elementos muito pesados foram reduzidas a contexto
  científico geral, sem reaproveitar equações nucleares inconsistentes da base.
- As referências explicam sua função: contexto editorial, convenções ou consulta
  especializada. A publicação não equivale a uma auditoria metrológica campo a campo.

## Acessibilidade e impressão

Todos os controles usam elementos nativos, rótulos e foco visível. A seleção das
camadas usa `aria-pressed` e saída textual. O comparador também comunica seus
resultados por texto; diferenças não dependem apenas de cores. Os temas e paletas,
escala de fonte, leitura simples, redução de movimento e VLibras continuam usando
o painel compartilhado. O layout adapta colunas pela largura disponível em rem.

A impressão expande os detalhes antes de imprimir e restaura seu estado depois.
A cópia de link possui alternativa selecionável quando a área de transferência é
negada. Os QR codes existentes continuam chegando diretamente à ficha.

## Verificação e limites

Os validadores percorrem as 118 páginas, ligações locais e âncoras, imagens e ícones,
relações ARIA, configurações eletrônicas e inventário offline. Testes de lógica
exercitam conversões e combinações de propriedades. Um harness de DOM verifica os
eventos de camada, unidades, comparação, impressão e cópia, inclusive falhas.

O ambiente desta alteração não oferece o navegador de teste autorizado. Os testes
de DOM não comprovam aparência, paginação real nem comportamento em Safari, Firefox
ou Chrome. A revisão visual em dispositivos reais permanece uma verificação de
homologação após a publicação.

As 118 ilustrações WebP já possuem canal alfa. O CSS mantém o fundo transparente e
sem borda também nos temas escuro, alto contraste e cores forçadas; o papel do próprio
folheto aparece atrás da arte, sem um retângulo claro adicional.

O cache passa a `cordel-varal-v7`, incluindo os quatro novos recursos de execução.
O carregamento parcial do vídeo e a estratégia de navegação existentes são mantidos.
