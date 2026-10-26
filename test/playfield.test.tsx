// @vitest-environment jsdom
import { act, cleanup, render as renderUI } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { World } from "planck";
import { Playfield } from "@/playfield.tsx";
import type { Report } from "@/playfield.tsx";
import { makeParks } from "@/physics.ts";

const park = makeParks()[0];

const frames = new Map<number, FrameRequestCallback>();

let sequence = 0;

function canvasContext() {
  const context: Partial<CanvasRenderingContext2D> = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    ellipse: vi.fn(),
    save: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    restore: vi.fn(),
  };

  // SAFETY: this drawing recorder implements every method used by renderer.ts; it does not
  // emulate pixels. These tests verify animation lifecycle and real Planck stepping only.
  return context as CanvasRenderingContext2D;
}

beforeEach(() => {
  frames.clear();
  sequence = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = sequence++;
    frames.set(id, callback);

    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function frame(timestamp: number) {
  const callbacks = [...frames.values()];
  frames.clear();
  act(() => {
    for (const callback of callbacks) {
      callback(timestamp);
    }
  });
}

test("launch and reset reuse the preview until controls change", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvasContext());
  const steps = vi.spyOn(World.prototype, "step");
  const onReport = vi.fn();
  const props = { park, angle: 24, strength: 14, onReport, paused: false };
  const view = renderUI(<Playfield {...props} attempt={0} />);
  const previewSteps = steps.mock.calls.length;

  expect(previewSteps).toBeGreaterThan(0);
  view.rerender(<Playfield {...props} attempt={1} />);
  expect(steps).toHaveBeenCalledTimes(previewSteps);
  view.rerender(<Playfield {...props} attempt={0} />);
  expect(steps).toHaveBeenCalledTimes(previewSteps);
  view.rerender(<Playfield {...props} angle={25} attempt={0} />);
  expect(steps.mock.calls.length).toBeGreaterThan(previewSteps);
});

test("pause cancels drawing and physics; resume does not catch up paused time", () => {
  const context = canvasContext();
  const draws = vi.spyOn(context, "clearRect");
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  const steps = vi.spyOn(World.prototype, "step");
  const onReport = vi.fn();
  const props = { park, angle: 24, strength: 14, attempt: 1, onReport };
  const view = renderUI(<Playfield {...props} paused={false} />);
  frame(0);
  frame(20);
  view.rerender(<Playfield {...props} paused />);
  const drawsBeforePause = draws.mock.calls.length;
  const stepsBeforePause = steps.mock.calls.length;

  expect(frames.size).toBe(0);
  frame(5_000);
  expect(draws).toHaveBeenCalledTimes(drawsBeforePause);
  expect(steps).toHaveBeenCalledTimes(stepsBeforePause);

  view.rerender(<Playfield {...props} paused={false} />);
  expect(frames.size).toBe(1);
  frame(10_000);
  expect(steps).toHaveBeenCalledTimes(stepsBeforePause);
  frame(10_020);
  expect(steps.mock.calls.length).toBeGreaterThan(stepsBeforePause);
});

test("a long active-frame gap advances at most six fixed steps", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvasContext());
  const steps = vi.spyOn(World.prototype, "step");
  renderUI(
    <Playfield
      park={park}
      angle={24}
      strength={14}
      attempt={1}
      paused={false}
      onReport={vi.fn()}
    />,
  );
  frame(10);
  const beforeGap = steps.mock.calls.length;
  frame(100_000);

  expect(steps.mock.calls.length - beforeGap).toBeGreaterThan(0);
  expect(steps.mock.calls.length - beforeGap).toBeLessThanOrEqual(6);
});

test("canonical play reports a real landing then releases the animation frame", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvasContext());
  const onReport = vi.fn<(report: Report) => void>();
  renderUI(
    <Playfield
      park={park}
      angle={24}
      strength={14}
      attempt={1}
      paused={false}
      onReport={onReport}
    />,
  );

  for (let timestamp = 0; timestamp <= 5_000 && frames.size > 0; timestamp += 16) {
    frame(timestamp);
  }

  const final = onReport.mock.lastCall?.[0];
  expect(final?.status).toBe("landed");
  expect(final?.rings).toBe(3);
  expect(final?.time).toBeCloseTo(2.583333333333327, 8);
  expect(frames.size).toBe(0);
});

test("unmount cancels the queued frame, including request ID zero", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvasContext());

  const view = renderUI(
    <Playfield
      park={park}
      angle={24}
      strength={14}
      attempt={1}
      paused={false}
      onReport={vi.fn()}
    />,
  );

  expect(frames.has(0)).toBe(true);
  view.unmount();
  expect(frames.size).toBe(0);
});
