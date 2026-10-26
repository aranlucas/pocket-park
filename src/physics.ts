import { World, Vec2, Circle, Edge } from "planck";
import type { Body } from "planck";
import { z } from "zod";

/** Simulation seconds per Planck step, shared by previews and live playback. */
export const FIXED_TIME_STEP = 1 / 120;

export type XY = { x: number; y: number };

export type Line = { a: XY; b: XY; color: "ramp" | "floor"; friction?: number };

export type Park = {
  id: number;
  name: string;
  gravity: number;
  lines: Line[];
  rings: XY[];
  goal: { left: number; right: number; bottom: number; top: number };
  solution: { angle: number; strength: number };
  description: string;
};

export type Status = "ready" | "rolling" | "landed" | "missed";

export type Run = {
  world: World;
  puck: Body;
  park: Park;
  status: Status;
  time: number;
  collected: Set<number>;
  trail: XY[];
  rest: number;
  previous: XY;
};

const line = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  color: "ramp" | "floor" = "ramp",
  friction = 0.2,
): Line => ({ a: { x: ax, y: ay }, b: { x: bx, y: by }, color, friction });

/** Create one of the five park layouts without rings. Throws for an unknown ID. */
export function basePark(id: number): Park {
  const variants = [
    { angle: 24, strength: 14, gravity: 7.5 },
    { angle: 28, strength: 13.4, gravity: 7.5 },
    { angle: 32, strength: 13, gravity: 8 },
    { angle: 36, strength: 13.4, gravity: 8.5 },
    { angle: 40, strength: 13.6, gravity: 9 },
  ];

  const v = variants[id];

  if (!v) {
    throw new Error("Unknown park.");
  }

  return {
    id,
    name: ["First light", "High tide", "The long way", "Moonrise", "Last little leap"][id],
    gravity: v.gravity,
    lines: [
      line(-2, 1, 5, 1, "floor"),
      line(5, 1, 8 + 0.25 * id, 2.2 + 0.1 * id),
      line(8, -3, 20, -3, "floor"),
      ...(id === 2 ? [line(13, 0.3, 15, 1.3), line(15, 1.3, 17, 0.3)] : []),
      ...(id === 3 ? [line(16, -1, 18, 1.1)] : []),
      ...(id === 4 ? [line(11, -2, 13, 0.5), line(13, 0.5, 15, -1)] : []),
      line(20, 1.4, 23, 0.4),
      line(23, 0.4, 25, 0.4, "floor", 0.9),
      line(25, 0.4, 28, 3.4),
      line(28, 3.4, 31, 3.4, "floor"),
    ],
    rings: [],
    goal: { left: 22, right: 26, bottom: 0.35, top: 1.8 },
    solution: { angle: v.angle, strength: v.strength },
    description: [
      "A small push can carry a lovely line.",
      "Find a little more air.",
      "Float past the gap.",
      "Rise, then settle.",
      "Make the final landing count.",
    ][id],
  };
}

/** Allocate an independent ready world and puck using the supplied park geometry. */
export function createRun(park: Park): Run {
  const world = new World(Vec2(0, -park.gravity));
  const ground = world.createBody();

  for (const l of park.lines) {
    ground.createFixture(Edge(Vec2(l.a.x, l.a.y), Vec2(l.b.x, l.b.y)), {
      friction: l.friction ?? 0.2,
      restitution: 0.03,
    });
  }

  const puck = world.createDynamicBody({
    position: Vec2(2, 1.45),
    bullet: true,
    linearDamping: 0.025,
    angularDamping: 0.3,
  });

  puck.createFixture(Circle(0.28), {
    density: 1,
    friction: 0.14,
    restitution: 0.05,
  });

  return {
    world,
    puck,
    park,
    status: "ready",
    time: 0,
    collected: new Set(),
    trail: [],
    rest: 0,
    previous: { x: 2, y: 1.45 },
  };
}

/** Launch a ready run; reject nonfinite/out-of-range controls and ignore repeat launches. */
export function launch(run: Run, angle: number, strength: number) {
  if (run.status !== "ready") {
    return;
  }

  if (
    !Number.isFinite(angle) ||
    !Number.isFinite(strength) ||
    angle < 5 ||
    angle > 70 ||
    strength < 8 ||
    strength > 22
  ) {
    throw new Error("Launch angle or strength is outside the playable range.");
  }

  const rad = (angle * Math.PI) / 180;
  run.puck.setLinearVelocity(Vec2(Math.cos(rad) * strength, Math.sin(rad) * strength));
  run.status = "rolling";
}

/** Distance to the closest point on a closed segment, including a zero-length segment. */
export function pointSegmentDistance(p: XY, a: XY, b: XY) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const d = dx * dx + dy * dy;

  const t = d ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / d)) : 0;

  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function collectRings(run: Run, pos: XY) {
  for (const [i, r] of run.park.rings.entries()) {
    if (pointSegmentDistance(r, run.previous, pos) < 0.65) {
      run.collected.add(i);
    }
  }

  run.previous = pos;
}

function recordTrail(run: Run, pos: XY) {
  if (Math.round(run.time / FIXED_TIME_STEP) % 4 !== 0) {
    return;
  }

  run.trail.push(pos);

  if (run.trail.length > 400) {
    run.trail.shift();
  }
}

function isInGoal(p: XY, g: Park["goal"]) {
  return p.x >= g.left && p.x <= g.right && p.y >= g.bottom && p.y <= g.top;
}

function updateRest(run: Run, pos: XY) {
  if (!isInGoal(pos, run.park.goal)) {
    run.rest = 0;

    return;
  }

  const velocity = run.puck.getLinearVelocity();
  run.puck.setLinearVelocity(Vec2(velocity.x * 0.985, velocity.y));
  const speed = run.puck.getLinearVelocity().length();
  run.rest = speed < 1.5 ? run.rest + FIXED_TIME_STEP : 0;
}

function statusAfterStep(run: Run, p: XY): Status {
  if (run.rest >= 0.3 && run.collected.size === run.park.rings.length) {
    return "landed";
  }

  if (p.y < -4 || p.x < -4 || p.x > 34 || run.time > 12) {
    return "missed";
  }

  return "rolling";
}

/** Advance a rolling run by one fixed step, including collection, rest and terminal state. */
export function step(run: Run) {
  if (run.status !== "rolling") {
    return;
  }

  run.world.step(FIXED_TIME_STEP, 8, 3);
  run.time += FIXED_TIME_STEP;
  const p = run.puck.getPosition();
  const pos = { x: p.x, y: p.y };
  collectRings(run, pos);
  recordTrail(run, pos);
  updateRest(run, pos);
  run.status = statusAfterStep(run, pos);
}

/** Simulate a fresh launch synchronously until terminal state or the bounded step limit. */
export function simulate(park: Park, angle: number, strength: number) {
  const run = createRun(park);
  launch(run, angle, strength);

  for (let i = 0; i < 1442 && run.status === "rolling"; i++) {
    step(run);
  }

  return run;
}

/** Derive three rings per park from its canonical trajectory; return independent layouts. */
export function makeParks(): Park[] {
  return Array.from({ length: 5 }, (_, i) => {
    const p = basePark(i);
    const trajectory = simulate(p, p.solution.angle, p.solution.strength);
    const ringXs = [7, 12.2, 17.5];
    p.rings = ringXs.map((x) =>
      trajectory.trail.reduce((a: XY, b: XY) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)),
    );

    return p;
  });
}

export type ProgressEntry = { angle: number; strength: number; time: number };

export type Progress = Record<number, ProgressEntry>;

const progressEntrySchema = z.object({
  angle: z.number().finite().min(5).max(70),
  strength: z.number().finite().min(8).max(22),
  time: z.number().finite().gt(0).lte(12),
});

const parsedProgressSchema = z.object({
  version: z.literal(1),
  best: z.record(z.string(), progressEntrySchema),
});

/** Decode version-one local scores. Empty input returns no scores; invalid data throws. */
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

    if (!Number.isInteger(id) || id < 0 || id > 4) {
      throw new Error("Invalid saved record.");
    }

    best[id] = entry;
  }

  return best;
}
