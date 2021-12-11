import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const grid = [];
for await (const l of readLines(Deno.stdin)) {
  grid.push(l.split("").map((x) => parseInt(x, 10)));
}

function* border(x, y) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dy == 0 && dx == 0) {
        continue;
      }

      yield [x + dx, y + dy];
    }
  }
}

let flashes = 0;
let step = 0;
while (true) {
  grid.forEach((row, y) => row.forEach((_, x) => grid[y][x] += 1));

  let changed;
  do {
    changed = false;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] > 9) {
          changed = true;
          grid[y][x] = -1;

          for (const [xx, yy] of border(x, y)) {
            if (
              grid[yy] !== undefined &&
              grid[yy][xx] !== undefined &&
              grid[yy][xx] != -1
            ) {
              grid[yy][xx]++;
            }
          }
        }
      }
    }
  } while (changed);

  let stepFlashes = 0;
  grid.forEach((row, y) =>
    row.forEach((_, x) => {
      if (grid[y][x] == -1) {
        stepFlashes++;
        grid[y][x] = 0;
      }
    })
  );

  flashes += stepFlashes;

  step++;

  if (step == 100 && isPart1) {
    console.log(flashes);
    break;
  }

  if (stepFlashes == grid.length * grid[0].length) {
    console.log(step);
    break;
  }
}
