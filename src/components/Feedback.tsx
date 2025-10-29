import { FeedbackState } from './SpellingTest'
import '../styles/Feedback.css'

interface FeedbackProps {
  feedback: FeedbackState
}

export default function Feedback({ feedback }: FeedbackProps) {
  return (
    <div className={`feedback feedback-${feedback.type}`}>
      <p className="feedback-message">{feedback.message}</p>
      {feedback.type === 'incorrect' && feedback.correctSpelling && (
        <p className="correct-spelling-display">
          ✏️ Correct spelling: <strong>{feedback.correctSpelling}</strong>
        </p>
      )}
      {feedback.type === 'correct' && (
        <p className="celebration-text">🎉 Great job! Keep it up!</p>
      )}
    </div>
  )
}
