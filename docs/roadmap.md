# Roadmap

## Goal
Build a lightweight browser app where the user can set a focus timer, work through the session, and receive a reminder to take a break when the timer ends.

## Core Features

### 1. Focus timer setup
- Allow the user to choose a focus duration in minutes.
- Provide a quick preset options such as 25, 45, and 60 minutes.
- Show a live countdown display in a clear, readable format.
- Include start, pause, reset, and resume controls.

### 2. Break reminder flow
- When the focus timer reaches zero, trigger a visible notification or alert.
- Show a break prompt that tells the user it is time to take a break.
- Offer a button to start a break timer or dismiss the reminder.
- Keep the app responsive and easy to use while the timer is running.

### 3. Break timer support
- Let the user set a break duration, such as 5 or 15 minutes.
- Display the break countdown separately from the focus timer.
- Automatically transition back to a focus session after the break ends.

### 4. User experience improvements
- Add a minimal visual theme with a clean timer layout.
- Use a browser notification if the tab is not in focus.
- Include a sound or vibration cue when the timer ends.
- Make the app mobile-friendly and easy to operate with keyboard or mouse.

## Suggested App Structure

### Frontend
- HTML for the app shell and controls
- CSS for layout, timer styling, and responsive design
- JavaScript for timer logic, state transitions, and notification behavior

### State Model
- current mode: focus or break
- selected duration
- remaining time
- running status
- notification status

## Milestones

### Phase 1: Basic timer
- Build a single focus timer with start, pause, and reset
- Display countdown values accurately
- Confirm the timer ends and updates state correctly

### Phase 2: Break loop
- Add configurable break timer
- Trigger a reminder when focus time ends
- Allow the user to begin a break or return to focus

### Phase 3: UI polish
- Improve styling and readability
- Add presets and accessibility-friendly controls
- Add sound and browser notifications

### Phase 4: Optional enhancements
- Track completed focus sessions over time
- Add a daily goals view
- Support custom timer settings and persistent preferences

## Success Criteria
The app should feel simple and reliable: the user can set a focus duration, start the timer, and clearly understand when to stop working and take a break.

## Notes
This project is ideal for a small browser app with a single-page interface and straightforward timer logic. It can be expanded later with session history, customization, and notification improvements.
