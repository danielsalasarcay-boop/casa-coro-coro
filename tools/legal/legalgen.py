"""Generador de páginas legales (Términos, Privacidad, Cookies) para los sitios de clientes.

Uso: python3 legalgen.py <config.py> <carpeta-de-salida>
El config define SITE (marca, estilos, idiomas) y DOCS (contenido por documento e idioma).
Bloques de contenido: str = párrafo (admite HTML inline), list = viñetas,
("table", [cabecera], [[fila], ...]) = tabla.
"""
import html, os, runpy, sys

LABELS = {
    "es": {"updated": "Última actualización", "version": "Versión", "back": "Volver al sitio",
           "terms": "Términos y condiciones", "privacy": "Política de privacidad", "cookies": "Política de cookies"},
    "en": {"updated": "Last updated", "version": "Version", "back": "Back to the site",
           "terms": "Terms and conditions", "privacy": "Privacy policy", "cookies": "Cookie policy"},
}


def block(b):
    if isinstance(b, str):
        return f"<p>{b}</p>"
    if isinstance(b, list):
        return "<ul>" + "".join(f"<li>{i}</li>" for i in b) + "</ul>"
    if isinstance(b, tuple) and b[0] == "table":
        head = "".join(f"<th>{h}</th>" for h in b[1])
        rows = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in b[2])
        return f'<div class="lg-table"><table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table></div>'
    raise ValueError(b)


def page(site, docs, key, lang_pages):
    langs = site["langs"]
    s = site["style"]
    arts = []
    for lg in langs:
        d = docs[key][lg]
        L = LABELS[lg]
        secs = "".join(
            f'<section><h2>{h}</h2>{"".join(block(b) for b in blocks)}</section>' for h, blocks in d["sections"]
        )
        nav = " · ".join(
            f'<a href="{site["files"][k]}"{" aria-current=\"page\"" if k == key else ""}>{LABELS[lg][k]}</a>'
            for k in ("terms", "privacy", "cookies")
        )
        arts.append(f"""<article data-lang="{lg}"{"" if lg == langs[0] else " hidden"} lang="{lg}">
  <p class="lg-kicker">{site["kicker"][lg]}</p>
  <h1>{d["title"]}</h1>
  <p class="lg-meta"><span>{L["updated"]}: {site["updated"][lg]}</span> · <span>{L["version"]} {site.get("versions", {}).get(key, site["version"])}</span></p>
  <div class="lg-intro">{"".join(block(b) for b in d.get("intro", []))}</div>
  {secs}
  <nav class="lg-docs" aria-label="Legal">{nav}</nav>
  <p class="lg-back"><a href="{site["home"][lg]}">← {L["back"]}</a></p>
</article>""")
    toggle = ""
    if len(langs) > 1:
        toggle = '<div class="lg-lang" role="group" aria-label="Idioma / Language">' + "".join(
            f'<button type="button" data-lc="{lg}">{lg.upper()}</button>' for lg in langs) + "</div>"
    first = docs[key][langs[0]]["title"]
    script = ""
    if len(langs) > 1:
        script = f"""<script>
(function () {{
  var KEY = {site.get("lang_key") or ''!r}, titles = {{{", ".join(f"{lg!r}: {docs[key][lg]['title'] + ' — ' + site['name']!r}" for lg in langs)}}};
  function setLang(l, save) {{
    if (!titles[l]) l = {langs[0]!r};
    document.querySelectorAll('article[data-lang]').forEach(function (a) {{ a.hidden = a.dataset.lang !== l; }});
    document.querySelectorAll('.lg-lang button').forEach(function (b) {{ b.setAttribute('aria-pressed', b.dataset.lc === l); }});
    document.documentElement.lang = l; document.title = titles[l];
    var home = document.querySelector('.lg-brand'); if (home && home.dataset.homeEn) home.href = l === 'en' ? home.dataset.homeEn : {site['home'][langs[0]]!r};
    if (!KEY) document.querySelectorAll('.lg-docs a').forEach(function (a) {{ a.href = a.getAttribute('href').split('?')[0] + (l === {langs[0]!r} ? '' : '?lang=' + l); }});
    if (save && KEY) {{ try {{ localStorage.setItem(KEY, {site.get("lang_store", "l")}); }} catch (e) {{}} }}
  }}
  var q = new URLSearchParams(location.search).get('lang'), saved = null;
  if (KEY) {{ try {{ saved = localStorage.getItem(KEY); }} catch (e) {{}} }}
  setLang(q || {site.get("lang_read", "saved")} || {langs[0]!r}, !!q);
  document.querySelectorAll('.lg-lang button').forEach(function (b) {{
    b.addEventListener('click', function () {{ setLang(b.dataset.lc, true); }});
  }});
}})();
</script>"""
    return f"""<!DOCTYPE html>
<html lang="{langs[0]}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(first)} — {html.escape(site["name"])}</title>
<meta name="description" content="{html.escape(docs[key][langs[0]]["description"])}">
<meta name="robots" content="noindex, follow">
{site.get("head", "")}
<style>
:root {{ --bg: {s["bg"]}; --ink: {s["ink"]}; --muted: {s["muted"]}; --accent: {s["accent"]}; --line: {s["line"]}; --card: {s["card"]}; }}
*, *::before, *::after {{ box-sizing: border-box; }}
html {{ -webkit-text-size-adjust: 100%; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font-family: {s["body"]}; font-size: 16px; line-height: 1.7; }}
.lg-top {{ position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 20px; background: var(--bg); border-bottom: 1px solid var(--line); }}
.lg-brand {{ font-family: {s["display"]}; font-size: {s.get("brand_size", "22px")}; letter-spacing: {s.get("brand_track", "0.04em")}; text-transform: {s.get("brand_case", "none")}; color: var(--ink); text-decoration: none; font-weight: {s.get("brand_weight", "500")}; }}
.lg-lang {{ display: flex; gap: 4px; }}
.lg-lang button {{ font: inherit; font-size: 13px; letter-spacing: 0.08em; padding: 6px 10px; border: 1px solid var(--line); background: transparent; color: var(--muted); border-radius: 999px; cursor: pointer; }}
.lg-lang button[aria-pressed="true"] {{ background: var(--ink); color: var(--bg); border-color: var(--ink); }}
main {{ max-width: 760px; margin: 0 auto; padding: 48px 20px 80px; }}
.lg-kicker {{ margin: 0; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); }}
h1 {{ font-family: {s["display"]}; font-weight: {s.get("h_weight", "500")}; font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem); line-height: 1.1; margin: 10px 0 8px; }}
h2 {{ font-family: {s["display"]}; font-weight: {s.get("h_weight", "500")}; font-size: 1.35rem; line-height: 1.25; margin: 40px 0 10px; }}
.lg-meta span {{ white-space: nowrap; }}
.lg-meta {{ margin: 0 0 24px; font-size: 13px; color: var(--muted); }}
p, li {{ color: var(--ink); }}
ul {{ padding-left: 1.2em; }}
li {{ margin: 6px 0; }}
a {{ color: var(--accent); text-underline-offset: 3px; }}
.lg-table {{ overflow-x: auto; margin: 12px 0; border: 1px solid var(--line); border-radius: 10px; }}
table {{ width: 100%; border-collapse: collapse; font-size: 14px; }}
th, td {{ text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid var(--line); }}
th {{ background: var(--card); font-weight: 600; }}
tr:last-child td {{ border-bottom: 0; }}
.lg-docs {{ margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 14px; color: var(--muted); }}
.lg-docs a[aria-current] {{ color: var(--ink); text-decoration: none; font-weight: 600; }}
.lg-back {{ font-size: 14px; }}
:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
</style>
</head>
<body>
<header class="lg-top"><a class="lg-brand" href="{site["home"][langs[0]]}" data-home-en="{site["home"].get("en", "")}">{site["brand_html"]}</a>{toggle}</header>
<main>
{"".join(arts)}
</main>
{script}
</body>
</html>
"""


def main():
    cfg = runpy.run_path(sys.argv[1])
    site, docs = cfg["SITE"], cfg["DOCS"]
    out = sys.argv[2]
    for key in ("terms", "privacy", "cookies"):
        path = os.path.join(out, site["files"][key])
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(page(site, docs, key, None))
        print("escrito", path)


if __name__ == "__main__":
    main()
