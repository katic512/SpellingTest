import '../styles/SpellingInput.css'

interface SpellingInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement>
  disabled: boolean
}

export default function SpellingInput({
  value,
  onChange,
  onKeyDown,
  inputRef,
  disabled
}: SpellingInputProps) {
  return (
    <div className="spelling-input-wrapper">
      <label htmlFor="spelling-input" className="input-label">
        Type the word here:
      </label>
      <input
        ref={inputRef}
        id="spelling-input"
        type="text"
        className="spelling-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your answer..."
        disabled={disabled}
        autoFocus
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  )
}
