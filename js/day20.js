import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l);
}

const algo = lines[0];

let image = [];
let boundary = ".";

for (let i = 2; i < lines.length; i++) {
  image.push(lines[i].split(""));
}

function nextPixel(image, boundary, x, y) {
  let num = 0;
  for (let yy = y - 1; yy <= y + 1; yy++) {
    for (let xx = x - 1; xx <= x + 1; xx++) {
      const pt = image[yy] && image[yy][xx] ? image[yy][xx] : boundary;
      num = num * 2 + (pt == "#" ? 1 : 0);
    }
  }
  return algo[num];
}

function printImage(image) {
  for (const row of image) {
    console.log(row.join(""));
  }
  console.log();
}

let steps = 0;
while (steps < (isPart1 ? 2 : 50)) {
  const nextBoundary = boundary == "." ? algo[0] : algo[511];
  const nextImage = [];

  // printImage(image);
  for (let y = 0; y < 2 + image.length; y++) {
    nextImage.push([]);
    for (let x = 0; x < 2 + image.length; x++) {
      const nx = nextPixel(image, boundary, x - 1, y - 1);
      nextImage[y].push(nx);
    }
  }

  image = nextImage;
  boundary = nextBoundary;
  // printImage(image);
  steps++;
}

let total = 0;
for (let y = 0; y < image.length; y++) {
  for (let x = 0; x < image[y].length; x++) {
    total += image[y][x] == "#" ? 1 : 0;
  }
}
console.log(total);
