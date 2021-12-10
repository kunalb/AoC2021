import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l);
}

const scores = { ")": 3, "]": 57, "}": 1197, ">": 25137 };
const scores2 = { "(": 1, "[": 2, "{": 3, "<": 4 };
const matches = { "(": ")", "[": "]", "{": "}", "<": ">" };

let score = 0;
const incompleteScores = [];

outer:
for (const line of lines) {
  const stack = [];

  for (const ch of line) {
    if (ch in matches) {
      stack.push(ch);
    } else {
      const top = stack.pop();
      if (matches[top] != ch) {
        score += scores[ch];
        continue outer;
      }
    }
  }

  incompleteScores.push(
    stack.reverse().reduce((a, ch) => 5 * a + scores2[ch], 0),
  );
}

if (isPart1) {
  console.log(score);
} else {
  incompleteScores.sort((a, b) => (a - b));
  console.log(incompleteScores[Math.floor(incompleteScores.length / 2)]);
}
