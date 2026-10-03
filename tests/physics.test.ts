import test from "node:test";
import assert from "node:assert/strict";
import {
  basePark,
  createRun,
  launch,
  makeParks,
  pointSegmentDistance,
  readProgress,
  simulate,
  step,
} from "../src/physics.ts";

test("fixed-step Planck simulation reaches actual landing on all five parks", () => {
  for (const p of makeParks()) {
    const r = simulate(p, p.solution.angle, p.solution.strength);
    assert.equal(
      r.status,
      "landed",
      `Park ${p.id}: puck ${r.puck.getPosition().x}, ${r.puck.getPosition().y}, time ${r.time}, rings ${r.collected.size}`,
    );
    assert.equal(r.collected.size, 3);
  }
});

test("identical controls yield identical trajectories and scores", () => {
  const p = makeParks()[0];

  const a = simulate(p, 24, 14),
    b = simulate(p, 24, 14);

  assert.equal(a.time, b.time);
  assert.deepEqual(a.trail, b.trail);
});

test("bad line misses rather than falsely completing", () => {
  assert.equal(simulate(makeParks()[0], 70, 8).status, "missed");
});

test("rings use swept distance so fast frames cannot tunnel", () => {
  assert.equal(
    pointSegmentDistance({ x: 5, y: 1 }, { x: 0, y: 1 }, { x: 10, y: 1 }),
    0,
  );
  assert.equal(
    pointSegmentDistance({ x: 15, y: 1 }, { x: 0, y: 1 }, { x: 10, y: 1 }),
    5,
  );
});

test("launch validation and ready state guard reject corrupt input", () => {
  const r = createRun(basePark(0));
  assert.throws(() => launch(r, NaN, 14));
  assert.throws(() => launch(r, 90, 14));
  launch(r, 24, 14);
  const v = r.puck.getLinearVelocity().clone();
  launch(r, 32, 16);
  assert.equal(r.puck.getLinearVelocity().x, v.x);
});

test("finished simulations stop mutating", () => {
  const r = simulate(makeParks()[0], 24, 14);
  const t = r.time;
  step(r);
  assert.equal(r.time, t);
});

test("progress restore validates schema and every saved score", () => {
  assert.deepEqual(readProgress(null), {});
  assert.throws(() => readProgress("bad"));
  assert.throws(() =>
    readProgress(
      '{"version":1,"best":{"6":{"angle":24,"strength":14,"time":2}}}',
    ),
  );
  assert.deepEqual(
    readProgress(
      '{"version":1,"best":{"0":{"angle":24,"strength":14,"time":2}}}',
    ),
    { 0: { angle: 24, strength: 14, time: 2 } },
  );
});
