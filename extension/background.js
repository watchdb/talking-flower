/* 闲聊花浏览器插件 —— 后台 service worker
 * 负责:整点报时、自动闲聊、计划提醒(全部基于 chrome.alarms,浏览器开着就生效)
 * 发声:浏览器引擎用 chrome.tts;在线引擎(ElevenLabs)经 offscreen 文档播放音频。
 */
"use strict";

importScripts("lines.js");

const DEFAULTS = {
  enabled: true,
  lang: "zh",
  engine: "browser",           // browser | elevenlabs
  elevenKey: "",
  elevenVoiceId: "",
  voiceName: "",               // "" 或 "auto" = 自动挑最好听的
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
  plans: [], // {id, time:"HH:MM", text, repeat:"daily"|"once", enabled}
};

const CHATTER_RANGES = {
  chatty: [2, 6],
  normal: [8, 20],
  quiet: [25, 45],
};

const GOOD_VOICE_HINTS = [
  "natural", "neural", "online", "google", "premium", "enhanced", "多情感",
  "晓晓", "晓伊", "晓", "云希", "云", "xiaoxiao", "xiaoyi", "yunxi",
  "nanami", "mayu", "keita", "ayumi", "child", "kid", "女", "female",
];

const ELEVEN_DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  const s = Object.assign({}, DEFAULTS, settings || {});
  s.customLines = Object.assign({ zh: [], en: [], ja: [] }, s.customLines || {});
  return s;
}

async function saveSettings(s) {
  await chrome.storage.local.set({ settings: s });
}

/* ---------- 台词池(内置 + 自定义) ---------- */
function chatterPool(s) {
  const builtin = s.useBuiltinLines ? FLOWER_LINES[s.lang].chatter : [];
  const custom = (s.customLines && s.customLines[s.lang]) || [];
  const pool = builtin.concat(custom);
  return pool.length ? pool : FLOWER_LINES[s.lang].chatter;
}

/* ---------- 音色优选 ---------- */
function scoreTtsVoice(v) {
  const n = (v.voiceName || "").toLowerCase();
  let s = 0;
  for (const h of GOOD_VOICE_HINTS) if (n.includes(h.toLowerCase())) s += 10;
  if (v.remote) s += 3; // 网络神经网络音色通常更自然
  return s;
}

function bestVoiceName(lang) {
  return new Promise((resolve) => {
    chrome.tts.getVoices((voices) => {
      const prefix = FLOWER_LINES[lang].voiceLang.slice(0, 2).toLowerCase();
      const match = (voices || []).filter((v) => (v.lang || "").toLowerCase().startsWith(prefix));
      const pool = match.length ? match : voices || [];
      pool.sort((a, b) => scoreTtsVoice(b) - scoreTtsVoice(a));
      resolve(pool[0] ? pool[0].voiceName : undefined);
    });
  });
}

/* ---------- 发声与通知 ---------- */
async function speak(text, s) {
  if (s.engine === "elevenlabs" && (s.elevenKey || "").trim()) {
    return speakCloud(text, s);
  }
  chrome.tts.stop();
  const voiceName = s.voiceName && s.voiceName !== "auto" ? s.voiceName : await bestVoiceName(s.lang);
  chrome.tts.speak(text, {
    lang: FLOWER_LINES[s.lang].voiceLang,
    voiceName: voiceName || undefined,
    rate: s.rate,
    pitch: Math.min(Math.max(s.pitch, 0), 2),
  });
}

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "播放在线 TTS 语音",
  });
}

async function speakCloud(text, s) {
  try {
    await ensureOffscreen();
    chrome.runtime.sendMessage({
      target: "offscreen",
      type: "cloud-speak",
      text,
      key: s.elevenKey.trim(),
      voiceId: (s.elevenVoiceId || "").trim() || ELEVEN_DEFAULT_VOICE,
      rate: s.rate,
    });
  } catch (e) {
    // 在线失败就回退到浏览器语音,别让小花“哑巴”
    chrome.tts.stop();
    const voiceName = s.voiceName && s.voiceName !== "auto" ? s.voiceName : await bestVoiceName(s.lang);
    chrome.tts.speak(text, { lang: FLOWER_LINES[s.lang].voiceLang, voiceName: voiceName || undefined, rate: s.rate, pitch: Math.min(s.pitch, 2) });
  }
}

function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
  });
}

/* ---------- 时间工具 ---------- */
function minutesOf(hm) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function isAwakeTime(s, d) {
  if (!s.quietNight) return true;
  const now = d.getHours() * 60 + d.getMinutes();
  const wake = minutesOf(s.wakeTime);
  const sleep = minutesOf(s.sleepTime);
  return wake <= sleep ? now >= wake && now < sleep : now >= wake || now < sleep;
}

function nextOccurrence(hm) {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

function nextHourTop() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.getTime();
}

/* ---------- 闹钟编排 ---------- */
async function scheduleChatter(s) {
  const [lo, hi] = CHATTER_RANGES[s.chatterFreq] || CHATTER_RANGES.normal;
  const delay = lo + Math.random() * (hi - lo);
  await chrome.alarms.create("chatter", { delayInMinutes: delay });
}

async function rescheduleAll() {
  const s = await getSettings();
  await chrome.alarms.clearAll();
  if (!s.enabled) return;

  await chrome.alarms.create("hourly", { when: nextHourTop(), periodInMinutes: 60 });
  if (s.autoChatter) await scheduleChatter(s);

  if (s.quietNight) {
    await chrome.alarms.create("greet-morning", { when: nextOccurrence(s.wakeTime), periodInMinutes: 1440 });
    await chrome.alarms.create("greet-night", { when: nextOccurrence(s.sleepTime), periodInMinutes: 1440 });
  }

  for (const plan of s.plans) {
    if (!plan.enabled) continue;
    const opts = { when: nextOccurrence(plan.time) };
    if (plan.repeat === "daily") opts.periodInMinutes = 1440;
    await chrome.alarms.create(`plan:${plan.id}`, opts);
  }
}

/* ---------- 闹钟触发 ---------- */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const s = await getSettings();
  if (!s.enabled) return;
  const d = new Date();
  const L = FLOWER_LINES[s.lang];

  if (alarm.name === "hourly") {
    if (s.hourlyChime && isAwakeTime(s, d)) {
      speak(`${hourAnnouncement(s.lang, d)} ${pickLine(L.hourlyTail)}`, s);
    }
    return;
  }

  if (alarm.name === "chatter") {
    if (s.autoChatter && isAwakeTime(s, d)) speak(pickLine(chatterPool(s)), s);
    await scheduleChatter(s);
    return;
  }

  if (alarm.name === "greet-morning") {
    if (s.quietNight) speak(pickLine(L.morning), s);
    return;
  }

  if (alarm.name === "greet-night") {
    if (s.quietNight) speak(pickLine(L.night), s);
    return;
  }

  if (alarm.name.startsWith("plan:")) {
    const id = alarm.name.slice(5);
    const plan = s.plans.find((p) => p.id === id);
    if (!plan || !plan.enabled) return;
    speak(`${pickLine(L.scheduleIntro)} ${plan.text}`, s);
    notify("🌼 计划提醒", `${plan.time}  ${plan.text}`);
    if (plan.repeat === "once") {
      plan.enabled = false;
      await saveSettings(s); // 会触发 onChanged → rescheduleAll
    }
    return;
  }
});

/* ---------- 生命周期 ---------- */
chrome.runtime.onInstalled.addListener(async () => {
  await rescheduleAll();
  const s = await getSettings();
  notify("🌼 闲聊花已就位", "点击工具栏上的小花图标可以调整设置、换语音、添加计划提醒。");
  speak(pickLine(FLOWER_LINES[s.lang].startup), s);
});

chrome.runtime.onStartup.addListener(rescheduleAll);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) rescheduleAll();
});

/* popup 请求(戳一下 / 试听 / 预设) */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "speak" && typeof msg.text === "string") {
    getSettings().then((s) => speak(msg.text, s));
  }
});
