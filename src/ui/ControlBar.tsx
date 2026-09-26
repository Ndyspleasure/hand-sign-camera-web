export interface ControlBarProps {
  recording: boolean
  onToggleRecord: () => void
  onOpenTutorial: () => void
  onOpenGuide: () => void
}

/**
 * Bottom control bar: a prominent circular record button flanked by the
 * Tutorial and Guide actions. Touch-friendly and kept clear of the hand area.
 */
export default function ControlBar({
  recording,
  onToggleRecord,
  onOpenTutorial,
  onOpenGuide,
}: ControlBarProps) {
  return (
    <div className="control-bar">
      <button className="cb-secondary" onClick={onOpenTutorial} aria-label="Open tutorial">
        <span className="cb-ico" aria-hidden="true">🎓</span>
        <span className="cb-txt">Tutorial</span>
      </button>

      <button
        className={`cb-record${recording ? ' is-recording' : ''}`}
        onClick={onToggleRecord}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
        aria-pressed={recording}
      >
        <span className="cb-record-inner" aria-hidden="true" />
      </button>

      <button className="cb-secondary" onClick={onOpenGuide} aria-label="Open gesture guide">
        <span className="cb-ico" aria-hidden="true">📖</span>
        <span className="cb-txt">Guide</span>
      </button>
    </div>
  )
}
