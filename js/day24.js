import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l.split(" "));
}

console.log(lines.length, lines.length / 14, lines.length % 14);
for (let j = 0; j < 14; j++) {
  let args = [];
  for (const i of [4, 5, 15]) {
    let k = i + j * 18;
    args.push(parseInt(lines[k][2]));
  }
  console.log(`step(${args.join(",")})`)
}

function evalProgram(program, inputs) {
  const vars = {};
  function num(x) {
    const parsed = parseInt(x, 10);
    return Number.isNaN(parsed) ? (vars[x] || 0) : parsed;
  }

  for (const line of program) {
    switch (line[0]) {
      case "inp":
        vars[line[1]] = inputs.next().value;
        break;
      case "add":
        vars[line[1]] = num(line[1]) + num(line[2]);
        break;
      case "mul":
        vars[line[1]] = num(line[1]) * num(line[2]);
        break;
      case "mod":
        vars[line[1]] = num(line[1]) % num(line[2]);
        break;
      case "div":
        vars[line[1]] = Math.floor(num(line[1]) / num(line[2]));
        break;
      case "eql":
        vars[line[1]] = num(line[1]) == num(line[2]) ? 1 : 0;
        break;
      default:
        throw Error("Unhandled op: " + line);
    }

    for (let v in vars) {
      if (Number.isNaN(vars[v])) {
        console.log(line, vars);
        throw Error("NAN Detected");
      }
    }
  }

  return vars;
}

const testInput = `inp z
inp x
mul z 3
eql z x`;

function monad(input) {
  const vars = evalProgram(lines, input.values());
  return vars["z"] == 0;
}

/*
const value = new Array(14).fill(9);
while (true) {
  if (value.some((x) => x == 0)) {
    continue;
  }

  if (monad(value)) {
    break;
  }

  let start = value.length - 1;
  while (start >= 0 && value[start] == 0) {
    start--;
  }

  if (start >= 0) {
    value[start]--;
    for (let i = start + 1; i < value.length; i++) {
      value[i] = 9;
    }
  }
}
*/

function myMonad(inputs) {
  let w = 0, x = 0, y = 0, z = 0;

  function step(p1, p2, p3) {
    // inp w
    w = inputs.next().value;
    // mul x 0
    x = 0;
    // add x z
    x = x + z;
    // mod x 26
    x = x % 26;
    // div z 1
    z = z / p1;
    // add x 11
    x = x + p2;
    // eql x w
    x = x == w ? 1 : 0;
    // eql x 0
    x = x == 0 ? 1 : 0;
    // mul y 0
    y = 0;
    // add y 25
    y = y + 25;
    // mul y x
    y = y * x;
    // add y 1
    y = y + 1;
    // mul z y
    z = z * y;
    // mul y 0
    y = 0;
    // add y w
    y = y + w;
    // add y 1
    y = y + p3;
    // mul y x
    y = y * x;
    // add z y
    z = z + y;
  }

  step(1,11,1)
  step(1,11,11)
  step(1,14,1)
  step(1,11,11)
  step(26,-8,2)
  step(26,-5,9)
  step(1,11,7)
  step(26,-13,11)
  step(1,12,6)
  step(26,-1,15)
  step(1,14,7)
  step(26,-5,1)
  step(26,-4,8)
  step(26,-8,6)
}
