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

const line = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  color: "ramp" | "floor" = "ramp",
  friction = 0.2,
): Line => ({ a: { x: ax, y: ay }, b: { x: bx, y: by }, color, friction });

const PARK_LAYOUTS = [
  {
    name: "First light",
    angle: 24,
    strength: 14,
    gravity: 7.5,
    obstacles: [],
    description: "A small push can carry a lovely line.",
  },
  {
    name: "High tide",
    angle: 28,
    strength: 13.4,
    gravity: 7.5,
    obstacles: [],
    description: "Find a little more air.",
  },
  {
    name: "The long way",
    angle: 32,
    strength: 13,
    gravity: 8,
    obstacles: [line(13, 0.3, 15, 1.3), line(15, 1.3, 17, 0.3)],
    description: "Float past the gap.",
  },
  {
    name: "Moonrise",
    angle: 36,
    strength: 13.4,
    gravity: 8.5,
    obstacles: [line(16, -1, 18, 1.1)],
    description: "Rise, then settle.",
  },
  {
    name: "Last little leap",
    angle: 40,
    strength: 13.6,
    gravity: 9,
    obstacles: [line(11, -2, 13, 0.5), line(13, 0.5, 15, -1)],
    description: "Make the final landing count.",
  },
];

export const PARK_COUNT = PARK_LAYOUTS.length;

export function basePark(id: number): Park {
  const v = PARK_LAYOUTS[id];

  if (!v) {
    throw new Error("Unknown park.");
  }

  return {
    id,
    name: v.name,
    gravity: v.gravity,
    lines: [
      line(-2, 1, 5, 1, "floor"),
      line(5, 1, 8 + 0.25 * id, 2.2 + 0.1 * id),
      line(8, -3, 20, -3, "floor"),
      ...v.obstacles.map((obstacle) => ({
        ...obstacle,
        a: { ...obstacle.a },
        b: { ...obstacle.b },
      })),
      line(20, 1.4, 23, 0.4),
      line(23, 0.4, 25, 0.4, "floor", 0.9),
      line(25, 0.4, 28, 3.4),
      line(28, 3.4, 31, 3.4, "floor"),
    ],
    rings: [],
    goal: { left: 22, right: 26, bottom: 0.35, top: 1.8 },
    solution: { angle: v.angle, strength: v.strength },
    description: v.description,
  };
}
