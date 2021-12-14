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

let word = template;

/*
for (let i = 0; i < 40; i++) {
  let newWord = "";
  for (let ch = 0; ch < word.length - 1; ch++) {
    let digram = word[ch] + word[ch + 1];
    if (rules[digram] != undefined) {
      newWord += word[ch] + rules[digram];
    } else {
      newWord += word[ch];
    }
  }
  newWord += word[word.length - 1];
  word = newWord;
}

let counter = {};
for (const ch of word) {
  counter[ch] = (counter[ch] || 0) + 1;
}

let counters = []
for (let key in counter) {
  counters.push(counter[key]);
}

console.log(Math.max.apply(null, counters) - Math.min.apply(null, counters))
*/

let pairs = {};
for (let i = 0; i < word.length - 1; i++) {
  let key = word[i] + word[i + 1];
  pairs[key] = (pairs[key] || 0) + 1;
}

const STEPS = 40;
for (let i = 0; i < STEPS; i++) {
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
// console.log(pairs);

let counts = {};
counts[word[0]] = 1;
counts[word[word.length - 1]] = 1 ;
for (let pair in pairs) {
  counts[pair[0]] = pairs[pair] + (counts[pair[0]] || 0)
  counts[pair[1]] = pairs[pair] + (counts[pair[1]] || 0)
}
// console.log(counts);

let final = []
for (let x in counts) {
  final.push(counts[x] / 2);
}

console.log(Math.max.apply(null, final) - Math.min.apply(null, final))
