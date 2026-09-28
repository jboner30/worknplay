const state = {
  mode: 'focus',
  focusDuration: 25,
  breakDuration: 5,
  remainingSeconds: 25 * 60,
  timerId: null,
  running: false,
};

const timeDisplay = document.getElementById('timeDisplay');
const modeLabel = document.getElementById('modeLabel');
const startPauseButton = document.getElementById('startPauseButton');
const resetButton = document.getElementById('resetButton');
const skipButton = document.getElementById('skipButton');
const focusMinutesInput = document.getElementById('focusMinutes');
const breakMinutesInput = document.getElementById('breakMinutes');
const reminderBox = document.getElementById('reminder');
const dismissReminderButton = document.getElementById('dismissReminder');

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

function startTimer() {
  if (state.running) {
    return;
  }

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }

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
  reminderBox.classList.add('hidden');
}

function showReminder() {
  reminderBox.classList.remove('hidden');

  const title = 'Focus Timer';
  const message = 'Break time! Step away from your screen, stretch, and recharge.';

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: message });
  }

  if (window.alert) {
    window.alert(message);
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
    reminderBox.classList.add('hidden');
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Timer', { body: 'Break complete. Back to focus.' });
    }
  }

  updateDisplay();
}

startPauseButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
skipButton.addEventListener('click', () => {
  reminderBox.classList.add('hidden');
  setMode(state.mode === 'focus' ? 'break' : 'focus');
});
dismissReminderButton.addEventListener('click', () => {
  reminderBox.classList.add('hidden');
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
