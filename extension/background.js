/* 闲聊花浏览器插件 —— 后台 service worker
 * 负责:整点报时、自动闲聊、计划提醒(全部基于 chrome.alarms,浏览器开着就生效)
 */
"use strict";

importScripts("lines.js");

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
  plans: [], // {id, time:"HH:MM", text, repeat:"daily"|"once", enabled}
};

const CHATTER_RANGES = {
  chatty: [2, 6],
  normal: [8, 20],
  quiet: [25, 45],
};

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  return Object.assign({}, DEFAULTS, settings || {});
}

async function saveSettings(s) {
  await chrome.storage.local.set({ settings: s });
}

/* ---------- 发声与通知 ---------- */
function speak(text, s) {
  chrome.tts.stop();
  chrome.tts.speak(text, {
    lang: FLOWER_LINES[s.lang].voiceLang,
    voiceName: s.voiceName || undefined,
    rate: s.rate,
    pitch: Math.min(s.pitch, 2),
  });
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
const two = (n) => String(n).padStart(2, "0");

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

/** HH:MM 的下一次到点时刻(毫秒) */
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

  // 整点报时:对齐到下一个整点,之后每 60 分钟一次
  await chrome.alarms.create("hourly", { when: nextHourTop(), periodInMinutes: 60 });

  // 自动闲聊:一次性闹钟,触发后再随机排下一次
  if (s.autoChatter) await scheduleChatter(s);

  // 起床 / 睡觉问候
  if (s.quietNight) {
    await chrome.alarms.create("greet-morning", { when: nextOccurrence(s.wakeTime), periodInMinutes: 1440 });
    await chrome.alarms.create("greet-night", { when: nextOccurrence(s.sleepTime), periodInMinutes: 1440 });
  }

  // 计划提醒
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
    if (s.autoChatter && isAwakeTime(s, d)) speak(pickLine(L.chatter), s);
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
  notify("🌼 闲聊花已就位", "点击工具栏上的小花图标可以调整设置、添加计划提醒。");
  speak(pickLine(FLOWER_LINES[s.lang].startup), s);
});

chrome.runtime.onStartup.addListener(rescheduleAll);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) rescheduleAll();
});

/* popup 请求(戳一下 / 试听) */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "speak" && typeof msg.text === "string") {
    getSettings().then((s) => speak(msg.text, s));
  }
});
