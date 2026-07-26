import { useState, useEffect } from "react";
import { fetchAllExcuses } from "../api";

const COLUMNS = [
  { key: "date",                label: "Date" },
  { key: "reasonOfWakeUp",      label: "Wake Up" },
  { key: "reasonOfGym",         label: "Gym" },
  { key: "reasonOfGate",        label: "GATE" },
  { key: "reasonOfAimlRevision", label: "AI/ML" },
  { key: "reasonOfUpSkill",     label: "Upskill" },
  { key: "reasonOfCodeForces",  label: "CodeForces" },
];

export default function ExcuseTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllExcuses().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="table-empty">Loading excuse records...</p>;
  }

  if (rows.length === 0) {
    return <p className="table-empty">No excuse records found.</p>;
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
                  {row[col.key] || "\u2014"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
