import { readLines } from "https://deno.land/std/io/mod.ts";

// Parse input

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");
const scans = [];
for await (const l of readLines(Deno.stdin)) {
  if (l.startsWith("---")) {
    scans.push([]);
  } else if (l.trim() != "") {
    scans[scans.length - 1].push(JSON.parse("[" + l + "]"));
  }
}

function delta(xs, ys) {
  return xs.map((x, i) => x - ys[i]);
}

function normDelta(ds) {
  ds = ds.map(Math.abs);
  ds.sort((a, b) => a - b);
  return ds + "";
}

// Figure out transforms to unify pairs
function axisSort(as, bs) {
  for (let i = 0; i < 3; i++) {
    if (bs[i] - as[i] != 0) {
      return bs[i] - as[i];
    }
  }
  return 0;
  // return as.reduce((prev, a, i) => prev == 0 ? bs[i] - a : prev);
}

function transform(as, bs) {
  const abs = [
    [scans[as.s][as.i], scans[as.s][as.j]],
    [scans[bs.s][bs.i], scans[bs.s][bs.j]],
  ];
  const deltas = abs.map((pair) => delta(...pair));

  let map = [];
  for (let i = 0; i < 3; i++) {
    // TODO Handle multiple matches?
    map.push(deltas[1].findIndex((x) => Math.abs(x) == Math.abs(deltas[0][i])));
  }

  // TODO Handle zeros correctly?
  const dirs = deltas[0].map((d, i) => d == deltas[1][map[i]] ? 1 : -1);

  abs[0].sort(axisSort);
  abs[1] = abs[1].map((beacon) => {
    const newBeacon = [];
    for (let i = 0; i < 3; i++) {
      newBeacon.push(beacon[map[i]] * dirs[i]);
    }
    return newBeacon;
  }).sort(axisSort);

  const ds = delta(abs[1][0], abs[0][0]);
  return { as, bs, map, dirs, ds };
}

function transformHash(t) {
  return `${t.map}|${t.dirs}|${t.ds}`;
}

function applyTransform(pt, map, dirs, ds) {
  pt = pt.map((_, i, arr) => arr[map[i]]);
  pt = pt.map((p, i) => p * dirs[i]);
  pt = pt.map((p, i) => p - ds[i]);
  return pt;
}

const solved = {};
let solved0 = 0;
let changed;

do {
  changed = false;

  // Create beacon pairs from given information
  const pairs = {};

  for (let s = 0; s < scans.length; s++) {
    const scan = scans[s];
    if (solved[`0|${s}`]) {
      continue;
    }

    for (let i = 0; i < scan.length; i++) {
      for (let j = i + 1; j < scan.length; j++) {
        const key = normDelta(delta(scan[i], scan[j]));
        pairs[key] = pairs[key] || [];
        pairs[key].push({ s, i, j });
      }
    }
  }

  const transforms = {};

  // Add a reduction to go from all values to zero
  for (const pair of Object.values(pairs).filter((x) => x.length > 1)) {
    for (let i = 0; i < pair.length; i++) {
      for (let j = i + 1; j < pair.length; j++) {
        const as = pair[i].s <= pair[j].s ? pair[i] : pair[j];
        const bs = pair[i].s > pair[j].s ? pair[i] : pair[j];
        if (as.s == bs.s) {
          continue;
        }

        const t = transform(as, bs);
        const th = transformHash(t);
        const key = `${as.s}|${bs.s}`;
        transforms[key] = transforms[key] || {};
        transforms[key][th] = transforms[key][th] || [];
        transforms[key][th].push(t);
      }
    }
  }

  // console.log(solved);

  for (const key in transforms) {
    const options = Object.values(transforms[key]);
    options.sort((a, b) => b.length - a.length);
    const t = options[0];
    if (t.length < 6) continue;

    const { as, bs, map, dirs, ds } = t[0];
    if (solved[as.s + "|" + bs.s]) {
      continue;
    }

    changed = true;

    for (const b of scans[bs.s]) {
      const newB = applyTransform(b, map, dirs, ds);
      const strNewB = JSON.stringify(newB);
      if (scans[as.s].findIndex((el) => JSON.stringify(el) == strNewB) == -1) {
        scans[as.s].push(newB);
      }
    }

    solved[as.s + "|" + bs.s] = { map, dirs, ds };
    // console.log(as.s, "<-", bs.s, "=", th);

    if (as.s == 0) {
      solved0++;
    }
  }
} while (changed);

function manhattan(xs) {
  return xs.map(Math.abs).reduce((a, b) => a + b, 0);
}

if (isPart1) {
  console.log(scans[0].length);
} else {
  let maxDistance = 0;
  for (let i = 1; i < scans.length; i++) {
    maxDistance = Math.max(manhattan(solved[`0|${i}`].ds), maxDistance);

    for (let j = i + 1; j < scans.length; j++) {
      maxDistance = Math.max(
        maxDistance,
        manhattan(delta(solved[`0|${i}`].ds, solved[`0|${j}`].ds))
      );
    }
  }
  console.log(maxDistance);
}
