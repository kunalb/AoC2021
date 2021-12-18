import { readLines } from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
  lines.push(JSON.parse(l));
}

function makeTree(x, parent = null) {
  if (typeof (x) == "number") {
    return { type: "leaf", val: x, parent: parent };
  }

  const self = { type: "node", parent: parent };
  self["left"] = makeTree(x[0], self);
  self["right"] = makeTree(x[1], self);
  return self;
}

function flatten(x) {
  if (x.type == "leaf") {
    return x.val;
  } else {
    return [flatten(x.left), flatten(x.right)];
  }
}

function addTree(x, y) {
  const self = { type: "node", left: x, right: y };
  x.parent = self;
  y.parent = self;
  return self;
}

function inorder(x) {
  if (x.type == "leaf") {
    return [x];
  } else {
    return inorder(x.left).concat(inorder(x.right));
  }
}

function inorderExplode(x, depth = 0) {
  if (
    x.type == "node" && x.left.type == "leaf" && x.right.type == "leaf" &&
    depth >= 4
  ) {
    const zeroTree = makeTree(0, x.parent);

    if (x.parent.left == x) {
      x.parent.left = zeroTree;
    } else if (x.parent.right == x) {
      x.parent.right = zeroTree;
    }

    return [zeroTree, x.left.val, x.right.val];
  } else if (x.type == "node") {
    const left = inorderExplode(x.left, depth + 1);
    if (left != null) return left;

    const right = inorderExplode(x.right, depth + 1);
    if (right != null) return right;
  }

  return null;
}

function inorderSplit(x) {
  if (x.type == "leaf" && x.val >= 10) {
    const newTree = makeTree(
      [Math.floor(x.val / 2), Math.ceil(x.val / 2)],
      x.parent,
    );
    if (x.parent.left == x) {
      x.parent.left = newTree;
    } else if (x.parent.right == x) {
      x.parent.right = newTree;
    } else {
      throw Exception("Unexpected split");
    }

    return true;
  } else if (x.type == "node") {
    if (inorderSplit(x.left)) return true;
    if (inorderSplit(x.right)) return true;
  }

  return false;
}

function reduce(tree) {
  let changed;
  do {
    changed = false;

    const res = inorderExplode(tree);
    if (res != null) {
      const [zeroTree, left, right] = res;
      const pieces = inorder(tree);
      const i = pieces.indexOf(zeroTree);
      if (i < 0) throw Exception("unexpected tree");
      if (i > 0) pieces[i - 1].val += left;
      if (i < pieces.length - 1) pieces[i + 1].val += right;
      changed = true;
    } else {
      changed = inorderSplit(tree);
    }
  } while (changed);
  return tree;
}

function magnitude(tree) {
  if (tree.type == "leaf") {
    return tree.val;
  }
  return 3 * magnitude(tree.left) + 2 * magnitude(tree.right);
}

if (isPart1) {
  let tree = makeTree(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    tree = reduce(addTree(tree, makeTree(lines[i])));
  }
  console.log(magnitude(tree));
} else {
  let maxMagnitude = null;
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines.length; j++) {
      if (i == j) continue;

      const mag = magnitude(
        reduce(addTree(makeTree(lines[i]), makeTree(lines[j]))),
      );
      if (maxMagnitude == null || maxMagnitude < mag) {
        maxMagnitude = mag;
      }
    }
  }

  console.log(maxMagnitude);
}
