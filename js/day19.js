import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");
const scans = [];

for await (const l of readLines(Deno.stdin)) {
  if (l.startsWith("---")) {
    scans.push([]);
  } else if (l.trim() != "") {
    scans[scans.length - 1].push(JSON.parse("[" + l + "]"));
  }
}

// no knowledge of position
// input =
// 1000 units along axis
// 12 beacons

function normDistance(d) {
  d = d.map(Math.abs);
  let maxIndexes = d.map((x, i) => [x, i]).sort((a, b) => (a[0] - b[0]));
  let maxIndex = maxIndexes[0][1];

  let rotated = [];
  for (let i = 0; i < 3; i++) {
    rotated.push(d[(maxIndex + i) % 3]);
  }
  return rotated;
}

let beaconPairs = {};
for (let s = 0; s < scans.length; s++) {
  let scan = scans[s];
  for (let i = 0; i < scan.length; i++) {
    for (let j = i + 1; j < scan.length; j++) {
      let distances = [];
      for (let k = 0; k < 3; k++) {
        distances.push(scan[i][k] - scan[j][k]);
      }

      let key = JSON.stringify(normDistance(distances));
      beaconPairs[key] = beaconPairs[key] || [];
      beaconPairs[key].push({ s, i, j });
    }
  }
}

let matchedBeacons = Object.values(beaconPairs).filter((x) => x.length > 0);
let scannerPairs = {};

for (let beacons of matchedBeacons) {
  for (let i = 0; i < beacons.length; i++) {
    for (let j = i + 1; j < beacons.length; j++) {
      let key = `${beacons[i].s}/${beacons[j].s}`;
      scannerPairs[key] = scannerPairs[key] || [];
      scannerPairs[key].push([beacons[i], beacons[j]]);
    }
  }
}
console.log(Object.keys(scannerPairs));

function g(pt) {
  return [scans[pt.s][pt.i], scans[pt.s][pt.j]];
}

let transforms = {};
for (let scannerPair of Object.values(scannerPairs)) {
  let offset;
  let directions;

  for (let bp of scannerPair) {
    let bs = bp.map(g);
    let deltas = bs.map(([xs, ys]) => {
      return xs.map((x, i) => x - ys[i]);
    });

    if (offset === undefined) {
      offset = 0;
      while (
        !deltas[0].every((p, i) =>
          Math.abs(p) == Math.abs(deltas[1][(i + offset) % 3])
        )
      ) {
        offset++;
        if (offset > 3) throw Error("Offset overflowed!");
      }
    } else {
      if (
        !deltas[0].every((p, i) =>
          Math.abs(p) == Math.abs(deltas[1][(i + offset) % 3])
        )
      ) {
        throw Error("Inconsistent offset!");
      }
    }

    if (directions === undefined) {
      if (deltas.every(delta => delta.every(x => x !=0 ))) {
        directions = deltas[0].map((p, i) =>
          (Math.sign(p) == Math.sign(deltas[1][(i + offset) % 3])) ? 1 : -1
        );
        // console.log(directions, deltas, offset);
      }
    } else {
      if (deltas.every(delta => delta.every(x => x !=0 ))) {
        const new_directions = deltas[0].map((p, i) =>
          (Math.sign(p) == Math.sign(deltas[1][(i + offset) % 3])) ? 1 : -1
        );
        if (
          JSON.stringify(new_directions) != JSON.stringify(directions) &&
            JSON.stringify(new_directions.map((x) => x * -1)) !=
            JSON.stringify(directions)
        ) {
          console.log(directions, new_directions, deltas, offset);
          throw Error("Inconsistent directions! ");
        }
      }
    }
  }

  let bp = scannerPair[0];
  let bs = bp.map(g);

  let bs0 = bs[0];
  bs0.sort(axisSort);
  let newbs1 = bs[1].map(b => b.map((_, i) => b[(i + offset) % 3] * directions[i]));
  newbs1.sort(axisSort);
  let deltas = newbs1[0].map((x, i) => x - bs0[0][i]);

  transforms[bp[1].s] = transforms[bp[1].s] || {};
  transforms[bp[1].s][bp[0].s] = {deltas, directions, offset};
}

function axisSort(a, b) {
  for (let i = 0; i < 3; i++) {
    const res = a[i] - b[i];
    if (res != 0)
      return res;
  }
  return 0;
};

console.log(transforms);

let beacons = new Set();
