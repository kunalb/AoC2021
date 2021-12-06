import {readLines} from "https://deno.land/std/io/mod.ts";

if (Deno.args.length == 0 || Deno.args[0] == "1") {
} else {
}

const lines = []
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}

const lanterns = lines[0].split(",").map(x => parseInt(x, 10));

const cache = new Map();

function countLanterns(timer, totalDays) {
    let lanterns = [timer];
    while (totalDays > 0) {
        let nextLanterns = [];
        for (let lantern of lanterns) {
            if (lantern == 0) {
                nextLanterns.push(6);
                nextLanterns.push(8);
            } else {
                nextLanterns.push(lantern - 1);
            }
        }
        lanterns = nextLanterns;

        totalDays--;
    }

    return lanterns.length;
}

function countLanterns2(lantern, totalDays) {
    let key = `${lantern},${totalDays}`;
    if (cache.has(key)) {
        return cache.get(key);
    }

    let result;
    if (totalDays == 0) {
        result = 1;
    } else if (lantern == 0) {
        result = countLanterns2(6, totalDays - 1) + countLanterns2(8, totalDays - 1);
    } else {
        result = countLanterns2(lantern - 1, totalDays - 1);
    }
    cache.set(key, result);
    return result;
}

console.log(lanterns.map(x => countLanterns2(x, 256)).reduce((a, b) => a + b));
