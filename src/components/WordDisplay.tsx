import { useEffect } from 'react'
import '../styles/WordDisplay.css'

interface WordDisplayProps {
  word: string
}

export default function WordDisplay({ word }: WordDisplayProps) {
  const handleSpeak = () => {
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8 // Slower speech for clarity
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    } else {
      alert('Speech synthesis not supported in your browser')
    }
  }

  // Auto-play pronunciation when component mounts
  useEffect(() => {
    // Optionally auto-play: uncomment the line below
    // handleSpeak()
  }, [word])

  return (
    <div className="word-display">
      <p className="word-label">Listen to the word and spell it:</p>
      <div className="word-section">
        <button 
          className="btn-speaker"
          onClick={handleSpeak}
          title="Click to hear the word"
          aria-label="Speak word"
        >
          🔊
        </button>
        <span className="word-placeholder">[Word Hidden]</span>
      </div>
      <p className="hint">Click the speaker icon to hear the word</p>
    </div>
  )
}
