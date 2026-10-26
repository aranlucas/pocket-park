import type { Report } from "./playback";
import type { ProgressEntry } from "./physics";

const settledMessages = {
  ready: "Collect every ring and land softly in the bowl.",
  landed: "Lovely line. Every ring, a soft landing.",
};

function statusMessage(state: Report, paused: boolean): string {
  if (state.status === "missed") {
    return `A little off-line. ${state.rings} of 3 rings — tweak it and try again.`;
  }

  if (state.status === "rolling") {
    return paused ? "Take a breath. Your line is paused." : "Let it roll. Watch the landing.";
  }

  return settledMessages[state.status];
}

interface RunResultProps {
  readonly state: Report;
  readonly paused: boolean;
  readonly level: number;
  readonly best: ProgressEntry | undefined;
  readonly onNext: () => void;
}

/** Present run status and progression without owning physics or persistence state. */
export function RunResult({ state, paused, level, best, onNext }: RunResultProps) {
  return (
    <div className={`result ${state.status === "landed" ? "landed" : ""}`} role="status">
      <span className="rings" role="img" aria-label={`${state.rings} of 3 rings collected`}>
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
      <p>{statusMessage(state, paused)}</p>
      <span className="best">Best: {best ? `${best.time.toFixed(2)}s` : "—"}</span>
      {state.status === "landed" && level < 4 && (
        <button type="button" className="next" onClick={onNext}>
          Next park
        </button>
      )}
      {state.status === "landed" && level === 4 && (
        <span className="complete">Five little adventures, complete.</span>
      )}
    </div>
  );
}
