import {readLines} from "https://deno.land/std/io/bufio.ts";

if (Deno.args.length == 0 || Deno.args[0] == "1") {
    let x = 0;
    let y = 0;
    for await (const l of readLines(Deno.stdin)) {
        let [word, num] = l.split(" ");
        num = parseInt(num, 10);

        if (word == "forward") {
            x += num;
        } else if (word == "up") {
            y -= num;
        } else if (word == "down") {
            y += num;
        }
    }
    console.log(Math.abs(x * y));
} else {
    let x = 0;
    let y = 0;
    let aim = 0;
    for await (const l of readLines(Deno.stdin)) {
        let [word, num] = l.split(" ");
        num = parseInt(num, 10);

        if (word == "forward") {
            x += num;
            y += aim * num;
        } else if (word == "up") {
            aim -= num;
        } else if (word == "down") {
            aim += num;
        }
    }
    console.log(Math.abs(x * y));
}
