import {readLines} from "https://deno.land/std/io/bufio.ts";

for await (const l of readLines(Deno.stdin)) {
    console.log(l);
}
