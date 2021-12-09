import {readLines} from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
    lines.push(l.split("").map(x => parseInt(x, 10)));
}

let sum = 0;
let points = [];
for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
        let success = true;
        for (let [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            let xx = x + dx;
            let yy = y + dy;
            if (xx >= 0 && xx < lines[y].length && yy >= 0 && yy < lines.length) {
                if (lines[yy][xx] <= lines[y][x]) {
                    success = false;
                }
            }
        }

        if (success) {
            points.push([x, y]);
            sum += lines[y][x] + 1;
        }
    }
}

if (isPart1) console.log(sum);

const basins = [];
const covered = new Set();

for (const point of points) {
    const basin = new Set();
    const queue = [point];
    while (queue.length) {
        const [x, y] = queue.pop();
        const key = `${x}:${y}`
        if (covered.has(key)) {
            continue;
        }

        basin.add(key);
        covered.add(key);
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            let xx = x + dx;
            let yy = y + dy;
            if (xx >= 0 && xx < lines[y].length && yy >= 0 && yy < lines.length) {
                if (lines[yy][xx] > lines[y][x] && lines[yy][xx] != 9) {
                    queue.push([xx, yy]);
                }
            }
        }
    }
    // console.log(basin);
    basins.push(basin.size);
}

// console.log(basins);
basins.sort((a, b) => b - a);
console.log(basins[0] * basins[1] * basins[2]);
