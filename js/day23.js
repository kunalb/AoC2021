import {readLines} from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const costs = {
  "A": 1,
  "B": 10,
  "C": 100,
  "D": 1000,
};

const dests = {
  "A": 3,
  "B": 5,
  "C": 7,
  "D": 9,
}

const lines = [];
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}

if (isPart1) {
  console.log(6 + 2000 + 3 + 3000+ 5000+ 700 + 20 + 500 + 30 + 50 + 3 + 8)
}


const extras = "  #D#C#B#A#\n  #D#B#A#C#".split("\n");

const grid = [];
for (let line of lines) {
  if (line.length < lines[0].length)
    line += "  "
  grid.push(line.split(""))
}

for (let extra of extras) {
  extra += "  ";
  grid.splice(-2, 0, extra.split(""));
}

function printGrid() {
  let prefix = "";
  for (let i = 0; i < grid[0].length; i++) {
    prefix += i.toString(16);
  }
  console.log("  " + prefix);

  let j = 0;
  for (let gridLine of grid) {
    console.log(String(j) + " " + gridLine.join(""));
    j++;
  }
}

function steps(start, end) {
  if (start[0] == end[0]) {
    return Math.abs(start[1] - end[1]);
  }

  return Math.abs(end[1] - 1) + Math.abs(start[1] - 1) + Math.abs(start[0] - end[0]);
}

function move(start, end) {
  let char = grid[start[1]][start[0]];
  if ("ABCD".indexOf(char) == -1)
    throw Error("moving invalid posn!")
  if (grid[end[1]][end[0]] != ".")
    throw Error("target is filled!")
  grid[end[1]][end[0]] = char;
  grid[start[1]][start[0]] = ".";
  return steps(start, end) * costs[char];
}

printGrid();
console.log();

// 1 top 2 right 4 bottom 8 left
let dirs = [ [0, -1], [1, 0], [0, 1], [-1, 0]]
let conns = new Array(grid.length).fill(null).map(_ => new Array(grid[0].length).fill(null).map(_ => []));

for (let y = 0; y < grid.length; y++) {
  for (let x = 0; x < grid[y].length; x++) {
    if (".ABCD".indexOf(grid[y][x]) == -1) continue;

    for (let dir of dirs) {
      let yy = y + dir[1];
      let xx = x + dir[0];
      if (grid[yy] !== undefined && ".ABCD".indexOf(grid[yy][xx]) != -1) {
        conns[y][x] = conns[y][x] || [];
        conns[y][x].push([xx, yy, 1]);
      }
    }
  }
}

// Mark front of hallways as blocked
for (let x = 3; x <= 9; x+=2) {
  const reconnect = conns[1][x];

  // Remove existing connections
  conns[1][x] = [];
  for (let i = 0; i < reconnect.length; i++) {
    let [xx, yy] = reconnect[i];
    conns[yy][xx] = conns[yy][xx].filter(([xxx, yyy]) => (xxx != x || yyy != 1));
  }

  // Add costly connections
  for (let i = 0; i < reconnect.length - 1; i++) {
    for (let j = i + 1; j < reconnect.length; j++) {
      let [x1, y1] = reconnect[i];
      let [x2, y2] = reconnect[j];

      conns[y1][x1].push([x2, y2, 2]);
      conns[y2][x2].push([x1, y1, 2]);
    }
  }
}

function validMoves() {
  const result = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if ("ABCD".indexOf(grid[y][x]) == -1) continue;

      out:
      if (y > 1 && dests[grid[y][x]] == x) {
        for (let b = y; b <= 5; b++) {
          if (grid[b][x] != grid[y][x])
            break out;
        }
        continue;
      }


      const visited = new Set();
      const queue = [[x, y, 0]];
      let cost = 0;

      while (queue.length > 0) {
        const top = queue.shift();
        const key = String(top[0] + "," + top[1]);

        if (visited.has(key))
          continue;
        visited.add(key);

        if ((top[0] != x || top[1] != y)) {
          // Can only move into the hallway or out of the hallway
          let skip = false;

          if (y == 1 && top[1] == 1) skip = true;

          // Can only move into the target column outside the hallway
          if (top[1] != 1 && top[0] != dests[grid[y][x]]) skip = true;

          // Can only move into the target column if it's correctly filled
          if (top[1] != 1) {
            for (let b = top[1] + 1; b <= 5; b++) {
              const pt = grid[b][top[0]];
              if (pt != grid[y][x]) { // Force it to the bottom of the column
                skip = true;
                break;
              }
            }
          }

          if (!skip) {
            move([x, y], [top[0], top[1]]);
            const d = distance();
            move([top[0], top[1]], [x, y]);

            result.push([[x, y], [top[0], top[1]], top[2], d]);
          }
        }

        const children = conns[top[1]][top[0]]
              .filter(([a, b, c]) => grid[b][a] == ".")
              .map(([a, b, c]) => [a, b, c * costs[grid[y][x]] + top[2]]);
        queue.push(...children);
      }
    }
  }

  result.sort((a, b) => ((a[2] + a[3]) - (b[2] + b[3])) || (a[3] - b[3]));
  return result;
}

function printMoves(moves) {
  for (let move of moves) {
    console.log(grid[move[0][1]][move[0][0]] + " | " + move[0] + " -> " + move[1] + " | " + move[2] + "/" + move[3] + "/" + (move[2] + move[3]));
  }
}

function checkSuccess() {
  for (let y = 2; y <= 5; y++) {
    for (let x = 3; x <= 9; x+=2) {
      if (dests[grid[y][x]] != x)
        return false;
    }
  }

  return true;
}

function hash() {
  let key = "";
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if ("ABCD".indexOf(grid[y][x]) != -1)
        key += grid[y][x] + ":" + x + "," + y + ";";
    }
  }

  return key;
}

function distance() {
  let d = 0;
  const ys = {};
  for (let y = 0; y < grid.length; y++) {
    for (let x= 0; x < grid[y].length; x++) {
      const pt = grid[y][x];
      if ("ABCD".indexOf(pt) != -1) {
        d += Math.abs(dests[pt] - x) * costs[pt];
        ys[pt] = ys[pt] || [];
        ys[pt].push(y);
      }
    }
  }

  for (const pt in ys) {
    const ptys = ys[pt];
    ptys.sort((a, b) => a - b);
    d += ptys.map((x, i) => Math.abs(x - i - 2)).reduce((a, b) => a + b) * costs[pt];
  }

  return d;
}

let totalCost = 0;
const active = new Set();
const visited = new Map();
let currentMin = Number.MAX_SAFE_INTEGER;
let path = [];

function cachedBruteForce() {
  const key = hash();
  if (visited.has(key)) {
    return (totalCost + visited.get(key));
  }

  if (active.has(key)) {
    return null;
  }

  active.add(key);
  const initialTotalCost = totalCost;
  const result = bruteForce();
  active.delete(key);
  if (result != null) {
    visited.set(key, result - initialTotalCost);
  }

  return result;
}

function bruteForce() {
  if (totalCost > currentMin) {
    return null; // This path was abandoned, retry later
  }

  if (checkSuccess()) {
    currentMin = Math.min(currentMin, totalCost);
    return totalCost;
  }

  const moves = validMoves();
  if (moves.length == 0) {
    return null; //  Number.MAX_SAFE_INTEGER; // Dead end
  }

  const costs = [];
  for (const m of moves) {
    path.push(m);
    move(m[0], m[1]);
    totalCost += m[2];
    // printGrid();
    // console.log(totalCost);

    const localCost = cachedBruteForce()
    if (localCost !== null)
      costs.push(localCost);

    path.pop(m);
    totalCost -= m[2];
    move(m[1], m[0]);
  }

  return costs.length > 0 ? Math.min(...costs) : null;
}

console.log(cachedBruteForce());
Deno.exit();


totalCost = 0;
const moves = [
  [[9, 2], [11, 1]],
  [[9, 3], [1, 1]],
  [[5, 2], [2, 1]],
  [[5, 3], [10, 1]],
  [[5, 4], [4, 1]],
  [[5, 5], [8, 1]],
  [[4, 1], [5, 5]],
  [[2, 1], [5, 4]],
  [[7, 2], [2, 1]],
  [[7, 3], [5, 3]],
  [[7, 4], [4, 1]],
  [[7, 5], [6, 1]],
  [[8, 1], [7, 5]],
  [[10, 1], [7, 4]],
  [[9, 4], [7, 3]],
  [[9, 5], [10, 1]],
  [[6, 1], [9, 5]],



  // [[9, 2], [11, 1]],
  // [[9, 3], [1, 1]],
  // [[5, 2], [2, 1]],
  // [[5, 3], [10, 1]],
  // [[5, 4], [4, 1]],
  // [[5, 5], [8, 1]],
  // [[4, 1], [5, 5]],
  // [[2, 1], [5, 4]],
  // [[7, 2], [2, 1]],
  // [[7, 3], [5, 3]],
  // [[7, 4], [4, 1]],
  // [[7, 5], [6, 1]],
  // [[8, 1], [7, 5]],
  // [[10, 1], [7, 4]],

  // [[7, 2], [1, 1]],
  // [[7, 3], [2, 1]],
  // [[7, 4], [11, 1]],
  // [[7, 5], [10, 1]],
  // [[3, 2], [7, 5]],
  // [[5, 2], [8, 1]],
  // [[5, 3], [7, 4]],
  // [[5, 4], [4, 1]],
  // [[5, 5], [7, 3]],
  // [[4, 1], [5, 5]],
  // [[2, 1], [5, 4]],
  // [[8, 1], [5, 3]],
];
for (let m of moves) {
  let cost = move(m[0], m[1]);
  totalCost += cost
  printGrid(grid);
  console.log(m);
  console.log(`${String(cost).padStart(4, '0')} (${String(totalCost).padStart(8, '0')})`);
  console.log();
}
printMoves(validMoves());



// #############
// #...........#
// ###C#B#A#D###
//   #B#C#D#A#
//   #########

// 6
// #############
// #.A.........#
// ###C#B#.#D###
//   #B#C#D#A#
//   #########

// 2000
// #############
// #A......D...#
// ###C#B#.#.###
//   #B#C#D#A#
//   #########

// 3
// #############
// #.A.....D.A.#
// ###C#B#.#.###
//   #B#C#D#.#
//   #########

// 3000
// #############
// #.A.......A.#
// ###C#B#.#.###
//   #B#C#D#D#
//   #########

// 5000
// #############
// #AA.........#
// ###C#B#.#D###
//   #B#C#.#D#
//   #########

// 700
// #############
// #.A.......A.#
// ###.#B#.#D###
//   #B#C#C#D#
//   #########

// 20
// #############
// #.A.B.....A.#
// ###.#.#.#D###
//   #B#C#C#D#
//   #########

// 500
// #############
// #.A.B.....A.#
// ###.#.#C#D###
//   #B#.#C#D#
//   #########

// 30
// #############
// #.A.......A.#
// ###.#.#C#D###
//   #B#B#C#D#
//   #########

// 50
// #############
// #.A.......A.#
// ###.#B#C#D###
//   #.#B#C#D#
//   #########

// 3
// #############
// #.........A.#
// ###.#B#C#D###
//   #A#B#C#D#
//   #########

// 8
// #############
// #...........#
// ###A#B#C#D###
//   #A#B#C#D#
//   #########
