import { World, Vec2, Circle, Edge } from "planck";
import type { Body } from "planck";
import type { Park, XY } from "./park-layouts";
import { LAUNCH_ANGLE, PUSH_STRENGTH, MAX_RUN_TIME } from "./rules";

export const FIXED_TIME_STEP = 1 / 120;

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

export function launch(run: Run, angle: number, strength: number) {
  if (run.status !== "ready") {
    return;
  }

  if (
    !Number.isFinite(angle) ||
    !Number.isFinite(strength) ||
    angle < LAUNCH_ANGLE.min ||
    angle > LAUNCH_ANGLE.max ||
    strength < PUSH_STRENGTH.min ||
    strength > PUSH_STRENGTH.max
  ) {
    throw new Error("Launch angle or strength is outside the playable range.");
  }

  const rad = (angle * Math.PI) / 180;
  run.puck.setLinearVelocity(Vec2(Math.cos(rad) * strength, Math.sin(rad) * strength));
  run.status = "rolling";
}

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

  if (p.y < -4 || p.x < -4 || p.x > 34 || run.time > MAX_RUN_TIME) {
    return "missed";
  }

  return "rolling";
}

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

export function simulate(park: Park, angle: number, strength: number) {
  const run = createRun(park);
  launch(run, angle, strength);

  for (
    let i = 0;
    i < Math.ceil(MAX_RUN_TIME / FIXED_TIME_STEP) + 2 && run.status === "rolling";
    i++
  ) {
    step(run);
  }

  return run;
}
