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
    voice: "声音",
    rate: "语速",
    pitch: "音调",
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
    plansTitle: "计划提醒",
    plansDesc: "到点时小花会大声念出来,并弹出通知(需要保持本页面打开;后台常驻请用浏览器插件版)",
    planPlaceholder: "例如:去开会 / 喝水 / 收快递",
    repeatDaily: "每天",
    repeatOnce: "仅一次",
    addPlan: "添加",
    plansEmpty: "还没有计划,添加一条试试吧",
    disclaimer: "粉丝自制网页玩具,与任天堂无关;台词均为原创,语音来自浏览器自带 TTS。",
    defaultVoice: "系统默认声音",
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
    voice: "Voice",
    rate: "Rate",
    pitch: "Pitch",
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
    plansTitle: "Reminders",
    plansDesc: "The flower reads it out loud and shows a notification (keep this tab open; use the browser extension for background reminders)",
    planPlaceholder: "e.g. meeting / drink water / pick up package",
    repeatDaily: "Daily",
    repeatOnce: "Once",
    addPlan: "Add",
    plansEmpty: "No reminders yet — add one!",
    disclaimer: "Fan-made web toy, not affiliated with Nintendo; all lines are original, voices come from your browser's built-in TTS.",
    defaultVoice: "System default voice",
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
    voice: "声",
    rate: "話す速さ",
    pitch: "声の高さ",
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
    plansTitle: "リマインダー",
    plansDesc: "時間になるとお花が読み上げて通知します(このタブを開いたままに;常駐は拡張機能版で)",
    planPlaceholder: "例:会議 / 水を飲む / 荷物の受け取り",
    repeatDaily: "毎日",
    repeatOnce: "一回だけ",
    addPlan: "追加",
    plansEmpty: "まだリマインダーがありません",
    disclaimer: "ファンメイドのWebトイです。任天堂とは無関係;セリフはすべてオリジナル、音声はブラウザ内蔵TTSです。",
    defaultVoice: "システム標準の声",
  },
};

const CHATTER_RANGES = {
  chatty: [2, 6],
  normal: [8, 20],
  quiet: [25, 45],
};

/* ---------- 状态 ---------- */
const STORE_KEY = "talking-flower:v1";

const defaultState = () => ({
  enabled: true,
  lang: navigator.language.startsWith("ja") ? "ja" : navigator.language.startsWith("en") ? "en" : "zh",
  voiceURI: "",
  rate: 1.05,
  pitch: 1.35,
  autoChatter: true,
  chatterFreq: "normal",
  hourlyChime: true,
  quietNight: true,
  wakeTime: "07:30",
  sleepTime: "22:30",
  plans: [], // {id, time:"HH:MM", text, repeat:"daily"|"once", enabled}
  fired: {}, // key -> timestamp,防止重复触发
});

let state = loadState();
let started = false;         // 用户是否已点击「唤醒」(解锁音频)
let nextChatterAt = 0;
let voices = [];

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (_) { /* 忽略损坏的存档 */ }
  return defaultState();
}

function saveState() {
  // 清理 24 小时前的触发记录,防止无限膨胀
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

/* ---------- 语音 ---------- */
function refreshVoices() {
  voices = speechSynthesis.getVoices();
  const sel = $("optVoice");
  const langPrefix = FLOWER_LINES[state.lang].voiceLang.slice(0, 2);
  const match = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  const list = match.length ? match : voices;

  sel.innerHTML = "";
  const def = document.createElement("option");
  def.value = "";
  def.textContent = UI_TEXT[state.lang].defaultVoice;
  sel.appendChild(def);
  for (const v of list) {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(opt);
  }
  sel.value = state.voiceURI && list.some((v) => v.voiceURI === state.voiceURI) ? state.voiceURI : "";
}

function speak(text, { force = false } = {}) {
  if (!started) return;
  if (!state.enabled && !force) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = FLOWER_LINES[state.lang].voiceLang;
  const v = voices.find((v) => v.voiceURI === state.voiceURI);
  if (v) u.voice = v;
  u.rate = state.rate;
  u.pitch = state.pitch;
  u.onstart = () => {
    stage.classList.add("talking");
    bubble.textContent = text;
    bubble.classList.remove("hidden");
  };
  u.onend = u.onerror = () => {
    stage.classList.remove("talking");
    setTimeout(() => {
      if (!speechSynthesis.speaking) bubble.classList.add("hidden");
    }, 1500);
  };
  speechSynthesis.speak(u);
}

/* ---------- 时间工具 ---------- */
const two = (n) => String(n).padStart(2, "0");
const dayKey = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
const nowHM = (d) => `${two(d.getHours())}:${two(d.getMinutes())}`;

function minutesOf(hm) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

/** 现在是否在「醒着」的时间段(起床~睡觉) */
function isAwakeTime(d) {
  if (!state.quietNight) return true;
  const now = d.getHours() * 60 + d.getMinutes();
  const wake = minutesOf(state.wakeTime);
  const sleep = minutesOf(state.sleepTime);
  return wake <= sleep ? now >= wake && now < sleep : now >= wake || now < sleep;
}

/** hm 是否在最近 grace 分钟内到点(用于后台节流时的补触发) */
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

  // 起床 / 睡觉问候
  if (state.quietNight) {
    if (justPassed(state.wakeTime, d)) {
      fireOnce(`morning:${dayKey(d)}`, () => speak(pickLine(L.morning)));
    }
    if (justPassed(state.sleepTime, d)) {
      fireOnce(`night:${dayKey(d)}`, () => speak(pickLine(L.night)));
    }
  }

  // 整点报时
  if (state.hourlyChime && awake && d.getMinutes() <= 3) {
    fireOnce(`hour:${dayKey(d)}-${d.getHours()}`, () => {
      speak(`${hourAnnouncement(state.lang, d)} ${pickLine(L.hourlyTail)}`);
    });
  }

  // 计划提醒(睡觉时间也照常提醒)
  for (const plan of state.plans) {
    if (!plan.enabled) continue;
    if (!justPassed(plan.time, d)) continue;
    const key = `plan:${plan.id}:${dayKey(d)}`;
    fireOnce(key, () => {
      const msg = `${pickLine(L.scheduleIntro)} ${plan.text}`;
      speak(msg, { force: true });
      notify(plan.text);
      if (plan.repeat === "once") {
        plan.enabled = false;
        saveState();
        renderPlans();
      }
    });
  }

  // 自动闲聊
  if (state.autoChatter && awake && Date.now() >= nextChatterAt) {
    if (!speechSynthesis.speaking) speak(pickLine(L.chatter));
    scheduleNextChatter();
  }
}

function notify(text) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification("🌼 " + UI_TEXT[state.lang].plansTitle, { body: text });
  } catch (_) { /* 某些平台不支持页面内 Notification 构造 */ }
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
    toggle.addEventListener("change", () => {
      plan.enabled = toggle.checked;
      saveState();
      renderPlans();
    });

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
    del.title = "删除";
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
}

/* ---------- 控件绑定 ---------- */
function bindControls() {
  const set = (key, value) => { state[key] = value; saveState(); };

  $("optEnabled").checked = state.enabled;
  $("optEnabled").addEventListener("change", (e) => {
    set("enabled", e.target.checked);
    if (!e.target.checked) speechSynthesis.cancel();
  });

  $("optLang").value = state.lang;
  $("optLang").addEventListener("change", (e) => {
    set("lang", e.target.value);
    set("voiceURI", "");
    applyUIText();
    refreshVoices();
    speak(pickLine(FLOWER_LINES[state.lang].startup));
  });

  $("optVoice").addEventListener("change", (e) => set("voiceURI", e.target.value));
  $("optRate").value = state.rate;
  $("optRate").addEventListener("input", (e) => set("rate", Number(e.target.value)));
  $("optPitch").value = state.pitch;
  $("optPitch").addEventListener("input", (e) => set("pitch", Number(e.target.value)));
  $("testVoiceBtn").addEventListener("click", () => speak(pickLine(FLOWER_LINES[state.lang].poke), { force: true }));

  $("optChatter").checked = state.autoChatter;
  $("optChatter").addEventListener("change", (e) => {
    set("autoChatter", e.target.checked);
    scheduleNextChatter();
  });

  $("optFreq").value = state.chatterFreq;
  $("optFreq").addEventListener("change", (e) => {
    set("chatterFreq", e.target.value);
    scheduleNextChatter();
  });

  $("optHourly").checked = state.hourlyChime;
  $("optHourly").addEventListener("change", (e) => set("hourlyChime", e.target.checked));

  $("optNight").checked = state.quietNight;
  $("optNight").addEventListener("change", (e) => set("quietNight", e.target.checked));

  $("optWake").value = state.wakeTime;
  $("optWake").addEventListener("change", (e) => set("wakeTime", e.target.value));
  $("optSleep").value = state.sleepTime;
  $("optSleep").addEventListener("change", (e) => set("sleepTime", e.target.value));

  // 戳一下
  flowerBtn.addEventListener("click", () => {
    if (!started) return;
    speechSynthesis.cancel();
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
      time,
      text,
      repeat: $("planRepeat").value,
      enabled: true,
    });
    saveState();
    renderPlans();
    $("planText").value = "";
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
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
  refreshVoices();
  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = refreshVoices;
  }
  scheduleNextChatter();
  setInterval(tick, 5000);
}

init();
