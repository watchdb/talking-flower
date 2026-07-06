/* 离屏文档:接收后台的 cloud-speak 消息,调用 ElevenLabs 生成语音并播放 */
"use strict";

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.target !== "offscreen" || msg.type !== "cloud-speak") return;
  playCloud(msg);
});

async function playCloud(m) {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(m.voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": m.key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: m.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
        }),
      }
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.playbackRate = Math.min(Math.max(m.rate || 1, 0.5), 2);
    audio.onended = audio.onerror = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch (e) {
    console.warn("闲聊花:在线语音失败", e);
  }
}
