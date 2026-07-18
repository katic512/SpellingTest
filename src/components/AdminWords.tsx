import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AdminWord,
  createAdminWord,
  deleteAdminWord,
  fetchAdminWords,
  updateAdminWord
} from '../utils/api'
import { useAuth } from '../auth/AuthContext'
import './AdminWords.css'

interface AdminWordsProps {
  onBack: () => void
}

export default function AdminWords({ onBack }: AdminWordsProps) {
  const { logout, user } = useAuth()
  const [words, setWords] = useState<AdminWord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [newWord, setNewWord] = useState('')
  const [newDefinition, setNewDefinition] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editWord, setEditWord] = useState('')
  const [editDefinition, setEditDefinition] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setWords(await fetchAdminWords())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return words
    return words.filter(
      w =>
        w.word.includes(q) ||
        (w.definition ?? '').toLowerCase().includes(q)
    )
  }, [words, search])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!newWord.trim()) return
    setSaving(true)
    setError(null)
    try {
      const created = await createAdminWord(newWord.trim(), newDefinition.trim() || undefined)
      setWords(prev => [...prev, created].sort((a, b) => a.word.localeCompare(b.word)))
      setNewWord('')
      setNewDefinition('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (row: AdminWord) => {
    setEditingId(row.id)
    setEditWord(row.word)
    setEditDefinition(row.definition ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditWord('')
    setEditDefinition('')
  }

  const saveEdit = async () => {
    if (editingId == null || !editWord.trim()) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateAdminWord(editingId, {
        word: editWord.trim(),
        definition: editDefinition.trim() || null
      })
      setWords(prev =>
        prev
          .map(w => (w.id === updated.id ? updated : w))
          .sort((a, b) => a.word.localeCompare(b.word))
      )
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update word')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: AdminWord) => {
    if (!window.confirm(`Delete “${row.word}”? This also removes user progress for that word.`)) {
      return
    }
    setSaving(true)
    setError(null)
    try {
      await deleteAdminWord(row.id)
      setWords(prev => prev.filter(w => w.id !== row.id))
      if (editingId === row.id) cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete word')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-words">
      <div className="admin-header">
        <div>
          <h1>Admin · Vocabulary</h1>
          <p className="admin-subtitle">
            Signed in as {user?.username} · {words.length} words
          </p>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-btn" onClick={onBack}>
            ← Practice
          </button>
          <button type="button" className="admin-btn admin-btn-muted" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form className="admin-add" onSubmit={handleAdd}>
        <h2>Add word</h2>
        <div className="admin-add-row">
          <input
            className="admin-input"
            placeholder="Spelling"
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            disabled={saving}
            required
          />
          <input
            className="admin-input admin-input-wide"
            placeholder="Meaning (optional — fetched from API if blank)"
            value={newDefinition}
            onChange={e => setNewDefinition(e.target.value)}
            disabled={saving}
          />
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            Add
          </button>
        </div>
      </form>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          placeholder="Search words or meanings…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="button" className="admin-btn admin-btn-muted" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading vocabulary…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  {editingId === row.id ? (
                    <>
                      <td>
                        <input
                          className="admin-input"
                          value={editWord}
                          onChange={e => setEditWord(e.target.value)}
                          disabled={saving}
                        />
                      </td>
                      <td>
                        <textarea
                          className="admin-textarea"
                          value={editDefinition}
                          onChange={e => setEditDefinition(e.target.value)}
                          disabled={saving}
                          rows={2}
                        />
                      </td>
                      <td className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary"
                          onClick={saveEdit}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-muted"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="admin-word-cell">{row.word}</td>
                      <td className="admin-def-cell">
                        {row.definition || <span className="admin-missing">No meaning yet</span>}
                      </td>
                      <td className="admin-actions">
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => startEdit(row)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDelete(row)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="admin-empty">
                    No matching words
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
