import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getTodayIso, getTodayDay } from "./data";
import {
  fetchCustomHabits, fetchCustomHabitData, fetchHabitStats,
  saveCustomHabitData, saveCustomHabitReason,
} from "./api";
import TopBar from "./components/TopBar";
import Hero from "./components/Hero";
import MetricCard from "./components/MetricCard";
import FocusCard from "./components/FocusCard";
import QuoteCard from "./components/QuoteCard";
import ManageHabits from "./components/ManageHabits";
import HabitRecord from "./components/HabitRecord";
import ReasonTable from "./components/ReasonTable";
import ReasonModal from "./components/ReasonModal";
import "./App.css";

const ISO = getTodayIso();
const DAY = getTodayDay();

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [customHabits, setCustomHabits] = useState([]);
  const [customData, setCustomData] = useState({});
  const [habitStats, setHabitStats] = useState({});
  const customLoadedRef = useRef(false);

  const [modal, setModal] = useState({ open: false, habitKey: null, habitLabel: "", slotIndex: 0 });

  const loadCustomHabits = useCallback(() => {
    fetchCustomHabits().then((habits) => {
      setCustomHabits(habits);
      fetchCustomHabitData(ISO).then((data) => {
        setCustomData(data);
        customLoadedRef.current = true;
      });
    });
  }, []);

  useEffect(() => { loadCustomHabits(); }, [loadCustomHabits]);

  useEffect(() => {
    fetchHabitStats().then(setHabitStats);
  }, []);

  useEffect(() => {
    if (customLoadedRef.current) {
      fetchHabitStats().then(setHabitStats);
    }
  }, [customData]);

  const toggleCustomSlot = useCallback((habitKey, slotIndex) => {
    setCustomData((prev) => {
      const habitSlots = prev[habitKey] || {};
      const wasCompleted = habitSlots[slotIndex];

      if (wasCompleted) {
        const habit = customHabits.find((h) => h.key === habitKey);
        setModal({ open: true, habitKey, habitLabel: habit?.label || habitKey, slotIndex });
        return prev;
      }

      saveCustomHabitData(ISO, habitKey, true, slotIndex);
      return { ...prev, [habitKey]: { ...habitSlots, [slotIndex]: true } };
    });
  }, [customHabits]);

  const handleReasonSubmit = useCallback(async (reason) => {
    const { habitKey, slotIndex } = modal;
    saveCustomHabitData(ISO, habitKey, false, slotIndex);
    if (reason.trim()) {
      await saveCustomHabitReason(ISO, habitKey, slotIndex, reason.trim());
    }
    setCustomData((prev) => {
      const habitSlots = prev[habitKey] || {};
      return { ...prev, [habitKey]: { ...habitSlots, [slotIndex]: false } };
    });
    setModal({ open: false, habitKey: null, habitLabel: "", slotIndex: 0 });
  }, [modal]);

  const todaySchedule = useMemo(() => {
    const slots = [];
    customHabits.forEach((h) => {
      const daySchedules = (h.schedule || []).filter((s) => s.day_of_week === DAY);
      daySchedules.forEach((s, idx) => {
        const timeRange = `${s.start_time}\u2013${s.end_time}`;
        slots.push({ time: timeRange, name: h.label, key: h.key, color: h.color, slotIndex: idx });
      });
    });
    slots.sort((a, b) => a.time.localeCompare(b.time));
    return slots;
  }, [customHabits]);

  const habitSlotCounts = useMemo(() => {
    const counts = {};
    customHabits.forEach((h) => {
      counts[h.key] = (h.schedule || []).filter((s) => s.day_of_week === DAY).length;
    });
    return counts;
  }, [customHabits]);

  const completed = useMemo(() => {
    let done = 0;
    let total = 0;
    customHabits.forEach((h) => {
      const count = habitSlotCounts[h.key] || 0;
      total += count;
      const slots = customData[h.key] || {};
      for (let i = 0; i < count; i++) {
        if (slots[i]) done++;
      }
    });
    return { done, total };
  }, [customHabits, habitSlotCounts, customData]);

  const nextSlot = useMemo(() => {
    return todaySchedule.find((s) => !(customData[s.key] || {})[s.slotIndex]) || null;
  }, [todaySchedule, customData]);

  return (
    <main className="shell">
      <TopBar />

      <Hero
        completed={completed.done}
        total={completed.total}
        allDone={completed.total > 0 && completed.done === completed.total}
      />

      <section className="metrics">
        {customHabits.map((h) => {
          const totalSlots = habitSlotCounts[h.key] || 0;
          let doneSlots = 0;
          if (totalSlots > 0) {
            const slots = customData[h.key] || {};
            for (let i = 0; i < totalSlots; i++) {
              if (slots[i]) doneSlots++;
            }
          }
          const at = habitStats[h.key] || { done: 0, total: 0 };
          return (
            <MetricCard
              key={h.key}
              habit={{ key: h.key, label: h.label, color: h.color }}
              done={totalSlots > 0 && doneSlots === totalSlots}
              doneSlots={doneSlots}
              totalSlots={totalSlots}
              allTimeDone={at.done}
              allTimeTotal={at.total}
              onToggle={() => {
                const nextUnchecked = Array.from({ length: totalSlots }, (_, i) => i).find((i) => !(customData[h.key] || {})[i]);
                if (nextUnchecked !== undefined) toggleCustomSlot(h.key, nextUnchecked);
              }}
            />
          );
        })}
        {customHabits.length === 0 && (
          <p className="empty-msg" style={{ gridColumn: "1 / -1" }}>
            No habits yet. Go to <strong>My Habits</strong> to create your first one.
          </p>
        )}
      </section>

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === "myhabits" ? "active" : ""}`}
          onClick={() => setActiveTab("myhabits")}
        >
          My Habits
        </button>
        <button
          className={`tab-btn ${activeTab === "records" ? "active" : ""}`}
          onClick={() => setActiveTab("records")}
        >
          Habit Record
        </button>
        <button
          className={`tab-btn ${activeTab === "reasons" ? "active" : ""}`}
          onClick={() => setActiveTab("reasons")}
        >
          Reasons
        </button>
      </div>

      {activeTab === "dashboard" && (
        <section className="content-grid">
          <section className="schedule-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TODAY&apos;S PLAN</p>
                <h2>{DAY} Schedule</h2>
              </div>
              <div className="schedule-summary">
                <span>{completed.done}</span>/{completed.total} done
              </div>
            </div>
            {todaySchedule.length > 0 ? (
              <div className="schedule">
                {todaySchedule.map((task) => {
                  const isChecked = !!(customData[task.key] || {})[task.slotIndex];
                  return (
                    <label
                      key={`${task.key}-${task.slotIndex}`}
                      className={`task ${isChecked ? "completed" : ""}`}
                    >
                      <span className="task-time">{task.time}</span>
                      <input
                        type="checkbox"
                        className="check"
                        checked={isChecked}
                        onChange={() => toggleCustomSlot(task.key, task.slotIndex)}
                      />
                      <span className="task-name">{task.name}</span>
                      <span
                        className="task-tag"
                        style={{ background: task.color + "22", color: task.color, borderColor: task.color + "44" }}
                      >
                        {task.slotIndex + 1}/{habitSlotCounts[task.key]}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="empty-msg">No habits scheduled for {DAY}. Go to My Habits to set up your schedule.</p>
            )}
          </section>

          <aside className="side-column">
            {nextSlot ? (
              <FocusCard
                time={nextSlot.time}
                task={nextSlot.name}
                text="Your next commitment is waiting."
              />
            ) : (
              <FocusCard
                time="--:--"
                task="All done!"
                text="Great work today. You've completed everything."
              />
            )}
            <QuoteCard />
          </aside>
        </section>
      )}

      {activeTab === "myhabits" && (
        <section className="data-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MANAGE</p>
              <h2>My Habits</h2>
            </div>
          </div>
          <ManageHabits onHabitsChanged={loadCustomHabits} />
        </section>
      )}

      {activeTab === "records" && (
        <section className="data-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DATA</p>
              <h2>Habit Record</h2>
            </div>
          </div>
          <HabitRecord />
        </section>
      )}

      {activeTab === "reasons" && (
        <section className="data-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DATA</p>
              <h2>Reasons</h2>
            </div>
          </div>
          <ReasonTable />
        </section>
      )}

      <ReasonModal
        open={modal.open}
        habitLabel={modal.habitLabel}
        onClose={() => setModal({ open: false, habitKey: null, habitLabel: "", slotIndex: 0 })}
        onSubmit={handleReasonSubmit}
      />
    </main>
  );
}
