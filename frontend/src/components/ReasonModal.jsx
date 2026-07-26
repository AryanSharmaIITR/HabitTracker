import { useState, useEffect, useRef } from "react";

export default function ReasonModal({ open, habitLabel, onClose, onSubmit }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      setText("");
      setTimeout(() => ref.current?.focus(), 80);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="reason-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>&times;</button>
        <p className="eyebrow">MISSED</p>
        <h2>{habitLabel}</h2>
        <p>Why did you skip this? (optional)</p>
        <textarea
          ref={ref}
          maxLength={500}
          placeholder="Type your reason here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(text);
            }
          }}
        />
        <div className="modal-actions">
          <button className="ghost-btn" onClick={() => onSubmit("")}>Skip</button>
          <button className="save-btn" onClick={() => onSubmit(text)}>Save reason</button>
        </div>
      </div>
    </div>
  );
}
