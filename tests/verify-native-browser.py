"""Safari through Apple safaridriver; stock Firefox stable/ESR through geckodriver."""

import os, json, time, traceback, platform, signal
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import ElementNotInteractableException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

kind = os.environ.get("NATIVE_BROWSER", "safari")
ident = os.environ.get("COMPAT_ID", kind)
out = Path("dist/compatibility") / ident
out.mkdir(parents=True, exist_ok=True)
report = {
    "id": ident,
    "browser": kind,
    "platform": platform.platform(),
    "cases": [],
    "limitations": [
        "No physical iOS/Android device.",
        "Native print dialogs, OS installation prompts and external VLibras translation are not automated.",
        "Any trusted-keyboard fallback is recorded explicitly; it does not homologate pointer delivery for that activation.",
        "Safari minimum window size can exceed the requested mobile viewport. Exact actual sizes are recorded.",
    ],
}
base = os.environ.get("SITE_BASE", "http://127.0.0.1:8765")
driver = None


def save():
    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))


def case(name, fn):
    started = time.time()
    try:
        details = fn()
        report["cases"].append(
            {
                "name": name,
                "status": "passed",
                "seconds": time.time() - started,
                "details": details,
            }
        )
    except Exception:
        report["cases"].append(
            {
                "name": name,
                "status": "failed",
                "seconds": time.time() - started,
                "error": traceback.format_exc(),
            }
        )
    save()


def js(code, *args):
    return driver.execute_script(code, *args)


def wait(code):
    return WebDriverWait(driver, 20).until(lambda _: js(code))


def click(selector):
    el = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
    )
    raw_tag = el.tag_name
    report.setdefault("inputTags", {})[selector] = raw_tag
    if (
        raw_tag.lower() == "input"
        and (el.get_attribute("type") or "").lower() == "checkbox"
    ):
        el = el.find_element(By.XPATH, "ancestor::label[1]")
    WebDriverWait(driver, 20).until(lambda _: el.is_displayed() and el.is_enabled())
    WebDriverWait(driver, 10).until(
        lambda _: js(
            """
        const dialog = arguments[0].closest('dialog');
        return !dialog || !dialog.getAnimations ||
          dialog.getAnimations().every(animation => animation.playState !== 'running');
    """,
            el,
        )
    )
    js(
        "arguments[0].scrollIntoView({behavior: 'instant', block: 'center', inline: 'nearest'});",
        el,
    )
    token = str(time.monotonic_ns())
    js(
        """
        const token = arguments[1];
        window.__cordelClickAck = null;
        arguments[0].addEventListener('click', event => {
          if (event.isTrusted) window.__cordelClickAck = token;
        }, {once: true});
    """,
        el,
        token,
    )
    try:
        el.click()
    except ElementNotInteractableException:
        report.setdefault("interactionDiagnostics", []).append(
            js(
                """
            const el = arguments[0], scroller = el.closest('.access-body');
            const rect = n => {const b=n.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}};
            return {id:el.id,element:rect(el),scroller:scroller?rect(scroller):null,
              scrollTop:scroller?.scrollTop,scrollHeight:scroller?.scrollHeight,
              viewport:{width:innerWidth,height:innerHeight},
              hit:document.elementFromPoint(el.getBoundingClientRect().x+5,el.getBoundingClientRect().y+5)?.outerHTML?.slice(0,200)};
        """,
                el,
            )
        )
        driver.save_screenshot(str(out / "interaction-failure.png"))
        ActionChains(driver).move_to_element(el).click().perform()

    def received():
        try:
            WebDriverWait(driver, 1, poll_frequency=0.1).until(
                lambda _: js("return window.__cordelClickAck === arguments[0]", token)
            )
            return True
        except TimeoutException:
            return False

    if not received():
        ActionChains(driver).move_to_element(el).click().perform()
        if not received():
            # Keep a real, trusted input path; never synthesize click() in the page.
            key_target = (
                el.find_element(By.CSS_SELECTOR, "input")
                if el.tag_name.lower() == "label"
                else el
            )
            key_target.send_keys(
                Keys.ENTER if el.tag_name.lower() == "a" else Keys.SPACE
            )
            assert received(), f"No trusted activation reached {selector}"
            report.setdefault("inputFallbacks", []).append(
                {
                    "selector": selector,
                    "method": "trusted keyboard activation",
                    "limitation": "pointer delivery by the native driver was not confirmed for this activation",
                }
            )


def count(selector):
    return js("return document.querySelectorAll(arguments[0]).length", selector)


def select(selector, value):
    el = WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, selector))
    )
    WebDriverWait(driver, 10).until(lambda _: el.is_enabled())
    menu = Select(el)
    options = [
        option for option in menu.options if option.get_attribute("value") == value
    ]
    option = options[0] if options else next(o for o in menu.options if o.text == value)
    el = driver.find_element(By.CSS_SELECTOR, selector)
    js("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", el)
    try:
        option.click()
    except ElementNotInteractableException:
        el.send_keys(Keys.HOME)
        for _ in range(menu.options.index(option)):
            el.send_keys(Keys.ARROW_DOWN)
        el.send_keys(Keys.TAB)
    WebDriverWait(driver, 10).until(lambda _: option.is_selected())


def view():
    return js(
        "return {width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}"
    )


try:
    if kind == "safari":

        def startup_timeout(signum, frame):
            raise TimeoutError("Safari native driver did not start within 120 seconds")

        signal.signal(signal.SIGALRM, startup_timeout)
        signal.alarm(120)
        try:
            driver = webdriver.Safari()
        finally:
            signal.alarm(0)
    else:
        options = webdriver.FirefoxOptions()
        options.add_argument("-headless")
        if os.environ.get("FIREFOX_BINARY"):
            options.binary_location = os.environ["FIREFOX_BINARY"]
        driver = webdriver.Firefox(options=options)
    driver.set_page_load_timeout(45)
    report["capabilities"] = driver.capabilities
    driver.get(base)
    js(
        "localStorage.setItem('cordel_accessibility_v1',JSON.stringify({motion:true,intro:false}))"
    )
    driver.refresh()
    report["userAgent"] = js("return navigator.userAgent")
    report["features"] = js(
        "return {dialog:typeof HTMLDialogElement!=='undefined'&&typeof HTMLDialogElement.prototype.showModal==='function',inert:'inert' in HTMLElement.prototype,container:CSS.supports('container-type','inline-size'),colorMix:CSS.supports('color','color-mix(in srgb, red, blue)'),serviceWorker:'serviceWorker'in navigator}"
    )

    def homepage():
        sizes = []
        for width in [390, 1280]:
            driver.set_window_size(width, 900)
            driver.get(base)
            wait(
                "return document.querySelectorAll('a.tile').length===118 && document.getElementById('brand-intro').hidden && !document.querySelector('main').inert"
            )
            assert count(".hq-open,#hq-edition") == 0
            field = driver.find_element(By.ID, "search")
            field.send_keys("cobre")
            assert count("a.tile:not([hidden])") == 1
            field.clear()
            field.send_keys("xyz-inexistente")
            assert not js("return document.getElementById('empty').hidden")
            field.clear()
            field.send_keys(" ")
            field.clear()
            click("#catalog-filters>summary")
            wait("return document.getElementById('catalog-filters').open")
            select("#category", "Halogênio")
            assert count("a.tile:not([hidden])") == 6
            click('[data-view="periodic"]')
            assert count("a.tile:not([hidden])") == 118
            click('.periodic-legend-states button[data-state="Líquido"]')
            assert count("a.tile:not(.unmatched)") == 1
            assert (
                js(
                    "return document.querySelector('a.tile:not(.unmatched) .symbol').textContent"
                )
                == "Br"
            )
            click('.periodic-legend-states button[data-state="Líquido"]')
            select("#category", "")
            click('[data-view="collection"]')
            click("#home-menu>summary")
            click("#appearance-open")
            assert js("return document.getElementById('appearance').open")
            click("#access-dark")
            click("#appearance-close")
            driver.refresh()
            assert js("return document.body.dataset.theme") == "dark"
            click("#home-menu>summary")
            click("#appearance-open")
            click("#access-reset")
            wait(
                "return document.body.dataset.theme === (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'original')"
            )
            click("#appearance-close")
            click("#home-menu>summary")
            click("#home-menu .install-open")
            assert js("return document.getElementById('install-dialog').open")
            click("#install-close")
            v = view()
            assert v["scroll"] <= v["client"] + 2, v
            sizes.append({"requested": width, "actual": v})
            driver.save_screenshot(str(out / f"home-{width}.png"))
        return sizes

    case(
        "Home, 118 elementos, filtros combinados, diálogos, temas e persistência",
        homepage,
    )

    def all_pages():
        models = json.loads(Path("assets/elementos-fichas.json").read_text())
        total = 0
        for m in models:
            driver.get(base + "/elementos/" + m["slug"] + "/")
            wait(
                "return document.querySelectorAll('.ep-print-story-art img').length===2&&[...document.querySelectorAll('.ep-print-story-art img')].every(i=>i.complete)"
            )
            info = js(
                "return {z:JSON.parse(document.getElementById('element-data').textContent).z,cover:document.querySelector('.ep-art').naturalWidth,images:[...document.querySelectorAll('.ep-print-story-art img')].map(i=>i.naturalWidth)}"
            )
            assert info["z"] == m["z"] and info["cover"] > 0, (m["slug"], info)
            assert len(info["images"]) == 2 and all(info["images"]), (m["slug"], info)
            total += 2
        return {"pages": len(models), "panels": total}

    case("118 fichas e 236 quadros carregados", all_pages)

    def interactive():
        driver.get(base + "/elementos/ferro/")
        wait("return !document.getElementById('comparison-controls').hidden")
        click('[data-shell="4"]')
        assert "Camada" in driver.find_element(By.ID, "shell-detail").text
        select("#temperature-unit", "K")
        assert "K" in driver.find_element(
            By.CSS_SELECTOR, '[data-property="fusion"]'
        ).get_attribute("textContent")
        select("#compare-element", "2")
        select("#compare-property", "radius")
        assert (
            "definições diferentes"
            in driver.find_element(By.ID, "comparison-note").text
        )
        click("#copy-element")
        wait("return document.getElementById('share-status').textContent.length>0")
        assert driver.find_element(By.ID, "share-status").text
        return "Camadas, unidades, comparação de definições diferentes, compartilhar/fallback."

    case("Ficha interativa", interactive)

    def print_styles():
        results = []
        for slug in ["silicio", "arsenio", "francio", "oganessonio"]:
            driver.get(base + "/elementos/" + slug + "/")
            wait(
                "return document.querySelectorAll('.ep-print-story-art img').length===2&&[...document.querySelectorAll('.ep-print-story-art img')].every(i=>i.complete&&i.naturalWidth>0)"
            )
            # Safari WebDriver has no print-media emulation: apply the print rules in this test page only.
            result = js(
                """const rules=[];function visit(list){for(const rule of list){if(rule.type===4&&rule.conditionText.includes('print')){rules.push(...[...rule.cssRules].map(x=>x.cssText));}else if(rule.type===3&&rule.styleSheet){visit(rule.styleSheet.cssRules);}}}for(const sheet of document.styleSheets){try{visit(sheet.cssRules);}catch{}}const style=document.createElement('style');style.textContent=rules.join('\\n');document.head.append(style);const s=document.querySelector('.ep-print-sheet'),b=s.getBoundingClientRect();return {appliedRules:rules.length,width:b.width,height:b.height,images:[...s.querySelectorAll('.ep-print-story-art img')].map(i=>({width:i.naturalWidth,fit:getComputedStyle(i).objectFit,bottom:i.getBoundingClientRect().bottom,limit:b.bottom}))};"""
            )
            assert result["appliedRules"] > 0
            assert 700 < result["width"] < 850
            assert 1050 < result["height"] < 1200
            for image in result["images"]:
                assert (
                    image["width"] > 0
                    and image["fit"] == "contain"
                    and image["bottom"] <= image["limit"] + 2
                )
            driver.save_screenshot(str(out / f"print-css-{slug}.png"))
            results.append({"slug": slug, **result})
        return {
            "method": "Applied print CSS rules, not a native print dialog or paginated PDF",
            "pages": results,
        }

    case(
        "Layout das regras de impressão (simulação CSS explicitamente identificada)",
        print_styles,
    )
except Exception:
    report["infrastructureError"] = traceback.format_exc()
finally:
    if driver:
        try:
            driver.quit()
        except Exception:
            pass
    report["passed"] = not report.get("infrastructureError") and all(
        x["status"] == "passed" for x in report["cases"]
    )
    save()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not report["passed"]:
        raise SystemExit(1)
