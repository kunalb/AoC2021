import { readLines } from "https://deno.land/std/io/mod.ts";
import { assert } from "https://deno.land/std@0.117.0/testing/asserts.ts";

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l);
}

function parseRange(val) {
  const pieces = val.split(",");
  return pieces.map((piece) => piece.split("=")).map(
    (x) => {
      return {
        "axis": x[0],
        "range": x[1].split("..").map((y) => parseInt(y, 10)),
      };
    },
  );
}

let steps = lines.map((line) => line.split(" "))
  .map((x) => {
    return { "action": x[0], "ranges": parseRange(x[1]) };
  });

class Cuboid {
  constructor(...d) { // [x0, x1], [y0, y1], [z0, z1]
    this.d = d;
  }

  combine(c) {
    let overlaps = [];
    for (let i = 0; i < 3; i++) {
      overlaps.push(overlap(this.d[i], c.d[i]));
    }

    let cuboids = [];
    for (let x = 0; x < overlaps[0].length; x++) {
      for (let y = 0; y < overlaps[1].length; y++) {
        for (let z = 0; z < overlaps[2].length; z++) {
          cuboids.push(
            new Cuboid(
              [...overlaps[0][x]],
              [...overlaps[1][y]],
              [...overlaps[2][z]],
            ),
          );
        }
      }
    }

    let result = { intersection: [], a: [], b: [] };
    for (let cuboid of cuboids) {
      let inThis = this.contains(cuboid);
      let inC = c.contains(cuboid);
      if (inThis && inC) {
        result.intersection.push(cuboid);
      } else if (inThis) {
        result.a.push(cuboid);
      } else if (inC) {
        result.b.push(cuboid);
      }
    }

    result.intersection = cube_reduce(result.intersection);
    result.a = cube_reduce(result.a);
    result.b = cube_reduce(result.b);

    return result;
  }

  contains(c) {
    for (let i = 0; i < 3; i++) {
      if (!(this.d[i][0] <= c.d[i][0] && this.d[i][1] >= c.d[i][1])) {
        return false;
      }
    }
    return true;
  }

  size() {
    let s = 1;
    for (let i = 0; i < 3; i++) {
      s *= this.d[i][1] - this.d[i][0];
    }
    return s;
    // return this.d.map(x => x[1] - x[0] + 1).reduce((a, b) => a * b, 1);
  }
}

function cube_reduce2(cuboids) {
  let changed;
  do {
    changed = false;
    for (let i = 0; i < 3; i++) {
      let index = new Map();
      for (let cuboid of cuboids) {
        if (cuboid.d == null) continue;
        let key = cuboid.d.filter((_, j) => j != i).join(",");
        let current = index.get(key) || [];
        current.push(cuboid);
        index.set(key, current);
      }

      for (let [_, choices] of index) {
        if (choices.length < 2) continue;
        for (let a = 0; a < choices.length; a++) {
          for (let b = 0; b < choices.length; b++) {
            if (a == b || choices[a].d == null || choices[b].d == null) continue;

            if (choices[a].d[i][1] == choices[b].d[i][0]) {
              changed = true;
              choices[a].d[i][1] = choices[b].d[i][1];
              choices[b].d = null;
            }
          }
        }
      }
    }
  } while (changed);

  return cuboids.filter(x => x.d != null);
}

function cube_reduce(cuboids) {
  return cube_reduce2(cuboids);

  let changed;
  do {
    changed = false;
    out:
    for (let i = 0; i < 3; i++) {
      for (let a = 0; a < cuboids.length; a++) {
        for (let b = 0; b < cuboids.length; b++) {
          if (a == b) continue;

          let ca = cuboids[a];
          let cb = cuboids[b];
          if (
            ca.d[i][1] == cb.d[i][0] &&
            ca.d.every((aa, j) =>
              j == i || aa[0] == cb.d[j][0] && aa[1] == cb.d[j][1]
            )
          ) {
            ca.d[i][1] = cb.d[i][1];

            cuboids.splice(b, 1);
            changed = true;
            break out;
          }
        }
      }
    }
  } while (changed);
}

function cube(dim) {
  return new Cuboid(dim, dim, dim);
}

function overlap(as, bs) {
  let pieces = [...as, ...bs];
  pieces.sort((a, b) => a - b);
  let uniquePieces = [];
  for (let piece of pieces) {
    if (
      uniquePieces.length == 0 || piece != uniquePieces[uniquePieces.length - 1]
    ) {
      uniquePieces.push(piece);
    }
  }

  let segments = [];
  for (let i = 0; i < uniquePieces.length - 1; i++) {
    segments.push([
      uniquePieces[i],
      uniquePieces[i + 1],
    ]);
  }

  return segments;
}

// let a = cube([0, 10]);
// let b = cube([-10, -1]);
// let res = a.combine(b);
// console.log(JSON.stringify(res));

let lights = [];
for (let step of steps) {
  console.log(step.action);
  let current = new Cuboid(
    ...step.ranges.map((r) => [r.range[0], r.range[1] + 1]),
  );
  let nextLights = [];

  if (step.action == "on") {
    if (lights.length == 0) {
      nextLights.push(current);
    } else {
      let active = [current];
      for (let i = 0; i < lights.length; i++) {
        let nextActive = [];
        for (let j = 0; j < active.length; j++) {
          let results = lights[i].combine(active[j]);
          nextLights = nextLights.concat(results.a);
          nextLights = nextLights.concat(results.intersection);
          nextActive = nextActive.concat(results.b);
        }
        active = nextActive;
      }
      nextLights = nextLights.concat(active);
    }
  } else {
    for (let i = 0; i < lights.length; i++) {
      let results = lights[i].combine(current);
      nextLights = nextLights.concat(results.a); // Subtract the cube from all active cubes
    }
  }

  nextLights = cube_reduce(nextLights);
  lights = nextLights;
}

console.log(lights.map((l) => l.size()).reduce((a, b) => (a + b), 0));
