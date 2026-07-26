export default function FocusCard({ time, task, text }) {
  return (
    <section className="focus-card">
      <p className="eyebrow">FOCUS WINDOW</p>
      <div className="focus-time">{time}</div>
      <h3>{task}</h3>
      <p>{text}</p>
      <div className="focus-rule" />
      <small>ONE BLOCK. FULL ATTENTION.</small>
    </section>
  );
}
