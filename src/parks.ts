import { basePark, PARK_COUNT } from "./park-layouts";
import type { Park, XY } from "./park-layouts";
import { simulate } from "./physics";

export function makeParks(): Park[] {
  return Array.from({ length: PARK_COUNT }, (_, i) => {
    const p = basePark(i);
    const trajectory = simulate(p, p.solution.angle, p.solution.strength);
    const ringXs = [7, 12.2, 17.5];
    p.rings = ringXs.map((x) =>
      trajectory.trail.reduce((a: XY, b: XY) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)),
    );

    return p;
  });
}
