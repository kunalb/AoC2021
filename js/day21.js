import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

// const lines = [];
// for await (const l of readLines(Deno.stdin)) {
//     lines.push(l);
// }

// 1 - > 10 wraps around
// scores start at 0
// ends at at least 1000
// 100 sided die, 1..100

let p = [8 - 1, 7 - 1];
// let p = [4 - 1, 8 - 1];

let scores = [0, 0];
let rolls = 0;
let die = 1;

let player = 0;

out:
while (true) {
  for (let i = 0; i < 3; i++) {
    p[player] += die;
    p[player] = p[player] % 10;
   // console.log(die, player, p[player]);

    die++;
    die = die > 100 ? 1 : die;
    rolls++;
  }
  scores[player] += (p[player] + 1);
  if (scores[player] >= 1000) {
    console.log(rolls * scores[1 - player]);
    break out;
  }

  // console.log(p, scores, rolls);
  player = 1 - player;
}
