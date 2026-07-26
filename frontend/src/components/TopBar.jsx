import { getTodayDay, getTodayFormatted } from "../data";

export default function TopBar() {
  const day = getTodayDay();
  const formatted = getTodayFormatted();

  return (
    <header className="topbar">
      <a className="brand" href="/">
        HABIT<span>FLOW</span>
      </a>
      <div className="date-block">
        <span>{day.toUpperCase()}</span>
        <strong>{formatted}</strong>
      </div>
      <button className="profile" aria-label="Profile">
        A
      </button>
    </header>
  );
}
