const state = {
  mode: 'focus',
  focusDuration: 25,
  breakDuration: 5,
  remainingSeconds: 25 * 60,
  deadline: null,
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
const testSoundButton = document.getElementById('testSoundButton');
const stopSoundButton = document.getElementById('stopSoundButton');

let notificationPermissionRequested = false;
let audioContext = null;
let bellIntervalId = null;
let bellActive = false;
let bellGeneration = 0;
const bellOscillators = new Set();

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
  state.deadline = null;
  state.running = false;
  clearTimer();
  startPauseButton.textContent = 'Start';
  updateDisplay();
}

function prepareAudio() {
  if (!('AudioContext' in window)) {
    return;
  }

  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
}

async function playBell(generation) {
  if (!('AudioContext' in window)) {
    return;
  }

  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    if (!bellActive || generation !== bellGeneration) {
      return;
    }

    const startTime = audioContext.currentTime;
    [880, 1320].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const volume = audioContext.createGain();
      const peak = 0.2 / (index + 1);

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(0.0001, startTime);
      volume.gain.exponentialRampToValueAtTime(peak, startTime + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.1);
      oscillator.connect(volume);
      volume.connect(audioContext.destination);
      bellOscillators.add(oscillator);
      oscillator.addEventListener('ended', () => bellOscillators.delete(oscillator), { once: true });
      oscillator.start(startTime);
      oscillator.stop(startTime + 1.15);
    });
  } catch (error) {
    console.warn('Could not play the break bell', error);
  }
}

function startBell() {
  stopBell();
  bellActive = true;
  const generation = bellGeneration;
  stopSoundButton.hidden = false;
  playBell(generation);
  bellIntervalId = setInterval(() => {
    if (bellActive) {
      playBell(generation);
    }
  }, 1600);
}

function stopBell() {
  bellActive = false;
  bellGeneration += 1;
  clearInterval(bellIntervalId);
  bellIntervalId = null;
  bellOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch {}
  });
  bellOscillators.clear();
  stopSoundButton.hidden = true;
}

function requestNotificationPermissionIfNeeded() {
  if (notificationPermissionRequested || !('Notification' in window)) {
    return;
  }

  if (document.visibilityState === 'visible') {
    Notification.requestPermission().then((permission) => {
      notificationPermissionRequested = true;
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }).catch(() => {
      notificationPermissionRequested = true;
    });
  }
}

function notifyBreak() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Focus Timer', {
      body: 'Take a break!'
    });
  }

}

function startTimer() {
  if (state.running) {
    return;
  }

  prepareAudio();
  requestNotificationPermissionIfNeeded();
  state.running = true;
  state.deadline = Date.now() + state.remainingSeconds * 1000;
  startPauseButton.textContent = 'Pause';

  state.timerId = setInterval(() => {
    state.remainingSeconds = Math.ceil((state.deadline - Date.now()) / 1000);

    if (state.remainingSeconds <= 0) {
      clearTimer();
      state.running = false;
      state.deadline = null;
      state.remainingSeconds = 0;
      startPauseButton.textContent = 'Start';
      handleSessionComplete();
      return;
    }

    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  state.remainingSeconds = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
  state.deadline = null;
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
  state.deadline = null;
  startPauseButton.textContent = 'Start';
  state.remainingSeconds = state.mode === 'focus' ? state.focusDuration * 60 : state.breakDuration * 60;
  updateDisplay();
}

function handleSessionComplete() {
  if (state.mode === 'focus') {
    state.mode = 'break';
    state.remainingSeconds = state.breakDuration * 60;
    startBell();
    notifyBreak();
    updateDisplay();
  } else {
    state.mode = 'focus';
    state.remainingSeconds = state.focusDuration * 60;
    updateDisplay();
  }
}

resetButton.addEventListener('click', resetTimer);
startPauseButton.addEventListener('click', toggleTimer);
testSoundButton.addEventListener('click', startBell);
stopSoundButton.addEventListener('click', stopBell);
skipButton.addEventListener('click', () => {
  setMode(state.mode === 'focus' ? 'break' : 'focus');
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestNotificationPermissionIfNeeded();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestNotificationPermissionIfNeeded();
  }
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
