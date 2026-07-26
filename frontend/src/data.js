export const HABITS = [
  { key: "wakeUp",       label: "WAKEUP",       color: "#ffad27" },
  { key: "gym",          label: "GYM",           color: "#4fd1b3" },
  { key: "gate",         label: "GATE PREP",     color: "#cbf54b" },
  { key: "aimlRevision", label: "AIML REVISION", color: "#8ca8ff" },
  { key: "upSkill",      label: "UPSKILL",       color: "#e58aff" },
  { key: "codeForces",   label: "CODEFORCES",    color: "#f37a82" },
];

// Each entry: [time, name, habitKey?]
export const SCHEDULES = {
  Monday: [
    ["5:40",        "Wake up",             "wakeUp"],
    ["6:00\u20137:00",   "Gym",                 "gym"],
    ["7:20",        "Shower"],
    ["7:30",        "Breakfast"],
    ["8:00\u20139:00",   "Optimization"],
    ["9:10\u201311:00",  "GATE",                "gate"],
    ["11:00\u20131:00",  "Tutorial"],
    ["1:00\u20131:30",   "Lunch"],
    ["1:30\u20132:50",   "AI/ML Revision",      "aimlRevision"],
    ["3:00\u20134:00",   "Heat & Mass"],
    ["4:00\u20135:00",   "Mechanics"],
    ["5:20",        "Back to Hostel"],
    ["7:30",        "Dinner"],
    ["8:00\u201310:30",  "DSA",                 "codeForces"],
    ["10:30\u201312:00", "Upskill",             "upSkill"],
  ],
  Tuesday: [
    ["6:00\u20137:00",   "Gym",                 "gym"],
    ["7:30",        "Breakfast"],
    ["8:00\u201311:00",  "GATE",                "gate"],
    ["11:00\u201312:30", "AI/ML",               "aimlRevision"],
    ["12:30",       "Lunch"],
    ["1:15\u20133:00",   "DSA",                 "codeForces"],
    ["3:00",        "Travel"],
    ["4:00\u20135:00",   "AI/ML Class"],
    ["5:00\u20137:30",   "GATE",                "gate"],
    ["7:30",        "Dinner"],
    ["8:00\u201310:00",  "Upskill",             "upSkill"],
    ["10:00\u201311:30", "DSA",                 "codeForces"],
  ],
  Wednesday: [
    ["5:40",        "Wake up",             "wakeUp"],
    ["6:00\u20137:00",   "Gym",                 "gym"],
    ["7:35",        "Breakfast"],
    ["8:00\u20139:00",   "Optimization"],
    ["9:10\u201312:10",  "GATE",                "gate"],
    ["12:30",       "Lunch"],
    ["1:30\u20132:45",   "AI/ML",               "aimlRevision"],
    ["3:00\u20134:00",   "Heat & Mass"],
    ["7:30",        "Dinner"],
    ["8:00\u201311:00",  "DSA",                 "codeForces"],
    ["11:00\u201312:00", "Upskill",             "upSkill"],
  ],
  Thursday: [
    ["5:40",        "Wake up",             "wakeUp"],
    ["6:00\u20137:00",   "Gym",                 "gym"],
    ["7:35",        "Breakfast"],
    ["9:00\u201310:00",  "Mechanics Practical"],
    ["10:10\u201311:00", "GATE",                "gate"],
    ["11:00\u20131:00",  "Heat Practical"],
    ["1:00",        "Lunch"],
    ["2:00\u20132:50",   "AI/ML",               "aimlRevision"],
    ["3:00\u20134:00",   "AI/ML",               "aimlRevision"],
    ["4:00\u20135:00",   "Mechanics"],
    ["7:30",        "Dinner"],
    ["8:00\u201310:30",  "DSA",                 "codeForces"],
    ["10:30\u201312:00", "Upskill",             "upSkill"],
  ],
  Friday: [
    ["5:40",        "Wake up",             "wakeUp"],
    ["6:00\u20137:00",   "Gym",                 "gym"],
    ["7:35",        "Breakfast"],
    ["8:00\u20139:00",   "Optimization Tutorial"],
    ["9:10\u201311:00",  "GATE",                "gate"],
    ["11:00\u20131:00",  "Tutorials"],
    ["1:00",        "Lunch"],
    ["2:00\u20132:50",   "AI/ML",               "aimlRevision"],
    ["3:00\u20136:00",   "Classes"],
    ["7:30",        "Dinner"],
    ["8:00\u201311:00",  "DSA",                 "codeForces"],
    ["11:00\u201312:00", "Upskill",             "upSkill"],
  ],
  Saturday: [
    ["6:30\u20137:30",  "Gym",                 "gym"],
    ["Flexible",    "GATE \u2014 3 hours",      "gate"],
    ["Flexible",    "AI/ML \u2014 1.5 hours",   "aimlRevision"],
    ["Flexible",    "DSA \u2014 3 hours",       "codeForces"],
    ["Flexible",    "Upskill \u2014 3 hours",   "upSkill"],
  ],
  Sunday: [
    ["6:30\u20137:30",  "Gym",                 "gym"],
    ["Flexible",    "Mock GATE",           "gate"],
    ["Flexible",    "Codeforces Contest",  "codeForces"],
    ["Flexible",    "Project Work",        "upSkill"],
    ["Flexible",    "Weekly Revision",     "aimlRevision"],
  ],
};

export const EXCUSE_FIELD_MAP = {
  wakeUp:       "reasonOfWakeUp",
  gym:          "reasonOfGym",
  gate:         "reasonOfGate",
  aimlRevision: "reasonOfAimlRevision",
  upSkill:      "reasonOfUpSkill",
  codeForces:   "reasonOfCodeForces",
};

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
