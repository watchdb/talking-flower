/* 闲聊花网页版 —— 工具逻辑(依赖 lines.js;界面文案由页面注入 window.TOOL_UI) */
"use strict";

const LANG = window.SITE_LANG && FLOWER_LINES[window.SITE_LANG] ? window.SITE_LANG : "en";
const T = window.TOOL_UI || {};

const CHATTER_RANGES = { chatty: [2, 6], normal: [8, 20], quiet: [25, 45] };
const VOICE_PRESETS = {
  cute: { rate: 1.1, pitch: 1.75 },
  normal: { rate: 1.05, pitch: 1.35 },
  calm: { rate: 0.95, pitch: 0.95 },
};
const GOOD_VOICE_HINTS = [
  "natural", "neural", "online", "google", "siri", "premium", "enhanced", "多情感",
  "晓晓", "晓伊", "晓", "云希", "云", "xiaoxiao", "xiaoyi", "yunxi",
  "nanami", "mayu", "keita", "ayumi", "child", "kid", "女", "female",
];

/* ---------- 状态 ---------- */
const STORE_KEY = "talking-flower:v2";

const defaultState = () => ({
  enabled: true,
  voiceURI: "auto",
  rate: 1.05,
  pitch: 1.35,
  autoChatter: true,
  chatterFreq: "normal",
  hourlyChime: true,
  quietNight: true,
  wakeTime: "07:30",
  sleepTime: "22:30",
  customLines: { zh: [], en: [], ja: [] },
  useBuiltinLines: true,
  plans: [],
  fired: {},
});

let state = loadState();
let started = false;
let nextChatterAt = 0;
let voices = [];

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = Object.assign(defaultState(), JSON.parse(raw));
      s.customLines = Object.assign({ zh: [], en: [], ja: [] }, s.customLines || {});
      return s;
    }
  } catch (_) { /* 忽略损坏存档 */ }
  return defaultState();
}

function saveState() {
  const cutoff = Date.now() - 24 * 3600 * 1000;
  for (const k of Object.keys(state.fired)) if (state.fired[k] < cutoff) delete state.fired[k];
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const stage = $("stage");
const bubble = $("bubble");

/* ---------- 台词池 ---------- */
function chatterPool() {
  const builtin = state.useBuiltinLines ? FLOWER_LINES[LANG].chatter : [];
  const custom = state.customLines[LANG] || [];
  const pool = builtin.concat(custom);
  return pool.length ? pool : FLOWER_LINES[LANG].chatter;
}
// 暴露给测试
window.chatterPool = chatterPool;

/* ---------- 语音优选 ---------- */
function scoreVoice(v) {
  const n = (v.name + " " + (v.voiceURI || "")).toLowerCase();
  let s = 0;
  for (const h of GOOD_VOICE_HINTS) if (n.includes(h.toLowerCase())) s += 10;
  if (n.includes("compact")) s -= 8;
  if (v.localService === false) s += 3;
  return s;
}
function rankedVoices() {
  const prefix = FLOWER_LINES[LANG].voiceLang.slice(0, 2).toLowerCase();
  const match = voices.filter((v) => (v.lang || "").toLowerCase().startsWith(prefix));
  const pool = match.length ? match : voices;
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}
function resolveVoice() {
  if (state.voiceURI && state.voiceURI !== "auto") {
    const v = voices.find((x) => x.voiceURI === state.voiceURI);
    if (v) return v;
  }
  return rankedVoices()[0] || null;
}
function refreshVoices() {
  voices = speechSynthesis.getVoices();
  const sel = $("optVoice");
  if (!sel) return;
  const ranked = rankedVoices();
  sel.innerHTML = "";
  const auto = document.createElement("option");
  auto.value = "auto";
  auto.textContent = T.autoVoice || "Auto";
  sel.appendChild(auto);
  for (const v of ranked) {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    const star = scoreVoice(v) >= 10 ? (T.recommend || "⭐") + " " : "";
    opt.textContent = `${star}${v.name} (${v.lang})`;
    sel.appendChild(opt);
  }
  sel.value = state.voiceURI && ranked.some((v) => v.voiceURI === state.voiceURI) ? state.voiceURI : "auto";
}

/* ---------- 发声 ---------- */
function showBubble(text) { bubble.textContent = text; bubble.classList.remove("hidden"); }
function endTalk() {
  stage.classList.remove("talking");
  setTimeout(() => { if (!speechSynthesis.speaking) bubble.classList.add("hidden"); }, 1500);
}
function speak(text, { force = false } = {}) {
  if (!started) return;
  if (!state.enabled && !force) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = resolveVoice();
  if (v) u.voice = v;
  u.lang = v ? v.lang : FLOWER_LINES[LANG].voiceLang;
  u.rate = state.rate;
  u.pitch = state.pitch;
  u.onstart = () => { stage.classList.add("talking"); showBubble(text); };
  u.onend = u.onerror = endTalk;
  speechSynthesis.speak(u);
}

/* ---------- 时间工具 ---------- */
const two = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
function minutesOf(hm) { const [h, m] = hm.split(":").map(Number); return h * 60 + m; }
function isAwakeTime(d) {
  if (!state.quietNight) return true;
  const now = d.getHours() * 60 + d.getMinutes();
  const wake = minutesOf(state.wakeTime), sleep = minutesOf(state.sleepTime);
  return wake <= sleep ? now >= wake && now < sleep : now >= wake || now < sleep;
}
function justPassed(hm, d, grace = 3) {
  const diff = d.getHours() * 60 + d.getMinutes() - minutesOf(hm);
  return diff >= 0 && diff <= grace;
}
function fireOnce(key, fn) {
  if (state.fired[key]) return;
  state.fired[key] = Date.now();
  saveState();
  fn();
}

/* ---------- 定时循环 ---------- */
function scheduleNextChatter() {
  const [lo, hi] = CHATTER_RANGES[state.chatterFreq] || CHATTER_RANGES.normal;
  nextChatterAt = Date.now() + (lo + Math.random() * (hi - lo)) * 60 * 1000;
}
function tick() {
  const d = new Date();
  const awake = isAwakeTime(d);
  stage.classList.toggle("sleeping", started && !awake);
  if (!started || !state.enabled) return;
  const L = FLOWER_LINES[LANG];

  if (state.quietNight) {
    if (justPassed(state.wakeTime, d)) fireOnce(`morning:${dayKey(d)}`, () => speak(pickLine(L.morning)));
    if (justPassed(state.sleepTime, d)) fireOnce(`night:${dayKey(d)}`, () => speak(pickLine(L.night)));
  }
  if (state.hourlyChime && awake && d.getMinutes() <= 3) {
    fireOnce(`hour:${dayKey(d)}-${d.getHours()}`, () => speak(`${hourAnnouncement(LANG, d)} ${pickLine(L.hourlyTail)}`));
  }
  for (const plan of state.plans) {
    if (!plan.enabled || !justPassed(plan.time, d)) continue;
    fireOnce(`plan:${plan.id}:${dayKey(d)}`, () => {
      speak(`${pickLine(L.scheduleIntro)} ${plan.text}`, { force: true });
      notify(plan.text);
      if (plan.repeat === "once") { plan.enabled = false; saveState(); renderPlans(); }
    });
  }
  if (state.autoChatter && awake && Date.now() >= nextChatterAt) {
    if (!speechSynthesis.speaking) speak(pickLine(chatterPool()));
    scheduleNextChatter();
  }
}
function notify(text) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try { new Notification("🌼 " + (T.plansTitle || ""), { body: text }); } catch (_) {}
}

/* ---------- 自定义台词 UI ---------- */
function renderCustomLines() {
  const ul = $("lineList");
  if (!ul) return;
  ul.innerHTML = "";
  const lines = state.customLines[LANG] || [];
  lines.forEach((text, idx) => {
    const li = document.createElement("li");
    const say = document.createElement("button");
    say.className = "plan-del"; say.textContent = "🔊"; say.title = T.testVoice || "";
    say.addEventListener("click", () => { if (started) speak(text, { force: true }); });
    const span = document.createElement("span");
    span.className = "plan-text"; span.textContent = text;
    const del = document.createElement("button");
    del.className = "plan-del"; del.textContent = "✕";
    del.addEventListener("click", () => { state.customLines[LANG].splice(idx, 1); saveState(); renderCustomLines(); });
    li.append(say, span, del);
    ul.appendChild(li);
  });
  $("lineEmpty").classList.toggle("hidden", lines.length > 0);
}

/* ---------- 计划 UI ---------- */
function renderPlans() {
  const ul = $("planList");
  if (!ul) return;
  ul.innerHTML = "";
  const sorted = [...state.plans].sort((a, b) => a.time.localeCompare(b.time));
  for (const plan of sorted) {
    const li = document.createElement("li");
    if (!plan.enabled) li.classList.add("plan-off");
    const toggle = document.createElement("input");
    toggle.type = "checkbox"; toggle.checked = plan.enabled;
    toggle.addEventListener("change", () => { plan.enabled = toggle.checked; saveState(); renderPlans(); });
    const time = document.createElement("span");
    time.className = "plan-time"; time.textContent = plan.time;
    const text = document.createElement("span");
    text.className = "plan-text"; text.textContent = plan.text;
    const repeat = document.createElement("span");
    repeat.className = "plan-repeat";
    repeat.textContent = plan.repeat === "daily" ? (T.repeatDaily || "") : (T.repeatOnce || "");
    const del = document.createElement("button");
    del.className = "plan-del"; del.textContent = "✕";
    del.addEventListener("click", () => { state.plans = state.plans.filter((p) => p.id !== plan.id); saveState(); renderPlans(); });
    li.append(toggle, time, text, repeat, del);
    ul.appendChild(li);
  }
  $("planEmpty").classList.toggle("hidden", state.plans.length > 0);
}

/* ---------- 预设 ---------- */
function applyPreset(name) {
  const p = VOICE_PRESETS[name];
  if (!p) return;
  state.rate = p.rate; state.pitch = p.pitch;
  $("optRate").value = p.rate; $("optPitch").value = p.pitch;
  saveState();
  speak(pickLine(FLOWER_LINES[LANG].poke), { force: true });
}

/* ---------- 绑定 ---------- */
function bind(id, evt, fn) { const el = $(id); if (el) el.addEventListener(evt, fn); }

function bindControls() {
  const set = (key, value) => { state[key] = value; saveState(); };

  if ($("optEnabled")) $("optEnabled").checked = state.enabled;
  bind("optEnabled", "change", (e) => { set("enabled", e.target.checked); if (!e.target.checked) speechSynthesis.cancel(); });

  bind("optVoice", "change", (e) => set("voiceURI", e.target.value));
  if ($("optRate")) $("optRate").value = state.rate;
  bind("optRate", "input", (e) => set("rate", Number(e.target.value)));
  if ($("optPitch")) $("optPitch").value = state.pitch;
  bind("optPitch", "input", (e) => set("pitch", Number(e.target.value)));

  bind("presetCute", "click", (e) => { e.preventDefault(); applyPreset("cute"); });
  bind("presetNormal", "click", (e) => { e.preventDefault(); applyPreset("normal"); });
  bind("presetCalm", "click", (e) => { e.preventDefault(); applyPreset("calm"); });
  bind("testVoiceBtn", "click", (e) => { e.preventDefault(); speak(pickLine(FLOWER_LINES[LANG].poke), { force: true }); });

  if ($("optChatter")) $("optChatter").checked = state.autoChatter;
  bind("optChatter", "change", (e) => { set("autoChatter", e.target.checked); scheduleNextChatter(); });
  if ($("optFreq")) $("optFreq").value = state.chatterFreq;
  bind("optFreq", "change", (e) => { set("chatterFreq", e.target.value); scheduleNextChatter(); });
  if ($("optHourly")) $("optHourly").checked = state.hourlyChime;
  bind("optHourly", "change", (e) => set("hourlyChime", e.target.checked));
  if ($("optNight")) $("optNight").checked = state.quietNight;
  bind("optNight", "change", (e) => set("quietNight", e.target.checked));
  if ($("optWake")) $("optWake").value = state.wakeTime;
  bind("optWake", "change", (e) => set("wakeTime", e.target.value));
  if ($("optSleep")) $("optSleep").value = state.sleepTime;
  bind("optSleep", "change", (e) => set("sleepTime", e.target.value));

  if ($("optUseBuiltin")) $("optUseBuiltin").checked = state.useBuiltinLines;
  bind("optUseBuiltin", "change", (e) => set("useBuiltinLines", e.target.checked));
  bind("lineForm", "submit", (e) => {
    e.preventDefault();
    const text = $("lineText").value.trim();
    if (!text) return;
    state.customLines[LANG].push(text);
    saveState(); renderCustomLines();
    $("lineText").value = "";
  });

  bind("flower", "click", () => {
    if (!started) return;
    speechSynthesis.cancel();
    speak(pickLine(FLOWER_LINES[LANG].poke));
  });

  bind("planForm", "submit", (e) => {
    e.preventDefault();
    const time = $("planTime").value;
    const text = $("planText").value.trim();
    if (!time || !text) return;
    state.plans.push({ id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`, time, text, repeat: $("planRepeat").value, enabled: true });
    saveState(); renderPlans();
    $("planText").value = "";
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  });

  bind("startBtn", "click", () => {
    started = true;
    $("startOverlay").classList.add("hidden");
    refreshVoices();
    speak(pickLine(FLOWER_LINES[LANG].startup), { force: true });
    scheduleNextChatter();
  });
}

/* ---------- 启动 ---------- */
function init() {
  bindControls();
  refreshVoices();
  renderCustomLines();
  renderPlans();
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = refreshVoices;
  scheduleNextChatter();
  setInterval(tick, 5000);
}
init();
