import {readLines} from "https://deno.land/std/io/bufio.ts";

if (Deno.args.length == 0 || Deno.args[0] == "1") {
    let counts = new Array(100).fill(0);
    let total = 0;
    let x = 0;

    for await (const l of readLines(Deno.stdin)) {
        x = l.length;
        for (let i = 0; i < x; i++) {
            counts[i] += parseInt(l[i], 10);
        }
        total += 1;
    }

    let gamma = 0;
    let epsilon = 0;
    for (let j = 0; j < x; j++) {
        gamma *= 2;
        epsilon *= 2;

        if (counts[j] >= total / 2) {
            gamma += 1;
        } else {
            epsilon += 1;
        }
    }

    console.log(gamma * epsilon);
} else {
    let inputs = [];
    for await (const l of readLines(Deno.stdin)) {
        inputs.push(l);
    }

    let oxy = decide_rating(inputs, (c, t) => c >= (t - c));
    let co2 = decide_rating(inputs, (c, t) => c < (t - c));
    console.log(oxy * co2);
}

function decide_rating(ratings, f) {
    let current_bit = 0;

    while (ratings.length > 1) {
        let count = 0;
        let total = ratings.length;
        for (let rating in ratings) {
            count += parseInt(ratings[rating][current_bit], 10);
        }

        let match = f(count, total) ? '1' : '0';
        ratings = ratings.filter(x => x[current_bit] == match);
        // console.log(count, total, match);
        // console.log(ratings);

        current_bit += 1;
    }

    let result = 0;
    for (let x in ratings[0]) {
        result *= 2;
        result += parseInt(ratings[0][x], 10);
    }

    return result;
}
