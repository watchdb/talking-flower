/* 闲聊花 Web —— 主逻辑(依赖 lines.js) */
"use strict";

/* ---------- UI 文案(界面本身的多语言) ---------- */
const UI_TEXT = {
  zh: {
    title: "闲聊花 Web",
    subtitle: "一朵话很多的小花:自动闲聊 · 整点报时 · 计划提醒",
    pokeHint: "戳一下小花,它会回应你",
    startBtn: "🔊 唤醒小花",
    startNote: "浏览器需要你点一下,才允许网页发出声音",
    settingsTitle: "设置",
    power: "小花开关(静音)",
    language: "语言",
    voiceEngine: "语音引擎",
    engineBrowser: "浏览器(免费)",
    engineCloud: "在线 · ElevenLabs(可爱,需 Key)",
    browserVoice: "声音(浏览器)",
    apiKey: "API Key",
    voiceId: "语音 ID",
    cloudNote: "在 elevenlabs.io 免费注册取 API Key,再从 Voice Library 选一个可爱音色复制它的 Voice ID。Key 只保存在你本地浏览器,不会上传别处。",
    rate: "语速",
    pitch: "音调",
    presetLabel: "预设",
    presetCute: "🎀 可爱",
    presetNormal: "标准",
    presetCalm: "沉稳",
    testVoice: "试听",
    autoChatter: "自动闲聊",
    autoChatterDesc: "小花会隔一会儿自己说点什么",
    chatterFreq: "闲聊频率",
    freqChatty: "话痨(2–6 分钟)",
    freqNormal: "正常(8–20 分钟)",
    freqQuiet: "安静(25–45 分钟)",
    hourlyChime: "整点报时",
    hourlyChimeDesc: "每到整点,小花会报一次时间",
    quietNight: "夜间休息",
    quietNightDesc: "睡觉时间内不闲聊、不报时(计划提醒仍然生效)",
    wakeTime: "起床",
    sleepTime: "睡觉",
    customTitle: "自定义文案",
    customDesc: "添加你自己的闲聊台词,会和内置台词一起被随机说出来(按当前语言分别管理)。",
    useBuiltin: "同时使用内置台词",
    useBuiltinDesc: "关掉后,小花只说你写的台词",
    linePlaceholder: "写一句小花会说的话…",
    addLine: "添加",
    customEmpty: "还没有自定义台词,添加一条试试吧",
    plansTitle: "计划提醒",
    plansDesc: "到点时小花会大声念出来,并弹出通知(需要保持本页面打开;后台常驻请用浏览器插件版)",
    planPlaceholder: "例如:去开会 / 喝水 / 收快递",
    repeatDaily: "每天",
    repeatOnce: "仅一次",
    addPlan: "添加",
    plansEmpty: "还没有计划,添加一条试试吧",
    disclaimer: "粉丝自制网页玩具,与任天堂无关;台词均为原创,语音来自浏览器自带 TTS 或你自选的在线引擎。",
    defaultVoice: "系统默认声音",
    autoVoice: "自动(挑最好听的)",
    recommend: "⭐",
    cloudSpeaking: "在线语音生成中…",
    cloudOk: "在线语音正常 ✓",
    cloudErr: "在线语音失败,已回退到浏览器语音:",
    needKey: "请先填 API Key",
  },
  en: {
    title: "Talking Flower Web",
    subtitle: "A very chatty flower: auto chatter · hourly chime · reminders",
    pokeHint: "Poke the flower and it will respond",
    startBtn: "🔊 Wake the flower",
    startNote: "Your browser needs one click before the page can make sound",
    settingsTitle: "Settings",
    power: "Flower on/off (mute)",
    language: "Language",
    voiceEngine: "Voice engine",
    engineBrowser: "Browser (free)",
    engineCloud: "Online · ElevenLabs (cute, needs key)",
    browserVoice: "Voice (browser)",
    apiKey: "API Key",
    voiceId: "Voice ID",
    cloudNote: "Sign up free at elevenlabs.io for an API Key, then pick a cute voice from the Voice Library and copy its Voice ID. The key is stored only in your browser.",
    rate: "Rate",
    pitch: "Pitch",
    presetLabel: "Presets",
    presetCute: "🎀 Cute",
    presetNormal: "Normal",
    presetCalm: "Calm",
    testVoice: "Preview",
    autoChatter: "Auto chatter",
    autoChatterDesc: "The flower says something on its own once in a while",
    chatterFreq: "Chatter frequency",
    freqChatty: "Chatty (2–6 min)",
    freqNormal: "Normal (8–20 min)",
    freqQuiet: "Quiet (25–45 min)",
    hourlyChime: "Hourly chime",
    hourlyChimeDesc: "Announces the time at the top of every hour",
    quietNight: "Night rest",
    quietNightDesc: "No chatter or chime during sleep hours (reminders still fire)",
    wakeTime: "Wake",
    sleepTime: "Sleep",
    customTitle: "Custom lines",
    customDesc: "Add your own chatter lines — they get mixed into the random pool (managed per language).",
    useBuiltin: "Also use built-in lines",
    useBuiltinDesc: "Turn off to make the flower say only your lines",
    linePlaceholder: "A line for the flower to say…",
    addLine: "Add",
    customEmpty: "No custom lines yet — add one!",
    plansTitle: "Reminders",
    plansDesc: "The flower reads it out loud and shows a notification (keep this tab open; use the browser extension for background reminders)",
    planPlaceholder: "e.g. meeting / drink water / pick up package",
    repeatDaily: "Daily",
    repeatOnce: "Once",
    addPlan: "Add",
    plansEmpty: "No reminders yet — add one!",
    disclaimer: "Fan-made web toy, not affiliated with Nintendo; all lines are original, voices come from your browser's TTS or the online engine you choose.",
    defaultVoice: "System default voice",
    autoVoice: "Auto (best-sounding)",
    recommend: "⭐",
    cloudSpeaking: "Generating online voice…",
    cloudOk: "Online voice OK ✓",
    cloudErr: "Online voice failed, fell back to browser voice: ",
    needKey: "Enter an API Key first",
  },
  ja: {
    title: "おしゃべりフラワー Web",
    subtitle: "おしゃべり大好きなお花:ひとりごと · 時報 · リマインダー",
    pokeHint: "お花をつつくと返事するよ",
    startBtn: "🔊 お花を起こす",
    startNote: "音を出すには、まず一度クリックが必要です",
    settingsTitle: "設定",
    power: "お花のオン/オフ(ミュート)",
    language: "言語",
    voiceEngine: "音声エンジン",
    engineBrowser: "ブラウザ(無料)",
    engineCloud: "オンライン · ElevenLabs(かわいい・Key必要)",
    browserVoice: "声(ブラウザ)",
    apiKey: "API Key",
    voiceId: "Voice ID",
    cloudNote: "elevenlabs.io で無料登録して API Key を取得し、Voice Library でかわいい声を選んで Voice ID をコピーしてね。Key はブラウザ内だけに保存されます。",
    rate: "話す速さ",
    pitch: "声の高さ",
    presetLabel: "プリセット",
    presetCute: "🎀 かわいい",
    presetNormal: "標準",
    presetCalm: "おちつき",
    testVoice: "試聴",
    autoChatter: "ひとりごと",
    autoChatterDesc: "ときどきお花がひとりでしゃべります",
    chatterFreq: "おしゃべり頻度",
    freqChatty: "おしゃべり(2–6分)",
    freqNormal: "ふつう(8–20分)",
    freqQuiet: "しずか(25–45分)",
    hourlyChime: "時報",
    hourlyChimeDesc: "毎正時に時間をお知らせします",
    quietNight: "おやすみモード",
    quietNightDesc: "就寝時間中はおしゃべり・時報なし(リマインダーは鳴ります)",
    wakeTime: "起床",
    sleepTime: "就寝",
    customTitle: "カスタムセリフ",
    customDesc: "自分のセリフを追加すると、内蔵セリフと一緒にランダムで話します(言語ごとに管理)。",
    useBuiltin: "内蔵セリフも使う",
    useBuiltinDesc: "オフにすると、書いたセリフだけを話します",
    linePlaceholder: "お花に言わせたいひとこと…",
    addLine: "追加",
    customEmpty: "まだカスタムセリフがありません",
    plansTitle: "リマインダー",
    plansDesc: "時間になるとお花が読み上げて通知します(このタブを開いたままに;常駐は拡張機能版で)",
    planPlaceholder: "例:会議 / 水を飲む / 荷物の受け取り",
    repeatDaily: "毎日",
    repeatOnce: "一回だけ",
    addPlan: "追加",
    plansEmpty: "まだリマインダーがありません",
    disclaimer: "ファンメイドのWebトイです。任天堂とは無関係;セリフはすべてオリジナル、音声はブラウザ内蔵TTSまたは選んだオンラインエンジンです。",
    defaultVoice: "システム標準の声",
    autoVoice: "自動(いちばん良い声)",
    recommend: "⭐",
    cloudSpeaking: "オンライン音声を生成中…",
    cloudOk: "オンライン音声OK ✓",
    cloudErr: "オンライン音声に失敗、ブラウザ音声に切替: ",
    needKey: "先に API Key を入力してください",
  },
};

const CHATTER_RANGES = {
  chatty: [2, 6],
  normal: [8, 20],
  quiet: [25, 45],
};

const VOICE_PRESETS = {
  cute: { rate: 1.1, pitch: 1.75 },
  normal: { rate: 1.05, pitch: 1.35 },
  calm: { rate: 0.95, pitch: 0.95 },
};

// 音色好听程度打分用的关键词(命中越多越好听/越可爱)
const GOOD_VOICE_HINTS = [
  "natural", "neural", "online", "google", "siri", "premium", "enhanced", "多情感",
  "晓晓", "晓伊", "晓", "云希", "云", "xiaoxiao", "xiaoyi", "yunxi", "yunxia",
  "nanami", "mayu", "keita", "ayumi", "child", "kid", "女", "female",
];

const ELEVEN_DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // 占位默认音色,建议换成你选的可爱音色

/* ---------- 状态 ---------- */
const STORE_KEY = "talking-flower:v1";

const defaultState = () => ({
  enabled: true,
  lang: navigator.language.startsWith("ja") ? "ja" : navigator.language.startsWith("en") ? "en" : "zh",
  engine: "browser",           // browser | elevenlabs
  elevenKey: "",
  elevenVoiceId: "",
  voiceURI: "auto",            // "auto" = 自动挑最好听的
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
  plans: [],                   // {id, time:"HH:MM", text, repeat, enabled}
  fired: {},
});

let state = loadState();
let started = false;
let nextChatterAt = 0;
let voices = [];
let currentAudio = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = Object.assign(defaultState(), JSON.parse(raw));
      s.customLines = Object.assign({ zh: [], en: [], ja: [] }, s.customLines || {});
      return s;
    }
  } catch (_) { /* 忽略损坏的存档 */ }
  return defaultState();
}

function saveState() {
  const cutoff = Date.now() - 24 * 3600 * 1000;
  for (const k of Object.keys(state.fired)) {
    if (state.fired[k] < cutoff) delete state.fired[k];
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const stage = $("stage");
const bubble = $("bubble");
const flowerBtn = $("flower");

/* ---------- 台词池(内置 + 自定义) ---------- */
function chatterPool() {
  const builtin = state.useBuiltinLines ? FLOWER_LINES[state.lang].chatter : [];
  const custom = state.customLines[state.lang] || [];
  const pool = builtin.concat(custom);
  return pool.length ? pool : FLOWER_LINES[state.lang].chatter;
}

/* ---------- 语音:打分与优选 ---------- */
function scoreVoice(v) {
  const n = (v.name + " " + (v.voiceURI || "")).toLowerCase();
  let s = 0;
  for (const h of GOOD_VOICE_HINTS) if (n.includes(h.toLowerCase())) s += 10;
  if (n.includes("compact")) s -= 8;
  if (v.localService === false) s += 3; // 网络神经网络音色通常更自然
  return s;
}

function rankedVoicesForLang(lang) {
  const prefix = FLOWER_LINES[lang].voiceLang.slice(0, 2).toLowerCase();
  const match = voices.filter((v) => (v.lang || "").toLowerCase().startsWith(prefix));
  const pool = match.length ? match : voices;
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

function resolveVoice() {
  if (state.voiceURI && state.voiceURI !== "auto") {
    const v = voices.find((x) => x.voiceURI === state.voiceURI);
    if (v) return v;
  }
  return rankedVoicesForLang(state.lang)[0] || null;
}

function refreshVoices() {
  voices = speechSynthesis.getVoices();
  const sel = $("optVoice");
  const T = UI_TEXT[state.lang];
  const ranked = rankedVoicesForLang(state.lang);

  sel.innerHTML = "";
  const auto = document.createElement("option");
  auto.value = "auto";
  auto.textContent = T.autoVoice;
  sel.appendChild(auto);

  for (const v of ranked) {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    const star = scoreVoice(v) >= 10 ? T.recommend + " " : "";
    opt.textContent = `${star}${v.name} (${v.lang})`;
    sel.appendChild(opt);
  }
  sel.value = state.voiceURI && ranked.some((v) => v.voiceURI === state.voiceURI) ? state.voiceURI : "auto";
}

/* ---------- 发声:引擎分发 ---------- */
function speak(text, { force = false } = {}) {
  if (!started) return;
  if (!state.enabled && !force) return;
  if (state.engine === "elevenlabs" && state.elevenKey.trim()) {
    speakCloud(text);
  } else {
    speakBrowser(text);
  }
}

function showBubble(text) {
  bubble.textContent = text;
  bubble.classList.remove("hidden");
}
function endTalk() {
  stage.classList.remove("talking");
  setTimeout(() => {
    if (!speechSynthesis.speaking && (!currentAudio || currentAudio.paused)) {
      bubble.classList.add("hidden");
    }
  }, 1500);
}

function speakBrowser(text) {
  const u = new SpeechSynthesisUtterance(text);
  const v = resolveVoice();
  if (v) u.voice = v;
  u.lang = v ? v.lang : FLOWER_LINES[state.lang].voiceLang;
  u.rate = state.rate;
  u.pitch = state.pitch;
  u.onstart = () => { stage.classList.add("talking"); showBubble(text); };
  u.onend = u.onerror = endTalk;
  speechSynthesis.speak(u);
}

function setEngineStatus(msg, kind) {
  const el = $("engineStatus");
  if (!el) return;
  el.textContent = msg || "";
  el.className = "engine-status" + (kind ? " " + kind : "");
}

async function speakCloud(text) {
  const T = UI_TEXT[state.lang];
  try {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    setEngineStatus(T.cloudSpeaking, "");
    const voiceId = state.elevenVoiceId.trim() || ELEVEN_DEFAULT_VOICE;
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": state.elevenKey.trim(), "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
        }),
      }
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playbackRate = Math.min(Math.max(state.rate, 0.5), 2);
    currentAudio = audio;
    audio.onplay = () => { stage.classList.add("talking"); showBubble(text); setEngineStatus(T.cloudOk, "ok"); };
    audio.onended = audio.onerror = () => { URL.revokeObjectURL(url); if (currentAudio === audio) currentAudio = null; endTalk(); };
    await audio.play();
  } catch (e) {
    setEngineStatus(T.cloudErr + (e && e.message ? e.message : e), "err");
    speakBrowser(text); // 失败回退到浏览器语音,不让小花“哑巴”
  }
}

/* ---------- 时间工具 ---------- */
const two = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;

function minutesOf(hm) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function isAwakeTime(d) {
  if (!state.quietNight) return true;
  const now = d.getHours() * 60 + d.getMinutes();
  const wake = minutesOf(state.wakeTime);
  const sleep = minutesOf(state.sleepTime);
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

  const L = FLOWER_LINES[state.lang];

  if (state.quietNight) {
    if (justPassed(state.wakeTime, d)) fireOnce(`morning:${dayKey(d)}`, () => speak(pickLine(L.morning)));
    if (justPassed(state.sleepTime, d)) fireOnce(`night:${dayKey(d)}`, () => speak(pickLine(L.night)));
  }

  if (state.hourlyChime && awake && d.getMinutes() <= 3) {
    fireOnce(`hour:${dayKey(d)}-${d.getHours()}`, () => {
      speak(`${hourAnnouncement(state.lang, d)} ${pickLine(L.hourlyTail)}`);
    });
  }

  for (const plan of state.plans) {
    if (!plan.enabled) continue;
    if (!justPassed(plan.time, d)) continue;
    fireOnce(`plan:${plan.id}:${dayKey(d)}`, () => {
      speak(`${pickLine(L.scheduleIntro)} ${plan.text}`, { force: true });
      notify(plan.text);
      if (plan.repeat === "once") {
        plan.enabled = false;
        saveState();
        renderPlans();
      }
    });
  }

  if (state.autoChatter && awake && Date.now() >= nextChatterAt) {
    if (!speechSynthesis.speaking && (!currentAudio || currentAudio.paused)) {
      speak(pickLine(chatterPool()));
    }
    scheduleNextChatter();
  }
}

function notify(text) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification("🌼 " + UI_TEXT[state.lang].plansTitle, { body: text });
  } catch (_) { /* 某些平台不支持页面内 Notification 构造 */ }
}

/* ---------- 自定义台词 UI ---------- */
function renderCustomLines() {
  const ul = $("lineList");
  ul.innerHTML = "";
  const lines = state.customLines[state.lang] || [];
  lines.forEach((text, idx) => {
    const li = document.createElement("li");

    const say = document.createElement("button");
    say.className = "plan-del";
    say.textContent = "🔊";
    say.title = UI_TEXT[state.lang].testVoice;
    say.addEventListener("click", () => { if (started) speak(text, { force: true }); });

    const span = document.createElement("span");
    span.className = "plan-text";
    span.textContent = text;

    const del = document.createElement("button");
    del.className = "plan-del";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      state.customLines[state.lang].splice(idx, 1);
      saveState();
      renderCustomLines();
    });

    li.append(say, span, del);
    ul.appendChild(li);
  });
  $("lineEmpty").classList.toggle("hidden", lines.length > 0);
}

/* ---------- 计划 UI ---------- */
function renderPlans() {
  const ul = $("planList");
  ul.innerHTML = "";
  const sorted = [...state.plans].sort((a, b) => a.time.localeCompare(b.time));
  for (const plan of sorted) {
    const li = document.createElement("li");
    if (!plan.enabled) li.classList.add("plan-off");

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = plan.enabled;
    toggle.addEventListener("change", () => { plan.enabled = toggle.checked; saveState(); renderPlans(); });

    const time = document.createElement("span");
    time.className = "plan-time";
    time.textContent = plan.time;

    const text = document.createElement("span");
    text.className = "plan-text";
    text.textContent = plan.text;

    const repeat = document.createElement("span");
    repeat.className = "plan-repeat";
    repeat.textContent = UI_TEXT[state.lang][plan.repeat === "daily" ? "repeatDaily" : "repeatOnce"];

    const del = document.createElement("button");
    del.className = "plan-del";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      state.plans = state.plans.filter((p) => p.id !== plan.id);
      saveState();
      renderPlans();
    });

    li.append(toggle, time, text, repeat, del);
    ul.appendChild(li);
  }
  $("planEmpty").classList.toggle("hidden", state.plans.length > 0);
}

/* ---------- 界面语言 ---------- */
function applyUIText() {
  const T = UI_TEXT[state.lang];
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : state.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (T[key]) el.textContent = T[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (T[key]) el.placeholder = T[key];
  });
  renderPlans();
  renderCustomLines();
}

/* ---------- 引擎字段显隐 ---------- */
function syncEngineUI() {
  const cloud = state.engine === "elevenlabs";
  $("cloudFields").classList.toggle("hidden", !cloud);
  $("voiceRow").classList.toggle("hidden", cloud);
  if (!cloud) setEngineStatus("", "");
}

function applyPreset(name) {
  const p = VOICE_PRESETS[name];
  if (!p) return;
  state.rate = p.rate;
  state.pitch = p.pitch;
  $("optRate").value = p.rate;
  $("optPitch").value = p.pitch;
  saveState();
  speak(pickLine(FLOWER_LINES[state.lang].poke), { force: true });
}

/* ---------- 控件绑定 ---------- */
function bindControls() {
  const set = (key, value) => { state[key] = value; saveState(); };

  $("optEnabled").checked = state.enabled;
  $("optEnabled").addEventListener("change", (e) => {
    set("enabled", e.target.checked);
    if (!e.target.checked) { speechSynthesis.cancel(); if (currentAudio) currentAudio.pause(); }
  });

  $("optLang").value = state.lang;
  $("optLang").addEventListener("change", (e) => {
    set("lang", e.target.value);
    applyUIText();
    refreshVoices();
    speak(pickLine(FLOWER_LINES[state.lang].startup));
  });

  $("optEngine").value = state.engine;
  $("optEngine").addEventListener("change", (e) => { set("engine", e.target.value); syncEngineUI(); });

  $("optElevenKey").value = state.elevenKey;
  $("optElevenKey").addEventListener("input", (e) => set("elevenKey", e.target.value));
  $("optElevenVoice").value = state.elevenVoiceId;
  $("optElevenVoice").addEventListener("input", (e) => set("elevenVoiceId", e.target.value));

  $("optVoice").addEventListener("change", (e) => set("voiceURI", e.target.value));
  $("optRate").value = state.rate;
  $("optRate").addEventListener("input", (e) => set("rate", Number(e.target.value)));
  $("optPitch").value = state.pitch;
  $("optPitch").addEventListener("input", (e) => set("pitch", Number(e.target.value)));

  $("presetCute").addEventListener("click", () => applyPreset("cute"));
  $("presetNormal").addEventListener("click", () => applyPreset("normal"));
  $("presetCalm").addEventListener("click", () => applyPreset("calm"));
  $("testVoiceBtn").addEventListener("click", () => speak(pickLine(FLOWER_LINES[state.lang].poke), { force: true }));

  $("optChatter").checked = state.autoChatter;
  $("optChatter").addEventListener("change", (e) => { set("autoChatter", e.target.checked); scheduleNextChatter(); });

  $("optFreq").value = state.chatterFreq;
  $("optFreq").addEventListener("change", (e) => { set("chatterFreq", e.target.value); scheduleNextChatter(); });

  $("optHourly").checked = state.hourlyChime;
  $("optHourly").addEventListener("change", (e) => set("hourlyChime", e.target.checked));

  $("optNight").checked = state.quietNight;
  $("optNight").addEventListener("change", (e) => set("quietNight", e.target.checked));

  $("optWake").value = state.wakeTime;
  $("optWake").addEventListener("change", (e) => set("wakeTime", e.target.value));
  $("optSleep").value = state.sleepTime;
  $("optSleep").addEventListener("change", (e) => set("sleepTime", e.target.value));

  // 自定义台词
  $("optUseBuiltin").checked = state.useBuiltinLines;
  $("optUseBuiltin").addEventListener("change", (e) => set("useBuiltinLines", e.target.checked));
  $("lineForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("lineText").value.trim();
    if (!text) return;
    state.customLines[state.lang].push(text);
    saveState();
    renderCustomLines();
    $("lineText").value = "";
  });

  // 戳一下
  flowerBtn.addEventListener("click", () => {
    if (!started) return;
    speechSynthesis.cancel();
    if (currentAudio) currentAudio.pause();
    speak(pickLine(FLOWER_LINES[state.lang].poke));
  });

  // 添加计划
  $("planForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const time = $("planTime").value;
    const text = $("planText").value.trim();
    if (!time || !text) return;
    state.plans.push({
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      time, text, repeat: $("planRepeat").value, enabled: true,
    });
    saveState();
    renderPlans();
    $("planText").value = "";
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  });

  // 唤醒(解锁音频)
  $("startBtn").addEventListener("click", () => {
    started = true;
    $("startOverlay").classList.add("hidden");
    refreshVoices();
    speak(pickLine(FLOWER_LINES[state.lang].startup), { force: true });
    scheduleNextChatter();
  });
}

/* ---------- 启动 ---------- */
function init() {
  applyUIText();
  bindControls();
  syncEngineUI();
  refreshVoices();
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = refreshVoices;
  scheduleNextChatter();
  setInterval(tick, 5000);
}

init();
