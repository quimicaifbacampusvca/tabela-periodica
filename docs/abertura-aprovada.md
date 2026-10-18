# Atualização da abertura e do catálogo — revisão 04

## Abertura aprovada

Usa integralmente a sequência de `cordel-animacao-previa-06.mp4`, aprovada em 17/10/2026, sem redesenho nem alteração dos quadros e tempos. A revisão 04 publicou o arquivo original como `assets/intro/cordel-abertura-aprovada-v06.mp4`; a revisão 05 usa a cópia de compatibilidade `assets/intro/cordel-abertura-v06-web.mp4`.

- H.264, 960 × 720, 30 fps, 11,033 segundos; sem áudio.
- SHA-256: `ec63c1d27855b23d6ff0e6b5e92b4f2064e144fbf10b4e1e5d4f0b62a81201c9`.
- Git blob: `7eefda4c4a57df9581a4616a7085eef25519783f`.
- Reprodução ao carregar a página e ao retornar pelo cache de navegação; sem botão de rever.
- Respeita movimento reduzido e preferência de desativação da abertura.
- Botão de pular e teclado encerram a apresentação. Falhas de carregamento ou reprodução deixam o catálogo acessível.
- Cache do PWA `cordel-varal-v5`, incluindo a cópia de compatibilidade e respostas parciais por intervalo de bytes.

## Tabela e varal

- Intervalo do balanço: 10 segundos; preservadas as pausas por interação, página oculta e preferências de acessibilidade.
- Largura mínima de célula: 3,3 rem, com fontes proporcionais à largura do catálogo. As 18 colunas cabem em telas grandes; telas estreitas mantêm rolagem horizontal dentro da tabela.
- Símbolos inteiros; nomes longos recebem pontos opcionais de divisão silábica para ocupar até duas linhas. Busca e nomes acessíveis permanecem completos.
- Nenhuma alteração no conteúdo das páginas individuais dos elementos.

## Verificação

Vídeo original decodificado integralmente. Comportamento de abertura, encerramento, reabertura, movimento reduzido e cache parcial verificado por simulação de eventos. Catálogo verificado com os 118 elementos e relógio simulado de 10 segundos. Não representa homologação visual em navegadores reais.

## Revisão 05 — integração visual

A captura do navegador mostrou fundo branco e cores excessivamente saturadas na camada de vídeo, embora a decodificação local do original apresentasse as cores corretas. O arquivo tinha matriz de cor indefinida. A cópia web declara matriz SMPTE 170M/BT.601, primárias e transferência BT.709 e faixa limitada, com metadados coerentes no contêiner e no fluxo H.264. Não houve recompressão dos quadros.

- SHA-256 da cópia web: `f694db0e6a86ae67e9a6266be0ac2aeb55a55b803d0fd381cc9567245b60e7af`.
- Os 331 quadros decodificados e os respectivos tempos são idênticos aos do original, conferidos com `framemd5`.
- A cena é desenhada em canvas sRGB; o vídeo serve apenas como fonte dos quadros, sem exibição direta de sua camada nativa.
- O fundo externo acompanha exatamente um pixel de papel da cena decodificada. Nenhuma máscara, filtro, recorte ou nova ilustração foi aplicado.
- Largura máxima de 760 px; tamanho limitado pela largura e altura da janela, com proporção 4:3 preservada.
- A rolagem fica suspensa durante a apresentação e é liberada ao terminar, pular ou falhar. A saída dissolve a cena durante 500 ms, revelando a página.
- Movimento reduzido, opção de desativar a apresentação, reabertura e reprodução offline permanecem preservados.

Reprodução da cópia web a partir do arquivo aprovado:

```sh
ffmpeg -i cordel-animacao-previa-06.mp4 -c:v copy -bsf:v 'h264_metadata=video_full_range_flag=0:colour_primaries=1:transfer_characteristics=1:matrix_coefficients=6' -color_primaries bt709 -color_trc bt709 -colorspace smpte170m -color_range tv -movflags +faststart -an -map_metadata -1 cordel-abertura-v06-web.mp4
```

Eventos de canvas, cor do fundo, bloqueio/liberação de rolagem, cancelamento de quadros e finalização verificados no teste de integração. A aparência final no navegador do usuário continua dependente da conferência após a publicação.
