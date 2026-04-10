import { useState, useEffect, useRef } from 'react';

function StudyTimer({ 
  isOpen, 
  onClose, 
  topicName, 
  topicIndex, 
  subjectId, 
  onSessionComplete,
  isTopicCompleted 
}) {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  
  const timerRef = useRef(null);

  const durations = [
    { value: 25, label: '25 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hour' }
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedDuration(25);
      setTimeLeft(25 * 60);
      setIsRunning(false);
      setIsCompleted(false);
      setSessionId(null);
      setError(null);
    }
  }, [isOpen, topicIndex]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (duration) => {
    if (!isRunning && !isCompleted) {
      setSelectedDuration(duration);
      setTimeLeft(duration * 60);
    }
  };

  const handleStart = async () => {
    try {
      // Create study session in backend
      const response = await fetch('/api/progress/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          topicName,
          topicIndex,
          duration: selectedDuration
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const session = await response.json();
      setSessionId(session._id);
      setIsRunning(true);
      setError(null);
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start session. Please try again.');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setIsCompleted(false);
    setSessionId(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    setIsCompleted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Complete the session in backend
    if (sessionId) {
      try {
        await fetch(`/api/progress/session/${sessionId}/complete`, {
          method: 'PATCH'
        });
        
        // Record study activity with minutes studied
        await fetch('/api/activity/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicsCompleted: 0,
            subjectName: subjectId,
            studyMinutes: selectedDuration
          })
        });
        
        onSessionComplete();
      } catch (err) {
        console.error('Error completing session:', err);
      }
    }
  };

  const handleMarkComplete = async () => {
    // Mark topic as completed directly
    try {
      await fetch('/api/subjects/topic-complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, topicIndex })
      });
      onSessionComplete();
      onClose();
    } catch (error) {
      console.error('Error marking topic complete:', error);
    }
  };

  if (!isOpen) return null;

  // Calculate progress percentage
  const totalSeconds = selectedDuration * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="timer-overlay" onClick={onClose}>
      <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="timer-close" onClick={onClose}>&times;</button>
        
        <div className="timer-header">
          <h3>⏱️ Study Focus Timer</h3>
        </div>
        
        <div className="timer-topic">
          <span className="timer-topic-label">Topic:</span>
          <span className="timer-topic-name">{topicName}</span>
        </div>

        {error && <div className="timer-error">{error}</div>}

        {!isRunning && !isCompleted && (
          <div className="timer-duration">
            <p>Select Duration:</p>
            <div className="duration-options">
              {durations.map((d) => (
                <button
                  key={d.value}
                  className={`duration-btn ${selectedDuration === d.value ? 'active' : ''}`}
                  onClick={() => handleDurationChange(d.value)}
                  disabled={isRunning}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="timer-display">
          <div className="timer-circle">
            <svg className="timer-progress" viewBox="0 0 100 100">
              <circle
                className="timer-progress-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className="timer-progress-fill"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progressPercent / 100)}`
                }}
              />
            </svg>
            <div className="timer-time">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {isCompleted ? (
          <div className="timer-completed">
            <div className="completed-message">
              🎉 Study session completed!
            </div>
            <p className="completed-text">
              Great job! You can now mark this topic as completed.
            </p>
            <div className="timer-buttons">
              <button 
                className="btn btn-success" 
                onClick={handleMarkComplete}
              >
                ✓ Mark as Completed
              </button>
              <button 
                className="btn btn-primary" 
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="timer-buttons">
            {!isRunning ? (
              sessionId ? (
                <button className="btn btn-primary" onClick={handleResume}>
                  ▶ Resume
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleStart}
                  disabled={isTopicCompleted}
                >
                  ▶ Start Timer
                </button>
              )
            ) : (
              <button className="btn btn-warning" onClick={handlePause}>
                ⏸ Pause
              </button>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={handleReset}
              disabled={isRunning}
            >
              ↺ Reset
            </button>
          </div>
        )}

        {isTopicCompleted && !isCompleted && (
          <div className="timer-already-completed">
            ✓ This topic is already completed
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyTimer;

