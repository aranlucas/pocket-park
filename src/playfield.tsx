import { useEffect, useMemo, useRef } from "react";
import { createRun, launch, simulate } from "./physics";
import type { Park } from "./physics";
import { startPlayback } from "./playback";
import type { Playback, Report } from "./playback";
import { render } from "./renderer";

export type { Report } from "./playback";

interface PlayfieldProps {
  readonly park: Park;
  readonly angle: number;
  readonly strength: number;
  readonly attempt: number;
  readonly paused: boolean;
  readonly onReport: (r: Report) => void;
}

export function Playfield({ park, angle, strength, attempt, paused, onReport }: PlayfieldProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const report = useRef(onReport);
  const stopped = useRef(paused);
  const playback = useRef<Playback | null>(null);
  const preview = useMemo(() => simulate(park, angle, strength).trail, [park, angle, strength]);
  useEffect(() => {
    report.current = onReport;
    stopped.current = paused;
    playback.current?.setPaused(paused);
  }, [onReport, paused]);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");

    if (!ctx) {
      report.current({ status: "missed", rings: 0, time: 0 });

      return;
    }

    const run = createRun(park);

    if (attempt > 0) {
      launch(run, angle, strength);
    }

    const active = startPlayback(
      run,
      () => render(ctx, run, run.status === "ready" ? preview : []),
      (value) => report.current(value),
      stopped.current,
    );

    playback.current = active;

    return () => {
      active.dispose();
      playback.current = null;
    };
  }, [park, angle, strength, attempt, preview]);

  return (
    <canvas
      className="playfield"
      ref={canvas}
      width="960"
      height="450"
      role="img"
      aria-label={`Skatepark ${park.name}, three rings and a landing bowl. Adjust the launch and take the line using the controls below.`}
    />
  );
}
