# Estados físicos nos materiais impressos

Revisão de 25/10/2026. Condição: substância simples a 25 °C e 1 atm.

Astato (85), Frâncio (87), Férmio (100), Mendelévio (101), Nobélio (102) e Laurêncio (103) passam de “Não determinado” para a classificação tabulada “Sólido”, em alinhamento com a base científica já adotada no site. Para os elementos com amostras limitadas, essa classificação não implica caracterização de uma amostra macroscópica. As notas científicas do site foram preservadas. Rf–Og permanecem como “Não determinado”.

## Arquivos corrigidos no Drive

- Seis PDFs e seis PNGs individuais: texto e ícone do estado, com cor da categoria preservada.
- Dois ZIPs de cards: faixas 081–100 e 101–118; os outros membros permanecem idênticos.
- Tabela completa em PDF, PNG e prévia: seis campos de estado corrigidos nas posições existentes.
- Catálogo de 118 cards: seis miniaturas corrigidas.
- Dados JSON/CSV, critérios científicos, guia e arquivo de apresentação da coleção.
- ZIP Fontes 1: dados, critérios de base e código de geração documental corrigidos para evitar regressão.

Total: 24 arquivos existentes substituídos, mantendo seus IDs, pastas e URLs. Ilustrações, frases, massas, QR codes, molduras e demais elementos dos cards foram preservados. O PDF da tabela mantém texto e marca em vetor.

Pasta: <https://drive.google.com/drive/folders/1cNErLSmFsFhrkXjIJHGx4eObGKtwmDOn>.

## Fontes do site

As 118 páginas e a base `assets/elementos-fichas.json` já estavam alinhadas. Foram corrigidos os seis estados em `assets/colecao/dados.json` e os respectivos estados e classes de composição em `data/folhetos-impressao-manifesto.json`, conservados na branch de construção. Esses arquivos de preparação não estão na branch publicada. A correção não exige alterar a interface publicada.

Verificação: `python3 scripts/validate-print-states.py`. Compara os 118 registros da coleção, manifesto de impressão, dados científicos e JSON incorporado nas páginas.

## Legenda horizontal

Uma proposta A4 horizontal (297 × 210 mm) foi preparada com moldura, paleta, fontes, ícones e marca oficiais. Categorias em duas colunas, estados com ícones neutros, exemplo de leitura do card, convenções de massa e QR para a página inicial. A substituição da legenda vertical existente aguarda aprovação visual; a proposta não foi aplicada à tabela nem aos pacotes de impressão.
