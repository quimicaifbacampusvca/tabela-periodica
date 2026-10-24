# Pacote 031–035 — integração preparada

Esta alteração prepara o CSS e JavaScript para os quadros 01 e 02 dos elementos 031 (Gálio), 032 (Germânio), 034 (Selênio) e 035 (Bromo).
**Não constitui publicação das imagens**: os respectivos arquivos binários ainda não integram este commit.

Arquivos esperados:
- `assets/folhetos/cenas/031-01.webp` e `031-02.webp`
- `assets/folhetos/cenas/032-01.webp` e `032-02.webp`
- `assets/folhetos/cenas/034-01.webp` e `034-02.webp`
- `assets/folhetos/cenas/035-01.webp` e `035-02.webp`

O carregamento de imagens está intencionalmente inativo até ser definido `data-folheto-piloto` nas páginas individuais. Quando ativado, o JavaScript só troca o conteúdo de impressão se **ambas** as imagens tiverem exatamente 1104 × 810 px.

Antes da ativação:
1. Transferir os oito WebP sem substituir artes anteriores.
2. Revisar a correção científica de legenda de `032-02` e texto de `034-01`. Em particular, não chamar a germanita de principal fonte industrial de Ge, nem manter o termo incorreto presente no parágrafo de Se.
3. Atualizar `data/folhetos-impressao-manifesto.json`, os atributos de cada HTML e a versão do cache PWA.
4. Conferir o folheto impresso A4 de uma página, em especial molduras e cortes.

O quadro `033-01` (Arsênio) foi descartado; `033-02` fica separado para revisão do rótulo científico. Não integrar Arsênio até as duas artes estarem homologadas.
