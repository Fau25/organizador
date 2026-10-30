"""
Pruebas automáticas de Mi Día (sin conexión: Google, IMDb y fuentes simuladas).

Uso:   pip install playwright && python3 tests/test_app.py
       (o con un Chromium ya instalado: PLAYWRIGHT_BROWSERS_PATH=... python3 tests/test_app.py)
Sale con código 1 si algo falla.
"""
import json, os, sys, time, base64
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = 'file://' + os.path.join(ROOT, 'index.html')
LISTA = 'file://' + os.path.join(ROOT, 'lista.html')
URL = 'https://script.google.com/macros/s/TEST/exec'
fails = []

def check(name, ok, extra=''):
    print(('  ✓ ' if ok else '  ✗ ') + name + (f'  ({extra})' if extra and not ok else ''))
    if not ok: fails.append(name)

def fake_google(route):
    r = route.request
    b = json.loads(r.post_data or '{}') if r.method == 'POST' else {}
    a = b.get('action')
    if a == 'upImg': time.sleep(1.2); body = {'ok': True, 'url': 'https://lh3.googleusercontent.com/d/AAAAAAAAAAAAAAAAAAAAAAAA=w900'}
    elif a == 'rating': body = {'ok': True, 'r': 8.5}
    else: body = {'ok': True, 'store': {'tasks': {}, 'lists': {}, 'tomb': {}}, 'bdays': [], 'events': []}
    route.fulfill(status=200, headers={'content-type': 'application/json'}, body=json.dumps(body))

def page(p, lists, linked=False, w=393, h=852):
    pg = p.new_page(viewport={'width': w, 'height': h})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('https://fonts.**', lambda r: r.abort())
    pg.route('https://script.google.com/**', fake_google)
    cfg = f",cfg:{{url:'{URL}',key:'k'}}" if linked else ''
    pg.add_init_script("localStorage.setItem('midia-v1',JSON.stringify({name:'T',tasks:[],lists:%s,bdays:[],events:[]%s}))" % (json.dumps(lists), cfg))
    pg.goto(APP); pg.wait_for_timeout(700)
    return pg, errs

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b
    print('Listas')
    pg, errs = page(b, [])
    pg.click('[data-pill=listas]'); pg.wait_for_timeout(400); pg.evaluate('expand()'); pg.wait_for_timeout(400)
    pg.fill('#qtext', 'En el súper leche, huevos y pan'); pg.press('#qtext', 'Enter'); pg.wait_for_timeout(200)
    got = pg.evaluate('db.lists.map(x=>[x.t,x.lc])')
    check('frase dictada → 3 cosas en Súper', got == [['Leche', 'super'], ['Huevos', 'super'], ['Pan', 'super']], got)
    check('«Casa de muñecas» no se toma como categoría', pg.evaluate('parseListPhrase("Casa de muñecas").cat') is None)
    check('sin errores de JavaScript', not errs, errs)

    print('Editar con la sincronización renovando las fichas')
    pg, errs = page(b, [{'id': 'g1', 't': 'Perfume', 'g': 1, 'c': 'cumple', 'nf': 1, 'u': 1}, {'id': 'l1', 't': 'Leche', 'lc': 'super', 'u': 1}])
    pg.evaluate('openPage("regalos")'); pg.wait_for_timeout(300)
    pg.evaluate('openGfSheet(db.lists[0])'); pg.evaluate('db.lists=JSON.parse(JSON.stringify(db.lists))')
    pg.fill('#gfName', 'Perfume Narciso'); pg.fill('#gfFor', 'Mamá'); pg.click('#gfSave'); pg.wait_for_timeout(200)
    pg.evaluate('openEdit("l:l1")'); pg.evaluate('db.lists=JSON.parse(JSON.stringify(db.lists))'); pg.fill('#edText', 'Leche sin lactosa'); pg.evaluate('saveEdit()')
    got = pg.evaluate('db.lists.map(x=>[x.t,x.pq||null])')
    check('Compras y Listas guardan la edición', got == [['Perfume Narciso', 'Mamá'], ['Leche sin lactosa', None]], got)

    print('Foto pegada mientras sincroniza')
    pg, errs = page(b, [{'id': 'a1', 't': 'Bolso', 'g': 1, 'c': 'capricho', 'u': 1}], linked=True)
    pg.evaluate('(()=>{const it=db.lists[0];it.nf=1;uploadPasted(it,"data:image/gif;base64,R0lGODlhAQABAIAAAP8AAP///yH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==");db.lists=JSON.parse(JSON.stringify(db.lists))})()')
    pg.wait_for_timeout(2500)
    check('la foto queda en la ficha vigente', 'lh3.googleusercontent' in (pg.evaluate('db.lists[0].img') or ''))

    print('Teclado físico')
    pg, errs = page(b, [], w=820, h=1180)
    pg.click('[data-pill=listas]'); pg.wait_for_timeout(400); pg.keyboard.type('Pilas'); pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
    check('escribir en la portada añade a Listas', pg.evaluate('db.lists.map(x=>x.t)') == ['Pilas'])

    print('Lecturas por POST (la clave no va en la dirección)')
    seen = []
    pg, errs = page(b, [], linked=True)
    pg.on('request', lambda r: seen.append((r.method, r.url)) if 'script.google.com' in r.url else None)
    pg.evaluate('apiGet("store")'); pg.wait_for_timeout(300)
    check('lee por POST', seen and seen[-1][0] == 'POST' and 'key=' not in seen[-1][1], seen[-1:])
    pg.unroute('https://script.google.com/**')
    def old_script(route):
        r = route.request
        body = {'ok': False, 'error': 'Acción desconocida'} if r.method == 'POST' else {'ok': True, 'store': {'tasks': {}, 'lists': {}, 'tomb': {}}}
        route.fulfill(status=200, headers={'content-type': 'application/json'}, body=json.dumps(body))
    pg.route('https://script.google.com/**', old_script)
    check('con el script antiguo vuelve a GET', pg.evaluate('apiGet("store").then(j=>!!j.store)'))
    check('ritmo tranquilo sin actividad', pg.evaluate('(lastActive=Date.now()-300000, Date.now()-lastActive<120000?15000:45000)') == 45000)

    print('Seguridad de la lista compartida')
    pg = b.new_page(); pg.route('https://fonts.**', lambda r: r.abort())
    code = 'j' + base64.urlsafe_b64encode(json.dumps({'k': 'g', 's': 'x', 'i': [['Trampa', '', 'javascript:alert(1)', '']]}).encode()).decode().rstrip('=')
    pg.goto(LISTA + '#' + code); pg.wait_for_timeout(300)
    check('enlaces «javascript:» anulados', pg.evaluate('document.querySelectorAll("a[href^=javascript]").length') == 0)

    b.close()

print('\n' + ('TODO BIEN ✓' if not fails else f'{len(fails)} FALLO(S): ' + ', '.join(fails)))
sys.exit(1 if fails else 0)
