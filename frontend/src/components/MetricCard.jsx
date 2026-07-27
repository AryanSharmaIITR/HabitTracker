export default function MetricCard({ habit, done, doneSlots, totalSlots, allTimeDone, allTimeTotal, onToggle }) {
  const fraction = allTimeTotal > 0 ? allTimeDone / allTimeTotal : 0;
  const accentDeg = fraction * 360;

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
          <strong>{allTimeDone}/{allTimeTotal}</strong>
          <small>ALL TIME</small>
        </div>
      </div>
      <p className="metric-label">{habit.label}</p>
      <p className="status">
        {done ? "COMPLETE TODAY" : totalSlots > 0 ? `${doneSlots}/${totalSlots} TODAY` : "NO SCHEDULE TODAY"}
      </p>
      <button
        aria-label={`Mark ${habit.label} complete`}
        onClick={() => onToggle(habit.key)}
      />
    </article>
  );
}
