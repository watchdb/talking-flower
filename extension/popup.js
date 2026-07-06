/* 闲聊花插件 popup:读写 chrome.storage.local 的 settings,后台自动重排闹钟 */
"use strict";

const UI_TEXT = {
  zh: {
    pokeHint: "戳一下小花,它会回应你",
    power: "小花开关",
    hourlyChime: "整点报时",
    autoChatter: "自动闲聊",
    chatterFreq: "闲聊频率",
    freqChatty: "话痨(2–6 分钟)",
    freqNormal: "正常(8–20 分钟)",
    freqQuiet: "安静(25–45 分钟)",
    quietNight: "夜间休息",
    wakeTime: "起床",
    sleepTime: "睡觉",
    language: "语言",
    voiceTitle: "语音",
    voiceEngine: "语音引擎",
    engineBrowser: "浏览器(免费)",
    engineCloud: "在线·ElevenLabs",
    browserVoice: "声音",
    apiKey: "API Key",
    voiceId: "语音 ID",
    cloudNote: "在 elevenlabs.io 免费注册取 Key,从 Voice Library 选可爱音色复制 Voice ID。Key 只存本地。",
    rate: "语速",
    pitch: "音调",
    presetCute: "🎀 可爱",
    presetNormal: "标准",
    presetCalm: "沉稳",
    testVoice: "试听",
    customTitle: "自定义文案",
    useBuiltin: "同时用内置台词",
    linePlaceholder: "写一句小花会说的话…",
    addLine: "添加",
    customEmpty: "还没有自定义台词",
    plansTitle: "计划提醒",
    planPlaceholder: "例如:去开会 / 喝水",
    repeatDaily: "每天",
    repeatOnce: "仅一次",
    addPlan: "添加",
    plansEmpty: "还没有计划,添加一条试试吧",
    disclaimer: "粉丝自制,与任天堂无关;台词原创,语音来自系统 TTS 或你自选的在线引擎。",
    defaultVoice: "系统默认声音",
    autoVoice: "自动(挑最好听的)",
    recommend: "⭐",
  },
  en: {
    pokeHint: "Poke the flower and it will respond",
    power: "Flower on/off",
    hourlyChime: "Hourly chime",
    autoChatter: "Auto chatter",
    chatterFreq: "Chatter frequency",
    freqChatty: "Chatty (2–6 min)",
    freqNormal: "Normal (8–20 min)",
    freqQuiet: "Quiet (25–45 min)",
    quietNight: "Night rest",
    wakeTime: "Wake",
    sleepTime: "Sleep",
    language: "Language",
    voiceTitle: "Voice",
    voiceEngine: "Voice engine",
    engineBrowser: "Browser (free)",
    engineCloud: "Online · ElevenLabs",
    browserVoice: "Voice",
    apiKey: "API Key",
    voiceId: "Voice ID",
    cloudNote: "Sign up free at elevenlabs.io for a key, pick a cute voice in the Voice Library, copy its Voice ID. Key stays local.",
    rate: "Rate",
    pitch: "Pitch",
    presetCute: "🎀 Cute",
    presetNormal: "Normal",
    presetCalm: "Calm",
    testVoice: "Preview",
    customTitle: "Custom lines",
    useBuiltin: "Also use built-in lines",
    linePlaceholder: "A line for the flower to say…",
    addLine: "Add",
    customEmpty: "No custom lines yet",
    plansTitle: "Reminders",
    planPlaceholder: "e.g. meeting / drink water",
    repeatDaily: "Daily",
    repeatOnce: "Once",
    addPlan: "Add",
    plansEmpty: "No reminders yet — add one!",
    disclaimer: "Fan-made, not affiliated with Nintendo; original lines, system TTS or your chosen online engine.",
    defaultVoice: "System default voice",
    autoVoice: "Auto (best-sounding)",
    recommend: "⭐",
  },
  ja: {
    pokeHint: "お花をつつくと返事するよ",
    power: "お花のオン/オフ",
    hourlyChime: "時報",
    autoChatter: "ひとりごと",
    chatterFreq: "おしゃべり頻度",
    freqChatty: "おしゃべり(2–6分)",
    freqNormal: "ふつう(8–20分)",
    freqQuiet: "しずか(25–45分)",
    quietNight: "おやすみモード",
    wakeTime: "起床",
    sleepTime: "就寝",
    language: "言語",
    voiceTitle: "音声",
    voiceEngine: "音声エンジン",
    engineBrowser: "ブラウザ(無料)",
    engineCloud: "オンライン·ElevenLabs",
    browserVoice: "声",
    apiKey: "API Key",
    voiceId: "Voice ID",
    cloudNote: "elevenlabs.io で無料登録して Key を取得、Voice Library でかわいい声を選んで Voice ID をコピー。Key はローカル保存。",
    rate: "話す速さ",
    pitch: "声の高さ",
    presetCute: "🎀 かわいい",
    presetNormal: "標準",
    presetCalm: "おちつき",
    testVoice: "試聴",
    customTitle: "カスタムセリフ",
    useBuiltin: "内蔵セリフも使う",
    linePlaceholder: "お花に言わせたいひとこと…",
    addLine: "追加",
    customEmpty: "まだカスタムセリフがありません",
    plansTitle: "リマインダー",
    planPlaceholder: "例:会議 / 水を飲む",
    repeatDaily: "毎日",
    repeatOnce: "一回だけ",
    addPlan: "追加",
    plansEmpty: "まだリマインダーがありません",
    disclaimer: "ファンメイド。任天堂とは無関係;セリフはオリジナル、音声はシステムTTSまたは選んだオンラインエンジン。",
    defaultVoice: "システム標準の声",
    autoVoice: "自動(いちばん良い声)",
    recommend: "⭐",
  },
};

const DEFAULTS = {
  enabled: true,
  lang: "zh",
  engine: "browser",
  elevenKey: "",
  elevenVoiceId: "",
  voiceName: "",
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
};

const VOICE_PRESETS = {
  cute: { rate: 1.1, pitch: 1.75 },
  normal: { rate: 1.05, pitch: 1.35 },
  calm: { rate: 0.95, pitch: 0.95 },
};

const GOOD_VOICE_HINTS = [
  "natural", "neural", "online", "google", "premium", "enhanced", "多情感",
  "晓晓", "晓伊", "晓", "云希", "云", "xiaoxiao", "xiaoyi", "yunxi",
  "nanami", "mayu", "keita", "ayumi", "child", "kid", "女", "female",
];

let settings = { ...DEFAULTS };

const $ = (id) => document.getElementById(id);

async function load() {
  const { settings: saved } = await chrome.storage.local.get("settings");
  settings = Object.assign({}, DEFAULTS, saved || {});
  settings.customLines = Object.assign({ zh: [], en: [], ja: [] }, settings.customLines || {});
}

async function save() {
  await chrome.storage.local.set({ settings });
}

function speakHere(text) {
  chrome.runtime.sendMessage({ type: "speak", text });
  const bubble = $("bubble");
  bubble.textContent = text;
  bubble.classList.remove("hidden");
  clearTimeout(speakHere._t);
  speakHere._t = setTimeout(() => bubble.classList.add("hidden"), 5000);
}

function applyUIText() {
  const T = UI_TEXT[settings.lang];
  document.documentElement.lang = settings.lang === "zh" ? "zh-CN" : settings.lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (T[key]) el.textContent = T[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (T[key]) el.placeholder = T[key];
  });
}

function scoreVoice(v) {
  const n = (v.voiceName || "").toLowerCase();
  let s = 0;
  for (const h of GOOD_VOICE_HINTS) if (n.includes(h.toLowerCase())) s += 10;
  if (v.remote) s += 3;
  return s;
}

function refreshVoices() {
  chrome.tts.getVoices((voices) => {
    const sel = $("optVoice");
    const T = UI_TEXT[settings.lang];
    const prefix = FLOWER_LINES[settings.lang].voiceLang.slice(0, 2).toLowerCase();
    const match = (voices || []).filter((v) => (v.lang || "").toLowerCase().startsWith(prefix));
    const ranked = (match.length ? match : voices || []).slice().sort((a, b) => scoreVoice(b) - scoreVoice(a));

    sel.innerHTML = "";
    const auto = document.createElement("option");
    auto.value = "auto";
    auto.textContent = T.autoVoice;
    sel.appendChild(auto);

    for (const v of ranked) {
      const opt = document.createElement("option");
      opt.value = v.voiceName;
      const star = scoreVoice(v) >= 10 ? T.recommend + " " : "";
      opt.textContent = `${star}${v.voiceName} (${v.lang || "?"})`;
      sel.appendChild(opt);
    }
    sel.value = settings.voiceName && ranked.some((v) => v.voiceName === settings.voiceName) ? settings.voiceName : "auto";
  });
}

function renderCustomLines() {
  const ul = $("lineList");
  ul.innerHTML = "";
  const lines = settings.customLines[settings.lang] || [];
  lines.forEach((text, idx) => {
    const li = document.createElement("li");

    const say = document.createElement("button");
    say.className = "plan-del";
    say.textContent = "🔊";
    say.title = UI_TEXT[settings.lang].testVoice;
    say.addEventListener("click", () => speakHere(text));

    const span = document.createElement("span");
    span.className = "plan-text";
    span.textContent = text;

    const del = document.createElement("button");
    del.className = "plan-del";
    del.textContent = "✕";
    del.addEventListener("click", async () => {
      settings.customLines[settings.lang].splice(idx, 1);
      await save();
      renderCustomLines();
    });

    li.append(say, span, del);
    ul.appendChild(li);
  });
  $("lineEmpty").classList.toggle("hidden", lines.length > 0);
}

function renderPlans() {
  const ul = $("planList");
  ul.innerHTML = "";
  const T = UI_TEXT[settings.lang];
  const sorted = [...settings.plans].sort((a, b) => a.time.localeCompare(b.time));
  for (const plan of sorted) {
    const li = document.createElement("li");
    if (!plan.enabled) li.classList.add("plan-off");

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = plan.enabled;
    toggle.addEventListener("change", async () => { plan.enabled = toggle.checked; await save(); renderPlans(); });

    const time = document.createElement("span");
    time.className = "plan-time";
    time.textContent = plan.time;

    const text = document.createElement("span");
    text.className = "plan-text";
    text.textContent = plan.text;

    const repeat = document.createElement("span");
    repeat.className = "plan-repeat";
    repeat.textContent = T[plan.repeat === "daily" ? "repeatDaily" : "repeatOnce"];

    const del = document.createElement("button");
    del.className = "plan-del";
    del.textContent = "✕";
    del.addEventListener("click", async () => {
      settings.plans = settings.plans.filter((p) => p.id !== plan.id);
      await save();
      renderPlans();
    });

    li.append(toggle, time, text, repeat, del);
    ul.appendChild(li);
  }
  $("planEmpty").classList.toggle("hidden", settings.plans.length > 0);
}

function syncEngineUI() {
  const cloud = settings.engine === "elevenlabs";
  $("cloudFields").classList.toggle("hidden", !cloud);
  $("voiceRow").classList.toggle("hidden", cloud);
}

async function applyPreset(name) {
  const p = VOICE_PRESETS[name];
  if (!p) return;
  settings.rate = p.rate;
  settings.pitch = p.pitch;
  $("optRate").value = p.rate;
  $("optPitch").value = p.pitch;
  await save();
  speakHere(pickLine(FLOWER_LINES[settings.lang].poke));
}

function bind() {
  const setAndSave = async (key, value) => { settings[key] = value; await save(); };

  $("optEnabled").checked = settings.enabled;
  $("optEnabled").addEventListener("change", (e) => setAndSave("enabled", e.target.checked));

  $("optHourly").checked = settings.hourlyChime;
  $("optHourly").addEventListener("change", (e) => setAndSave("hourlyChime", e.target.checked));

  $("optChatter").checked = settings.autoChatter;
  $("optChatter").addEventListener("change", (e) => setAndSave("autoChatter", e.target.checked));

  $("optFreq").value = settings.chatterFreq;
  $("optFreq").addEventListener("change", (e) => setAndSave("chatterFreq", e.target.value));

  $("optNight").checked = settings.quietNight;
  $("optNight").addEventListener("change", (e) => setAndSave("quietNight", e.target.checked));

  $("optWake").value = settings.wakeTime;
  $("optWake").addEventListener("change", (e) => setAndSave("wakeTime", e.target.value));
  $("optSleep").value = settings.sleepTime;
  $("optSleep").addEventListener("change", (e) => setAndSave("sleepTime", e.target.value));

  $("optLang").value = settings.lang;
  $("optLang").addEventListener("change", async (e) => {
    settings.lang = e.target.value;
    settings.voiceName = "";
    await save();
    applyUIText();
    refreshVoices();
    renderPlans();
    renderCustomLines();
    speakHere(pickLine(FLOWER_LINES[settings.lang].startup));
  });

  $("optEngine").value = settings.engine;
  $("optEngine").addEventListener("change", (e) => { setAndSave("engine", e.target.value); syncEngineUI(); });

  $("optElevenKey").value = settings.elevenKey;
  $("optElevenKey").addEventListener("input", (e) => setAndSave("elevenKey", e.target.value));
  $("optElevenVoice").value = settings.elevenVoiceId;
  $("optElevenVoice").addEventListener("input", (e) => setAndSave("elevenVoiceId", e.target.value));

  $("optVoice").addEventListener("change", (e) => setAndSave("voiceName", e.target.value));

  $("optRate").value = settings.rate;
  $("optRate").addEventListener("input", (e) => setAndSave("rate", Number(e.target.value)));
  $("optPitch").value = settings.pitch;
  $("optPitch").addEventListener("input", (e) => setAndSave("pitch", Number(e.target.value)));

  $("presetCute").addEventListener("click", (e) => { e.preventDefault(); applyPreset("cute"); });
  $("presetNormal").addEventListener("click", (e) => { e.preventDefault(); applyPreset("normal"); });
  $("presetCalm").addEventListener("click", (e) => { e.preventDefault(); applyPreset("calm"); });
  $("testVoiceBtn").addEventListener("click", (e) => { e.preventDefault(); speakHere(pickLine(FLOWER_LINES[settings.lang].poke)); });

  $("optUseBuiltin").checked = settings.useBuiltinLines;
  $("optUseBuiltin").addEventListener("change", (e) => setAndSave("useBuiltinLines", e.target.checked));
  $("lineForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $("lineText").value.trim();
    if (!text) return;
    settings.customLines[settings.lang].push(text);
    await save();
    renderCustomLines();
    $("lineText").value = "";
  });

  $("flower").addEventListener("click", () => speakHere(pickLine(FLOWER_LINES[settings.lang].poke)));

  $("planForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const time = $("planTime").value;
    const text = $("planText").value.trim();
    if (!time || !text) return;
    settings.plans.push({
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      time, text, repeat: $("planRepeat").value, enabled: true,
    });
    await save();
    renderPlans();
    $("planText").value = "";
  });
}

(async function init() {
  await load();
  applyUIText();
  bind();
  syncEngineUI();
  refreshVoices();
  renderCustomLines();
  renderPlans();
})();
