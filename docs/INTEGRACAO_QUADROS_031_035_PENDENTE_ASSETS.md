# Situação dos quadros 031–035 — acervo e publicação

Atualizado após recuperação das artes geradas e consolidação no GitHub.

## Elementos ativados no folheto A4

- **031 — Gálio:** quadros 01 e 02 publicados, sem alterações.
- **035 — Bromo:** quadros 01 e 02 publicados, sem alterações.

## Artes armazenadas no GitHub, com integração no A4 ainda pendente

- **032 — Germânio:**
  - `032-01.webp`: aprovado e armazenado.
  - `032-02.webp`: produzido e armazenado sem alterações, mas requer correção textual: germanita (Cu₃GeS₄) não deve ser indicada como fonte principal da obtenção industrial do elemento. Evitar esse enunciado no texto e na legenda.
- **033 — Arsênio:**
  - `033-01.webp`: versão descartada por destacar agrotóxicos/madeiras como aplicações atuais; não publicada.
  - `033-02.webp`: imagem produzida e armazenada. Conferir roteiro industrial e substituir rótulo “metal obtido” por “arsênio elementar”, por ser classificado como semimetal/metaloide.
- **034 — Selênio:**
  - `034-01.webp`: produzido e armazenado sem alterações, porém contém “alergas alimentares” no parágrafo principal, expressão incorreta, além de afirmações nutricionais que exigem revisão.
  - `034-02.webp`: aprovado e armazenado.

Todos os WebP armazenados são 1104 × 810 px e preservam as artes originais. Para os elementos 032 e 034, o par de arquivos já existe no repositório, mas a página **não está ativada** para imprimir a arte com erros conhecidos. Para o 033, é necessária uma arte 01 corrigida.

## Integração técnica existente

As regras CSS para `031`, `032`, `034` e `035` e o carregador de dois quadros integrais estão preparados em `assets/element-page.css` e `assets/element-page.js`. O carregador evita ativar a impressão especial quando faltam arquivos, enquanto as páginas individuais mantiverem inativo `data-folheto-piloto`.

O site não deve exibir os quadros com ressalvas antes da revisão editorial/científica e validação visual da folha A4. A arte superior de cada elemento e os quadros já publicados não devem ser modificados.
