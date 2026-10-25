# Cordel dos Elementos

Site estático de divulgação científica com 118 elementos, 236 quadros aprovados, catálogo em Varal e Tabela, fichas interativas e impressão de folhetos A4.

[Visitar o site](https://quimicaifbacampusvca.github.io/tabela-periodica/)

## Branches

- `tabelaifbavca`: principal de publicação, apenas os arquivos utilizados pelo site.
- `construção`: fontes completas, dados de origem, geradores, testes, documentação e estudos preservados.

Veja [o procedimento de manutenção e publicação](docs/BRANCHES.md). Não fazer merge integral da branch de construção sobre a publicada.

## Navegação e acessibilidade

O cabeçalho apresenta um único Menu. Nele ficam instalação e acessibilidade; nas fichas, também há o retorno à exploração dos elementos. Acessibilidade inclui tema, contraste, escala, espaçamento, movimento, leitura, paletas e VLibras. As preferências são persistidas quando o armazenamento está disponível.

O VLibras é opcional, externo e requer internet. Instalação e compartilhamento dependem das permissões e dos recursos de cada navegador. A cópia manual permanece disponível quando o clipboard falha ou não responde.

## Manutenção

Leia [as regras de escrita](CONTRIBUTING.md) e [o mapa do código](docs/ESTRUTURA-DO-CODIGO.md). Não remover código existente, rotas, dados científicos ou artes aprovadas como parte de uma organização.

```sh
npm ci
python3 -m pip install -r requirements-dev.txt
npm run format:check
npm run verify:elements
```

As ferramentas são necessárias apenas para desenvolvimento. O site publicado continua estático, sem dependência de Node ou Python no dispositivo do visitante.

## Verificações

Os workflows de `construção` separam escrita e contratos, renderização e impressão, motores atuais e históricos, Safari nativo e Firefox oficial. Os relatórios registram versões efetivamente executadas; WebKit automatizado não equivale a todas as versões do Safari. Viewports móveis são emulados, sem homologação em aparelhos físicos.

Contato para relatar erros: **202411320020@ifba.edu.br**.
