import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AIAssistant({ onSubjectCreated }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm your AI Study Assistant. How can I help you today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRobot, setShowRobot] = useState(true)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  const suggestions = [
    { icon: '📅', text: 'Create a study schedule' },
    { icon: '⚖️', text: 'Balance subjects for exams' },
    { icon: '📚', text: 'Break down difficult topics' },
    { icon: '📊', text: 'Track my study progress' }
  ]

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return

    const userMessage = text.trim()
    setInput('')
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }])
    setLoading(true)
    setShowRobot(false)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()

      setMessages((prev) => [...prev, { type: 'bot', text: data.message }])

      if (data.success && onSubjectCreated) {
        onSubjectCreated()
        setTimeout(() => {
          navigate('/schedule')
        }, 1500)
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: "Sorry, I couldn't process your request. Please make sure the backend server is running."
        }
      ])
    }

    setLoading(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="ai-assistant">
      {/* Floating Robot Button */}
      <div className="ai-floating-container">
        {!isOpen && (
          <div className="robot-floating" onClick={() => setIsOpen(true)}>
            <div className="robot-bubble">
              <span className="robot-bubble-text">Need help?</span>
            </div>
            <div className="robot-3d">
              <div className="robot-head-3d">
                <div className="robot-ear-3d left"></div>
                <div className="robot-ear-3d right"></div>
                <div className="robot-face-3d">
                  <div className="robot-eye-3d left">
                    <div className="robot-eye-shine"></div>
                  </div>
                  <div className="robot-eye-3d right">
                    <div className="robot-eye-shine"></div>
                  </div>
                  <div className="robot-mouth-3d"></div>
                </div>
                <div className="robot-antenna-3d">
                  <div className="antenna-ball"></div>
                </div>
              </div>
              <div className="robot-body-3d">
                <div className="robot-chest-3d">
                  <div className="chest-light"></div>
                </div>
                <div className="robot-arm-3d left"></div>
                <div className="robot-arm-3d right"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div className="ai-chat-container">
          {/* Robot Hovering Above */}
          <div className="robot-hover">
            <div className="robot-head-3d small">
              <div className="robot-ear-3d left"></div>
              <div className="robot-ear-3d right"></div>
              <div className="robot-face-3d">
                <div className="robot-eye-3d left">
                  <div className="robot-eye-shine"></div>
                </div>
                <div className="robot-eye-3d right">
                  <div className="robot-eye-shine"></div>
                </div>
                <div className="robot-mouth-3d"></div>
              </div>
              <div className="robot-antenna-3d">
                <div className="antenna-ball"></div>
              </div>
            </div>
            <div className="robot-body-3d small">
              <div className="robot-chest-3d">
                <div className="chest-light"></div>
              </div>
            </div>
          </div>

          <div className="ai-popup-modern">
            <div className="ai-header-modern">
              <div className="ai-header-content">
                <div className="ai-avatar">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div className="ai-header-text">
                  <h3>AI Study Assistant</h3>
                  <span className="ai-status">Online • Ready to help</span>
                </div>
              </div>
              <button className="ai-close-modern" onClick={() => setIsOpen(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="ai-messages-modern">
              {messages.map((msg, index) => (
                <div key={index} className={`ai-message-modern ${msg.type}`}>
                  {msg.type === 'bot' && (
                    <div className="message-avatar">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                  )}
                  <div className="message-content">
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ai-message-modern bot">
                  <div className="message-avatar">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <div className="message-content typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-suggestions-modern">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="ai-suggestion-modern"
                  onClick={() => handleSend(suggestion.text)}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <span className="suggestion-text">{suggestion.text}</span>
                </button>
              ))}
            </div>

            <div className="ai-input-modern">
              <button className="ai-mic-button">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                </svg>
              </button>
              <input
                type="text"
                className="ai-input-modern-field"
                placeholder="What do you want to study today?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="ai-send-modern" onClick={() => handleSend()}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAssistant

