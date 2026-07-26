export function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayDay() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export function getTodayFormatted() {
  return new Date()
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
}
