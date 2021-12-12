import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(l);
}

const graph = {};
for (const l of lines) {
  const [a, b] = l.split("-");
  graph[a] = graph[a] || [];
  graph[a].push(b);
  graph[b] = graph[b] || [];
  graph[b].push(a);
}

function findPath(cur, visited = new Set()) {
  if (cur == "end") {
    return [
      ["end"],
    ];
  }

  if (cur.toLowerCase() == cur) {
    visited.add(cur);
  }

  const children = graph[cur].filter((x) => !visited.has(x));
  let paths = [];
  for (const child of children) {
    paths = paths.concat(
      findPath(child, new Set(visited)).map((x) => {
        x.unshift(cur);
        return x;
      }),
    );
  }

  return paths;
}

function findPath2(cur, visited = new Set(), doubled = false) {
  if (cur == "end") {
    return [
      ["end"],
    ];
  }

  if (cur.toLowerCase() == cur) {
    visited.add(cur);
  }

  const children = graph[cur];
  let paths = [];
  for (const child of children) {
    let newPaths = [];
    if (doubled && visited.has(child)) {
      continue;
    } else if (
      !doubled && visited.has(child) && child != "start" && child != "end"
    ) {
      newPaths = findPath2(child, new Set(visited), true);
    } else if (!visited.has(child)) {
      newPaths = findPath2(child, new Set(visited), doubled);
    }

    paths = paths.concat(newPaths.map((x) => {
      x.unshift(cur);
      return x
    }));
  }

  return paths;
}

console.log((isPart1 ? findPath("start") : findPath2("start")).length);
