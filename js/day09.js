import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l.split("").map((x) => parseInt(x, 10)));
}

function* surrounding(x, y) {
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const xx = x + dx;
    const yy = y + dy;
    if (xx >= 0 && xx < lines[y].length && yy >= 0 && yy < lines.length) {
      yield [xx, yy];
    }
  }
}

const points = [];
for (let y = 0; y < lines.length; y++) {
  marker:
  for (let x = 0; x < lines[y].length; x++) {
    for (const [xx, yy] of surrounding(x, y)) {
      if (lines[yy][xx] <= lines[y][x]) {
        continue marker;
      }
    }

    points.push([x, y]);
  }
}

if (isPart1) {
  console.log(points.map(([x, y]) => lines[y][x] + 1).reduce((a, b) => a + b));
  Deno.exit();
}

const basins = [];
for (const point of points) {
  const basin = new Set();
  const queue = [point];
  while (queue.length) {
    const [x, y] = queue.pop();
    const key = `${x}:${y}`;
    if (basin.has(key)) {
      continue;
    }
    basin.add(key);

    for (const [xx, yy] of surrounding(x, y)) {
      if (lines[yy][xx] > lines[y][x] && lines[yy][xx] != 9) {
        queue.push([xx, yy]);
      }
    }
  }

  basins.push(basin.size);
}

basins.sort((a, b) => b - a);
console.log(basins.slice(0, 3).reduce((a, b) => a * b, 1));
