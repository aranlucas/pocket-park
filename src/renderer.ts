import type { Run, XY } from "./physics";
const W = 960,
  H = 450;
const x = (p: number) => (p + 1) * 30,
  y = (p: number) => H - 85 - p * 30;
function star(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 ? r * 0.45 : r;
    const px = cx + Math.cos(a) * radius,
      py = cy + Math.sin(a) * radius;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
export function render(
  ctx: CanvasRenderingContext2D,
  run: Run,
  preview: XY[] = [],
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#443678";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#594988";
  for (const [cx, cy, r] of [
    [90, 70, 70],
    [730, 110, 55],
    [360, 32, 18],
  ]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#a093bd";
  for (let i = 0; i < 26; i++) {
    const cx = (i * 127 + 31) % W,
      cy = (i * 83 + 11) % 230;
    ctx.beginPath();
    ctx.arc(cx, cy, i % 4 === 0 ? 2 : 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#362c62";
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let i = 0; i < 17; i++) ctx.lineTo(i * 64, 295 - (i % 3) * 22);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  // These polygons depict the same line fixtures used by the simulation.
  for (const l of run.park.lines) {
    ctx.fillStyle = l.color === "ramp" ? "#817491" : "#948895";
    ctx.beginPath();
    ctx.moveTo(x(l.a.x), y(l.a.y));
    ctx.lineTo(x(l.b.x), y(l.b.y));
    ctx.lineTo(x(l.b.x), H + 5);
    ctx.lineTo(x(l.a.x), H + 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = l.color === "ramp" ? "#f59383" : "#fff2c6";
    ctx.lineWidth = 10;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(x(l.a.x), y(l.a.y));
    ctx.lineTo(x(l.b.x), y(l.b.y));
    ctx.stroke();
  }
  const path = run.trail.length ? run.trail : preview;
  ctx.strokeStyle = run.trail.length ? "#fff2c6" : "#b9aed0";
  ctx.globalAlpha = run.trail.length ? 0.7 : 0.5;
  ctx.lineWidth = 1.5;
  ctx.setLineDash(run.trail.length ? [] : [5, 6]);
  ctx.beginPath();
  path.forEach((p, i) =>
    i ? ctx.lineTo(x(p.x), y(p.y)) : ctx.moveTo(x(p.x), y(p.y)),
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  run.park.rings.forEach((r, i) => {
    const done = run.collected.has(i),
      cx = x(r.x),
      cy = y(r.y);
    ctx.strokeStyle = done ? "#fff2c6" : "#a5d5be";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = done ? "#fff2c6" : "#a5d5be";
    star(ctx, cx, cy, 8);
  });
  const goalX = x(24),
    goalY = y(0.75);
  ctx.strokeStyle = "#d7ccef";
  ctx.lineWidth = 1.5;
  for (const [rx, ry] of [
    [24, 5],
    [16, 3],
  ]) {
    ctx.beginPath();
    ctx.ellipse(goalX, goalY, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "#fff2c6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x(28.5), y(3.4));
  ctx.lineTo(x(28.5), y(5.4));
  ctx.stroke();
  ctx.fillStyle = "#f59383";
  ctx.beginPath();
  ctx.moveTo(x(28.5), y(5.4));
  ctx.lineTo(x(29.8), y(4.9));
  ctx.lineTo(x(28.5), y(4.4));
  ctx.closePath();
  ctx.fill();
  const p = run.puck.getPosition(),
    cx = x(p.x),
    cy = y(p.y);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-run.puck.getAngle());
  ctx.fillStyle = "#fff2c6";
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f2ca65";
  ctx.beginPath();
  ctx.arc(-1, -2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#30244f";
  for (const dx of [-6, 6]) {
    ctx.beginPath();
    ctx.arc(dx, 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b8a8d1";
    ctx.beginPath();
    ctx.arc(dx, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#30244f";
  }
  ctx.restore();
}
