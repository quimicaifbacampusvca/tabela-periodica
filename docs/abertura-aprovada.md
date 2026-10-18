# Atualização da abertura e do catálogo — revisão 04

## Abertura aprovada

Usa integralmente `cordel-animacao-previa-06.mp4`, aprovada em 17/10/2026, sem redesenho nem alteração da sequência. Publicada como `assets/intro/cordel-abertura-aprovada-v06.mp4`.

- H.264, 960 × 720, 30 fps, 11,033 segundos; sem áudio.
- SHA-256: `ec63c1d27855b23d6ff0e6b5e92b4f2064e144fbf10b4e1e5d4f0b62a81201c9`.
- Git blob: `7eefda4c4a57df9581a4616a7085eef25519783f`.
- Reprodução ao carregar a página e ao retornar pelo cache de navegação; sem botão de rever.
- Respeita movimento reduzido e preferência de desativação da abertura.
- Botão de pular e teclado encerram a apresentação. Falhas de carregamento ou reprodução deixam o catálogo acessível.
- Cache do PWA `cordel-varal-v4`, incluindo vídeo e respostas parciais por intervalo de bytes.

## Tabela e varal

- Intervalo do balanço: 10 segundos; preservadas as pausas por interação, página oculta e preferências de acessibilidade.
- Largura mínima de célula: 3,3 rem, com fontes proporcionais à largura do catálogo. As 18 colunas cabem em telas grandes; telas estreitas mantêm rolagem horizontal dentro da tabela.
- Símbolos inteiros; nomes longos recebem pontos opcionais de divisão silábica para ocupar até duas linhas. Busca e nomes acessíveis permanecem completos.
- Nenhuma alteração no conteúdo das páginas individuais dos elementos.

## Verificação

Vídeo original decodificado integralmente. Comportamento de abertura, encerramento, reabertura, movimento reduzido e cache parcial verificado por simulação de eventos. Catálogo verificado com os 118 elementos e relógio simulado de 10 segundos. Não representa homologação visual em navegadores reais.
