# Verificação da organização do código — 25/10/2026

A formatação foi comparada com uma cópia limpa do commit `a179fb862b07187f36efd8504b20391d6b97dad6`. Antes da comparação, foram aplicados à cópia os ajustes deliberados dos verificadores: contagem de WebP no cache, interação com rótulos de acessibilidade e aceitação de espaços e quebras de linha nos testes estáticos.

O comparador aprovou 558 arquivos existentes: JavaScript e Python por estrutura sintática; HTML por estrutura, atributos e conteúdo; CSS por sequência de regras, seletores e valores; JSON pelos tokens originais, sem arredondamento; imagens, fontes e vídeos por hash. As únicas normalizações aceitas foram de formatação, comentários, aspas equivalentes, zeros à esquerda de decimais CSS e caixa de cores hexadecimais.

As regras CSS permaneceram na ordem original. Não houve remoção de funções, rotas, IDs, textos científicos ou artes aprovadas durante a organização. A separação posterior entre branches é intencional e está descrita em `docs/BRANCHES.md`.

Passaram também os contratos da abertura, da tabela e da tabela mobile, a verificação editorial das 118 páginas, a validação dos 521 recursos offline e o teste do modelo científico com 69.620 pares/propriedades.

No Chromium local 153.0.8010.0 passaram nove grupos de cenários: página inicial em cinco larguras; acessibilidade; armazenamento bloqueado; conteúdo sem JavaScript; 118 fichas e 236 quadros; controles científicos e compartilhamento; impressão A4; navegação offline para folheto ainda não visitado; recuperação de falha do vídeo.

A conferência sintática complementa a execução em navegadores. Não constitui garantia de funcionamento em todas as versões históricas de todos os navegadores.
