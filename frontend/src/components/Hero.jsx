export default function Hero({ completed, total, allDone }) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">DAILY EXECUTION SYSTEM</p>
        <h1>
          Habit Tracker<span>.</span>
        </h1>
        <p className="subhead">
          Show up for the plan. One focused block at a time.
        </p>
      </div>
      <div className="hero-progress">
        <div className="mini-ring">
          <span>{completed}</span>
        </div>
        <div>
          <strong>
            {allDone ? "All commitments complete." : "Let\u2019s make today count."}
          </strong>
          <small>
            {completed} of {total} scheduled habits complete
          </small>
        </div>
      </div>
    </section>
  );
}
