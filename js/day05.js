import {readLines} from "https://deno.land/std/io/bufio.ts";

x = {}
x[[1, 2]] = 3;

function isPart1() {
    return Deno.args.length == 0 || Deno.args[0] == "1";
}

let grid = {};

for await (const l of readLines(Deno.stdin)) {
    let points = l.split(" -> ")
    let [x1, y1] = points[0].split(",").map(x => parseInt(x, 10));
    let [x2, y2] = points[1].split(",").map(x => parseInt(x, 10));

    if (x1 == x2 || y1 == y2) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                grid[x + "," + y] = (grid[x + "," + y] ?? 0) + 1;
            }
        }
    } else if (!isPart1()) {
        let y = y1;
        let dx = Math.sign(x2 - x1);
        let dy = Math.sign(y2 - y1);
        for (let x = x1; x != x2 + dx; x += dx){
            grid[x + "," + y] = (grid[x + "," + y] ?? 0) + 1;
            y += dy;
        }
    }

}

let count = 0;
for (let point in grid) {
    if (grid[point] >= 2) {
        count++;
    }
}

// console.log(grid);
console.log(count);
