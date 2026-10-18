"""Adaptar fontes aprovadas do Drive para o catálogo, preservando as artes.
Uso: python preparar_varal.py /caminho/projeto_tabela_periodica
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from html import escape
import hashlib, json, re, shutil, sys, os, tempfile
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools import subset
SITE=Path(__file__).resolve().parents[2]
SOURCE=Path(sys.argv[1]).resolve()
DATA=json.loads((SOURCE/'Colecao_v08/04_Dados_e_fontes/Dados_118_elementos_v08.json').read_text())
ELEMENTS=DATA['elements']
NAME_BREAKS=json.loads(Path(__file__).with_name('quebras-nomes.json').read_text())
ASSETS=SITE/'assets/colecao'; ASSETS.mkdir(parents=True,exist_ok=True)

def image_for_web(source,destination,edge):
    # Apenas tamanho e formato web: proporções, cores e transparência preservadas.
    valid = False
    if destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
        try:
            with Image.open(destination) as cached:
                cached.load()
                valid = cached.format == 'WEBP' and 0 < max(cached.size) <= edge
        except (OSError, ValueError):
            pass
    if not valid:
        # Um arquivo parcial nunca substitui uma imagem válida.
        fd, temporary = tempfile.mkstemp(dir=destination.parent, suffix='.webp')
        os.close(fd)
        try:
            with Image.open(source) as im:
                im=im.convert('RGBA'); im.thumbnail((edge,edge),Image.Resampling.LANCZOS)
                im.save(temporary,format='WEBP',quality=88,method=6)
            with Image.open(temporary) as check:
                check.load()
                assert check.format == 'WEBP' and check.width > 0 and check.height > 0
            os.replace(temporary,destination)
        finally:
            Path(temporary).unlink(missing_ok=True)
    return {'source':str(source.relative_to(SOURCE)),'sha256_source':hashlib.sha256(source.read_bytes()).hexdigest(),'web':str(destination.relative_to(SITE)),'sha256_web':hashlib.sha256(destination.read_bytes()).hexdigest()}
state_names={'Sólido':'solido','Líquido':'liquido','Gasoso':'gasoso','Não determinado':'nao_determinado'}
tasks=[]; icons={}
for e in ELEMENTS:
    tasks.append((SOURCE/e['asset'],ASSETS/f"arte-{e['z']:03d}.webp",640))
    icon=f"estado_{state_names[e['state']]}_{e['category_key']}"; icons[e['z']]=icon
    task=(SOURCE/f'02_Layouts_mestres/Indicadores_de_estado/{icon}.png',ASSETS/f'{icon}.webp',144)
    if task not in tasks: tasks.append(task)
with ThreadPoolExecutor(max_workers=6) as pool:
    provenance=list(pool.map(lambda args:image_for_web(*args),tasks))
font_dir=SITE/'assets/fonts'; font_dir.mkdir(exist_ok=True)
for name in ['DejaVuSerif-Bold','DejaVuSans','DejaVuSans-Bold']:
    font=TTFont(SOURCE/f'07_Fontes_editaveis/fonts/{name}.ttf'); sub=subset.Subsetter()
    sub.populate(unicodes=list(range(0x20,0x180))+list(range(0x2000,0x2100))+[0x2197,0x2192,0x2212]); sub.subset(font)
    font.flavor='woff'; font.save(font_dir/f'{name}.woff')
shutil.copyfile(SOURCE/'07_Fontes_editaveis/fonts/LICENSE_DejaVu.txt',font_dir/'LICENSE_DejaVu.txt')
# Geometria da moldura original: contorno talhado, linha interior e quatro hachuras.
corners=[]
for sx in [-1,1]:
    for sy in [-1,1]:
        ax,ay=(95.7 if sx==1 else 4.3),(135.7 if sy==1 else 4.3)
        for k in range(4):
            d=.75+k*.72; corners.append(f'M{ax-sx*d:.2f} {ay}L{ax} {ay-sy*d:.2f}')
FRAME='<svg class="folio-frame folio-decoration" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="folio-frame-outer" d="M2.4 2L27.92 2.16L61.52 1.94L97.7 2.18L98 46.88L97.88 93.12L97.9 137.8L64.4 138L31.76 137.85L2.15 138L2 89.04L2.14 42.8Z"/><path class="folio-frame-inner" d="M3.5 3.5H96.5V136.5H3.5Z"/><path class="folio-frame-hatch" d="'+' '.join(corners)+'"/></svg>'
DIVIDER='<span class="folio-divider folio-decoration" aria-hidden="true"><i></i></span>'
index_path=SITE/'index.html'; index=index_path.read_text()
old_tiles=re.findall(r'<a class="tile\b[^>]*>.*?</a>',index,re.S)
assert len(old_tiles)==118
routes={};positions={}
for tile in old_tiles:
    z=int(re.search(r'data-search="(\d+)',tile)[1]); routes[z]=re.search(r'href="([^"]+)"',tile)[1]; positions[z]=re.search(r'style="([^"]+)"',tile)[1]
categories=sorted({e['category'] for e in ELEMENTS})
def phrase(e): return e['phrase'].replace('\\n',' ').replace('\n',' ')
def card(e):
    z=e['z']; state_id=f'folio-state-{z}'; phrase_id=f'folio-phrase-{z}'
    return f'''<a class="tile category-{categories.index(e['category'])}" href="{escape(routes[z],quote=True)}" style="{positions[z]}" data-search="{z} {escape(e['symbol'])} {escape(e['name'])}" data-category="{escape(e['category'])}" aria-label="{escape(e['name'])}, {escape(e['symbol'])}, número atômico {z}, {escape(e['category'])}. Abrir folheto." aria-describedby="{state_id} {phrase_id}">
{FRAME}<span class="folio-header"><span class="z">{z}</span><span class="folio-state folio-decoration" id="{state_id}"><img class="folio-state-icon" src="assets/colecao/{icons[z]}.webp" width="42" height="42" alt="" loading="lazy" decoding="async"><span><strong>{escape(e['state'])}</strong><span class="folio-condition">25 °C / 1 atm</span></span></span><small class="folio-category">{escape(e['category'])}</small></span>
<span class="symbol">{escape(e['symbol'])}</span><img class="folio-illustration folio-decoration" src="assets/colecao/arte-{z:03d}.webp" alt="{escape(e['illustration_description'],quote=True)}" width="640" height="427" loading="lazy" decoding="async"><span class="name">{escape(NAME_BREAKS.get(e['name'],e['name']))}</span><span class="folio-mass folio-decoration">{escape(e['mass'])}</span>{DIVIDER}<span class="folio-phrase folio-decoration" id="{phrase_id}">{escape(phrase(e))}</span><span class="folio-open folio-decoration" aria-hidden="true">Abrir folheto <span>↗</span></span></a>'''
cards=''.join(card(e) for e in ELEMENTS)
index,n=re.subn(r'<div class="grid(?: cordel-collection)?">.*?</div>(?=</div><p id="empty")','<div class="grid cordel-collection">'+cards+'</div>',index,count=1,flags=re.S)
assert n==1,'Catálogo não encontrado; índice não alterado.'
if 'href="assets/cordel-collection.css"' not in index:
    index=index.replace('<link rel="stylesheet" href="assets/style.css">','<link rel="stylesheet" href="assets/style.css"><link rel="stylesheet" href="assets/cordel-collection.css">')
if 'src="assets/cordel-collection.js"' not in index:
    index=index.replace('<script defer src="assets/app.js"></script>','<script defer src="assets/app.js"></script><script defer src="assets/cordel-collection.js"></script>')
index=index.replace('<h2>Explore os elementos</h2></div><div class="view-switch"','<h2>Um varal de elementos</h2><p class="catalog-intro">Escolha um folheto e descubra a química no cotidiano.</p></div><div class="view-switch"')
index=index.replace('data-view="collection" aria-pressed="true">Coleção</button>','data-view="collection" aria-pressed="true">Varal</button>')
options='<option value="">Todas as categorias</option>'+''.join(f'<option>{escape(c)}</option>' for c in categories)
index=re.sub(r'(<select id="category">).*?(</select>)',lambda m:m[1]+options+m[2],index,count=1,flags=re.S)
index_path.write_text(index)
sw_path=SITE/'sw.js';sw=sw_path.read_text();sw=re.sub(r"const CACHE='cordel-[^']+'","const CACHE='cordel-varal-v5'",sw,count=1)
cache_files=['assets/cordel-collection.css','assets/cordel-collection.js']+[p['web'] for p in provenance]+[str(p.relative_to(SITE)) for p in font_dir.glob('*.woff')]
extra=[json.dumps(f) for f in cache_files if json.dumps(f) not in sw]
if extra:sw=sw.replace('const FILES=[','const FILES=['+','.join(extra)+',',1)
sw_path.write_text(sw)
record={'reference_version':DATA['version'],'reference_date':DATA['revision_date'],'drive_folder':'https://drive.google.com/drive/folders/1cNErLSmFsFhrkXjIJHGx4eObGKtwmDOn','processing':'Tamanho proporcional e WebP, transparência preservada; fontes originais em WOFF. Sem redesenho.','files':provenance}
(SITE/'estudos/colecao/proveniencia.json').write_text(json.dumps(record,ensure_ascii=False,indent=2))
(SITE/'assets/colecao/dados.json').write_text(json.dumps(DATA,ensure_ascii=False,separators=(',',':')))
print(json.dumps({'cards':len(ELEMENTS),'images':len(provenance),'image_bytes':sum((SITE/p['web']).stat().st_size for p in provenance),'fonts':3}))
