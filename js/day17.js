import { readPacket, readString } from "./packets.js";
import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l);
}

const input = lines[0].substr("target area: ".length);
let [xrange, yrange] = input.split(", ");
xrange = xrange.split("=")[1].split("..").map((x) => parseInt(x, 10));
yrange = yrange.split("=")[1].split("..").map((y) => parseInt(y, 10));

function testPoint(x, y) {
  return x >= xrange[0] && x <= xrange[1] && y >= yrange[0] && y <= yrange[1];
}

function exceeded(vx, vy, x, y) {
  if (vx >= 0 && x > xrange[0] && x > xrange[1]) {
    return true;
  }

  if (vx <= 0 && x < xrange[0] && x < xrange[1]) {
    return true;
  }

  return y < yrange[0] && y < yrange[1];
}

function* trajectory(vx, vy) {
  let x = 0;
  let y = 0;
  while (true) {
    yield [x, y];
    x += vx;
    y += vy;
    if (vx > 0) vx--;
    else if (vx < 0) vx++;
    vy--;
  }
}

let maxY = 0;
const vels = new Set();

// Only works for positive x
for (let vx = 0; vx <= xrange[1]; vx++) {
  for (let vy = Math.min(...yrange); vy <= 2000; vy++) {
    let localMaxY = 0;
    for (const [x, y] of trajectory(vx, vy)) {
      if (localMaxY < y) {
        localMaxY = y;
      }

      if (testPoint(x, y)) {
        vels.add(`${vx},${vy}`);
        if (localMaxY > maxY) {
          maxY = localMaxY;
        }
      }

      if (exceeded(vx, vy, x, y)) {
        break;
      }
    }
  }
}

if (isPart1) {
  console.log(maxY);
} else {
  console.log(vels.size);
}
