import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  HABITS,
  SCHEDULES,
  getTodayIso,
  getTodayDay,
} from "./data";
import { fetchHabits, saveHabits, saveExcuse, fetchHabitStats } from "./api";
import TopBar from "./components/TopBar";
import Hero from "./components/Hero";
import MetricCard from "./components/MetricCard";
import Schedule from "./components/Schedule";
import FocusCard from "./components/FocusCard";
import QuoteCard from "./components/QuoteCard";
import ExcuseModal from "./components/ExcuseModal";
import HabitTable from "./components/HabitTable";
import ExcuseTable from "./components/ExcuseTable";
import "./App.css";

const ISO = getTodayIso();
const DAY = getTodayDay();

export default function App() {
  const [state, setState] = useState(() =>
    Object.fromEntries(HABITS.map((h) => [h.key, false]))
  );
  const [modal, setModal] = useState({ open: false, key: null });
  const [activeTab, setActiveTab] = useState("dashboard");
  const loadedRef = useRef(false);

  // Load saved state on mount
  useEffect(() => {
    fetchHabits(ISO).then((saved) => {
      if (saved) {
        setState((prev) => {
          const next = { ...prev };
          HABITS.forEach((h) => (next[h.key] = Boolean(saved[h.key])));
          return next;
        });
      }
      loadedRef.current = true;
    });
  }, []);

  // Persist state whenever it changes (only after initial load)
  useEffect(() => {
    if (loadedRef.current) saveHabits(ISO, state);
  }, [state]);

  const todaySchedule = useMemo(
    () => SCHEDULES[DAY] || SCHEDULES.Monday,
    []
  );

  const associatedKeys = useMemo(
    () => new Set(todaySchedule.map((x) => x[2]).filter(Boolean)),
    [todaySchedule]
  );

  const completed = useMemo(
    () => [...associatedKeys].filter((k) => state[k]).length,
    [associatedKeys, state]
  );

  const allDone = completed === associatedKeys.size;

  // Per-habit slot counts: how many times each habit appears in today's schedule
  const habitSlotCounts = useMemo(() => {
    const counts = {};
    HABITS.forEach((h) => (counts[h.key] = 0));
    todaySchedule.forEach((slot) => {
      if (slot[2] && counts[slot[2]] !== undefined) {
        counts[slot[2]]++;
      }
    });
    return counts;
  }, [todaySchedule]);

  const nextSlot = useMemo(
    () => todaySchedule.find((x) => x[2] && !state[x[2]]) || todaySchedule[0],
    [todaySchedule, state]
  );

  const toggleHabit = useCallback(
    (key, force) => {
      const next = force ?? !state[key];

      // Unchecking -> open excuse modal
      if (!next && state[key]) {
        const label = HABITS.find((h) => h.key === key).label;
        setModal({ open: true, key, label });
      }

      setState((prev) => ({ ...prev, [key]: next }));
    },
    [state]
  );

  const closeModal = useCallback(() => {
    setModal({ open: false, key: null, label: null });
  }, []);

  const submitExcuse = useCallback(
    async (text) => {
      await saveExcuse(ISO, modal.key, text);
      closeModal();
    },
    [modal.key, closeModal]
  );

  return (
    <main className="shell">
      <TopBar />

      <Hero
        completed={completed}
        total={associatedKeys.size}
        allDone={allDone}
      />

      <section className="metrics">
        {HABITS.map((h) => {
          const totalSlots = habitSlotCounts[h.key] || 0;
          const doneSlots = state[h.key] ? totalSlots : 0;
          return (
            <MetricCard
              key={h.key}
              habit={h}
              done={state[h.key]}
              doneSlots={doneSlots}
              totalSlots={totalSlots}
              onToggle={toggleHabit}
            />
          );
        })}
      </section>

      {/* Tab navigation */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === "habits" ? "active" : ""}`}
          onClick={() => setActiveTab("habits")}
        >
          Habit Tracker
        </button>
        <button
          className={`tab-btn ${activeTab === "excuses" ? "active" : ""}`}
          onClick={() => setActiveTab("excuses")}
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
                <span>{completed}</span>/{associatedKeys.size} done
              </div>
            </div>
            <Schedule
              tasks={todaySchedule}
              state={state}
              onToggle={toggleHabit}
            />
          </section>

          <aside className="side-column">
            <FocusCard
              time={nextSlot[0]}
              task={nextSlot[1]}
              text={
                nextSlot[2]
                  ? "Your next commitment is waiting."
                  : "One focused block at a time."
              }
            />
            <QuoteCard />
          </aside>
        </section>
      )}

      {activeTab === "habits" && (
        <section className="data-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DATABASE</p>
              <h2>Habit Tracker Table</h2>
            </div>
          </div>
          <HabitTable />
        </section>
      )}

      {activeTab === "excuses" && (
        <section className="data-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DATABASE</p>
              <h2>Reasons Table</h2>
            </div>
          </div>
          <ExcuseTable />
        </section>
      )}

      <ExcuseModal
        open={modal.open}
        missedLabel={modal.label}
        onClose={closeModal}
        onSubmit={submitExcuse}
      />
    </main>
  );
}
