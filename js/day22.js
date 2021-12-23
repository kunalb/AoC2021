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

let on = {};
for (let step of steps) {
  for (let x = step.ranges[0].range[0]; x <= step.ranges[0].range[1]; x++) {
    if (isPart1 && (x < -50 || x > 50)) {
      continue;
    }
    for (let y = step.ranges[1].range[0]; y <= step.ranges[1].range[1]; y++) {
      if (isPart1 && (y < -50 || y > 50)) {
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
