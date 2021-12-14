import {readLines} from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}

let template = lines[0]
let rules = {}
for (let i = 2; i < lines.length; i++) {
  let pieces = lines[i].split(" -> ");
  rules[pieces[0]] = pieces[1];
}

let pairs = {};
for (let i = 0; i < template.length - 1; i++) {
  let key = template[i] + template[i + 1];
  pairs[key] = (pairs[key] || 0) + 1;
}

const steps = isPart1 ? 10 : 40;
for (let i = 0; i < steps; i++) {
  let nextPairs = {};
  for (let pair in pairs) {
    let match = rules[pair];
    if (match !== undefined) {
      let key1 = pair[0] + match;
      nextPairs[key1] = (nextPairs[key1] || 0)  + pairs[pair];
      let key2 = match + pair[1];
      nextPairs[key2] = (nextPairs[key2] || 0)  + pairs[pair];
    } else {
      nextPairs[pair] = pairs[pair];
    }
  }
  pairs = nextPairs;
}

let counts = {};
counts[template[0]] = 1;
counts[template[template.length - 1]] = 1 ;
for (let pair in pairs) {
  counts[pair[0]] = pairs[pair] + (counts[pair[0]] || 0)
  counts[pair[1]] = pairs[pair] + (counts[pair[1]] || 0)
}

let letterCounts = Object.values(counts).map(x => x / 2);
console.log(Math.max.apply(null, letterCounts) - Math.min.apply(null, letterCounts))
