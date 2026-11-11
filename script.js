const MODES = {
  focus: { minutes: 25, label: 'Time to focus', done: 'Focus session done. Take a break.' },
  short: { minutes: 5, label: 'Short break', done: 'Break over. Back to it.' },
  long: { minutes: 15, label: 'Long break', done: 'Long break over. New round.' },
};
const SESSIONS_PER_ROUND = 4;
const CIRCUMFERENCE = 2 * Math.PI * 90;

const timeEl = document.getElementById('time');
const statusEl = document.getElementById('status');
const progressEl = document.getElementById('progress');
const toggleBtn = document.getElementById('toggle');
const resetBtn = document.getElementById('reset');
const skipBtn = document.getElementById('skip');
const dotsEl = document.getElementById('dots');
const countEl = document.getElementById('session-count');
const tabs = document.querySelectorAll('.modes button');

let mode = 'focus';
let remaining = MODES.focus.minutes * 60; // seconds
let endsAt = null; // timestamp while running, so the timer doesn't drift when the tab is in the background
let tick = null;
let completedFocus = 0; // total focus sessions finished today

progressEl.style.strokeDasharray = CIRCUMFERENCE;

function format(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function render() {
  const total = MODES[mode].minutes * 60;
  timeEl.textContent = format(remaining);
  progressEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - remaining / total);
  document.title = endsAt ? `${format(remaining)} · ${MODES[mode].label}` : 'Pomodoro Timer';
  toggleBtn.textContent = endsAt ? 'Pause' : remaining < total ? 'Resume' : 'Start';

  const inRound = completedFocus % SESSIONS_PER_ROUND;
  dotsEl.innerHTML = '';
  for (let i = 0; i < SESSIONS_PER_ROUND; i++) {
    const li = document.createElement('li');
    if (i < inRound || (inRound === 0 && completedFocus > 0 && mode === 'long')) li.className = 'done';
    dotsEl.appendChild(li);
  }
  countEl.textContent = completedFocus
    ? `${completedFocus} focus session${completedFocus === 1 ? '' : 's'} today`
    : 'Four focus sessions, then a long break';
}

function setMode(next, { keepStatus = false } = {}) {
  stop();
  mode = next;
  remaining = MODES[mode].minutes * 60;
  document.body.dataset.mode = mode;
  tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
  if (!keepStatus) statusEl.textContent = MODES[mode].label;
  render();
}

function start() {
  endsAt = Date.now() + remaining * 1000;
  statusEl.textContent = MODES[mode].label;
  tick = setInterval(() => {
    remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
    render();
    if (remaining === 0) complete();
  }, 250);
  render();
}

function stop() {
  clearInterval(tick);
  tick = null;
  endsAt = null;
}

function toggle() {
  if (endsAt) {
    stop();
    render();
  } else {
    start();
  }
}

function nextMode() {
  if (mode !== 'focus') return 'focus';
  return completedFocus % SESSIONS_PER_ROUND === 0 ? 'long' : 'short';
}

function complete() {
  const finished = mode;
  stop();
  if (finished === 'focus') completedFocus++;
  chime();
  setMode(nextMode(), { keepStatus: true });
  statusEl.textContent = MODES[finished].done;
}

function skip() {
  if (mode === 'focus') completedFocus++;
  setMode(nextMode());
}

// Short two-note chime with the Web Audio API (no sound files needed).
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  } catch {
    // Audio isn't available; the color change and status text still signal the switch.
  }
}

toggleBtn.addEventListener('click', toggle);
resetBtn.addEventListener('click', () => setMode(mode));
skipBtn.addEventListener('click', skip);
tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));

document.addEventListener('keydown', (e) => {
  if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
  if (e.key === ' ') { e.preventDefault(); toggle(); }
  else if (e.key.toLowerCase() === 'r') setMode(mode);
  else if (e.key.toLowerCase() === 'n') skip();
});

render();
