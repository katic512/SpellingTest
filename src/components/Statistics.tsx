import { WordPerformance, normalizeWordKey } from '../utils/spellingEngine'
import '../styles/Statistics.css'

interface StatisticsProps {
  performance: WordPerformance[]
  currentWord: string
}

export default function Statistics({ performance, currentWord }: StatisticsProps) {
  const key = normalizeWordKey(currentWord)
  const currentPerf = key ? performance.find(p => p.word === key) : undefined

  const totalAttempts = performance.reduce((sum, p) => sum + p.successes + p.misses, 0)
  const totalSuccesses = performance.reduce((sum, p) => sum + p.successes, 0)
  const globalAccuracy = totalAttempts > 0 ? ((totalSuccesses / totalAttempts) * 100).toFixed(1) : 0

  const successes = currentPerf?.successes ?? 0
  const misses = currentPerf?.misses ?? 0
  const total = successes + misses
  const accuracy = total > 0 ? ((successes / total) * 100).toFixed(0) : 'N/A'

  return (
    <div className="statistics">
      <div className="stat-item">
        <div className="stat-label">This Word</div>
        <div className="stat-value">
          <span className="stat-success">✅ {successes}</span>
          <span className="stat-miss">❌ {misses}</span>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">Accuracy</div>
        <div className="stat-value large">{accuracy}%</div>
      </div>

      <div className="stat-item">
        <div className="stat-label">Overall</div>
        <div className="stat-value">
          <span className="stat-total">{totalAttempts} attempts</span>
          <span className="stat-rate">{globalAccuracy}% correct</span>
        </div>
      </div>
    </div>
  )
}
