import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

let posns = [];
for await (const l of readLines(Deno.stdin)) {
  posns.push(l);
}
posns = posns.map(x => x.split(":")[1])
  .map(x => x.trim())
  .map(x => parseInt(x, 10))
  .map(x => (x - 1) % 10);


if (isPart1) {
  const scores = [0, 0];
  let rolls = 0;
  let player = 0;

  let die = 1;

  out:
  while (true) {
    for (let i = 0; i < 3; i++) {
      posns[player] += die;
      posns[player] = posns[player] % 10;
      // console.log(die, player, p[player]);

      die++;
      die = die > 100 ? 1 : die;
      rolls++;
    }
    scores[player] += posns[player] + 1;
    if (scores[player] >= 1000) {
      console.log(rolls * scores[1 - player]);
      break out;
    }

    player = 1 - player;
  }
} else {
  const memo = new Map();

  function countWins(posns, totals, p) {
    const key = `${posns}/${totals}/${p}`;
    if (memo.has(key)) {
      return memo.get(key);
    }

    const wins = [0, 0];

    for (let i = 0; i < 27; i++) {
      const posn = posns[p];
      const total = totals[p];

      const rollsSum = [...Array(3).keys()]
            .map(x => 1 + Math.floor(i / (3 ** x)) % 3)
            .reduce((a, b) => a + b)
      posns[p] = (posn + rollsSum) % 10;
      totals[p] -= (posns[p] + 1);

      if (totals[p] <= 0) {
        wins[p]++;
      } else {
        const innerWins = countWins(posns, totals, 1 - p);
        wins[0] += innerWins[0];
        wins[1] += innerWins[1];
      }

      posns[p] = posn;
      totals[p] = total;
    }

    memo.set(key, wins);
    return wins;
  }

  console.log(Math.max(...countWins(posns, [21, 21], 0)));
}
