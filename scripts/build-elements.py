#!/usr/bin/env python3
"""Build only the 118 element folhetos; leave the collection and intro intact."""
from pathlib import Path
import html
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / 'scripts/templates'
RAW = json.loads((ROOT / 'assets/elementos.json').read_text())
EDITORIAL = json.loads((ROOT / 'data/elementos-editoriais.json').read_text())
CONTEXT = json.loads((ROOT / 'data/contextos-elementos.json').read_text())
E = html.escape
SUPER = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')
CORES = {'He': 2, 'Ne': 10, 'Ar': 18, 'Kr': 36, 'Xe': 54, 'Rn': 86}
SHELL_NAMES = 'KLMNOPQ'
STATE_KEYS = {'Sólido':'solido','Líquido':'liquido','Gasoso':'gasoso','Não determinado':'nao_determinado'}
RADIUS_REFS = {
    'C08': 'Cordero et al. — Covalent radii revisited. Dalton Transactions (2008), 2832–2838.',
    'P09': 'Pyykkö e Atsumi — Molecular single-bond covalent radii for elements 1–118. Chemistry — A European Journal 15 (2009), 186–197.',
    'Alv13': 'Alvarez — A cartography of the van der Waals territories. Dalton Transactions 42 (2013), 8617–8636.'
}
# High-level descriptions replace old reaction shorthand and dated production claims.
ORIGIN_OVERRIDES = {
  2: 'O hélio pode ser separado de reservatórios de gás natural que o contêm. Parte desse hélio se acumula no subsolo a partir do decaimento de elementos radioativos presentes nas rochas.',
  4: 'Minerais como o berilo são fontes de compostos de berílio. A obtenção do metal envolve separação química e redução desses compostos em instalações industriais especializadas.',
  6: 'Grafite e diamante podem ser encontrados em depósitos minerais. Também existem rotas industriais para produzir materiais de carbono, como negro de fumo, grafite e diamante sintético; cada rota produz estruturas e propriedades diferentes.',
  84: 'O polônio aparece em quantidades muito pequenas em cadeias naturais de decaimento. Para pesquisa, pode ser produzido a partir da irradiação de bismuto, seguida de separação em instalações especializadas.',
  85: 'O astato ocorre em traços transitórios em cadeias de decaimento natural. A pesquisa utiliza principalmente isótopos produzidos em aceleradores, pois as quantidades naturais são extremamente pequenas.',
  86: 'O radônio é formado pelo decaimento de elementos radioativos presentes em minerais, solos e rochas. Por ser um gás, pode migrar desses materiais para o ar.',
  87: 'O frâncio aparece em traços no decaimento do actínio. Também pode ser produzido para pesquisa em instalações nucleares; seus isótopos de curta duração impedem o acúmulo de amostras comuns.',
  88: 'O rádio ocorre em quantidades pequenas em minerais de urânio, como produto de cadeias de decaimento. Sua separação é realizada apenas em contextos especializados.',
  89: 'O actínio ocorre em traços associados a minerais de urânio. Isótopos de interesse para pesquisa também são produzidos por reações nucleares e separados de outros elementos.',
  90: 'Minerais como a monazita contêm tório associado a outros elementos. A obtenção de seus compostos envolve separações químicas; a preparação do metal exige etapas adicionais.',
  91: 'O protactínio ocorre em quantidades muito pequenas em minerais de urânio. Seu estudo depende de separações especializadas ou de produção em instalações de pesquisa.',
  92: 'O urânio é encontrado em minerais como a uraninita. O processamento mineral concentra seus compostos; as etapas seguintes dependem da aplicação e da composição isotópica necessária.',
  93: 'O netúnio é produzido principalmente por reações nucleares envolvendo urânio. A separação de seus compostos ocorre em instalações especializadas para pesquisa e tecnologia nuclear.',
  94: 'O plutônio pode se formar pela captura de nêutrons por núcleos de urânio, seguida de decaimentos. Sua produção e separação pertencem ao campo da tecnologia nuclear.',
  95: 'Isótopos de amerício se formam em materiais submetidos a reações nucleares e pelo decaimento de outros actinídeos. Sua separação requer instalações e técnicas especializadas.'
}

def slug(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.lower()) if unicodedata.category(c) != 'Mn')

def number(value):
    if value is None:
        return 'Não disponível nesta base'
    return str(value).replace('.', ',')

def full_config(z):
    config = RAW[z-1]['config']
    core = re.match(r'\[([A-Za-z]+)\]\s*', config)
    if core:
        return full_config(CORES[core[1]]) + ' ' + config[core.end():]
    return config

def shells(z):
    parsed = re.findall(r'([1-7])([spdf])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)', full_config(z))
    result = []
    for n in range(1, 8):
        parts = [(l, digits, int(digits.translate(SUPER))) for level,l,digits in parsed if int(level)==n]
        if parts:
            result.append({'n':n, 'label':SHELL_NAMES[n-1], 'count':sum(p[2] for p in parts), 'sublevels':' '.join(f'{n}{l}{d}' for l,d,_ in parts)})
    assert sum(s['count'] for s in result)==z, (z, result)
    return result

def temp_note(z):
    return {
      2: 'O hélio não se solidifica a 1 atm. Por isso, não é apresentado um ponto de fusão normal.',
      6: 'Os valores legados para o carbono dependem da forma e da pressão. Como não representam uma transição normal a 1 atm, ficam fora da comparação de temperaturas.',
      15: 'As temperaturas desta base se referem ao fósforo branco. Outras formas do fósforo têm propriedades diferentes.',
      16: 'A base associa as temperaturas à forma beta, monoclínica, do enxofre. Mudanças de estrutura e condições experimentais afetam os valores.',
      33: 'O arsênio sublima sob pressão atmosférica. O valor de fusão de 817 °C exige pressão elevada; a base registra 614 °C para a sublimação. Não são apresentados como um intervalo líquido a 1 atm.',
      34: 'As temperaturas desta base se referem à forma cinza, hexagonal, do selênio.',
      87: 'As temperaturas do frâncio nesta base são estimativas. Elas não confirmam seu estado macroscópico a 25 °C.',
      97: 'A base associa os valores à forma alfa do berquélio; as amostras e condições de caracterização são limitadas.'
    }.get(z, 'Para elementos com amostras muito limitadas, valores tabulados podem depender de estimativas e de condições específicas; eles não confirmam o estado físico.' if z>=100 or z==85 else '')

models = []
for raw, art in zip(RAW, EDITORIAL['elements']):
    z = raw['numero']
    assert z==art['z']
    series = 57 <= z <= 71 or 89 <= z <= 103
    period = 6 if 57 <= z <= 71 else 7 if 89 <= z <= 103 else raw['periodo']
    radius = raw['raio'] or {}
    model = {
      'z':z,'symbol':art['symbol'],'name':art['name'],'slug':slug(raw['nome']),
      'category':art['category'],'categoryKey':art['category_key'],'color':art['color'],
      'state':art['state'],'mass':art['mass'],'period':period,'group':None if series else raw['grupo'],
      'series':series,'block':raw['bloco'],'config':raw['config'],'fullConfig':full_config(z),
      'predictedConfig':z>=104,'shells':shells(z),'radius':radius.get('r'),
      'radiusType':radius.get('t'),'radiusSource':radius.get('f'),'en':raw['en'],'ei':raw['ei'],
      'fusion':raw['fusao'],'boiling':raw['ebulicao'],'temperatureNote':temp_note(z),
      'temperatureComparable':z not in (6,33,85,87) and z<100,
    }
    models.append(model)
assert len(models)==118
(ROOT/'assets/elementos-fichas.json').write_text(json.dumps(models, ensure_ascii=False, separators=(',',':'))+'\n')

frame = (TEMPLATES/'folio-frame.svg').read_text()
header = (TEMPLATES/'element-header.html').read_text()
dialogs = (TEMPLATES/'element-dialogs.html').read_text()

def fact(label, value):
    return f'<div><dt>{label}</dt><dd>{E(str(value))}</dd></div>'

def related_link(m):
    return f'<a class="ep-related-card" href="../{m["slug"]}/"><span class="ep-related-z">{m["z"]}</span><strong>{m["symbol"]}</strong><span>{m["name"]}</span><small>{m["category"]}</small></a>'

def prop(label, value, explanation, key='', unit=''):
    shown = number(value) + (' '+unit if value is not None else '')
    data = f' data-property="{key}"' if key else ''
    return f'<details class="ep-property"><summary><span>{label}</span><strong{data}>{E(shown)}</strong><small>Entender esta medida <span aria-hidden="true">＋</span></small></summary><p>{explanation}</p></details>'

for m, raw, art in zip(models, RAW, EDITORIAL['elements']):
    z=m['z']; name=m['name']; symbol=m['symbol']; predicted=m['predictedConfig']
    group_label = 'Série destacada' if m['series'] else f'Grupo {m["group"]}'
    placement = f'{m["category"]} · período {m["period"]}' if m['series'] else f'Grupo {m["group"]} · período {m["period"]}'
    state_note = ('A classificação é conservadora: não há caracterização suficiente para afirmar um estado macroscópico nesta condição. “Não determinado” indica uma lacuna de conhecimento, não um quarto estado físico.' if m['state']=='Não determinado' else 'O estado indicado se refere à substância simples a 25 °C e 1 atm. Compostos, ligas e objetos que contêm o elemento podem ter outras propriedades.')
    isotope_mass = m['mass'].startswith('[')
    mass_label = 'Número de massa indicado' if isotope_mass else 'Massa atômica apresentada'
    mass_note = ('O número entre colchetes é o número de massa A de um isótopo indicado na tabela de referência. Não é uma massa atômica média: A conta prótons e nêutrons.' if isotope_mass else 'Este valor representa a massa atômica média de referência, expressa em u. Ele depende da composição isotópica e não permite deduzir a quantidade de nêutrons de um átomo individual.')
    if raw.get('intervalo'):
        mass_note += ' A base também registra o intervalo natural de referência: '+ '–'.join(raw['intervalo']) + ' u.'
    mass_question = (f'Para o isótopo indicado por {m["mass"]}, qual seria o número de nêutrons?' if isotope_mass else f'É correto arredondar {m["mass"]} para descobrir os nêutrons de qualquer átomo de {name.lower()}?')
    mass_answer = (f'Para esse isótopo, N = A − Z = {m["mass"].strip("[]")} − {z} = {int(m["mass"].strip("[]"))-z}. Outros isótopos do mesmo elemento têm outros números de nêutrons.' if isotope_mass else 'Não. A massa média descreve uma composição isotópica. Para calcular N = A − Z, precisamos escolher um isótopo e conhecer seu número de massa A.')
    layer_buttons = ''.join(f'<button type="button" class="ep-shell" data-shell="{s["n"]}" aria-pressed="{"true" if i==0 else "false"}" aria-controls="shell-detail"><small>Camada {s["label"]}</small><strong>{s["count"]}</strong><span>elétron{"s" if s["count"]!=1 else ""}</span></button>' for i,s in enumerate(m['shells']))
    layer_rows = ''.join(f'<tr><th scope="row">{s["label"]} · n = {s["n"]}</th><td>{s["count"]}</td><td>{s["sublevels"]}</td></tr>' for s in m['shells'])
    same_family = [x for x in models if x['z']!=z and ((m['series'] and x['category']==m['category']) or (not m['series'] and x['group']==m['group']))]
    same_family.sort(key=lambda x:abs(x['z']-z))
    related = same_family[:4]
    default_other = related[0]['z'] if related else (z%118)+1
    options = ''.join(f'<option value="{x["z"]}"{" selected" if x["z"]==default_other else ""}>{x["z"]} · {x["name"]} ({x["symbol"]})</option>' for x in models if x['z']!=z)
    radius_label = 'Raio de van der Waals' if m['radiusType']=='vdW' else 'Raio covalente'
    radius_explanation = ('Estimativa da região ocupada por um átomo em contatos não ligantes. Não equivale ao raio covalente.' if m['radiusType']=='vdW' else 'Medida associada à distância entre núcleos em uma ligação covalente. Depende do ambiente químico e da convenção adotada.')+' Um picômetro (pm) corresponde a 10⁻¹² m.'
    if m['radiusSource']=='P09': radius_explanation += ' Esta base usa o conjunto de raios covalentes calculados de Pyykkö e Atsumi.'
    properties = prop(radius_label,m['radius'],radius_explanation,'radius','pm')
    properties += prop('Eletronegatividade · Pauling',m['en'],'Tendência relativa de um átomo a atrair elétrons em uma ligação. A escala de Pauling não tem unidade; a ausência de um valor aqui não significa eletronegatividade zero.','en')
    properties += prop('Primeira energia de ionização',m['ei'],'Energia necessária para retirar o primeiro elétron de um átomo neutro, isolado e no estado gasoso. Uma energia maior indica maior custo para essa remoção.','ei','eV')
    properties += prop('Fusão · valor tabulado',m['fusion'],'Transição entre sólido e líquido. A temperatura depende da pressão e, quando há formas diferentes da substância, da estrutura considerada. '+E(m['temperatureNote']),'fusion','°C')
    properties += prop('Sublimação · valor tabulado' if z==33 else 'Ebulição · valor tabulado',m['boiling'],('Passagem direta de sólido para gás. O arsênio não apresenta uma faixa líquida normal a 1 atm.' if z==33 else 'Transição entre líquido e gás. O valor tabulado exige atenção às condições da substância e à pressão.')+' '+E(m['temperatureNote']),'boiling','°C')
    properties += f'<details class="ep-property"><summary><span>{mass_label}</span><strong>{E(m["mass"])}</strong><small>Entender esta medida <span aria-hidden="true">＋</span></small></summary><p>{E(mass_note)}</p></details>'
    obtaining = ORIGIN_OVERRIDES.get(z, raw['obtencao'])
    if 96<=z<=100:
        obtaining = f'O {name.lower()} é produzido em instalações de pesquisa por reações nucleares envolvendo núcleos pesados. Sua obtenção pode envolver irradiações e separações sucessivas; as quantidades disponíveis são limitadas e dependem do isótopo.'
    elif z>=101:
        obtaining = f'O {name.lower()} é um elemento sintético, produzido para pesquisa por colisões de núcleos em aceleradores. A identificação se apoia nos sinais dos átomos produzidos e em seus decaimentos. Não existe extração mineral ou produção comercial comum desse elemento.'
    source_items = []
    seen = set()
    for source in art['phrase_sources']:
        if source['url'] not in seen:
            source_items.append(f'<li><a href="{E(source["url"],quote=True)}">{E(source["label"])}</a> — contexto da ilustração e leitura complementar.</li>'); seen.add(source['url'])
    for url in art['source_urls']:
        if 'periodic-table.rsc.org' in url and url not in seen:
            source_items.append(f'<li><a href="{E(url,quote=True)}">Royal Society of Chemistry — {E(name)}</a> — perfil do elemento.</li>');seen.add(url)
    source_items.extend([
      '<li><a href="https://ciaaw.org/abridged-atomic-weights.htm">CIAAW — pesos atômicos abreviados (2024)</a> — referência editorial para as massas.</li>',
      '<li><a href="https://iupac.org/what-we-do/periodic-table-of-elements/">IUPAC — tabela e convenções</a> — grupos, séries e números de massa entre colchetes; edição de 4 de maio de 2022 para [A].</li>',
      '<li><a href="https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html">NIST — energias de ionização</a> — consulta especializada para a primeira ionização.</li>',
      '<li><a href="https://periodictable.com/Properties/A/MeltingPoint.v.html">Compilação de temperaturas — Wolfram ElementData</a> — origem dos valores de transição da base e de suas notas sobre formas da substância.</li>',
      f'<li>Raio atômico: {E(RADIUS_REFS.get(m["radiusSource"],"referência não informada na base."))}</li>'
    ])
    prev = models[z-2] if z>1 else None; nxt = models[z] if z<118 else None
    previous = f'<a href="../{prev["slug"]}/" rel="prev"><small>← Folheto anterior</small><strong>{prev["name"]}</strong><span>{prev["symbol"]} · {prev["z"]}</span></a>' if prev else '<a href="../../index.html#colecao"><small>Voltar à coleção</small><strong>Todos os elementos</strong></a>'
    following = f'<a href="../{nxt["slug"]}/" rel="next"><small>Próximo folheto →</small><strong>{nxt["name"]}</strong><span>{nxt["symbol"]} · {nxt["z"]}</span></a>' if nxt else '<a href="../../index.html#colecao"><small>Voltar à coleção</small><strong>Todos os elementos</strong></a>'
    state_icon = f'estado_{STATE_KEYS[m["state"]]}_{m["categoryKey"]}.webp'
    position_note = ('Esta série pertence ao período '+str(m['period'])+'. Ela aparece abaixo da tabela para tornar o desenho mais compacto. A coluna do folheto nessa linha não corresponde a um número de grupo. A atribuição do grupo 3 tem convenções distintas; esta coleção identifica a série sem atribuir grupos artificiais.' if m['series'] else 'O grupo é a coluna vertical; o período é a linha horizontal da tabela. Elementos de um mesmo grupo podem apresentar semelhanças, mas a posição não torna todas as suas propriedades iguais.')
    paragraph_config = 'Configuração prevista teoricamente para o átomo neutro.' if predicted else 'Configuração do átomo neutro, conforme a base de referência.'
    body = f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="{E(name)} ({symbol}): explore o átomo, compare propriedades e descubra suas conexões no Cordel dos Elementos."><meta name="theme-color" content="#f4eedf"><meta name="color-scheme" content="light dark"><title>{E(name)} ({symbol}) · Cordel dos Elementos</title><link rel="manifest" href="../../manifest.webmanifest"><link rel="icon" href="../../assets/icon-192.png"><link rel="apple-touch-icon" href="../../assets/icon-192.png"><link rel="stylesheet" href="../../assets/style.css"><link rel="stylesheet" href="../../assets/element-page.css"><script defer src="../../assets/accessibility.js"></script><script defer src="../../assets/element-model.js"></script><script defer src="../../assets/element-page.js"></script></head>
<body class="element-page" style="--element-color:{m['color']}">{header}
<main id="conteudo" class="wrap ep-main"><nav class="ep-breadcrumb" aria-label="Caminho da página"><a href="../../index.html#colecao">Coleção dos elementos</a><span aria-hidden="true">/</span><span aria-current="page">{E(name)}</span></nav>
<div class="ep-hero" id="ficha"><figure class="ep-cover">{frame}<span class="ep-cover-pin" aria-hidden="true"></span><div class="ep-cover-top"><span><small>Número atômico</small><strong>{z}</strong></span><span class="ep-state"><img src="../../assets/colecao/{state_icon}" width="42" height="42" alt=""><span>{m['state']}<small>25 °C · 1 atm</small></span></span></div><span class="ep-symbol" aria-hidden="true">{symbol}</span><img class="ep-art" src="../../assets/colecao/arte-{z:03d}.webp" alt="{E(art['illustration_description'],quote=True)}" width="640" height="427" fetchpriority="high"><figcaption><strong>{E(name)}</strong><span>{E(m['mass'])}</span><div class="ep-ornament" aria-hidden="true">◆</div><p>{E(art['phrase'])}</p></figcaption></figure>
<div class="ep-introduction"><p class="ep-kicker">Folheto {z:03d} <span>/ 118</span></p><p class="ep-category">{E(m['category'])}</p><h1>{E(name)}</h1><p class="ep-hero-phrase">{E(art['phrase'])}</p><p class="ep-intro-description">Um elemento, muitas conexões. Percorra este folheto para descobrir o que sua identidade atômica revela e como ela se relaciona com o mundo.</p><dl class="ep-identity-facts">{fact('Símbolo químico',symbol)}{fact('Na tabela',placement)}{fact(mass_label,m['mass'])}</dl><div class="ep-actions"><a class="ep-primary" href="#atomo">Explorar o átomo <span aria-hidden="true">↓</span></a><button hidden data-enhance id="copy-element" type="button">Copiar link</button><button hidden data-enhance id="print-element" type="button">Imprimir folheto</button></div><p id="share-status" class="ep-status" role="status"></p><div id="share-fallback" hidden><label for="element-url">Selecione e copie o endereço</label><input id="element-url" readonly></div></div></div>
<div class="ep-reading"><nav class="ep-chapters" aria-label="Capítulos deste folheto"><p>Dentro do folheto</p><a href="#cotidiano"><span>01</span> Conexões</a><a href="#atomo"><span>02</span> O átomo</a><a href="#propriedades"><span>03</span> Propriedades</a><a href="#obtencao"><span>04</span> De onde vem</a><a href="#posicao"><span>05</span> Na tabela</a><a href="#referencias"><span>06</span> Fontes e notas</a><a class="ep-back-top" href="#conteudo">Voltar ao início ↑</a></nav>
<div class="ep-chapter-content">
<section class="ep-section" id="cotidiano" aria-labelledby="heading-context"><div class="ep-section-heading"><span>01</span><div><p class="ep-kicker">Do desenho à química</p><h2 id="heading-context">Conexões que contam histórias</h2></div></div><p id="curiosidades" class="ep-context">{E(CONTEXT[str(z)])}</p><details class="ep-explainer"><summary>Como ler a ilustração deste folheto?</summary><p>A arte representa: <strong>{E(art['illustration_description'])}</strong>. {E(art['phrase'])}</p><p>Uma ilustração pode mostrar um objeto, composto, liga ou contexto de pesquisa. Ela não representa necessariamente uma amostra pura do elemento.</p></details><div class="ep-state-note"><img src="../../assets/colecao/{state_icon}" alt="" width="48" height="48" loading="lazy"><div><strong>{m['state']} · 25 °C e 1 atm</strong><p>{state_note}</p></div></div></section>
<section class="ep-section" id="atomo" aria-labelledby="heading-atom"><div class="ep-section-heading"><span>02</span><div><p class="ep-kicker">Identidade por dentro</p><h2 id="heading-atom">O que faz {symbol} ser {symbol}?</h2></div></div><p>São os <strong>{z} prótons</strong> no núcleo que identificam o elemento {name.lower()}. No átomo neutro, essa carga positiva é equilibrada por <strong>{z} elétrons</strong>.</p><dl class="ep-atom-counts">{fact('Prótons',z)}{fact('Elétrons · átomo neutro',z)}{fact('Nêutrons','Dependem do isótopo')}</dl><h3>Elétrons, camada por camada</h3><p>{paragraph_config} As camadas agrupam os elétrons pelo número quântico principal n.</p><div class="ep-shell-explorer" hidden data-enhance><p class="ep-hint" id="shell-help">Escolha um folheto para ver os subníveis ocupados nessa camada.</p><div class="ep-shells" role="group" aria-label="Camadas eletrônicas" aria-describedby="shell-help">{layer_buttons}</div><div id="shell-detail" class="ep-shell-detail" role="status" aria-live="polite"></div></div><details class="ep-explainer" open><summary>Distribuição completa e configuração</summary><p class="ep-config">{E(m['config'])}</p><p class="ep-small">{'Previsão teórica. ' if predicted else ''}Colchetes na configuração representam os elétrons de um gás nobre. Eles têm significado diferente dos colchetes usados no número de massa.</p><p class="ep-full-config">Sem abreviação: <strong>{E(m['fullConfig'])}</strong></p><div class="ep-table-scroll" tabindex="0" role="region" aria-label="Distribuição dos elétrons por camada"><table class="ep-shell-table"><caption>Contagem por camada do átomo neutro</caption><thead><tr><th scope="col">Camada</th><th scope="col">Elétrons</th><th scope="col">Subníveis ocupados</th></tr></thead><tbody>{layer_rows}</tbody></table></div></details><p class="ep-small">Este esquema organiza a contagem de elétrons: não desenha trajetórias nem distâncias reais. {'No paládio, a configuração tabulada não ocupa a camada n = 5; isso não altera sua posição no período 5.' if z==46 else 'A última camada ocupada não deve ser confundida, em todos os casos, com o conjunto dos elétrons envolvidos em ligações.'}</p><details class="ep-question"><summary><span>Pergunta de bolso</span>{E(mass_question)}</summary><p>{E(mass_answer)}</p></details></section>
<section class="ep-section" id="propriedades" aria-labelledby="heading-properties"><div class="ep-section-heading"><span>03</span><div><p class="ep-kicker">Medidas com significado</p><h2 id="heading-properties">Compare, relacione, entenda</h2></div></div><p>Abra cada medida para entender o que ela descreve. Um campo sem valor indica uma informação ausente nesta base, nunca zero.</p><fieldset class="ep-unit-controls" hidden data-enhance><legend>Unidades de leitura</legend><label>Temperatura<select id="temperature-unit"><option value="C">°C · Celsius</option><option value="K">K · kelvin</option></select></label><label>Ionização<select id="energy-unit"><option value="eV">eV · por átomo</option><option value="kJ">kJ/mol · por mol</option></select></label></fieldset><div class="ep-properties">{properties}</div>{f'<p class="ep-caution">{E(m["temperatureNote"])}</p>' if m['temperatureNote'] else ''}
<div class="ep-comparison" id="comparar"><p class="ep-kicker">Dois folhetos, lado a lado</p><h3>O que muda entre os elementos?</h3><p id="comparison-fallback">As propriedades acima podem ser consultadas sem JavaScript. Ative-o para comparar dois elementos neste quadro.</p><div id="comparison-controls" hidden><div class="ep-compare-controls"><label>Comparar {E(name)} com<select id="compare-element">{options}</select></label><label>Escolha a propriedade<select id="compare-property"><option value="radius">Raio atômico</option><option value="en">Eletronegatividade · Pauling</option><option value="ei">Primeira energia de ionização</option><option value="fusion">Fusão</option><option value="boiling">Ebulição / sublimação</option></select></label></div><div id="comparison-result" class="ep-compare-result" aria-live="polite" aria-atomic="true"><div class="ep-compare-row"><span id="comparison-name-a"></span><strong id="comparison-value-a"></strong><span class="ep-meter" aria-hidden="true"><i id="comparison-bar-a"></i></span></div><div class="ep-compare-row"><span id="comparison-name-b"></span><strong id="comparison-value-b"></strong><span class="ep-meter" aria-hidden="true"><i id="comparison-bar-b"></i></span></div><p id="comparison-note"></p></div><a id="comparison-link" href="../{models[default_other-1]['slug']}/">Abrir o outro folheto →</a></div></div></section>
<section class="ep-section" id="obtencao" aria-labelledby="heading-origin"><div class="ep-section-heading"><span>04</span><div><p class="ep-kicker">Da origem aos materiais</p><h2 id="heading-origin">Da origem à obtenção</h2></div></div><p class="ep-context">{E(obtaining)}</p><details class="ep-explainer"><summary>{'Produzir um elemento é o mesmo que separar uma substância?' if z>=93 else 'Encontrar o elemento é encontrar o material puro?'}</summary><p>{'Reações químicas reorganizam átomos em substâncias. Para produzir núcleos de outro elemento, é preciso mudar o número de prótons por processos nucleares. Depois, técnicas químicas podem separar os produtos.' if z>=93 else 'Nem sempre. Um elemento pode estar combinado com outros em minerais, dissolvido em misturas ou distribuído em materiais. Separar, concentrar e transformar esses compostos são etapas diferentes da obtenção da substância simples.'}</p></details></section>
<section class="ep-section" id="posicao" aria-labelledby="heading-position"><div class="ep-section-heading"><span>05</span><div><p class="ep-kicker">Uma posição, muitas relações</p><h2 id="heading-position">Encontre seus vizinhos</h2></div></div><dl class="ep-position-facts">{fact('Posição',group_label)}{fact('Período',m['period'])}{fact('Bloco na coleção',m['block'])}{fact('Categoria',m['category'])}</dl><p>{position_note}</p><h3>{'Outros folhetos desta série' if m['series'] else 'Outros folhetos deste grupo'}</h3><div class="ep-related">{''.join(related_link(x) for x in related)}</div><p><a href="../../index.html#colecao">Ver a coleção e a tabela periódica completa →</a></p></section>
<section class="ep-section ep-references" id="referencias" aria-labelledby="heading-references"><div class="ep-section-heading"><span>06</span><div><p class="ep-kicker">Continue a leitura</p><h2 id="heading-references">Fontes e notas do folheto</h2></div></div><p>As ilustrações e os textos aproximam os elementos químicos de situações do cotidiano. As propriedades apresentadas devem ser interpretadas considerando as condições de referência, os métodos e as convenções utilizados nas fontes consultadas. As referências a seguir permitem aprofundar os conhecimentos e compreender melhor os dados. Quando a incerteza não é indicada, o valor não deve ser considerado exato.</p><ol>{''.join(source_items)}</ol><details class="ep-explainer"><summary>Convenções de leitura</summary><p>{E(mass_note)}</p><p>As propriedades descrevem contextos diferentes: a primeira ionização considera átomos no gás, o raio depende de uma convenção e as temperaturas dependem da pressão e da forma da substância. Esses valores não são automaticamente propriedades do objeto ilustrado.</p><p>O estado físico segue a condição de 25 °C e 1 atm. Algumas fontes complementares usam 20 °C; essa diferença precisa ser considerada ao comparar referências.</p></details></section>
</div></div><nav class="ep-pager" aria-label="Percorrer elementos">{previous}{following}</nav></main>
<footer><div class="wrap"><strong>Cordel dos Elementos</strong><p>Química em folhetos, conhecimento em movimento.</p><a href="../../index.html#colecao">Voltar à coleção</a><div class="site-contact"><p><strong>Encontrou algum erro no site?</strong> Para informar problemas no conteúdo ou no funcionamento, entre em contato pelo e-mail <a href="mailto:202411320020@ifba.edu.br">202411320020@ifba.edu.br</a>.</p><p>Informe a página ou o elemento, descreva o problema e, se possível, anexe uma captura de tela.</p></div></div></footer>{dialogs}
<script type="application/json" id="element-data">{json.dumps(m, ensure_ascii=False, separators=(',',':')).replace('<','\\u003c')}</script><script defer src="../../assets/experience.js"></script></body></html>'''
    path=ROOT/'elementos'/m['slug']/'index.html'
    assert path.exists(), f'Would change existing QR route: {path}'
    path.write_text(body)
print('Geradas 118 fichas; rotas existentes, coleção e abertura preservadas.')
