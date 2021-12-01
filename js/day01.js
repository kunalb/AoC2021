import {readLines} from "https://deno.land/std/io/bufio.ts";


if (Deno.args.length == 0 || Deno.args[0] == "1") {
    let incs = 0;
    let prev = null;

    for await (const l of readLines(Deno.stdin)) {
        let val = parseInt(l, 10);
        if (prev != null && val > prev) {
            incs++;
        }
        prev = val;
    }

    console.log(incs);
} else {
    let incs = 0;
    let sliding_window = [0, 0, 0]
    let i = 0;
    let prev_sum = null;

    for await (const l of readLines(Deno.stdin)) {
        let val = parseInt(l, 10);

        sliding_window[i % 3] = val;
        i++;

        let curr_sum = sliding_window.reduce((a, b) => a + b, 0);
        if (prev_sum != null && curr_sum > prev_sum) {
            incs++;
        }

        if (i >= 3) {
            prev_sum = curr_sum;
        }
    }

    console.log(incs);
}
