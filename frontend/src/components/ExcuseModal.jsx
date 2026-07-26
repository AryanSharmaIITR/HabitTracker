import { useRef, useEffect } from "react";

export default function ExcuseModal({
  open,
  missedLabel,
  onClose,
  onSubmit,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(textareaRef.current.value);
    textareaRef.current.value = "";
  }

  return (
    <div className={`modal-backdrop ${open ? "open" : ""}`} aria-hidden={!open}>
      <form className="excuse-modal" onSubmit={handleSubmit}>
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
        <p className="eyebrow">CHECK-IN REQUIRED</p>
        <h2>What got in the way?</h2>
        <p>
          You marked <strong>{missedLabel || "this habit"}</strong> as missed.
          A brief, honest note helps you spot the pattern.
        </p>
        <textarea
          ref={textareaRef}
          maxLength={50}
          placeholder="e.g. Slept late after finishing a project..."
          required
        />
        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            Skip for now
          </button>
          <button className="save-btn" type="submit">
            Save note
          </button>
        </div>
      </form>
    </div>
  );
}
