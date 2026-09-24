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

function getSetupPopupMarkup() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Popup ready</title>
        <style>
          :root {
            --bg: #f5f5f5;
            --panel: #ffffff;
            --panel-alt: #f8f8f8;
            --border: #e5e5e5;
            --text: #111111;
            --muted: #666666;
            --accent: #2f6fed;
          }

          * { box-sizing: border-box; }

          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
            font-family: "Quicksand", "Segoe UI", sans-serif;
            background: var(--bg);
            color: var(--text);
          }

          body {
            display: grid;
            place-items: center;
            padding: 40px;
          }

          .fullscreen-panel {
            width: min(90vw, 920px);
            min-height: min(70vh, 560px);
            display: grid;
            place-items: center;
            text-align: center;
            padding: 48px;
            border-radius: 28px;
            background: var(--panel);
            border: 1px solid var(--border);
            box-shadow: 0 18px 36px rgba(17, 17, 17, 0.08);
          }

          h1 {
            margin: 0 0 18px;
            font-size: clamp(2.4rem, 5vw, 5rem);
            line-height: 1.1;
            color: var(--accent);
          }

          p {
            margin: 0;
            font-size: clamp(1.15rem, 2vw, 2rem);
            line-height: 1.5;
            color: var(--text);
          }
        </style>
      </head>
      <body>
        <div class="fullscreen-panel">
          <div>
            <h1>Popup ready.</h1>
            <p>You can now close this window.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getBreakPopupMarkup() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Break time</title>
        <style>
          :root {
            --bg: #f5f5f5;
            --panel: #ffffff;
            --panel-alt: #f8f8f8;
            --border: #e5e5e5;
            --text: #111111;
            --muted: #666666;
            --accent: #2f6fed;
          }

          * { box-sizing: border-box; }

          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
            font-family: "Quicksand", "Segoe UI", sans-serif;
            background: var(--bg);
            color: var(--text);
          }

          body {
            display: grid;
            place-items: center;
            padding: 40px;
          }

          .fullscreen-panel {
            width: min(90vw, 920px);
            min-height: min(70vh, 560px);
            display: grid;
            place-items: center;
            text-align: center;
            padding: 48px;
            border-radius: 28px;
            background: var(--panel);
            border: 1px solid var(--border);
            box-shadow: 0 18px 36px rgba(17, 17, 17, 0.08);
          }

          .arduino-wrap {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .arduino-image {
            display: block;
            width: 140px;
            height: auto;
            border-radius: 16px;
            background: var(--panel-alt);
            border: 1px solid var(--border);
          }

          .speech-bubble {
            position: relative;
            background: var(--panel-alt);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 0.8rem 1rem;
            max-width: 290px;
            color: var(--text);
            font-size: clamp(1rem, 1.6vw, 1.5rem);
            line-height: 1.4;
          }

          .speech-bubble::after {
            content: "";
            position: absolute;
            left: -8px;
            bottom: 18px;
            width: 16px;
            height: 16px;
            background: var(--panel-alt);
            border-left: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            transform: rotate(45deg);
          }

          h1 {
            margin: 0 0 18px;
            font-size: clamp(2.4rem, 5vw, 5rem);
            line-height: 1.1;
            color: var(--accent);
          }

          p {
            margin: 0;
            font-size: clamp(1.15rem, 2vw, 2rem);
            line-height: 1.5;
            color: var(--text);
          }
        </style>
      </head>
      <body>
        <div class="fullscreen-panel">
          <div>
            <div class="arduino-wrap">
              <img class="arduino-image" src="process/screenshots/arduino!!.png" alt="Arduino board" />
              <div class="speech-bubble">Break time! Please step away for a moment.</div>
            </div>
            <h1>Break time!</h1>
            <p>Stand up, stretch, and take a short break.</p>
          </div>
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
    "fullscreen=yes,location=no,menubar=no,toolbar=no,status=no,resizable=yes,scrollbars=no"
  );

  if (!reminderPopup) {
    return false;
  }

  reminderPopup.document.write(getBreakPopupMarkup());
  reminderPopup.document.close();
  reminderPopup.focus();
  return true;
}

function openSetupPopup() {
  if (reminderPopup && !reminderPopup.closed) {
    reminderPopup.focus();
    return true;
  }

  reminderPopup = window.open(
    "",
    "focus-break-test",
    "fullscreen=yes,location=no,menubar=no,toolbar=no,status=no,resizable=yes,scrollbars=no"
  );

  if (!reminderPopup) {
    return false;
  }

  reminderPopup.document.write(getSetupPopupMarkup());
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
    openSetupPopup();
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
