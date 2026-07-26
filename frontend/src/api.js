import { EXCUSE_FIELD_MAP, HABITS } from "./data";

export async function fetchHabits(iso) {
  try {
    const res = await fetch(`/habitTracker/${iso}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.info("Using local dashboard state");
  }
  return null;
}

export async function saveHabits(iso, state) {
  const body = { date: iso, ...state };
  try {
    const r = await fetch(`/habitTrackerUpdate/${iso}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.status === 404) {
      await fetch("/habitTracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
  } catch {
    console.info("Database unavailable; state remains in this session.");
  }
}

export async function fetchHabitStats(iso) {
  try {
    const res = await fetch(`/habitStats/${iso}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.info("Could not fetch habit stats");
  }
  return null;
}

export async function fetchAllHabits() {
  try {
    const res = await fetch("/habitTrackerAll");
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not fetch habit records");
  }
  return [];
}

export async function fetchAllExcuses() {
  try {
    const res = await fetch("/excuseAll");
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not fetch excuse records");
  }
  return [];
}

export async function saveExcuse(iso, missedKey, text) {
  const reasons = Object.fromEntries(
    HABITS.map((h) => [`reasonOf${capitalize(h.key)}`, ""])
  );
  reasons[EXCUSE_FIELD_MAP[missedKey]] = text;

  try {
    await fetch("/excuse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: iso, ...reasons }),
    });
  } catch {
    // Silently ignore network errors
  }
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}
