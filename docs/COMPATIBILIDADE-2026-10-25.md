# Compatibilidade e organização — 25/10/2026

A auditoria registra as versões realmente instaladas no ambiente de testes. Não representa todas as versões estáveis já lançadas, todos os sistemas operacionais nem todos os aparelhos móveis.

A versão publicada corresponde ao commit `c20d5690fd095c461a7d4787687d6989feeeab2f`. A manutenção completa está na branch `construção`. Os motores foram executados sobre `cb5a03e49d864784570c675cb94dc6cce66ac6ac`; a seta da massa recebeu depois uma alteração visual isolada, conferida em tela e pelos contratos da tabela e pelo teste da página inicial. Os 523 arquivos de utilização têm os mesmos hashes nas duas branches. Os 236 quadros aprovados foram preservados.

## Execuções e versões

Os 124 grupos de cenários funcionais passaram nos 16 ambientes. As ressalvas de entrada no Safari são detalhadas abaixo. Os resultados por cenário estão em `compatibilidade-2026-10-25.json`.

| Ambiente | Versão executada | Resultado |
| --- | --- | --- |
| Atual — chrome-stable | 156.0.8078.47 | Aprovado |
| Histórico PW 1.40.1 — webkit | 17.4 | Aprovado |
| Histórico PW 1.40.1 — chromium | 120.0.6099.28 | Aprovado |
| Atual — chromium-current | 156.0.8078.4 | Aprovado |
| WebKit no macOS | 27.2 | Aprovado |
| Histórico PW 1.40.1 — firefox | 119.0 | Aprovado |
| Atual — webkit-linux-current | 27.2 | Aprovado |
| Histórico PW 1.48.2 — chromium | 130.0.6723.31 | Aprovado |
| Atual — firefox-current-pw | 157.0 | Aprovado |
| Histórico PW 1.48.2 — webkit | 18.0 | Aprovado |
| Histórico PW 1.48.2 — firefox | 131.0 | Aprovado |
| Atual — edge-stable | 156.0.4314.42 | Aprovado |
| Safari real — macos-15 | 26.6.1 | Funcional aprovado; ressalva de ponteiro |
| Firefox oficial — esr | 153.5.1 | Aprovado |
| Firefox oficial — stable | 158.0.1 | Aprovado |
| Safari real — macos-26 | 26.6.2 | Funcional aprovado; ressalva de ponteiro |

- [Motores atuais e históricos](https://github.com/quimicaifbacampusvca/tabela-periodica/actions/runs/40242332731).
- [Safari e Firefox oficiais](https://github.com/quimicaifbacampusvca/tabela-periodica/actions/runs/40244395580).
- [Publicação no GitHub Pages](https://github.com/quimicaifbacampusvca/tabela-periodica/actions/runs/40243833224).

## Cobertura

- Página inicial em 320, 390, 650, 800 e 1440 pixels, filtros combinados, estados físicos, legenda dinâmica, diálogos, foco, escala e recuperação de falhas do vídeo.
- Preferências reais de acessibilidade, persistência após recarregar e redução de movimento sem depender da preferência do sistema operacional.
- Conteúdo estático com JavaScript desativado e recuperação quando o armazenamento é bloqueado.
- 118 fichas, ilustrações e 236 quadros carregados.
- Camadas eletrônicas, unidades, comparação de raios com definições distintas e compartilhamento. A permissão de clipboard que nunca responde é testada explicitamente.
- Impressão A4 em quatro amostras científicas e visuais diferentes: Silício, Arsênio, Frâncio e Oganessônio. Nos motores Chromium são gerados PDFs; nos demais motores Playwright é usada a mídia `print`.
- Preparação offline com todos os 236 WebP no cache e abertura de um folheto ainda não visitado, durante falha real das conexões GET ao servidor. Um controle negativo confirma a indisponibilidade da rede.
- Nos navegadores nativos, os relatórios distinguem a aplicação das regras CSS de impressão de uma impressão nativa paginada. Essa simulação não é um PDF nem uma homologação da janela de impressão do sistema.

O menu das 118 fichas também recebeu uma verificação específica no Chromium: uma única entrada Menu, ações preservadas, Escape, clique externo, retorno do foco e diálogos em 320, 390, 768 e 1440 pixels.

## Correções e organização

1. A preparação offline não incluía 176 dos WebP aprovados. A lista agora inclui os 236 quadros, preservando os dois SVG legados e os demais recursos existentes; os 521 caminhos foram conferidos.
2. As 118 fichas passaram a usar o menu compartilhado da página inicial, com exploração, instalação e acessibilidade dentro dele. O modelo e o gerador foram atualizados.
3. O caminho de cópia manual permanece acessível quando o clipboard rejeita a operação ou não responde em três segundos. O caso de permissão indefinidamente pendente passou em teste específico.
4. A preferência de redução de movimento passou a abranger também a rolagem da página, que antes continuava suave. A verificação usa um contexto sem redução de movimento pelo sistema para comprovar o efeito da preferência do site.
5. A formatação preservou a estrutura executável e o conteúdo de 558 arquivos existentes. Veja `PRESERVACAO-DO-CODIGO.md`, `ESTRUTURA-DO-CODIGO.md`, `BRANCHES.md` e `CONTRIBUTING.md`.

Também foram corrigidos verificadores que dependiam da grafia minificada exata, contavam os SVG legados como WebP, rejeitavam HTTP 304 válido ou tentavam interagir antes do término de animações e rolagem. Os testes de impressão no GitHub voltaram a passar. As verificações antigas permanecem no histórico dos commits.

A simulação `setOffline(true)` de algumas versões do Playwright/WebKit pode impedir a própria interceptação pelo service worker. Por isso a auditoria usa interrupção do transporte no servidor local, sem mudar o site. [O problema está documentado no repositório do Playwright](https://github.com/microsoft/playwright/issues/42775).

A seta da massa passou a fazer a curva por baixo e terminar apontando para cima, em direção ao valor. Essa alteração foi solicitada e aprovada após a auditoria dos motores.

## Safari: escopo da aprovação funcional

Safari 26.6.1 no macOS 15 e 26.6.2 no macOS 26 passaram os quatro grupos: página inicial e preferências; 118 fichas e 236 quadros; controles da ficha; e simulação CSS da impressão.

O driver retornava nomes de tags em maiúsculas (`INPUT`, `BUTTON`, `SUMMARY`), enquanto o verificador assumia minúsculas. Isso impedia a identificação correta do rótulo visível de um switch. A normalização foi corrigida no teste.

A entrega de ponteiro pela automação foi intermitente. Os testes agora confirmam que o controle recebeu um evento nativo confiável; se o ponteiro não chega, usam ativação real pelo teclado e registram a alternativa. Foram registradas 34 ativações por teclado em cada execução completa do Safari. Nenhum `element.click()` executado por JavaScript dentro da página foi usado para aprovar esses cenários.

Sondagens separadas confirmaram cliques reais e teclado funcionando nos dois Safari em 1280 pixels; na comparação em 390/1280, o macOS 15 recebeu os cliques e o macOS 26 apresentou falhas de entrega do driver. Os controles JavaScript sintéticos foram identificados como diagnósticos e não contam como homologação.

Portanto, a aprovação é dos cenários funcionais executados, com teclado quando necessário. A cobertura completa de mouse e toque no Safari continua exigindo uma conferência manual; não foi declarada aprovada pela automação. [Sondagem de entrada](https://github.com/quimicaifbacampusvca/tabela-periodica/actions/runs/40243246991).

## Limites

Viewports móveis são emulados. Não foram usados iPhone, iPad ou Android físicos. A janela mínima do Safari de desktop pode exceder a largura solicitada; os tamanhos efetivos são registrados no relatório nativo.

Builds Playwright de Firefox e WebKit são identificados como tais. Não equivalem a todas as versões comerciais de Firefox ou Safari. Os containers históricos representam as versões de motores indicadas, e não todas as versões intermediárias.

A instalação pelo sistema, menus de compartilhamento do sistema, impressoras físicas e a tradução externa do VLibras exigem conferência específica. Os testes verificam os caminhos de instalação e compartilhamento existentes no site, incluindo as alternativas quando APIs não estão disponíveis.
