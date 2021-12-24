import {readLines} from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}

function parseRange(val) {
  const pieces = val.split(",");
  return pieces.map((piece) => piece.split("=")).map(
    (x) => x[1].split("..").map((y) => parseInt(y, 10))
  );
}

let steps = lines.map((line) => line.split(" "))
  .map((x) => {
    return { "action": x[0], "ranges": parseRange(x[1]) };
  });

class Node {
  constructor(center) {
    this.center = center;
    this.children = new Array(8).fill(null);
  }
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
  }
}


class OctTree {
  constructor() {
    this.root = new Node([0, 0, 0]);
  }

  static identifyQuadrant(point, cuboid) {
    if (point.some((p, i) => cuboid.d[i][0] <= p && p <= cuboid.d[i][1]))
      return -1;

  }

  switchOn(cuboid) {
  }

  switchOff(cuboid) {
  }

  size() {
  }
}

let tree = new OctTree();
for (let step of steps.slice(0, 2)) {
  let cuboid = new Cuboid(...step.ranges);
  console.log(step.action, cuboid);
  if (step.action == "on") {
    tree.switchOn(cuboid);
  } else {
    tree.switchOff(cuboid);
  }
  console.log(tree);
}
