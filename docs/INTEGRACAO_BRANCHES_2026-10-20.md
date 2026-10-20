# Integração dos branches do Cordel dos Elementos — 20/10/2026

## Objetivo
Reunir, para homologação, as alterações ainda não presentes em `tabelaifbavca`, preservando o site publicado e as 118 fichas individuais.

## Auditoria de todos os branches existentes
- `tabelaifbavca`: referência de produção, não alterada.
- `editorial/textos-publicos-sem-processo-interno`: já incorporado na referência, nenhuma diferença pendente.
- `feat/abertura-organica-cordel-20261019`: já incorporado na referência, nenhuma diferença pendente.
- `fix/revisao-legenda-pwa-20261019`: já incorporado na referência, nenhuma diferença pendente.
- `feat/folheto-editorial-a4-uma-pagina`: ancestral da produção dos folhetos, incorporado neste branch.
- `prototype/quatro-linguagens-estados-20261019`: ancestral da produção dos folhetos, incorporado neste branch.
- `production/folhetos-118-estrutura-sem-imagens`: incorporado integralmente como base da consolidação.
- `fix/tabela-mobile-legibilidade-20261019`: incorporadas as correções responsivas, orientação para rolagem e verificações mobile.

## Resolução dos arquivos compartilhados
- `assets/cordel-collection.css` e `index.html`: adotadas as versões do branch de legibilidade, pois a produção de folhetos não as modificou.
- `assets/element-page.css`, `assets/element-page.js`, manifesto e gerador A4: preservados da produção dos folhetos.
- `sw.js`: preservado o conteúdo da produção, elevando o identificador do cache PWA para a integração.
- Testes `verify-intro`, `verify-folheto-print`, `verify-periodic-mobile`: corrigidas as expectativas incompatíveis com a versão do cache.
- O workflow de geração dos 118 PDFs passa a verificar PRs com destino a `tabelaifbavca`; os PDFs são artefatos da execução, não arquivos versionados.

## Limites e homologação
Os 118 folhetos A4 estão estruturados, mas há 236 campos de cenas complementares com `image: null` (dois por elemento). Este branch **não afirma que essas artes ou os PDFs finais ilustrados estejam prontos**. As ilustrações originais da coleção permanecem preservadas.

**Não mesclar em `tabelaifbavca` antes de aprovação visual do usuário**, verificação de layout A4 (uma página), responsividade, acessibilidade e execução dos workflows. O PR deve permanecer em rascunho.

Não apagar os branches de origem até a aprovação e publicação da integração.
