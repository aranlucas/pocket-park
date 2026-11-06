import { z } from "zod";
import { PARK_COUNT } from "./park-layouts";
import { LAUNCH_ANGLE, PUSH_STRENGTH, MAX_RUN_TIME } from "./rules";

export const PROGRESS_STORE = "pocket-park.best.v1";
const PROGRESS_VERSION = 1;

export type ProgressEntry = { angle: number; strength: number; time: number };

export type Progress = Record<number, ProgressEntry>;

const progressEntrySchema = z.object({
  angle: z.number().finite().min(LAUNCH_ANGLE.min).max(LAUNCH_ANGLE.max),
  strength: z.number().finite().min(PUSH_STRENGTH.min).max(PUSH_STRENGTH.max),
  time: z.number().finite().gt(0).lte(MAX_RUN_TIME),
});

const parsedProgressSchema = z.object({
  version: z.literal(PROGRESS_VERSION),
  best: z.record(z.string(), progressEntrySchema),
});

export function readProgress(text: string | null) {
  const best: Progress = {};

  if (!text) {
    return best;
  }

  const parsed: unknown = JSON.parse(text);

  const result = parsedProgressSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error("Saved progress is unreadable.");
  }

  for (const [key, entry] of Object.entries(result.data.best)) {
    const id = Number(key);

    if (!Number.isInteger(id) || id < 0 || id >= PARK_COUNT) {
      throw new Error("Invalid saved record.");
    }

    best[id] = entry;
  }

  return best;
}

export function writeProgress(best: Progress): string {
  return JSON.stringify({ version: PROGRESS_VERSION, best });
}
