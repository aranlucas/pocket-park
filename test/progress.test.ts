import { it, expect } from "vitest";
import { readProgress, writeProgress } from "@/progress.ts";

it("progress restore validates schema and every saved score", () => {
  expect(readProgress(null)).toEqual({});
  expect(() => readProgress("bad")).toThrow(SyntaxError);
  expect(() =>
    readProgress('{"version":1,"best":{"6":{"angle":24,"strength":14,"time":2}}}'),
  ).toThrow("Invalid saved record.");
  expect(readProgress('{"version":1,"best":{"0":{"angle":24,"strength":14,"time":2}}}')).toEqual({
    0: { angle: 24, strength: 14, time: 2 },
  });
});

it.each([
  { angle: 4, strength: 14, time: 2 },
  { angle: 71, strength: 14, time: 2 },
  { angle: 24, strength: 7.9, time: 2 },
  { angle: 24, strength: 22.1, time: 2 },
  { angle: 24, strength: 14, time: 0 },
  { angle: 24, strength: 14, time: 12.1 },
])("rejects an unplayable saved score: %o", (entry) => {
  expect(() => readProgress(JSON.stringify({ version: 1, best: { 0: entry } }))).toThrow(
    "Saved progress is unreadable.",
  );
});

it("restores playable boundary scores for the final park", () => {
  expect(readProgress('{"version":1,"best":{"4":{"angle":70,"strength":22,"time":12}}}')).toEqual({
    4: { angle: 70, strength: 22, time: 12 },
  });
});

it("writes the version-one format consumed on reload", () => {
  const best = { 0: { angle: 24, strength: 14, time: 2 } };
  expect(JSON.parse(writeProgress(best))).toEqual({ version: 1, best });
  expect(readProgress(writeProgress(best))).toEqual(best);
});
