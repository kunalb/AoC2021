import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

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

if (isPart1) {
  let on = {};
  for (let step of steps) {
    for (let x = step.ranges[0].range[0]; x <= step.ranges[0].range[1]; x++) {
      if (x < -50 || x > 50) {
        continue;
      }
      for (let y = step.ranges[1].range[0]; y <= step.ranges[1].range[1]; y++) {
        if (y < -50 || y > 50) {
          continue;
        }
        for (
          let z = step.ranges[2].range[0];
          z <= step.ranges[2].range[1];
          z++
        ) {
          if (isPart1 && (z < -50 || z > 50)) {
            continue;
          }
          let key = `${x},${y},${z}`;
          if (step.action == "on") {
            on[key] = true;
          } else {
            delete on[key];
          }
        }
      }
    }
  }

  console.log(Object.keys(on).length);
  Deno.exit();
}

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

    result.intersection = cubeReduce(result.intersection);
    result.a = cubeReduce(result.a);
    result.b = cubeReduce(result.b);

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

function cubeReduce(cuboids) {
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
            if (a == b || choices[a].d == null || choices[b].d == null) {
              continue;
            }

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

  return cuboids.filter((x) => x.d != null);
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
for (const step of steps) {
  const current = new Cuboid(
    ...step.ranges.map((r) => [r.range[0], r.range[1] + 1]),
  );
  // if (lights.length <= 100) console.log(lights);
  // console.log(step.action, lights.length, "+", current);

  let nextLights = [];

  if (step.action == "on") {
    let active = [current];
    for (let i = 0; i < lights.length; i++) {
      const nextActive = [];
      nextLights.push(lights[i]);
      for (let j = 0; j < active.length; j++) {
        const results = lights[i].combine(active[j]);
        nextActive.push(...results.b);
      }
      active = nextActive;
    }
    nextLights.push(...active);
  } else {
    for (let i = 0; i < lights.length; i++) {
      const results = lights[i].combine(current);
      nextLights.push(...results.a); // Subtract the cube from all active cubes
    }
  }

  nextLights = cubeReduce(nextLights);
  lights = nextLights;
}
// console.log(lights);
console.log(lights.map((l) => l.size()).reduce((a, b) => (a + b), 0));
