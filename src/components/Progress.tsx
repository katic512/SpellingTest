import '../styles/Progress.css'

interface ProgressProps {
  current: number
  total: number
}

export default function Progress({ current, total }: ProgressProps) {
  const percentage = (current / total) * 100

  return (
    <div className="progress-container">
      <div className="progress-text">
        Word <span className="current">{current}</span> of <span className="total">{total}</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-percentage">{Math.round(percentage)}%</div>
    </div>
  )
}
