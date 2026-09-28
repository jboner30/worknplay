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
const breakPopupButton = document.getElementById('breakPopupButton');
const focusMinutesInput = document.getElementById('focusMinutes');
const breakMinutesInput = document.getElementById('breakMinutes');

let timerWindow = null;

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

function updateTimerWindow() {
  if (!timerWindow || timerWindow.closed) {
    return;
  }

  const windowBody = timerWindow.document.body;

  if (state.mode === 'focus') {
    windowBody.innerHTML = `
      <style>
        body {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          font-family: Arial, sans-serif;
          background: #f5f5f4;
          color: #111827;
          text-align: center;
        }
        .card {
          background: white;
          border-radius: 18px;
          box-shadow: 0 14px 30px rgba(17, 24, 39, 0.12);
          padding: 22px 20px;
          width: min(88vw, 280px);
        }
        .label {
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .time {
          font-size: 2.6rem;
          font-weight: 700;
          margin: 0;
        }
      </style>
      <div class="card">
        <div class="label">Focus</div>
        <p class="time">${formatTime(state.remainingSeconds)}</p>
      </div>
    `;
  } else {
    windowBody.innerHTML = `
      <style>
        body {
          margin: 0;
          min-height: 100vh;
          display: grid;
          place-items: center;
          font-family: Arial, sans-serif;
          background: #111827;
          color: white;
          text-align: center;
        }
        .card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 18px;
          box-shadow: 0 14px 30px rgba(0,0,0,0.25);
          padding: 26px 22px;
          width: min(88vw, 300px);
        }
        h1 {
          margin: 0;
          font-size: 2rem;
          line-height: 1.2;
        }
      </style>
      <div class="card">
        <h1>Take a break!</h1>
      </div>
    `;
  }
}

function openTimerWindow() {
  if (timerWindow && !timerWindow.closed) {
    timerWindow.focus();
    return;
  }

  timerWindow = window.open('about:blank', 'focusTimerWidget', 'width=320,height=220');
  if (timerWindow) {
    updateTimerWindow();
  }
}

function startTimer() {
  if (state.running) {
    return;
  }

  openTimerWindow();
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
    updateTimerWindow();
  }, 1000);
}

function pauseTimer() {
  state.running = false;
  clearTimer();
  startPauseButton.textContent = 'Resume';
  updateTimerWindow();
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
  updateTimerWindow();
  if (timerWindow && !timerWindow.closed) {
    timerWindow.close();
    timerWindow = null;
  }
}

function handleSessionComplete() {
  if (state.mode === 'focus') {
    state.mode = 'break';
    state.remainingSeconds = state.breakDuration * 60;
    updateDisplay();
    updateTimerWindow();
  } else {
    state.mode = 'focus';
    state.remainingSeconds = state.focusDuration * 60;
    updateDisplay();
    updateTimerWindow();
  }
}

resetButton.addEventListener('click', resetTimer);
startPauseButton.addEventListener('click', toggleTimer);
breakPopupButton.addEventListener('click', () => {
  openTimerWindow();
});
skipButton.addEventListener('click', () => {
  setMode(state.mode === 'focus' ? 'break' : 'focus');
  updateTimerWindow();
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
