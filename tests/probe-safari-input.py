"""Diagnostic only: compare native input methods; no compatibility approval."""

import json
import signal
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains

out = Path("dist/safari-input-probe")
out.mkdir(parents=True, exist_ok=True)
report = {
    "scope": "diagnostic input probe, not full browser qualification",
    "results": [],
}
driver = None


def startup_timeout(signum, frame):
    raise TimeoutError("Safari startup exceeded 120 seconds")


try:
    signal.signal(signal.SIGALRM, startup_timeout)
    signal.alarm(120)
    driver = webdriver.Safari()
    signal.alarm(0)
    driver.set_page_load_timeout(30)
    report["version"] = driver.capabilities.get("browserVersion")
    report["capabilities"] = driver.capabilities
    driver.get("http://127.0.0.1:8765/")
    driver.execute_script(
        "localStorage.setItem('cordel_accessibility_v1', JSON.stringify({motion:true,intro:false}))"
    )
    driver.set_window_size(1280, 900)
    for target in ["filters", "copy"]:
        for method in [
            "element-click",
            "pointer-actions",
            "keyboard",
            "javascript-diagnostic",
        ]:
            driver.get(
                "http://127.0.0.1:8765/"
                + ("elementos/ferro/" if target == "copy" else "")
            )
            selector = (
                "#copy-element" if target == "copy" else "#catalog-filters>summary"
            )
            el = driver.find_element(By.CSS_SELECTOR, selector)
            before = driver.execute_script(
                """
                const e=arguments[0];e.scrollIntoView({behavior:'instant',block:'center'});
                window.__probeClicks=[];
                document.addEventListener('click',event=>window.__probeClicks.push({
                  target:event.target.outerHTML.slice(0,200),trusted:event.isTrusted,
                  x:event.clientX,y:event.clientY,prevented:event.defaultPrevented}),true);
                const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,
                  hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,200),
                  inert:e.closest('[inert]')?.outerHTML.slice(0,100),
                  viewport:{width:innerWidth,height:innerHeight}};
            """,
                el,
            )
            error = None
            try:
                if method == "element-click":
                    el.click()
                elif method == "pointer-actions":
                    ActionChains(driver).move_to_element(el).click().perform()
                elif method == "keyboard":
                    el.send_keys(Keys.ENTER if target == "copy" else Keys.SPACE)
                else:
                    driver.execute_script("arguments[0].click()", el)
                time.sleep(1)
            except Exception as exc:
                error = str(exc)
            after = driver.execute_script(
                """
                return {clicks:window.__probeClicks,filters:document.getElementById('catalog-filters')?.open,
                  share:document.getElementById('share-status')?.textContent,
                  active:document.activeElement?.outerHTML.slice(0,200)};
            """
            )
            report["results"].append(
                {
                    "target": target,
                    "method": method,
                    "before": before,
                    "after": after,
                    "error": error,
                }
            )
            driver.save_screenshot(str(out / f"{target}-{method}.png"))
finally:
    signal.alarm(0)
    if driver:
        driver.quit()
    (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))
