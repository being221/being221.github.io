import hexagrams from "../data/hexagrams.json";

const KEYS = Object.keys(hexagrams);

export function randomDivination() {
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  return { ...hexagrams[key] };
}

export function coinDivination() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += Math.random() > 0.5 ? "1" : "0";
  }
  const hexagram = hexagrams[code] || randomDivination();
  return { hexagram: { ...hexagram }, code, timestamp: Date.now() };
}

export function detectShake(event, callback, threshold = 15) {
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;
  const m = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
  if (m > threshold) callback();
}
