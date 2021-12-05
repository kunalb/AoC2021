import {readLines} from "https://deno.land/std/io/mod.ts";

if (Deno.args.length == 0 || Deno.args[0] == "1") {
} else {
}

for await (const l of readLines(Deno.stdin)) {
    console.log(l);
}
