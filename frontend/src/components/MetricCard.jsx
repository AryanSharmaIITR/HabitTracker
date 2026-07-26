export default function MetricCard({ habit, done, doneSlots, totalSlots, onToggle }) {
  const fraction = totalSlots > 0 ? doneSlots / totalSlots : 0;
  const accentDeg = fraction * 360;
  const redDeg = (1 - fraction) * 360;

  return (
    <article
      className={`metric ${done ? "done" : ""}`}
      style={{ "--accent": habit.color }}
    >
      <div
        className="ring"
        style={{
          background: `conic-gradient(${habit.color} ${accentDeg}deg, #e53e3e ${accentDeg}deg ${360}deg)`,
        }}
      >
        <div className="ring-inner">
          <strong>{doneSlots}/{totalSlots}</strong>
          <small>DONE</small>
        </div>
      </div>
      <p className="metric-label">{habit.label}</p>
      <p className="status">{done ? "COMPLETE" : "TAP TO CHECK IN"}</p>
      <button
        aria-label={`Mark ${habit.label} complete`}
        onClick={() => onToggle(habit.key)}
      />
    </article>
  );
}
