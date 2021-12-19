import { readLines } from "https://deno.land/std/io/mod.ts";

// Parse input

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");
const scans = [];
for await (const l of readLines(Deno.stdin)) {
  if (l.startsWith("---")) {
    scans.push([]);
  } else if (l.trim() != "") {
    scans[scans.length - 1].push(JSON.parse("[" + l + "]"));
  }
}

console.log(scans);


// Create beacon pairs from given information
for (let scan of scans) {

}
