import { useState, useEffect } from "react";
import {
  fetchCustomHabits,
  createCustomHabit,
  updateCustomHabit,
  deleteCustomHabit,
} from "../api";

const PALETTE = [
  "#ffad27", "#4fd1b3", "#cbf54b", "#8ca8ff",
  "#e58aff", "#f37a82", "#ff6b6b", "#51cf66",
  "#339af0", "#fcc419", "#ff922b", "#20c997",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function emptySchedule() {
  return DAYS.map((d) => ({ day_of_week: d, slots: [] }));
}

function scheduleFromApi(apiSchedule) {
  const map = {};
  apiSchedule.forEach((s) => {
    if (!map[s.day_of_week]) map[s.day_of_week] = [];
    map[s.day_of_week].push({ start_time: s.start_time, end_time: s.end_time });
  });
  return DAYS.map((d) => ({
    day_of_week: d,
    slots: map[d] || [],
  }));
}

function scheduleToApi(schedule) {
  const result = [];
  schedule.forEach((day) => {
    day.slots.forEach((slot) => {
      result.push({ day_of_week: day.day_of_week, start_time: slot.start_time, end_time: slot.end_time });
    });
  });
  return result;
}

function DayScheduleBuilder({ day, dayState, onChange }) {
  const addSlot = () => {
    onChange({ ...dayState, slots: [...dayState.slots, { start_time: "09:00", end_time: "10:00" }] });
  };

  const removeSlot = (idx) => {
    onChange({ ...dayState, slots: dayState.slots.filter((_, i) => i !== idx) });
  };

  const updateSlot = (idx, field, value) => {
    const slots = dayState.slots.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    onChange({ ...dayState, slots });
  };

  return (
    <div className={`schedule-row ${dayState.slots.length > 0 ? "active" : ""}`}>
      <span className="schedule-day-label">{day.slice(0, 3)}</span>
      <div className="schedule-slots">
        {dayState.slots.length === 0 ? (
          <span className="holiday-label">No slot</span>
        ) : (
          dayState.slots.map((slot, idx) => (
            <div key={idx} className="slot-entry">
              <div className="schedule-times">
                <input
                  type="time"
                  className="time-input"
                  value={slot.start_time}
                  onChange={(e) => updateSlot(idx, "start_time", e.target.value)}
                />
                <span className="time-sep">to</span>
                <input
                  type="time"
                  className="time-input"
                  value={slot.end_time}
                  onChange={(e) => updateSlot(idx, "end_time", e.target.value)}
                />
              </div>
              <button className="btn-slot-remove" onClick={() => removeSlot(idx)} title="Remove slot">&times;</button>
            </div>
          ))
        )}
        <button className="btn-add-slot" onClick={addSlot}>+ Add slot</button>
      </div>
    </div>
  );
}

export default function ManageHabits({ onHabitsChanged }) {
  const [habits, setHabits] = useState([]);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [schedule, setSchedule] = useState(emptySchedule);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editSchedule, setEditSchedule] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => fetchCustomHabits().then(setHabits);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (!key) return;
    const activeSchedule = scheduleToApi(schedule);
    const result = await createCustomHabit({ key, label: trimmed.toUpperCase(), color, sort_order: habits.length, schedule: activeSchedule });
    if (result) {
      setLabel("");
      setColor(PALETTE[0]);
      setSchedule(emptySchedule());
      load();
      onHabitsChanged?.();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this habit and all its data?")) return;
    await deleteCustomHabit(id);
    load();
    onHabitsChanged?.();
  };

  const startEdit = (h) => {
    setEditingId(h.id);
    setEditLabel(h.label);
    setEditColor(h.color);
    setEditSchedule(scheduleFromApi(h.schedule || []));
  };

  const saveEdit = async () => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    await updateCustomHabit(editingId, { label: trimmed.toUpperCase(), color: editColor, schedule: scheduleToApi(editSchedule) });
    setEditingId(null);
    load();
    onHabitsChanged?.();
  };

  const totalSlots = (h) => (h.schedule || []).length;
  const activeDays = (h) => new Set((h.schedule || []).map((s) => s.day_of_week)).size;

  return (
    <div className="manage-habits">
      <div className="manage-habits-form">
        <input
          type="text"
          className="manage-input"
          placeholder="New habit name..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          maxLength={30}
        />
        <div className="palette">
          {PALETTE.map((c) => (
            <button
              key={c}
              className={`palette-swatch ${color === c ? "active" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="schedule-builder">
          <p className="schedule-builder-title">Weekly Schedule</p>
          {DAYS.map((d, i) => (
            <DayScheduleBuilder
              key={d}
              day={d}
              dayState={schedule[i]}
              onChange={(newDay) => {
                const next = [...schedule];
                next[i] = newDay;
                setSchedule(next);
              }}
            />
          ))}
        </div>

        <button className="btn-add" onClick={handleAdd} disabled={!label.trim()}>
          + Add Habit
        </button>
      </div>

      <div className="habit-list">
        {habits.length === 0 && (
          <p className="empty-msg">No custom habits yet. Add one above.</p>
        )}
        {habits.map((h) => (
          <div key={h.id} className="habit-row-wrap">
            {editingId === h.id ? (
              <div className="habit-edit-card">
                <div className="habit-row">
                  <div className="habit-row-left">
                    <div className="palette-swatch" style={{ background: editColor, flexShrink: 0 }} />
                    <input
                      type="text"
                      className="manage-input manage-input-sm"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      maxLength={30}
                      autoFocus
                    />
                  </div>
                  <div className="habit-row-actions">
                    <button className="btn-sm btn-save" onClick={saveEdit}>Save</button>
                    <button className="btn-sm btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
                <div className="palette palette-sm">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      className={`palette-swatch ${editColor === c ? "active" : ""}`}
                      style={{ background: c }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                </div>
                <div className="schedule-builder schedule-builder-sm">
                  <p className="schedule-builder-title">Weekly Schedule</p>
                  {DAYS.map((d, i) => (
                    <DayScheduleBuilder
                      key={d}
                      day={d}
                      dayState={editSchedule[i] || { day_of_week: d, slots: [] }}
                      onChange={(newDay) => {
                        const next = [...editSchedule];
                        next[i] = newDay;
                        setEditSchedule(next);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="habit-view-card">
                <div className="habit-row">
                  <div className="habit-row-left">
                    <div className="palette-swatch" style={{ background: h.color }} />
                    <span className="habit-label">{h.label}</span>
                    <span className="habit-key">{h.key}</span>
                    {totalSlots(h) > 0 && (
                      <span className="habit-schedule-badge">{totalSlots(h)} slots &middot; {activeDays(h)}d/week</span>
                    )}
                  </div>
                  <div className="habit-row-actions">
                    <button className="btn-sm btn-edit" onClick={() => startEdit(h)}>Edit</button>
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(h.id)}>Delete</button>
                  </div>
                </div>
                {totalSlots(h) > 0 && (
                  <button
                    className="schedule-expand-btn"
                    onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                  >
                    {expandedId === h.id ? "Hide schedule" : "View schedule"}
                  </button>
                )}
                {expandedId === h.id && totalSlots(h) > 0 && (
                  <div className="schedule-preview">
                    {DAYS.map((d) => {
                      const daySlots = (h.schedule || []).filter((s) => s.day_of_week === d);
                      return (
                        <div key={d} className={`schedule-row ${daySlots.length > 0 ? "active" : ""}`}>
                          <span className="schedule-day-label">{d.slice(0, 3)}</span>
                          {daySlots.length > 0 ? (
                            <div className="schedule-preview-slots">
                              {daySlots.map((s, i) => (
                                <span key={i} className="schedule-preview-time">{s.start_time} - {s.end_time}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="holiday-label">No slot</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
