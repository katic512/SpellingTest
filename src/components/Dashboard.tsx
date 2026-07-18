import { useMemo, useState } from 'react'
import { WordPerformance, getOverallStats, isMasteredWord, normalizeWordKey } from '../utils/spellingEngine'
import '../styles/Dashboard.css'

type SortKey = 'word' | 'successes' | 'misses' | 'total' | 'status'

interface DashboardProps {
  words: string[]
  performance: WordPerformance[]
  sessionAttempts: number
  sessionSuccesses: number
  sessionMisses: number
  onReset: () => void
  onExport: () => void
}

interface WordRow {
  display: string
  successes: number
  misses: number
  mastered: boolean
  total: number
  status: string
  statusTone: 'new' | 'mastered' | 'needs' | 'progress'
}

function buildRow(display: string, p: WordPerformance | undefined): WordRow {
  const successes = p?.successes ?? 0
  const misses = p?.misses ?? 0
  const total = successes + misses
  const mastered = p ? isMasteredWord(p) : false
  let status: string
  let statusTone: WordRow['statusTone']
  if (total === 0) {
    status = 'New'
    statusTone = 'new'
  } else if (mastered) {
    status = 'Mastered'
    statusTone = 'mastered'
  } else if (misses > 0) {
    status = 'Needs work'
    statusTone = 'needs'
  } else {
    status = 'In progress'
    statusTone = 'progress'
  }
  return { display, successes, misses, mastered, total, status, statusTone }
}

export default function Dashboard({
  words,
  performance,
  sessionAttempts,
  sessionSuccesses,
  sessionMisses,
  onReset,
  onExport
}: DashboardProps) {
  const stats = getOverallStats(performance)
  const sessionAccuracy =
    sessionAttempts > 0 ? ((sessionSuccesses / sessionAttempts) * 100).toFixed(1) : '0.0'
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('word')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const perfByKey = useMemo(
    () =>
      new Map(
        performance.map(p => {
          const k = normalizeWordKey(p.word)
          return [k, { ...p, word: k }] as const
        })
      ),
    [performance]
  )

  const baseRows: WordRow[] = useMemo(
    () => words.map(w => buildRow(w, perfByKey.get(normalizeWordKey(w)))),
    [words, perfByKey]
  )

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = q
      ? baseRows.filter(row => {
          const blob = [
            row.display,
            String(row.successes),
            String(row.misses),
            String(row.total),
            row.status
          ]
            .join(' ')
            .toLowerCase()
          return blob.includes(q)
        })
      : [...baseRows]

    const dir = sortDir === 'asc' ? 1 : -1
    rows.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'word':
          cmp = a.display.localeCompare(b.display, undefined, { sensitivity: 'base' })
          break
        case 'successes':
          cmp = a.successes - b.successes
          break
        case 'misses':
          cmp = a.misses - b.misses
          break
        case 'total':
          cmp = a.total - b.total
          break
        case 'status':
          cmp = a.status.localeCompare(b.status, undefined, { sensitivity: 'base' })
          break
        default:
          break
      }
      return cmp * dir
    })
    return rows
  }, [baseRows, search, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Your Progress Dashboard</h2>
        <div className="dashboard-actions">
          <button type="button" className="btn-secondary" onClick={onExport}>
            📥 Export
          </button>
          <button type="button" className="btn-danger" onClick={onReset}>
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card session-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-title">This Session</div>
          <div className="stat-big">{sessionAttempts}</div>
          <div className="stat-subtitle">
            {sessionSuccesses} correct · {sessionMisses} miss · {sessionAccuracy}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-title">Accuracy</div>
          <div className="stat-big">{stats.accuracy}%</div>
          <div className="stat-subtitle">{stats.totalSuccesses}/{stats.totalAttempts} correct</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-title">Mastered</div>
          <div className="stat-big">{stats.masteredWords}</div>
          <div className="stat-subtitle">5+ correct streak (miss resets streak)</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-title">New Words</div>
          <div className="stat-big">{stats.newWords}</div>
          <div className="stat-subtitle">Not attempted yet</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-title">In Progress</div>
          <div className="stat-big">{stats.wordsInProgress}</div>
          <div className="stat-subtitle">Being practiced</div>
        </div>
      </div>

      <div className="progress-visualization">
        <div className="progress-item">
          <div className="progress-label">✅ Successes: {stats.totalSuccesses}</div>
          <div className="progress-bar">
            <div
              className="progress-fill success"
              style={{
                width: `${stats.totalAttempts > 0 ? (stats.totalSuccesses / stats.totalAttempts) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-label">❌ Misses: {stats.totalMisses}</div>
          <div className="progress-bar">
            <div
              className="progress-fill miss"
              style={{
                width: `${stats.totalAttempts > 0 ? (stats.totalMisses / stats.totalAttempts) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      <section className="dashboard-word-section" aria-label="Per-word progress">
        <div className="dashboard-word-toolbar">
          <div>
            <h3 className="dashboard-word-heading">Words</h3>
            <p className="dashboard-word-hint">
              Showing {filteredSorted.length} of {baseRows.length} — click a column header to sort. Search matches
              word, counts, or status.
            </p>
          </div>
          <label className="dashboard-search-label">
            <span className="visually-hidden">Search words table</span>
            <input
              type="search"
              className="dashboard-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search (e.g. ability, 2, needs)…"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-word-table">
            <thead>
              <tr>
                <th scope="col">
                  <button type="button" className="sort-header-btn" onClick={() => toggleSort('word')}>
                    Word{sortIndicator('word')}
                  </button>
                </th>
                <th scope="col" className="num">
                  <button type="button" className="sort-header-btn" onClick={() => toggleSort('successes')}>
                    Successes{sortIndicator('successes')}
                  </button>
                </th>
                <th scope="col" className="num">
                  <button type="button" className="sort-header-btn" onClick={() => toggleSort('misses')}>
                    Misses{sortIndicator('misses')}
                  </button>
                </th>
                <th scope="col" className="num">
                  <button type="button" className="sort-header-btn" onClick={() => toggleSort('total')}>
                    Total{sortIndicator('total')}
                  </button>
                </th>
                <th scope="col">
                  <button type="button" className="sort-header-btn" onClick={() => toggleSort('status')}>
                    Status{sortIndicator('status')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((row, index) => (
                <tr key={`${row.display}-${index}`}>
                  <td className="word-cell">{row.display}</td>
                  <td className="num">{row.successes}</td>
                  <td className="num">{row.misses}</td>
                  <td className="num">{row.total}</td>
                  <td>
                    <span className={`word-status word-status--${row.statusTone}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
