const state = {
  mode: 'focus',
  focusDuration: 25,
  breakDuration: 5,
  remainingSeconds: 25 * 60,
  timerId: null,
  running: false,
};

const app = document.getElementById('app');
const timeDisplay = document.getElementById('timeDisplay');
const modeLabel = document.getElementById('modeLabel');
const startPauseButton = document.getElementById('startPauseButton');
const resetButton = document.getElementById('resetButton');
const skipButton = document.getElementById('skipButton');
const focusMinutesInput = document.getElementById('focusMinutes');
const breakMinutesInput = document.getElementById('breakMinutes');

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(state.remainingSeconds);

  if (state.mode === 'focus') {
    modeLabel.textContent = 'Focus Session';
  } else {
    modeLabel.textContent = 'Break Time';
  }
}

function applyDurationValues() {
  const focusMinutes = Math.max(1, Number(focusMinutesInput.value) || state.focusDuration);
  const breakMinutes = Math.max(1, Number(breakMinutesInput.value) || state.breakDuration);

  state.focusDuration = focusMinutes;
  state.breakDuration = breakMinutes;

  if (state.mode === 'focus') {
    state.remainingSeconds = state.focusDuration * 60;
  } else {
    state.remainingSeconds = state.breakDuration * 60;
  }

  updateDisplay();
}

function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function setMode(mode) {
  state.mode = mode;
  state.remainingSeconds =
    mode === 'focus' ? state.focusDuration * 60 : state.breakDuration * 60;
  state.running = false;
  clearTimer();
  startPauseButton.textContent = 'Start';
  updateDisplay();
}

function activateWidgetMode() {
  app.classList.add('widget-mode');
}

function startTimer() {
  if (state.running) {
    return;
  }

  activateWidgetMode();
  state.running = true;
  startPauseButton.textContent = 'Pause';

  state.timerId = setInterval(() => {
    state.remainingSeconds -= 1;

    if (state.remainingSeconds <= 0) {
      clearTimer();
      state.running = false;
      startPauseButton.textContent = 'Start';
      handleSessionComplete();
      return;
    }

    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  state.running = false;
  clearTimer();
  startPauseButton.textContent = 'Resume';
}

function toggleTimer() {
  if (state.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function resetTimer() {
  clearTimer();
  state.running = false;
  startPauseButton.textContent = 'Start';
  state.remainingSeconds = state.mode === 'focus' ? state.focusDuration * 60 : state.breakDuration * 60;
  updateDisplay();
  if (reminderWindow && !reminderWindow.closed) {
    reminderWindow.close();
    reminderWindow = null;
  }
}

let reminderWindow = null;

function showReminder() {
  if (reminderWindow && !reminderWindow.closed) {
    reminderWindow.focus();
    return;
  }

  reminderWindow = window.open('about:blank', 'focusTimerBreak', 'width=420,height=260');

  if (reminderWindow) {
    reminderWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Break time</title>
          <style>
            body {
              margin: 0;
              display: grid;
              place-items: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
              background: #f5f5f4;
              color: #111827;
              text-align: center;
            }
            .card {
              width: min(88%, 320px);
              background: white;
              border-radius: 18px;
              box-shadow: 0 16px 32px rgba(17, 24, 39, 0.12);
              padding: 28px 22px;
            }
            h1 {
              margin: 0 0 12px;
              font-size: 2rem;
            }
            p {
              margin: 0;
              line-height: 1.5;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Break time</h1>
            <p>Step away from your screen, stretch, and recharge for a few minutes.</p>
          </div>
        </body>
      </html>
    `);
    reminderWindow.document.close();
  }
}

function handleSessionComplete() {
  if (state.mode === 'focus') {
    state.mode = 'break';
    state.remainingSeconds = state.breakDuration * 60;
    showReminder();
  } else {
    state.mode = 'focus';
    state.remainingSeconds = state.focusDuration * 60;
    if (reminderWindow && !reminderWindow.closed) {
      reminderWindow.close();
      reminderWindow = null;
    }
  }

  updateDisplay();
}

resetButton.addEventListener('click', resetTimer);
startPauseButton.addEventListener('click', toggleTimer);
skipButton.addEventListener('click', () => {
  if (reminderWindow && !reminderWindow.closed) {
    reminderWindow.close();
    reminderWindow = null;
  }
  setMode(state.mode === 'focus' ? 'break' : 'focus');
});

focusMinutesInput.addEventListener('change', () => {
  applyDurationValues();
  if (!state.running) {
    updateDisplay();
  }
});

breakMinutesInput.addEventListener('change', () => {
  applyDurationValues();
  if (!state.running) {
    updateDisplay();
  }
});

applyDurationValues();
updateDisplay();
