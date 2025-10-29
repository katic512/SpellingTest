import '../styles/DefinitionDisplay.css'

interface DefinitionDisplayProps {
  definition: string | null
  loading: boolean
}

export default function DefinitionDisplay({ definition, loading }: DefinitionDisplayProps) {
  return (
    <div className="definition-display">
      <p className="definition-label">📖 Word Meaning:</p>
      {loading ? (
        <div className="definition-loading">Loading...</div>
      ) : (
        <p className="definition-text">{definition || 'Definition not available'}</p>
      )}
    </div>
  )
}
