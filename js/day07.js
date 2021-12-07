import {readLines} from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = []
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}

const crabs = lines[0].split(",").map(x => parseInt(x, 10));
crabs.sort();

let min_fuel = Number.MAX_SAFE_INTEGER;
function cost(x) {
    return isPart1 ? x : x * (x + 1) / 2;
}

for (let pos = crabs[0] ; pos <= crabs[crabs.length - 1]; pos += 1) {
    min_fuel = Math.min(min_fuel, crabs.map(x => cost(Math.abs(pos - x))).reduce((a, b) => a + b));
}
console.log(min_fuel);
