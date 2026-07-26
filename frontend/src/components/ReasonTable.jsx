import { useState, useEffect } from "react";
import { fetchCustomHabits, fetchAllReasons } from "../api";

export default function ReasonTable() {
  const [reasons, setReasons] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCustomHabits(), fetchAllReasons()]).then(([h, r]) => {
      setHabits(h);
      setReasons(r);
      setLoading(false);
    });
  }, []);

  const habitMap = {};
  habits.forEach((h) => { habitMap[h.key] = h; });

  if (loading) return <p className="table-empty">Loading...</p>;
  if (reasons.length === 0) return <p className="table-empty">No reasons recorded yet.</p>;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Habit</th>
            <th>Slot</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {reasons.map((r, i) => {
            const habit = habitMap[r.habit_key];
            return (
              <tr key={i}>
                <td className="td-date">{r.date}</td>
                <td>
                  <span className="td-habit-tag" style={{ background: (habit?.color || "#888") + "22", color: habit?.color || "#888" }}>
                    {habit?.label || r.habit_key}
                  </span>
                </td>
                <td className="td-slot">#{r.slot_index + 1}</td>
                <td className="td-reason">{r.reason || <span className="td-empty">No reason</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
