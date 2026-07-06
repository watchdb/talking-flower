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
    voice: "声音",
    plansTitle: "计划提醒",
    planPlaceholder: "例如:去开会 / 喝水",
    repeatDaily: "每天",
    repeatOnce: "仅一次",
    addPlan: "添加",
    plansEmpty: "还没有计划,添加一条试试吧",
    disclaimer: "粉丝自制,与任天堂无关;台词原创,语音来自系统 TTS。",
    defaultVoice: "系统默认声音",
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
    voice: "Voice",
    plansTitle: "Reminders",
    planPlaceholder: "e.g. meeting / drink water",
    repeatDaily: "Daily",
    repeatOnce: "Once",
    addPlan: "Add",
    plansEmpty: "No reminders yet — add one!",
    disclaimer: "Fan-made, not affiliated with Nintendo; original lines, system TTS voices.",
    defaultVoice: "System default voice",
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
    voice: "声",
    plansTitle: "リマインダー",
    planPlaceholder: "例:会議 / 水を飲む",
    repeatDaily: "毎日",
    repeatOnce: "一回だけ",
    addPlan: "追加",
    plansEmpty: "まだリマインダーがありません",
    disclaimer: "ファンメイド。任天堂とは無関係;セリフはオリジナル、音声はシステムTTS。",
    defaultVoice: "システム標準の声",
  },
};

const DEFAULTS = {
  enabled: true,
  lang: "zh",
  voiceName: "",
  rate: 1.05,
  pitch: 1.35,
  autoChatter: true,
  chatterFreq: "normal",
  hourlyChime: true,
  quietNight: true,
  wakeTime: "07:30",
  sleepTime: "22:30",
  plans: [],
};

let settings = { ...DEFAULTS };

const $ = (id) => document.getElementById(id);

async function load() {
  const { settings: saved } = await chrome.storage.local.get("settings");
  settings = Object.assign({}, DEFAULTS, saved || {});
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

function refreshVoices() {
  chrome.tts.getVoices((voices) => {
    const sel = $("optVoice");
    const prefix = FLOWER_LINES[settings.lang].voiceLang.slice(0, 2);
    const match = (voices || []).filter((v) => (v.lang || "").toLowerCase().startsWith(prefix));
    const list = match.length ? match : voices || [];

    sel.innerHTML = "";
    const def = document.createElement("option");
    def.value = "";
    def.textContent = UI_TEXT[settings.lang].defaultVoice;
    sel.appendChild(def);
    for (const v of list) {
      const opt = document.createElement("option");
      opt.value = v.voiceName;
      opt.textContent = `${v.voiceName} (${v.lang || "?"})`;
      sel.appendChild(opt);
    }
    sel.value = settings.voiceName && list.some((v) => v.voiceName === settings.voiceName)
      ? settings.voiceName : "";
  });
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
    toggle.addEventListener("change", async () => {
      plan.enabled = toggle.checked;
      await save();
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

function bind() {
  const setAndSave = async (key, value) => {
    settings[key] = value;
    await save();
  };

  $("optEnabled").checked = settings.enabled;
  $("optEnabled").addEventListener("change", (e) => {
    setAndSave("enabled", e.target.checked);
    if (!e.target.checked) chrome.tts.stop();
  });

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
    speakHere(pickLine(FLOWER_LINES[settings.lang].startup));
  });

  $("optVoice").addEventListener("change", (e) => setAndSave("voiceName", e.target.value));

  $("flower").addEventListener("click", () => {
    speakHere(pickLine(FLOWER_LINES[settings.lang].poke));
  });

  $("planForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const time = $("planTime").value;
    const text = $("planText").value.trim();
    if (!time || !text) return;
    settings.plans.push({
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      time,
      text,
      repeat: $("planRepeat").value,
      enabled: true,
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
  refreshVoices();
  renderPlans();
})();
