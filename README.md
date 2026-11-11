<h1 align="center">Pomodoro Timer</h1>

<p align="center">
  25 minutes of focus, a short break, repeat. After four sessions, a long break.
</p>

<p align="center">
  <a href="https://bezalelchris.github.io/Pomodoro-Timer/"><strong>Live demo</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/dependencies-none-d9452f?style=flat-square" alt="No dependencies">
</p>

<p align="center">
  <img src="docs/screenshot.png" alt="Focus session in progress" width="68%">
  &nbsp;
  <img src="docs/break-mobile.png" alt="Short break on mobile" width="24%">
</p>

## Features

- **Focus, short break and long break** modes (25 / 5 / 15 min), each with its own color so you can tell where you are from across the room.
- **Auto-advances** through the cycle: focus → short break, and a long break after every fourth session.
- **Progress ring** that drains as time runs out, plus a live countdown in the browser tab title.
- **Chime** when a session ends, generated with the Web Audio API (no sound files).
- **Keyboard shortcuts:** Space to start/pause, R to reset, N to skip.
- Mobile layout, dark mode, visible focus states and reduced-motion support.

## Engineering notes

| Problem | Fix |
|---|---|
| Counting down with `setInterval(…, 1000)` drifts, and browsers throttle timers in background tabs, so the clock fell behind. | The timer stores an end timestamp and recomputes the remaining time on every tick, so it stays exact even when the tab is hidden. |
| The old version used `alert()` when time was up, which blocks the page. | A chime plus a color and status change signal the switch without interrupting. |

## Run locally

No build step:

```bash
git clone https://github.com/bezalelchris/Pomodoro-Timer.git
cd Pomodoro-Timer
open index.html        # or just double-click it
```

## Roadmap

- Custom session lengths
- Desktop notifications
- Task list attached to each focus session
