import { FIXED_TIME_STEP, step } from "./physics";
import type { Run, Status } from "./physics";

export type Report = { status: Status; rings: number; time: number };

export interface Playback {
  setPaused(paused: boolean): void;
  dispose(): void;
}

interface Clock {
  previous: number | undefined;
  accumulator: number;
}

function advance(run: Run, clock: Clock, timestamp: number): void {
  const previous = clock.previous;
  clock.previous = timestamp;

  if (previous === undefined) {
    return;
  }

  clock.accumulator += Math.min(0.05, Math.max(0, (timestamp - previous) / 1000));

  while (clock.accumulator >= FIXED_TIME_STEP && run.status === "rolling") {
    step(run);
    clock.accumulator -= FIXED_TIME_STEP;
  }
}

/** Drive one run with bounded fixed steps; paused and terminal runs own no animation frame. */
export function startPlayback(
  run: Run,
  draw: () => void,
  report: (value: Report) => void,
  initiallyPaused: boolean,
): Playback {
  const clock: Clock = { previous: undefined, accumulator: 0 };
  let paused = initiallyPaused;
  let disposed = false;
  let frameId: number | undefined;
  let reportedRings = -1;
  let reportedStatus: Status | undefined;

  function notify() {
    if (run.collected.size === reportedRings && run.status === reportedStatus) {
      return;
    }

    reportedRings = run.collected.size;
    reportedStatus = run.status;
    report({ status: run.status, rings: reportedRings, time: run.time });
  }

  function schedule() {
    if (disposed || paused || run.status !== "rolling" || frameId !== undefined) {
      return;
    }

    frameId = requestAnimationFrame(frame);
  }

  function frame(timestamp: number) {
    frameId = undefined;

    if (disposed || paused) {
      return;
    }

    advance(run, clock, timestamp);
    draw();
    notify();
    schedule();
  }

  function cancel() {
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
      frameId = undefined;
    }
  }

  draw();
  notify();
  schedule();

  return {
    setPaused(next) {
      if (disposed || next === paused) {
        return;
      }

      paused = next;
      clock.previous = undefined;

      if (paused) {
        cancel();

        return;
      }

      schedule();
    },
    dispose() {
      disposed = true;
      cancel();
    },
  };
}
