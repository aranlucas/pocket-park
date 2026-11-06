// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "@/app.tsx";

// Record canvas calls and leave animation frames pending: these tests exercise real
// App/Playfield effects without advancing wall time or inspecting rendered pixels.
beforeEach(() => {
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

  // SAFETY: the recorder implements each drawing method used by renderer.ts.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as CanvasRenderingContext2D,
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("holding Space launches once and pauses only on the next physical press", () => {
  render(<App />);
  const game = screen.getByRole("application");
  fireEvent.keyDown(game, { code: "Space" });
  expect(screen.getByText("Let it roll. Watch the landing.")).toBeDefined();
  fireEvent.keyDown(game, { code: "Space", repeat: true });
  expect(screen.getByText("Let it roll. Watch the landing.")).toBeDefined();
  fireEvent.keyDown(game, { code: "Space" });
  expect(screen.getByText("Take a breath. Your line is paused.")).toBeDefined();
  fireEvent.keyDown(game, { code: "Space", repeat: true });
  expect(screen.getByText("Take a breath. Your line is paused.")).toBeDefined();
});

test("Escape resets while the pause button retains focus", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Take the line" }));
  const pause = screen.getByRole("button", { name: "Pause", exact: true });
  pause.focus();
  fireEvent.click(pause);
  expect(screen.getByText("Take a breath. Your line is paused.")).toBeDefined();
  fireEvent.keyDown(pause, { key: "Escape", code: "Escape" });
  expect(screen.getByText("Collect every ring and land softly in the bowl.")).toBeDefined();
});
