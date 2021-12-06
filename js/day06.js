import {readLines} from "https://deno.land/std/io/mod.ts";

const lines = []
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}
const lanterns = lines[0].split(",").map(x => parseInt(x, 10));

function countLanterns(lanterns, days) {
    const lanternCounts = new Array(9).fill(0);
    for (const lantern of lanterns) {
        lanternCounts[lantern]++;
    }

    for (let i = 0; i < days; i++) {
        const finished = lanternCounts[0];
        for (let j = 0; j < 8; j++) {
            lanternCounts[j] = lanternCounts[j + 1];
        }
        lanternCounts[8] = finished;
        lanternCounts[6] += finished;
    }

    return lanternCounts.reduce((a, b) => a + b);
}

const days = (Deno.args.length == 0 || Deno.args[0] == "1") ? 80 : 256;
console.log(countLanterns(lanterns, days));
