import { useState, useEffect } from "react";
import { fetchAllHabits } from "../api";

const COLUMNS = [
  { key: "date",         label: "Date" },
  { key: "wakeUp",       label: "Wake Up" },
  { key: "gym",          label: "Gym" },
  { key: "gate",         label: "GATE" },
  { key: "aimlRevision", label: "AI/ML" },
  { key: "upSkill",      label: "Upskill" },
  { key: "codeForces",   label: "CodeForces" },
];

export default function HabitTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllHabits().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="table-empty">Loading habit records...</p>;
  }

  if (rows.length === 0) {
    return <p className="table-empty">No habit records found.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date}>
              {COLUMNS.map((col) => (
                <td key={col.key}>
                  {col.key === "date"
                    ? row.date
                    : row[col.key]
                      ? "\u2713"
                      : "\u2717"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
