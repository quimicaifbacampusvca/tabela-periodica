# Escrita e manutenção do código

O Cordel dos Elementos é um site estático. As ferramentas de desenvolvimento não são necessárias para o visitante e não mudam a forma de hospedagem no GitHub Pages.

## Preservação obrigatória

- Não excluir código, recursos, comentários ou tratamentos de compatibilidade durante uma organização de escrita.
- Não remover funções que pareçam repetidas ou antigas sem uma revisão específica e autorização correspondente.
- Não trocar rotas, nomes de arquivos publicados, IDs, atributos `data-*` ou contratos usados entre HTML, CSS, JavaScript e testes como parte de uma formatação.
- Não reordenar regras CSS: a ordem participa do comportamento visual.
- Não modificar textos científicos, valores, referências ou artes aprovadas para melhorar a apresentação do código.
- Separar alterações de comportamento de alterações de formatação em commits diferentes.

## Convenções

- Usar UTF-8, terminações LF e uma quebra de linha ao final do arquivo.
- Usar dois espaços em HTML, CSS, JavaScript e JSON; quatro em Python.
- Manter o código-fonte legível no repositório. Não enviar arquivos minificados como fonte de manutenção.
- Adotar nomes que indiquem a responsabilidade de novas variáveis e funções. Não renomear identificadores existentes durante uma formatação mecânica.
- Documentar a responsabilidade de cada arquivo e explicar decisões não evidentes. Evitar comentários que apenas repitam a instrução seguinte.
- Agrupar novas rotinas por responsabilidade: leitura de dados, validação, apresentação, eventos e tratamento de falhas.
- Preservar o funcionamento básico quando armazenamento, vídeo, clipboard ou serviços externos estiverem indisponíveis.
- Em alterações futuras, usar detecção de recursos antes de depender de uma API recente. Não inferir capacidade apenas pelo nome do navegador.

## Ferramentas

```sh
npm ci
python3 -m pip install -r requirements-dev.txt
npm run preservation:snapshot
npm run format
python3 -m black scripts tests
npm run preservation:check
npm run format:check
npm run verify:elements
```

O comparador de preservação verifica a estrutura sintática do JavaScript e do Python, a estrutura do HTML e do CSS, os tokens dos arquivos JSON e os hashes dos recursos binários. Espaços de formatação e comentários novos não são alterações de lógica. Essa comparação complementa os testes de navegador; não os substitui.

Os dados científicos em JSON são formatados sem reserializar valores numéricos. Não arredondar, converter unidades ou trocar convenções durante a organização.

## Páginas geradas

As fichas são produzidas por `scripts/build-elements.py`. Depois de regenerá-las, execute a formatação e a validação. O comando `npm run generate:elements` reúne geração e formatação. Não editar artes ou reescrever conteúdo aprovado durante esse processo.

## Testes de compatibilidade

Consulte `.github/workflows/verify-browser-compat.yml`. Os relatórios registram as versões efetivamente executadas e distinguem Safari nativo, WebKit automatizado, navegadores comerciais e builds históricos de motores. Um teste em WebKit não deve ser declarado como teste em todas as versões do Safari.

## Organização das branches

A manutenção e os testes ficam em `construção`. A branch publicada `tabelaifbavca` contém somente os arquivos de utilização do site. Veja `docs/BRANCHES.md` antes de publicar: não reintroduzir arquivos de desenvolvimento por um merge integral. O workflow `verify-code-style.yml` verifica automaticamente a escrita e os contratos na branch de construção.
