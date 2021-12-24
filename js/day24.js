import { readLines } from "https://deno.land/std/io/mod.ts";
import { assert } from "https://deno.land/std@0.117.0/testing/asserts.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l.split(" "));
}

const parameters = [];
for (let j = 0; j < 14; j++) {
  const args = [];
  for (const i of [4, 5, 15]) {
    const k = i + j * 18;
    args.push(parseInt(lines[k][2]));
  }
  parameters.push(args);
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

function monad(input) {
  return evalProgram(lines, input);
}

function myMonad(inputs) {
  let w = 0, x = 0, y = 0, z = 0, i = 0;

  function step(p1, p2, p3) {
    w = inputs.next().value;
    x = z % 26 + p2;
    z = Math.floor(z / p1);
    if (x != w) {
      z = z * 26 + w + p3;
    }
    // console.log({step: ++i, w, x, y, z});
  }

  for (const parameter of parameters) {
    step(...parameter);
  }

  return {x, y, w, z};
}

function makeConstrainedValues() {
  const deps = [0];
  const constraints = new Array(15).fill(null);
  for (let i = 1; i <= parameters.length; i++) {
    let p = parameters[i - 1];
    if (p[0] == 1) {
      deps.push(i);
    } else {
      constraints[i] = deps[deps.length - 1];
      deps.pop();
    }
  }
  // console.log(constraints);

  const maxValues = new Array(15).fill(null);
  const minValues = new Array(15).fill(null);
  for (const [i, constraint] of constraints.entries()) {
    if (constraint === null) continue;
    maxValues[constraint] = Math.min(
      9,
      9 - parameters[constraint - 1][2] - parameters[i - 1][1]
    );

    const sum = parameters[constraint - 1][2] + parameters[i - 1][1];
    minValues[constraint] = Math.max(1 - sum, 1);
  }
  // console.log(maxValues);
  // console.log(minValues);

  const maxAttempt = [];
  const minAttempt = [];
  for (let i = 1; i < maxValues.length; i++) {
    maxAttempt.push(maxValues[i]);
    minAttempt.push(minValues[i]);
  }
  for (const [i, constraint] of constraints.entries()) {
    if (constraint == null) continue;
    maxAttempt[i - 1] = maxAttempt[constraint - 1] + parameters[constraint - 1][2] + parameters[i - 1][1];
    minAttempt[i - 1] = minAttempt[constraint - 1] + parameters[constraint - 1][2] + parameters[i - 1][1];
  }

  return [maxAttempt, minAttempt];
}


const values = makeConstrainedValues();

for (let value of values) {
  const res = myMonad(value.values());
  assert(res["z"] == 0);

  const res2 = monad(value.values());
  assert(res2["z"] == 0);
}

if (isPart1) {
  console.log(values[0].join(""));
} else {
  myMonad(values[1].values())
  console.log(values[1].join(""));
}
