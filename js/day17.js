import { readPacket, readString } from "./packets.js";
import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l);
}

let input = lines[0].substr("target area: ".length);
let [xrange, yrange] = input.split(", ");
xrange = xrange.split("=")[1].split("..").map((x) => parseInt(x, 10));
yrange = yrange.split("=")[1].split("..").map((y) => parseInt(y, 10));
console.log(xrange, yrange);

// xrange = [20, 30];
// yrange = [-10, -5];

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

let maxy = 0;
let total = 0;
let vels = new Set();

for (let vx = 0; vx <= xrange[1]; vx++) {
  for (let vy = -2000; vy <= 2000; vy++) {
    let local_maxy = 0;
    for (let [x, y] of trajectory(vx, vy)) {
      if (local_maxy < y) {
        local_maxy = y;
      }

      if (testPoint(x, y)) {
        vels.add(`${vx},${vy}`);
        if (local_maxy > maxy) {
          maxy = local_maxy;
        }
      }

      if (exceeded(vx, vy, x, y)) {
        break;
      }
    }
  }
}

console.log(maxy, vels.size);
