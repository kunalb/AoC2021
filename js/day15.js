import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l.split("").map((x) => parseInt(x, 10)));
}

let x = 0;
let y = 0;
let X = lines[0].length;
let Y = lines.length;

let cache = new Map();
let visited = new Set();

/*
function leastRisk(x1, y1) {
  let key = `${x1}:${y1}`;

  if (cache.has(key)) {
    return cache.get(key);
  }

  if (x1 == X - 1 && y1 == Y - 1) {
    return lines[y1][x1];
  }

  let options = [];
  let pts = [
    [x1 -1 , y1],
    [x1 + 1, y1],
    [x1, y1 -1 ],
    [x1, y1 + 1],
  ]

  for (let pt of pts) {
    let ptKey = `${pt[0]}:${pt[1]}`;
    if (visited.has(ptKey)) {
      continue;
    }

    if (pt[0] >= 0 && pt[0] < X && pt[1] >= 0 && pt[1] < Y) {
      options.push(lines[pt[1]][pt[0]] + leastRisk(pt[0], pt[1]));
    }
  }

  let result = Math.min.apply(null, options);
  cache.set(key, result);
  return result;
}
*/

function dp(grid) {
  let X = grid[0].length;
  let Y = grid.length;

  let table = new Array(Y).fill(0).map(() => new Array(X).fill(0));
  let path = new Array(Y).fill(0).map(() => new Array(X).fill(null));

  table[0][0] = 0;
  path[0][0] = [[0, 0]];
  for (let x = 1; x < X; x++) {
    table[0][x] = table[0][x - 1] + grid[0][x];
    path[0][x] = [...path[0][x - 1], [x, 0]];
  }
  for (let y = 1; y < Y; y++) {
    table[y][0] = table[y - 1][0] + grid[y][0];
    path[y][0] = [...path[y - 1][0], [0, y]];
  }

  for (let y = 1; y < Y; y++) {
    for (let x = 1; x < X; x++) {
      table[y][x] = grid[y][x] + Math.min(
        table[y - 1][x],
        table[y][x - 1],
      );

      if (table[y - 1][x] < table[y][x - 1]) {
        path[y][x] = [...path[y - 1][x], [x, y]];
      } else {
        path[y][x] = [...path[y][x - 1], [x, y]];
      }
    }
  }

  return [table[Y - 1][X - 1], path[Y - 1][X - 1]];
}

let grid = lines;
let grid2 = new Array(Y * 5).fill(0).map(() => new Array(X * 5).fill(0));
for (let yy = 0; yy < 5; yy++) {
  for (let xx = 0; xx < 5; xx++) {
    let xOff = xx * X;
    let yOff = yy * Y;
    for (let y = 0; y < Y; y++) {
      for (let x = 0; x < X; x++) {
        let res = grid[y][x] + xx + yy;
        grid2[yOff + y][xOff + x] = (res >= 10) ? res - 9 : res;
      }
    }
  }
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
      if (xx < 0 || yy < 0 || xx >= X || yy >= Y) {
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
        if (!visited[y][x]) {
          if (table[y][x] < best) {
            best = table[y][x];
            current = [x, y];
          }
        }
      }
    }
  }

  return table[Y - 1][X - 1];
}

grid = isPart1 ? grid : grid2;
// let [res, path] = dp(grid);
// for (let y in grid) {
//   let row = grid[y];
//   for (let xx of path.filter(([xx, yy]) => yy == y).map(([xx, yy]) => xx)) {
//     row[xx] = ".";
//   }
//   console.log(row.join(""));
// }
console.log(djikstras(grid));
