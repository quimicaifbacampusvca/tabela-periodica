"""Prévia autônoma: todos os recursos locais embutidos; páginas abrem o site atual."""
from pathlib import Path
import re,base64,json
from PIL import Image
S=Path(__file__).resolve().parents[2]
html=(S/'index.html').read_text()
collection=re.search(r'<section id="colecao".*?</section>',html,re.S).group(0)
drawer=re.search(r'<dialog id="appearance".*?</dialog>',html,re.S).group(0)
filters=re.search(r'<svg class="access-filters".*?</svg>',html,re.S).group(0)
base='https://quimicaifbacampusvca.github.io/tabela-periodica/'
collection=re.sub(r'href="(elementos/[^"]+)"',lambda m:'href="'+base+m[1]+'" target="_blank" rel="noopener"',collection)
def uri(p):
    mime={'.webp':'image/webp','.png':'image/png','.woff':'font/woff'}[p.suffix]
    if mime.startswith('image/'):
        with Image.open(p) as image:
            image.load()
            assert image.width > 0 and image.height > 0, f'Imagem inválida: {p}'
    assert p.stat().st_size > 0, f'Recurso vazio: {p}'
    return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
def embed_image(m): return 'src="'+uri(S/m[1])+'"'
collection=re.sub(r'src="(assets/[^"]+)"',embed_image,collection)
css=(S/'assets/style.css').read_text()+'\n'+(S/'assets/cordel-collection.css').read_text()
css=re.sub(r"url\('fonts/([^']+)'\)",lambda m:"url('"+uri(S/'assets/fonts'/m[1])+"')",css)
css+='\n.preview-head{display:flex;align-items:center;gap:1rem;padding:1.1rem 0;border-bottom:1px solid var(--line)}.preview-head img{width:56px;height:56px;object-fit:contain}.preview-head strong{font-family:Georgia,serif;font-size:1.25rem}.preview-head p{margin:0;font-size:.76rem;color:var(--muted)}.preview-head button{margin-left:auto}.preview-main{padding-block:2rem}.preview-footer{font-size:.8rem;color:var(--muted);padding:1rem 0 2rem}.preview-head>div{min-width:0}@media(max-width:500px){.preview-head{flex-wrap:wrap}.preview-head button{margin-left:0}.preview-head strong{font-size:1.05rem}}'
mode_script="""(()=>{const grid=document.querySelector('#colecao .grid');document.querySelectorAll('[data-view]').forEach(button=>{button.onclick=()=>{const periodic=button.dataset.view==='periodic';grid.classList.toggle('periodic',periodic);document.getElementById('table-help').hidden=!periodic;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.getElementById('search').dispatchEvent(new Event('input'));};});})();"""
scripts=''.join('<script>'+ (S/'assets'/f).read_text()+'</script>' for f in ['accessibility.js','app.js','cordel-collection.js'])+'<script>'+mode_script+'</script>'
result=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f4eedf"><title>Cordel dos Elementos · Prévia 02</title><style>{css}</style></head><body><a class="skip" href="#conteudo">Ir para o catálogo</a><header class="wrap preview-head"><img src="{uri(S/'assets/logo-symbol.webp')}" alt=""><div><strong>Cordel dos Elementos</strong><p>Prévia 02 · artes originais do Drive</p></div><button id="appearance-open" type="button" aria-controls="appearance" aria-expanded="false">Acessibilidade</button></header><main id="conteudo" class="wrap preview-main">{collection}</main><footer class="wrap preview-footer">Os folhetos abrem as páginas do site atual em uma nova aba.</footer>{drawer}{filters}{scripts}</body></html>'''
result=result.replace('Prévia 02','Prévia 03')
out=Path('output/cordel-varal-previa-03.html');out.parent.mkdir(exist_ok=True);out.write_text(result)
print(json.dumps({'preview':str(out.resolve()),'bytes':out.stat().st_size,'elements':len(re.findall(r'<a class="tile ',result))}))
