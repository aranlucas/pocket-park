import { describe, it, expect } from "vitest";
import {
  basePark,
  createRun,
  launch,
  makeParks,
  pointSegmentDistance,
  readProgress,
  simulate,
  step,
} from "@/physics.ts";

describe("physics", () => {
  it("fixed-step Planck simulation reaches actual landing on all five parks", () => {
    for (const p of makeParks()) {
      const r = simulate(p, p.solution.angle, p.solution.strength);
      expect(r.status).toBe("landed");
      expect(r.collected.size).toBe(3);
    }
  });

  it("identical controls yield identical trajectories and scores", () => {
    const p = makeParks()[0];

    const a = simulate(p, 24, 14);
    const b = simulate(p, 24, 14);

    expect(a.time).toBe(b.time);
    expect(a.trail).toEqual(b.trail);
  });

  it("bad line misses rather than falsely completing", () => {
    expect(simulate(makeParks()[0], 70, 8).status).toBe("missed");
  });

  it("rings use swept distance so fast frames cannot tunnel", () => {
    expect(pointSegmentDistance({ x: 5, y: 1 }, { x: 0, y: 1 }, { x: 10, y: 1 })).toBe(0);
    expect(pointSegmentDistance({ x: 15, y: 1 }, { x: 0, y: 1 }, { x: 10, y: 1 })).toBe(5);
  });

  it("launch validation and ready state guard reject corrupt input", () => {
    const r = createRun(basePark(0));
    expect(() => launch(r, NaN, 14)).toThrow();
    expect(() => launch(r, 90, 14)).toThrow();
    launch(r, 24, 14);
    const v = r.puck.getLinearVelocity().clone();
    launch(r, 32, 16);
    expect(r.puck.getLinearVelocity().x).toBe(v.x);
  });

  it("finished simulations stop mutating", () => {
    const r = simulate(makeParks()[0], 24, 14);
    const t = r.time;
    step(r);
    expect(r.time).toBe(t);
  });

  it("progress restore validates schema and every saved score", () => {
    expect(readProgress(null)).toEqual({});
    expect(() => readProgress("bad")).toThrow();
    expect(() =>
      readProgress('{"version":1,"best":{"6":{"angle":24,"strength":14,"time":2}}}'),
    ).toThrow();
    expect(readProgress('{"version":1,"best":{"0":{"angle":24,"strength":14,"time":2}}}')).toEqual({
      0: { angle: 24, strength: 14, time: 2 },
    });
  });
});
