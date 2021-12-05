import {readLines} from "https://deno.land/std/io/mod.ts";

function isPart1() {
    return Deno.args.length == 0 || Deno.args[0] == "1";
}

const grid = new Map();

for await (const l of readLines(Deno.stdin)) {
    const points = l.split(" -> ")
    const [x1, y1] = points[0].split(",").map(x => parseInt(x, 10));
    const [x2, y2] = points[1].split(",").map(x => parseInt(x, 10));

    if (x1 == x2 || y1 == y2 || !isPart1()) {
        const dx = Math.sign(x2 - x1);
        const dy = Math.sign(y2 - y1);
        for (let x = x1, y = y1; x != x2 + dx || y != y2 + dy; x += dx, y += dy){
            const key = `${x},${y}`;
            grid.set(key, (grid.get(key) ?? 0) + 1);
        }
    }

}

console.log(Array.from(grid.values()).filter(x => x >= 2).length)
