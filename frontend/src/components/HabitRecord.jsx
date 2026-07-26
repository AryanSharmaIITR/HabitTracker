import { useState, useEffect } from "react";
import { fetchCustomHabits, fetchAllCustomHabitData } from "../api";

export default function HabitRecord() {
  const [habits, setHabits] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCustomHabits(), fetchAllCustomHabitData()]).then(([h, d]) => {
      setHabits(h);
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="table-empty">Loading...</p>;
  if (habits.length === 0) return <p className="table-empty">No custom habits yet.</p>;

  const dates = Object.keys(data).sort().reverse();

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            {habits.map((h) => (
              <th key={h.key} style={{ color: h.color }}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.length === 0 && (
            <tr>
              <td colSpan={habits.length + 1} className="table-empty">No records yet.</td>
            </tr>
          )}
          {dates.map((dateStr) => (
            <tr key={dateStr}>
              <td className="td-date">{dateStr}</td>
              {habits.map((h) => {
                const habitData = data[dateStr]?.[h.key] || {};
                const slots = Object.entries(habitData);
                if (slots.length === 0) {
                  return <td key={h.key}><span className="td-empty">&mdash;</span></td>;
                }
                return (
                  <td key={h.key}>
                    <span className="td-symbols">
                      {slots.map(([idx, done]) => (
                        <span key={idx} className={`symbol ${done ? "tick" : "cross"}`}>
                          {done ? "\u2713" : "\u2717"}
                        </span>
                      ))}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
