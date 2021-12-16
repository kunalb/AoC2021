import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

let grid = [];
for await (const l of readLines(Deno.stdin)) {
  grid.push(l.split("").map((x) => parseInt(x, 10)));
}

if (!isPart1) {
  const X = grid[0].length;
  const Y = grid.length;
  const grid2 = new Array(Y * 5).fill(0).map(() => new Array(X * 5).fill(0));
  for (let yy = 0; yy < 5; yy++) {
    for (let xx = 0; xx < 5; xx++) {
      const xOff = xx * X;
      const yOff = yy * Y;
      for (let y = 0; y < Y; y++) {
        for (let x = 0; x < X; x++) {
          const res = grid[y][x] + xx + yy;
          grid2[yOff + y][xOff + x] = (res >= 10) ? res - 9 : res;
        }
      }
    }
  }
  grid = grid2;
}

function djikstras(grid) {
  const X = grid[0].length;
  const Y = grid.length;

  let table = new Array(Y).fill(0).map(() =>
    new Array(X).fill(Number.MAX_SAFE_INTEGER)
  );
  table[0][0] = 0;
  let visited = new Array(Y).fill(0).map(() => new Array(X).fill(false));
  let current = [0, 0];

  let ds = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (!visited[Y - 1][X - 1]) {
    let [x, y] = current;
    for (let [dx, dy] of ds) {
      let xx = x + dx;
      let yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= X || yy >= Y || visited[yy][xx]) {
        continue;
      }

      const curDist = table[y][x] + grid[yy][xx];
      if (table[yy][xx] > curDist) {
        table[yy][xx] = curDist;
      }
    }
    visited[y][x] = true;

    let best = Number.MAX_SAFE_INTEGER;
    for (let y = 0; y < Y; y++) {
      for (let x = 0; x < X; x++) {
        if (!visited[y][x] && table[y][x] < best) {
          best = table[y][x];
          current = [x, y];
        }
      }
    }
  }

  return table[Y - 1][X - 1];
}

console.log(djikstras(grid));
