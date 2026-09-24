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
            --bg: #f4f4f4;
            --bubble: rgba(0, 0, 0, 0.08);
            --text: #111111;
            --button-text: #111111;
            --penguin-teal: #1f7d8f;
            --penguin-dark: #0d3d53;
            --penguin-yellow: #f6d63f;
            --penguin-red: #e74444;
          }

          * { box-sizing: border-box; }

          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
            background: var(--bg);
            font-family: "Quicksand", "Segoe UI", sans-serif;
            color: var(--text);
          }

          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 36px 44px 60px;
            overflow: hidden;
          }

          .top-row {
            width: 100%;
            max-width: 1500px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3vw;
            margin-top: 16px;
          }

          .penguin {
            position: relative;
            width: 260px;
            height: 230px;
            flex-shrink: 0;
          }

          .penguin-body {
            position: absolute;
            left: 26px;
            top: 50px;
            width: 190px;
            height: 150px;
            background: var(--penguin-teal);
            border: 5px solid var(--penguin-dark);
            border-radius: 50% 50% 46% 46%;
          }

          .penguin-head {
            position: absolute;
            left: 52px;
            top: 0;
            width: 138px;
            height: 116px;
            background: var(--penguin-teal);
            border: 5px solid var(--penguin-dark);
            border-radius: 50%;
          }

          .penguin-eye {
            position: absolute;
            width: 12px;
            height: 12px;
            background: var(--penguin-dark);
            border-radius: 50%;
            top: 52px;
          }

          .penguin-eye.left { left: 88px; }
          .penguin-eye.right { right: 80px; }

          .penguin-beak {
            position: absolute;
            left: 118px;
            top: 70px;
            width: 28px;
            height: 18px;
            background: var(--penguin-red);
            clip-path: polygon(0 0, 100% 50%, 0 100%);
            border-radius: 3px;
            transform: rotate(5deg);
          }

          .penguin-wing {
            position: absolute;
            left: 24px;
            top: 88px;
            width: 52px;
            height: 82px;
            background: rgba(0, 0, 0, 0.12);
            border-radius: 48% 48% 42% 42%;
            transform: rotate(-18deg);
          }

          .penguin-foot {
            position: absolute;
            width: 34px;
            height: 18px;
            background: var(--penguin-yellow);
            border: 4px solid var(--penguin-dark);
            border-radius: 18px;
            bottom: 8px;
          }

          .penguin-foot.left { left: 96px; }
          .penguin-foot.right { left: 138px; }

          .speech-bubble {
            width: min(70vw, 920px);
            min-height: 220px;
            background: var(--bubble);
            border-radius: 34px;
            padding: 22px 28px 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: left;
          }

          .speech-text {
            margin: 0;
            font-size: clamp(2.7rem, 4vw, 6rem);
            line-height: 1.04;
            letter-spacing: -0.08em;
            font-weight: 500;
            color: var(--text);
            white-space: normal;
          }

          .headline-wrap {
            width: 100%;
            max-width: 1540px;
            display: flex;
            justify-content: center;
            margin-top: 30px;
          }

          .headline {
            margin: 0;
            font-size: clamp(6rem, 10vw, 18rem);
            line-height: 0.82;
            letter-spacing: -0.08em;
            font-weight: 500;
            color: var(--text);
            text-align: center;
            white-space: nowrap;
          }

          .continue-wrap {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: 18px;
          }

          .continue-btn {
            appearance: none;
            border: none;
            border-radius: 20px;
            background: rgba(0, 0, 0, 0.08);
            color: var(--button-text);
            font-family: "Quicksand", "Segoe UI", sans-serif;
            font-size: clamp(2.2rem, 3vw, 5.5rem);
            line-height: 1;
            letter-spacing: -0.08em;
            min-width: min(60vw, 820px);
            min-height: 86px;
            padding: 18px 28px;
            cursor: pointer;
            box-shadow: none;
            transition: opacity 0.2s ease;
          }

          .continue-btn:disabled {
            opacity: 0.95;
            cursor: not-allowed;
          }

          .continue-btn:not(:disabled):hover {
            filter: brightness(0.98);
          }
        </style>
      </head>
      <body>
        <div class="top-row">
          <div class="penguin" aria-hidden="true">
            <div class="penguin-head"></div>
            <div class="penguin-eye left"></div>
            <div class="penguin-eye right"></div>
            <div class="penguin-beak"></div>
            <div class="penguin-body"></div>
            <div class="penguin-wing"></div>
            <div class="penguin-foot left"></div>
            <div class="penguin-foot right"></div>
          </div>

          <div class="speech-bubble">
            <p class="speech-text">Stop.<br />Are you doing okay?<br />Why don't you take a break?</p>
          </div>
        </div>

        <div class="headline-wrap">
          <h1 class="headline">Take a deep breath.</h1>
        </div>

        <div class="continue-wrap">
          <button id="continueBtn" class="continue-btn" type="button" disabled>Continue (30)</button>
        </div>

        <script>
          let remaining = 30;
          const continueBtn = document.getElementById('continueBtn');
          const timer = setInterval(() => {
            remaining -= 1;

            if (remaining <= 0) {
              clearInterval(timer);
              continueBtn.disabled = false;
              continueBtn.textContent = 'Continue';
              return;
            }

            continueBtn.textContent = 'Continue (' + remaining + ')';
          }, 1000);

          continueBtn.addEventListener('click', () => {
            if (continueBtn.disabled) return;
            if (window.opener && !window.opener.closed) {
              window.opener.focus();
            }
            window.close();
          });

          window.addEventListener('beforeunload', (event) => {
            if (continueBtn.disabled) {
              event.preventDefault();
              event.returnValue = '';
              return '';
            }
          });
        </script>
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
