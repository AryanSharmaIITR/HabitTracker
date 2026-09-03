const BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchCustomHabits() {
  try {
    const res = await fetch(`${BASE}/customHabits`);
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not fetch custom habits");
  }
  return [];
}

export async function createCustomHabit(data) {
  try {
    const res = await fetch(`${BASE}/customHabits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not create custom habit");
  }
  return null;
}

export async function updateCustomHabit(id, data) {
  try {
    const res = await fetch(`${BASE}/customHabits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not update custom habit");
  }
  return null;
}

export async function deleteCustomHabit(id) {
  try {
    const res = await fetch(`${BASE}/customHabits/${id}`, { method: "DELETE" });
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not delete custom habit");
  }
  return null;
}

export async function fetchCustomHabitData(iso) {
  try {
    const res = await fetch(`${BASE}/customHabitData/${iso}`);
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not fetch custom habit data");
  }
  return {};
}

export async function saveCustomHabitData(iso, habitKey, completed, slotIndex = 0) {
  try {
    await fetch(`${BASE}/customHabitData/${iso}/${habitKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed, slot_index: slotIndex }),
    });
  } catch {
    console.info("Could not save custom habit data");
  }
}

export async function fetchAllCustomHabitData() {
  try {
    const res = await fetch(`${BASE}/customHabitAll`);
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not fetch all custom habit data");
  }
  return {};
}

export async function fetchHabitStats() {
  try {
    const res = await fetch(`${BASE}/habitStats`);
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not fetch habit stats");
  }
  return {};
}

export async function saveCustomHabitReason(iso, habitKey, slotIndex, reason) {
  try {
    const res = await fetch(`${BASE}/customHabitReason`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: iso, habit_key: habitKey, slot_index: slotIndex, reason }),
    });
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not save reason");
  }
  return null;
}

export async function fetchAllReasons() {
  try {
    const res = await fetch(`${BASE}/customHabitReasonAll`);
    if (res.ok) return await res.json();
  } catch {
    console.info("Could not fetch reasons");
  }
  return [];
}
