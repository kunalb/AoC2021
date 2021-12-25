import {readLines} from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

let floor = [];
for await (const l of readLines(Deno.stdin)) {
  floor.push(l.split(""));
}

let step = 0;
let changed;

function pt(floor, x, y) {
  y = y % floor.length;
  x = x % floor[y].length;
  return floor[y][x];
}

function pts(floor, x, y, val) {
  let orig = pt(floor, x, y);
  y = y % floor.length;
  x = x % floor[y].length;
  floor[y][x] = val;
  return orig;
}

function print() {
  for (let line of floor) {
    console.log(line.join(""));
  }
}

let nextFloor = new Array(floor.length).fill(null).map(
  _ => new Array(floor[0].length).fill(null)
);

do {
  changed = false;
  step += 1;

  for (let y = 0; y < floor.length; y++) {
    for (let x = 0; x < floor[y].length; x++) {
      nextFloor[y][x] = floor[y][x];
    }
  }

  for (let y = 0; y < floor.length; y++) {
    for (let x = 0; x < floor[y].length; x++) {
      if (pt(floor, x, y) == '>' && pt(floor, x + 1, y) == '.') {
        pts(nextFloor, x + 1, y, '>');
        pts(nextFloor, x, y, '.');
        changed = true;
      }
    }
  }

  for (let y = 0; y < floor.length; y++) {
    for (let x = 0; x < floor[y].length; x++) {
      floor[y][x] = nextFloor[y][x];
    }
  }

  for (let y = 0; y < floor.length; y++) {
    for (let x = 0; x < floor[y].length; x++) {
      if (pt(nextFloor, x, y) == 'v' && pt(nextFloor, x, y + 1) == '.') {
        pts(floor, x, y + 1, 'v');
        pts(floor, x, y, '.');
        changed = true;
      }
    }
  }
} while (changed);


console.log(step);
