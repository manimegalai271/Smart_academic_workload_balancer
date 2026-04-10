# Implementation Plan: Countdown Timer Feature

## Information Gathered:

- **Current Structure**: StudySchedule.jsx displays topics in a list with checkboxes; StudyTimer.jsx is a modal Pomodoro timer
- **Subject Model**: Has topics array with `completed` boolean field
- **API Endpoints**: `/api/subjects/topic-complete` for marking topics complete
- **Tech Stack**: React.js with useState, useEffect hooks

## Plan:

### 1. Modify `frontend/src/components/StudySchedule.jsx`

- Add timer state management using useState for each topic
- Add useEffect to load/save timer state from localStorage
- Add helper function to format time as "10h 17m"
- Add inline timer display for each uncompleted topic
- Add Start/Stop/Complete buttons for each topic
- Add "Time's up!" message display
- Handle auto-start when clicking topic
- Update progress when topic is completed

### 2. Update `frontend/src/App.css`

- Add `.topic-timer-display` styles
- Add `.timer-btn` button styles (Start/Stop/Complete)
- Add `.times-up-message` styles
- Add `.timer-running` and `.timer-paused` states
- Style the timer in HH:MM format

### 3. Default Timer Duration

- Set default study time to 2 hours (7200 seconds) per topic
- This can be adjusted as needed

## Dependent Files:

- `frontend/src/components/StudySchedule.jsx` - Main component
- `frontend/src/App.css` - Styling

## Followup Steps:

1. Test timer countdown functionality
2. Test localStorage persistence (refresh page)
3. Test Start/Stop/Complete buttons
4. Verify progress bar updates
5. Test "Time's up" message display
