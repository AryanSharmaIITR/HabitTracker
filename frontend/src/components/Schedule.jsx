import { HABITS } from "../data";

export default function Schedule({ tasks, state, onToggle }) {
  return (
    <div className="schedule">
      {tasks.map(([time, name, key], i) => {
        const isChecked = key && state[key];
        const habit = key ? HABITS.find((h) => h.key === key) : null;
        return (
          <label
            key={i}
            className={`task ${isChecked ? "completed" : ""}`}
          >
            <span className="task-time">{time}</span>
            <input
              type="checkbox"
              className="check"
              checked={!!isChecked}
              onChange={() => key && onToggle(key, !isChecked)}
              readOnly={!key}
            />
            <span className="task-name">{name}</span>
            {habit && <span className="task-tag">{habit.label}</span>}
          </label>
        );
      })}
    </div>
  );
}
