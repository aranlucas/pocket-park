// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { RunResult } from "@/run-result.tsx";
import type { Status } from "@/physics.ts";

type StatusCase = [Status, boolean, string];

afterEach(cleanup);

test.each<StatusCase>([
  ["ready", false, "Collect every ring and land softly in the bowl."],
  ["rolling", false, "Let it roll. Watch the landing."],
  ["rolling", true, "Take a breath. Your line is paused."],
  ["missed", false, "A little off-line. 2 of 3 rings — tweak it and try again."],
  ["landed", false, "Lovely line. Every ring, a soft landing."],
])("reports %s with pause=%s", (status, paused, message) => {
  render(
    <RunResult
      state={{ status, rings: 2, time: 1 }}
      paused={paused}
      level={0}
      best={undefined}
      onNext={vi.fn()}
    />,
  );

  expect(screen.getByText(message)).toBeDefined();
  expect(screen.getByRole("img", { name: "2 of 3 rings collected" })).toBeDefined();
  expect(screen.getByText("Best: —")).toBeDefined();
});

test("only a landed run offers the next park, and the last park shows completion", () => {
  const onNext = vi.fn();
  const best = { angle: 24, strength: 14, time: 2.5833 };
  const state = { status: "landed", rings: 3, time: 2.6 } as const;

  const view = render(
    <RunResult state={state} paused={false} level={0} best={best} onNext={onNext} />,
  );

  expect(screen.getByText("Best: 2.58s")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Next park" }));
  expect(onNext).toHaveBeenCalledOnce();

  view.rerender(<RunResult state={state} paused={false} level={4} best={best} onNext={onNext} />);
  expect(screen.queryByRole("button", { name: "Next park" })).toBeNull();
  expect(screen.getByText("Five little adventures, complete.")).toBeDefined();

  view.rerender(
    <RunResult
      state={{ ...state, status: "missed" }}
      paused={false}
      level={0}
      best={best}
      onNext={onNext}
    />,
  );
  expect(screen.queryByRole("button", { name: "Next park" })).toBeNull();
});
