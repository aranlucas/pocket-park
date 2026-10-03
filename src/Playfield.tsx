import { useEffect, useRef } from "react";
import { createRun, launch, simulate, step } from "./physics";
import type { Park, Status } from "./physics";
import { render } from "./renderer";

export type Report = { status: Status; rings: number; time: number };

export function Playfield({
  park,
  angle,
  strength,
  attempt,
  paused,
  onReport,
}: {
  park: Park;
  angle: number;
  strength: number;
  attempt: number;
  paused: boolean;
  onReport: (r: Report) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const report = useRef(onReport);
  const stopped = useRef(paused);
  useEffect(() => {
    report.current = onReport;
    stopped.current = paused;
  }, [onReport, paused]);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");

    if (!ctx) {
      report.current({ status: "missed", rings: 0, time: 0 });

      return;
    }

    const run = createRun(park);
    const preview = simulate(park, angle, strength).trail;

    let id = 0,
      last = 0,
      accumulator = 0,
      reported = -1;

    if (attempt > 0) launch(run, angle, strength);
    else report.current({ status: "ready", rings: 0, time: 0 });

    function frame(timestamp: number) {
      if (last && !stopped.current) {
        accumulator += Math.min(0.05, (timestamp - last) / 1000);

        while (accumulator >= 1 / 120 && run.status === "rolling") {
          step(run);
          accumulator -= 1 / 120;
        }
      }

      last = timestamp;
      render(ctx!, run, run.status === "ready" ? preview : []);

      if (run.collected.size !== reported || run.status !== "rolling") {
        reported = run.collected.size;
        report.current({ status: run.status, rings: reported, time: run.time });
      }

      if (run.status === "rolling" || stopped.current)
        id = requestAnimationFrame(frame);
    }

    id = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(id);
  }, [park, angle, strength, attempt]);

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
