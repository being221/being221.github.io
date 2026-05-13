let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function settingEnabled(key) {
  try {
    const settings = JSON.parse(localStorage.getItem("divination_settings"));
    return settings?.[key] !== false;
  } catch {
    return true;
  }
}

export function playCoinSound() {
  if (!settingEnabled("sound")) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // 音频不可用，静默处理
  }
}

export function vibrate(pattern = 15) {
  if (!settingEnabled("vibration")) return;
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // 震动不可用
  }
}

export function coinFeedback() {
  playCoinSound();
  vibrate(10);
}
