// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import App from "@/app.tsx";

// Keep this a keyboard contract test; real playback and physics have their own tests.
vi.mock("@/playfield", () => ({ Playfield: () => <canvas /> }));

afterEach(() => {
  cleanup();
  localStorage.clear();
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
