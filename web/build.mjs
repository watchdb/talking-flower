/* 零依赖静态站生成器:读 content/*.json,生成三语预渲染 HTML 到 dist/ */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const distDir = join(root, "dist");

/* ---------- 站点配置 ---------- */
const SITE_URL = "https://talking-flower.pages.dev";
const LOCALES = [
  { code: "en", path: "", htmlLang: "en", label: "English", hreflang: "en", isDefault: true },
  { code: "zh", path: "/zh", htmlLang: "zh-CN", label: "中文", hreflang: "zh-Hans" },
  { code: "ja", path: "/ja", htmlLang: "ja", label: "日本語", hreflang: "ja" },
];

const load = (code) => JSON.parse(readFileSync(join(root, "content", `${code}.json`), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const canonicalOf = (loc) => SITE_URL + loc.path; // en → 站点根,无尾斜杠
const homeHref = (loc) => loc.path || "/";

/* ---------- 小花 SVG(舞台) ---------- */
const FLOWER_SVG = `<svg viewBox="0 0 240 300" width="240" height="300" role="img" aria-hidden="true">
  <g class="sway">
    <path d="M120 160 C 118 200, 122 230, 120 262" stroke="#4caf50" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M120 205 C 95 195, 82 178, 78 160 C 100 162, 116 178, 120 196 Z" fill="#66bb6a"/>
    <path d="M121 228 C 146 220, 160 204, 165 186 C 142 188, 126 202, 121 220 Z" fill="#57a05b"/>
    <g class="petals">
      <ellipse cx="120" cy="52" rx="30" ry="40" fill="#ffd54f"/>
      <ellipse cx="178" cy="94" rx="30" ry="40" fill="#ffd54f" transform="rotate(72 178 94)"/>
      <ellipse cx="156" cy="162" rx="30" ry="40" fill="#ffca28" transform="rotate(144 156 162)"/>
      <ellipse cx="84" cy="162" rx="30" ry="40" fill="#ffca28" transform="rotate(216 84 162)"/>
      <ellipse cx="62" cy="94" rx="30" ry="40" fill="#ffd54f" transform="rotate(288 62 94)"/>
    </g>
    <circle cx="120" cy="110" r="52" fill="#fff8e1" stroke="#f5c542" stroke-width="5"/>
    <g class="face">
      <g class="eyes">
        <ellipse class="eye" cx="100" cy="102" rx="7" ry="11" fill="#3b2f2f"/>
        <ellipse class="eye" cx="140" cy="102" rx="7" ry="11" fill="#3b2f2f"/>
      </g>
      <circle cx="88" cy="122" r="7" fill="#ffab91" opacity=".7"/>
      <circle cx="152" cy="122" r="7" fill="#ffab91" opacity=".7"/>
      <path class="mouth" d="M105 128 Q 120 142 135 128" stroke="#3b2f2f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse class="mouth-open" cx="120" cy="132" rx="12" ry="10" fill="#3b2f2f"/>
    </g>
  </g>
  <path d="M78 262 L 162 262 L 152 298 L 88 298 Z" fill="#c96f4a"/>
  <rect x="70" y="254" width="100" height="14" rx="7" fill="#b35d3b"/>
</svg>`;

/* ---------- 工具区块(设置 / 自定义台词 / 计划) ---------- */
function toolMarkup(ui) {
  return `
  <section class="card" aria-label="${attr(ui.settingsTitle)}">
    <h2>${esc(ui.settingsTitle)}</h2>
    <div class="row">
      <label class="switch-label">${esc(ui.power)}</label>
      <label class="switch"><input type="checkbox" id="optEnabled" checked /><span class="slider"></span></label>
    </div>
    <div class="row">
      <label for="optVoice">${esc(ui.browserVoice)}</label>
      <select id="optVoice"></select>
    </div>
    <div class="row sliders">
      <label>${esc(ui.rate)}</label>
      <input type="range" id="optRate" min="0.6" max="1.6" step="0.05" value="1.05" />
      <label>${esc(ui.pitch)}</label>
      <input type="range" id="optPitch" min="0.6" max="2" step="0.05" value="1.35" />
    </div>
    <div class="row presets">
      <span class="preset-label">${esc(ui.presetLabel)}</span>
      <button class="btn btn-sm" id="presetCute">${esc(ui.presetCute)}</button>
      <button class="btn btn-sm" id="presetNormal">${esc(ui.presetNormal)}</button>
      <button class="btn btn-sm" id="presetCalm">${esc(ui.presetCalm)}</button>
      <button class="btn btn-sm" id="testVoiceBtn">${esc(ui.testVoice)}</button>
    </div>
    <hr />
    <div class="row">
      <div><label class="switch-label">${esc(ui.autoChatter)}</label><p class="row-desc">${esc(ui.autoChatterDesc)}</p></div>
      <label class="switch"><input type="checkbox" id="optChatter" checked /><span class="slider"></span></label>
    </div>
    <div class="row">
      <label for="optFreq">${esc(ui.chatterFreq)}</label>
      <select id="optFreq">
        <option value="chatty">${esc(ui.freqChatty)}</option>
        <option value="normal" selected>${esc(ui.freqNormal)}</option>
        <option value="quiet">${esc(ui.freqQuiet)}</option>
      </select>
    </div>
    <div class="row">
      <div><label class="switch-label">${esc(ui.hourlyChime)}</label><p class="row-desc">${esc(ui.hourlyChimeDesc)}</p></div>
      <label class="switch"><input type="checkbox" id="optHourly" checked /><span class="slider"></span></label>
    </div>
    <div class="row">
      <div><label class="switch-label">${esc(ui.quietNight)}</label><p class="row-desc">${esc(ui.quietNightDesc)}</p></div>
      <label class="switch"><input type="checkbox" id="optNight" checked /><span class="slider"></span></label>
    </div>
    <div class="row times">
      <label>${esc(ui.wakeTime)}</label><input type="time" id="optWake" value="07:30" />
      <label>${esc(ui.sleepTime)}</label><input type="time" id="optSleep" value="22:30" />
    </div>
  </section>

  <section class="card" aria-label="${attr(ui.customTitle)}">
    <h2>${esc(ui.customTitle)}</h2>
    <p class="row-desc">${esc(ui.customDesc)}</p>
    <div class="row">
      <div><label class="switch-label">${esc(ui.useBuiltin)}</label><p class="row-desc">${esc(ui.useBuiltinDesc)}</p></div>
      <label class="switch"><input type="checkbox" id="optUseBuiltin" checked /><span class="slider"></span></label>
    </div>
    <form id="lineForm" class="plan-form">
      <input type="text" id="lineText" maxlength="120" required placeholder="${attr(ui.linePlaceholder)}" />
      <button type="submit" class="btn btn-primary">${esc(ui.addLine)}</button>
    </form>
    <ul id="lineList" class="plan-list"></ul>
    <p class="empty-note hidden" id="lineEmpty">${esc(ui.customEmpty)}</p>
  </section>

  <section class="card" aria-label="${attr(ui.plansTitle)}">
    <h2>${esc(ui.plansTitle)}</h2>
    <p class="row-desc">${esc(ui.plansDesc)}</p>
    <form id="planForm" class="plan-form">
      <input type="time" id="planTime" required />
      <input type="text" id="planText" maxlength="60" required placeholder="${attr(ui.planPlaceholder)}" />
      <select id="planRepeat">
        <option value="daily">${esc(ui.repeatDaily)}</option>
        <option value="once">${esc(ui.repeatOnce)}</option>
      </select>
      <button type="submit" class="btn btn-primary">${esc(ui.addPlan)}</button>
    </form>
    <ul id="planList" class="plan-list"></ul>
    <p class="empty-note hidden" id="planEmpty">${esc(ui.plansEmpty)}</p>
  </section>`;
}

/* ---------- 结构化数据 ---------- */
function jsonLd(loc, c) {
  const url = canonicalOf(loc);
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: c.brand,
    description: c.meta.description,
    url: url || SITE_URL,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    inLanguage: loc.hreflang,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: c.brand, item: url || SITE_URL }],
  };
  return [webApp, faq, crumbs]
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join("\n");
}

/* ---------- 页面模板 ---------- */
function renderPage(loc, c) {
  const canonical = canonicalOf(loc) || SITE_URL;
  const ogImage = SITE_URL + "/assets/og-image.png";

  const alternates = LOCALES.map(
    (l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${canonicalOf(l) || SITE_URL}" />`
  ).join("\n  ");
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${SITE_URL}" />`;

  const langSwitch = LOCALES.map(
    (l) => `<a href="${homeHref(l)}"${l.code === loc.code ? ' class="active" aria-current="page"' : ""}>${esc(l.label)}</a>`
  ).join("");

  const navLinks = [
    ["#features", c.nav.features], ["#what", c.nav.what], ["#how", c.nav.how],
    ["#why", c.nav.why], ["#faq", c.nav.faq],
  ].map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join("");

  const features = c.features.items.map((f) => `
      <div class="feature">
        <div class="ficon" aria-hidden="true">${f.icon}</div>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.body)}</p>
      </div>`).join("");

  const whatParas = c.what.body.map((p) => `<p>${esc(p)}</p>`).join("\n      ");
  const steps = c.how.steps.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`).join("\n        ");
  const whys = c.why.items.map((w) => `<div class="why-item"><h3>${esc(w.title)}</h3><p>${esc(w.body)}</p></div>`).join("\n        ");
  const faqs = c.faq.items.map((it) => `<details><summary>${esc(it.q)}</summary><p>${esc(it.a)}</p></details>`).join("\n        ");

  return `<!doctype html>
<html lang="${loc.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(c.meta.title)}</title>
  <meta name="description" content="${attr(c.meta.description)}" />
  <link rel="canonical" href="${canonical}" />
  ${alternates}
  ${xDefault}
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${attr(c.brand)}" />
  <meta property="og:title" content="${attr(c.meta.title)}" />
  <meta property="og:description" content="${attr(c.meta.description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:locale" content="${loc.htmlLang.replace('-', '_')}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(c.meta.title)}" />
  <meta name="twitter:description" content="${attr(c.meta.description)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <link rel="stylesheet" href="/assets/style.css" />
  ${jsonLd(loc, c)}
  <script>window.SITE_LANG=${JSON.stringify(loc.code)};window.TOOL_UI=${JSON.stringify(c.ui)};</script>
</head>
<body>
  <header class="site-header">
    <a class="logo" href="${homeHref(loc)}">🌼 ${esc(c.brand)}</a>
    <nav class="site-nav">${navLinks}</nav>
    <div class="lang-switch">${langSwitch}</div>
  </header>

  <main>
    <section class="hero">
      <h1>${esc(c.hero.h1)}</h1>
      <p class="lead">${esc(c.hero.lead)}</p>
      <div class="stage" id="stage">
        <div class="bubble hidden" id="bubble" aria-live="polite"></div>
        <button class="flower-wrap" id="flower" aria-label="${attr(c.hero.pokeHint)}" title="${attr(c.hero.pokeHint)}">
          ${FLOWER_SVG}
        </button>
        <p class="stage-hint">${esc(c.hero.pokeHint)}</p>
        <div class="stage-overlay" id="startOverlay">
          <button class="btn btn-primary btn-big" id="startBtn">${esc(c.hero.wake)}</button>
          <p class="overlay-note">${esc(c.hero.wakeNote)}</p>
        </div>
      </div>
    </section>

    ${toolMarkup(c.ui)}

    <section class="section" id="features">
      <h2>${esc(c.features.heading)}</h2>
      <div class="features-grid">${features}
      </div>
    </section>

    <section class="section" id="what">
      <h2>${esc(c.what.heading)}</h2>
      ${whatParas}
    </section>

    <section class="section" id="how">
      <h2>${esc(c.how.heading)}</h2>
      <ol class="steps">
        ${steps}
      </ol>
    </section>

    <section class="section" id="why">
      <h2>${esc(c.why.heading)}</h2>
      <div class="why-list">
        ${whys}
      </div>
    </section>

    <section class="section faq" id="faq">
      <h2>${esc(c.faq.heading)}</h2>
        ${faqs}
    </section>
  </main>

  <footer class="site-footer">
    <p class="tagline">${esc(c.footer.tagline)}</p>
    <p class="disclaimer">${esc(c.footer.disclaimer)}</p>
  </footer>

  <script src="/assets/lines.js"></script>
  <script src="/assets/app.js"></script>
</body>
</html>
`;
}

/* ---------- sitemap / robots ---------- */
function sitemap() {
  const urls = LOCALES.map((loc) => {
    const links = LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${canonicalOf(l) || SITE_URL}"/>`).join("\n");
    return `  <url>
    <loc>${canonicalOf(loc) || SITE_URL}</loc>
${links}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}"/>
  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;

/* ---------- 生成 ---------- */
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(join(root, "assets"), join(distDir, "assets"), { recursive: true });

for (const loc of LOCALES) {
  const c = load(loc.code);
  const outDir = loc.path ? join(distDir, loc.path.replace(/^\//, "")) : distDir;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), renderPage(loc, c));
}
writeFileSync(join(distDir, "sitemap.xml"), sitemap());
writeFileSync(join(distDir, "robots.txt"), robots);

console.log("Built dist/ →", LOCALES.map((l) => l.code).join(", "), "+ sitemap.xml, robots.txt");
