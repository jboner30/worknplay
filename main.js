const timerDisplay = document.getElementById("timerDisplay");
const minutesInput = document.getElementById("minutesInput");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const setTimerBtn = document.getElementById("setTimerBtn");
const enableReminderPopupBtn = document.getElementById("enableReminderPopupBtn");
const presetButtons = document.querySelectorAll(".preset-btn");

let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let timerId = null;
let isRunning = false;
let reminderPopup = null;

function getReminderPopupMarkup() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Break Time</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: linear-gradient(135deg, #0f172a, #1e3a8a);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          .panel {
            width: 320px;
            padding: 24px;
            border-radius: 18px;
            background: rgba(15, 23, 42, 0.8);
            box-shadow: 0 14px 32px rgba(0,0,0,0.3);
          }
          h1 {
            margin: 0 0 12px;
            font-size: 2rem;
          }
          p {
            margin: 0;
            line-height: 1.5;
            font-size: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="panel">
          <h1>Break time!</h1>
          <p>Stand up, stretch, and take a short break.</p>
        </div>
      </body>
    </html>
  `;
}

function openReminderPopup() {
  if (reminderPopup && !reminderPopup.closed) {
    reminderPopup.focus();
    return true;
  }

  reminderPopup = window.open(
    "",
    "focus-break-reminder",
    "width=380,height=220,resizable=no,scrollbars=no"
  );

  if (!reminderPopup) {
    return false;
  }

  reminderPopup.document.write(getReminderPopupMarkup());
  reminderPopup.document.close();
  reminderPopup.focus();
  return true;
}

function formatTime(totalSecondsValue) {
  const minutes = Math.floor(totalSecondsValue / 60);
  const seconds = totalSecondsValue % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function setActivePreset(selectedMinutes) {
  presetButtons.forEach((button) => {
    const isActive = Number(button.dataset.minutes) === selectedMinutes;
    button.classList.toggle("active", isActive);
  });
}

function applyTimerMinutes(minutes) {
  const safeMinutes = Math.max(1, Math.min(120, Number(minutes) || 25));
  totalSeconds = safeMinutes * 60;
  remainingSeconds = totalSeconds;
  minutesInput.value = String(safeMinutes);
  setActivePreset(safeMinutes);
  updateDisplay();
}

function toggleTimer() {
  if (isRunning) {
    stopTimer();
    isRunning = false;
    startPauseBtn.textContent = "Resume";
    return;
  }

  isRunning = true;
  startPauseBtn.textContent = "Pause";

  timerId = setInterval(() => {
    remainingSeconds -= 1;

    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      updateDisplay();
      stopTimer();
      isRunning = false;
      startPauseBtn.textContent = "Start";
      showBreakReminder();
      return;
    }

    updateDisplay();
  }, 1000);
}

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => permission === "granted");
  }

  return Notification.permission === "granted";
}

function showBreakReminder() {
  if (document.hidden || !document.hasFocus()) {
    if (openReminderPopup()) {
      return;
    }
  }

  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification("Time is up!", {
      body: "Take a break and recharge.",
      tag: "focus-break-reminder",
    });

    if (notification) {
      return;
    }
  }

  window.alert("Time is up! Take a break and recharge.");
}

function resetTimer() {
  stopTimer();
  isRunning = false;
  remainingSeconds = totalSeconds;
  startPauseBtn.textContent = "Start";
  updateDisplay();
}

startPauseBtn.addEventListener("click", () => {
  if (!isRunning) {
    requestNotificationPermission();
  }
  toggleTimer();
});

if (enableReminderPopupBtn) {
  enableReminderPopupBtn.addEventListener("click", () => {
    openReminderPopup();
    enableReminderPopupBtn.textContent = "Popup ready";
  });
}

resetBtn.addEventListener("click", resetTimer);

setTimerBtn.addEventListener("click", () => {
  applyTimerMinutes(minutesInput.value);
  resetTimer();
});

minutesInput.addEventListener("change", () => {
  applyTimerMinutes(minutesInput.value);
  resetTimer();
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedMinutes = Number(button.dataset.minutes);
    applyTimerMinutes(selectedMinutes);
    resetTimer();
  });
});

applyTimerMinutes(25);
updateDisplay();
