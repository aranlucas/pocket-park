import { useEffect, useMemo, useState } from "react";
import { Playfield } from "./Playfield";
import type { Report } from "./Playfield";
import { makeParks, readProgress } from "./physics";
const STORE = "pocket-park.best.v1";
function initial() {
  try {
    return { best: readProgress(localStorage.getItem(STORE)), notice: "" };
  } catch {
    return {
      best: {},
      notice:
        "Saved records were unreadable. Your parks are ready for a fresh line.",
    };
  }
}
export default function App() {
  const parks = useMemo(makeParks, []);
  const [boot] = useState(initial);
  const [best, setBest] = useState(boot.best);
  const [notice, setNotice] = useState(boot.notice);
  const [level, setLevel] = useState(0);
  const [angle, setAngle] = useState(24);
  const [strength, setStrength] = useState(12);
  const [history, setHistory] = useState<{ angle: number; strength: number }[]>(
    [],
  );
  const [attempt, setAttempt] = useState(0);
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<Report>({
    status: "ready",
    rings: 0,
    time: 0,
  });
  const park = parks[level];
  const running = state.status === "rolling";
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ version: 1, best }));
    } catch {
      setNotice(
        "Browser storage is unavailable. Records last for this visit only.",
      );
    }
  }, [best]);
  function report(r: Report) {
    setState((prev) =>
      prev.status === r.status &&
      prev.rings === r.rings &&
      r.status === "rolling"
        ? prev
        : r,
    );
    if (r.status === "landed")
      setBest((old) => {
        const current = old[level];
        return current && current.time <= r.time
          ? old
          : { ...old, [level]: { angle, strength, time: r.time } };
      });
  }
  function reset() {
    setAttempt(0);
    setPaused(false);
    setState({ status: "ready", rings: 0, time: 0 });
  }
  function tweak(a: number, s: number) {
    if (running) return;
    setHistory((h) => [...h.slice(-19), { angle, strength }]);
    setAngle(a);
    setStrength(s);
    reset();
  }
  function changePark(n: number) {
    setLevel(n);
    setAngle(24);
    setStrength(12);
    setHistory([]);
    reset();
    setNotice("");
  }
  function take() {
    setPaused(false);
    setAttempt((a) => a + 1);
    setState({ status: "rolling", rings: 0, time: 0 });
  }
  function key(e: React.KeyboardEvent) {
    if ((e.target as HTMLElement).matches("input,select,button")) return;
    if (e.code === "Space") {
      e.preventDefault();
      if (!running) take();
      else setPaused((p) => !p);
    }
    if (e.key === "Escape") reset();
  }
  const message =
    state.status === "landed"
      ? "Lovely line. Every ring, a soft landing."
      : state.status === "missed"
        ? `A little off-line. ${state.rings} of 3 rings — tweak it and try again.`
        : running
          ? paused
            ? "Take a breath. Your line is paused."
            : "Let it roll. Watch the landing."
          : "Collect every ring and land softly in the bowl.";
  return (
    <div className="game" onKeyDown={key} tabIndex={-1}>
      <header>
        <h1>
          Pocket Park
          <svg viewBox="0 0 60 36" aria-hidden="true">
            <ellipse
              cx="30"
              cy="18"
              rx="27"
              ry="5"
              transform="rotate(-18 30 18)"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="30" cy="18" r="12" fill="currentColor" />
          </svg>
        </h1>
        <p>One push. A whole little adventure.</p>
        <div className="park-heading">
          Park {level + 1} of 5 <span>·</span> {park.name}
        </div>
      </header>
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      <main>
        <Playfield
          park={park}
          angle={angle}
          strength={strength}
          attempt={attempt}
          paused={paused}
          onReport={report}
        />
        <div className="controls">
          <label>
            Launch angle <strong>{angle}°</strong>
            <input
              aria-label="Launch angle"
              type="range"
              min="5"
              max="70"
              value={angle}
              disabled={running}
              onChange={(e) => tweak(Number(e.target.value), strength)}
            />
            <div>
              <span>5°</span>
              <span>70°</span>
            </div>
          </label>
          <label>
            Push strength <strong>{strength.toFixed(1)}</strong>
            <input
              aria-label="Push strength"
              type="range"
              min="8"
              max="22"
              step=".1"
              value={strength}
              disabled={running}
              onChange={(e) => tweak(angle, Number(e.target.value))}
            />
            <div>
              <span>Gentle</span>
              <span>Bold</span>
            </div>
          </label>
          <button className="take" onClick={take} disabled={running}>
            Take the line{" "}
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 12h18m-7-7 7 7-7 7" />
            </svg>
          </button>
          <div className="secondary">
            <button onClick={running ? () => setPaused((p) => !p) : reset}>
              {running ? (paused ? "Resume" : "Pause") : "Reset"}
            </button>
            <button onClick={reset} disabled={!running}>
              Restart
            </button>
            <button
              disabled={!history.length || running}
              onClick={() => {
                const p = history.at(-1);
                if (p) {
                  setAngle(p.angle);
                  setStrength(p.strength);
                  setHistory((h) => h.slice(0, -1));
                  reset();
                }
              }}
            >
              Undo tweak
            </button>
          </div>
        </div>
        <div
          className={`result ${state.status === "landed" ? "landed" : ""}`}
          role="status"
        >
          <span
            className="rings"
            aria-label={`${state.rings} of 3 rings collected`}
          >
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                width="23"
                height="23"
                fill={i < state.rings ? "#a5d5be" : "none"}
                stroke="#a5d5be"
                strokeWidth="1.7"
              >
                <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />
              </svg>
            ))}
          </span>
          <p>{message}</p>
          <span className="best">
            Best: {best[level] ? `${best[level].time.toFixed(2)}s` : "—"}
          </span>
          {state.status === "landed" && level < 4 && (
            <button className="next" onClick={() => changePark(level + 1)}>
              Next park
            </button>
          )}
          {state.status === "landed" && level === 4 && (
            <span className="complete">Five little adventures, complete.</span>
          )}
        </div>
        <footer>
          <div className="parks" aria-label="Choose park">
            {parks.map((p, i) => (
              <button
                key={p.id}
                aria-label={`Park ${i + 1}: ${p.name}`}
                aria-pressed={level === i}
                onClick={() => changePark(i)}
                disabled={running}
              >
                {i + 1}
                {best[i] && <span aria-label="Completed">✓</span>}
              </button>
            ))}
          </div>
          <p>
            {park.description}
            <small>
              Space to launch / pause · Esc to reset · dotted line previews real
              physics
            </small>
          </p>
          <button
            className="hint"
            disabled={running}
            onClick={() => {
              tweak(park.solution.angle, park.solution.strength);
              setNotice(
                "Reference line loaded. Try it, then see how small changes reshape the flight.",
              );
            }}
          >
            Show a hint
          </button>
        </footer>
      </main>
    </div>
  );
}
