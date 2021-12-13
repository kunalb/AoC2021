import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l);
}

let flag = false;
const dots = [];
const folds = [];
for (const line of lines) {
  if (line == "") {
    flag = true;
  } else if (!flag) {
    dots.push(line.split(",").map((x) => parseInt(x, 10)));
  } else {
    const pieces = line.split("=");
    folds.push([pieces[0][pieces[0].length - 1], parseInt(pieces[1], 10)]);
  }
}

for (const fold of folds) {
  for (const dot of dots) {
    if (fold[0] == "x" && dot[0] > fold[1]) {
      dot[0] = fold[1] - (dot[0] - fold[1]);
    } else if (fold[0] == "y" && dot[1] > fold[1]) {
      dot[1] = fold[1] - (dot[1] - fold[1]);
    }
  }

  if (isPart1) {
    break;
  }
}

const finalDots = new Set();
for (const dot of dots) {
  finalDots.add(`${dot}`);
}

if (isPart1) {
  console.log(finalDots.size);
  Deno.exit();
}

const maxX = dots.reduce((a, b) => Math.max(a, b[0]), 0);
const maxY = dots.reduce((a, b) => Math.max(a, b[1]), 0);
for (let y = 0; y <= maxY; y++) {
  let line = "";
  for (let x = 0; x <= maxX; x++) {
    if (finalDots.has(`${[x, y]}`)) {
      line += "#";
    } else {
      line += ".";
    }
  }
  console.log(line);
}
