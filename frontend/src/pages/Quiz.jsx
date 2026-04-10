import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function Quiz() {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const navigate = useNavigate()
  const location = useLocation()

  // Get subject data from navigation state
  const subjectData = location.state || {}
  const { subjectName = 'Quiz', topics = [], difficulty = 'medium', subjectId } = subjectData

  useEffect(() => {
    generateQuiz()
  }, [])

  const generateQuiz = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/generateQuiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName,
          topics,
          difficulty
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const data = await response.json()
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
      } else {
        // Generate default questions if none returned
        setQuestions([
          {
            question: 'What is the main purpose of studying this subject?',
            options: { A: 'To pass exams', B: 'To gain knowledge and skills', C: 'To get good grades', D: 'To complete assignments' },
            correctAnswer: 'B',
            explanation: 'The main purpose of education is to gain knowledge and develop skills.'
          },
          {
            question: 'How should you approach difficult topics?',
            options: { A: 'Avoid them', B: 'Ask for help and practice', C: 'Memorize answers', D: 'Skip to easy topics' },
            correctAnswer: 'B',
            explanation: 'Asking for help and practicing is the best way to understand difficult topics.'
          },
          {
            question: 'What is the best way to retain information?',
            options: { A: 'Read once', B: 'Active revision and practice', C: 'Highlight everything', D: 'Copy notes repeatedly' },
            correctAnswer: 'B',
            explanation: 'Active revision through practice and teaching others helps retain information better.'
          },
          {
            question: 'How does regular study help?',
            options: { A: 'It wastes time', B: 'It builds understanding gradually', C: 'It causes stress', D: 'It is not necessary' },
            correctAnswer: 'B',
            explanation: 'Regular study helps build a strong foundation and better understanding over time.'
          },
          {
            question: 'What is the key to academic success?',
            options: { A: 'Studying only before exams', B: 'Consistent effort and understanding', C: 'Copying others work', D: 'Memorizing without understanding' },
            correctAnswer: 'B',
            explanation: 'Consistent effort combined with true understanding leads to long-term success.'
          }
        ])
      }
    } catch (err) {
      setError('Failed to load quiz. Please try again.')
      console.error('Quiz generation error:', err)
    }
    setLoading(false)
  }

  const handleAnswerClick = (answerKey) => {
    setSelectedAnswer(answerKey)
    
    // Store the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerKey
    }))
  }

  const handleNextQuestion = () => {
    // Check if answer is correct
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1)
    }

    // Move to next question or show score
    const nextQuestion = currentQuestion + 1
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion)
      setSelectedAnswer(answers[nextQuestion] || null)
    } else {
      // Calculate final score (including last question if answered)
      let finalScore = score
      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        finalScore += 1
      }
      setScore(finalScore)
      setShowScore(true)
    }
  }

  const handlePreviousQuestion = () => {
    const prevQuestion = currentQuestion - 1
    if (prevQuestion >= 0) {
      setCurrentQuestion(prevQuestion)
      setSelectedAnswer(answers[prevQuestion] || null)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowScore(false)
    setAnswers({})
    generateQuiz()
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loading-spinner"></div>
        <h2>Generating Quiz...</h2>
        <p>Creating personalized questions for {subjectName}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={handleRetry}>
          Try Again
        </button>
        <button className="btn btn-secondary" onClick={handleGoBack} style={{ marginLeft: '10px' }}>
          Go Back
        </button>
      </div>
    )
  }

  if (showScore) {
    const percentage = Math.round((score / questions.length) * 100)
    let feedback = ''
    let emoji = ''
    
    if (percentage >= 80) {
      feedback = 'Excellent! You have a great understanding of the subject!'
      emoji = '🏆'
    } else if (percentage >= 60) {
      feedback = 'Good job! Keep practicing to improve further.'
      emoji = '👍'
    } else if (percentage >= 40) {
      feedback = 'Not bad! Review the topics you missed and try again.'
      emoji = '📚'
    } else {
      feedback = 'Keep studying! Review the topics and try again.'
      emoji = '💪'
    }

    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
          <h1>🎉 Quiz Complete!</h1>
          <div style={{ fontSize: '4rem', margin: '20px 0' }}>{emoji}</div>
          <h2>Your Score: {score} / {questions.length}</h2>
          <div className="progress-bar" style={{ margin: '20px 0', height: '30px' }}>
            <div 
              className="progress-fill" 
              style={{ 
                width: `${percentage}%`,
                backgroundColor: percentage >= 60 ? '#2ecc71' : '#e74c3c'
              }}
            ></div>
          </div>
          <p style={{ fontSize: '1.2rem' }}>{percentage}%</p>
          <p style={{ fontSize: '1.1rem', color: '#555', marginTop: '20px' }}>{feedback}</p>
          
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleRetry}>
              🔄 Try Again
            </button>
            <button className="btn btn-secondary" onClick={handleGoBack}>
              📅 Back to Schedule
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '700px', margin: '30px auto' }}>
        {/* Quiz Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid #eee'
        }}>
          <h2 style={{ margin: 0 }}>📝 {subjectName} Quiz</h2>
          <button 
            className="btn" 
            onClick={handleGoBack}
            style={{ padding: '8px 15px' }}
          >
            ✕ Exit
          </button>
        </div>

        {/* Progress Indicator */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
            {question.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(question.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleAnswerClick(key)}
              className={`quiz-option ${selectedAnswer === key ? 'selected' : ''}`}
              style={{
                padding: '15px 20px',
                border: `2px solid ${selectedAnswer === key ? '#3498db' : '#ddd'}`,
                borderRadius: '10px',
                backgroundColor: selectedAnswer === key ? '#e8f4fd' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <span style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                backgroundColor: selectedAnswer === key ? '#3498db' : '#f0f0f0',
                color: selectedAnswer === key ? '#fff' : '#555',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {key}
              </span>
              <span>{value}</span>
            </button>
          ))}
        </div>

        {/* Explanation (shown after answering) */}
        {selectedAnswer && question.explanation && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            borderLeft: '4px solid #3498db'
          }}>
            <strong>💡 Explanation:</strong>
            <p style={{ marginTop: '5px', color: '#555' }}>{question.explanation}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            style={{ opacity: currentQuestion === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            style={{ opacity: !selectedAnswer ? 0.5 : 1 }}
          >
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Quiz

