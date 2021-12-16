import {readLines} from "https://deno.land/std/io/mod.ts";
import { assert } from "https://deno.land/std@0.117.0/testing/asserts.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}
const input = lines[0];

function readString(input) {
  const inputArray = new Uint8Array(input.length / 2);
  for (let i = 0; i < input.length - 1; i+=2) {
    inputArray[Math.floor(i / 2)] = parseInt(input[i]  + input[i + 1], 16);
  }

  return inputArray;
}

function getBits(x, start, end) {
  let startIndex = Math.floor(start / 8);
  let endIndex = Math.ceil(end / 8);
  let mask = (1 << (8 - start % 8)) - 1;

  // // console.log(startIndex, endIndex, mask.toString(2), 8 - end %  8);
  // // console.log(x[startIndex].toString(2));

  let result = ((1 << (8 - start % 8)) - 1) & x[startIndex];
  for (let i = startIndex + 1; i < endIndex; i++) {
    result <<= 8;
    result += x[i];
  }
  result >>= end % 8 == 0 ? 0 : 8 - end % 8;
  return result;
}

let totalVersion = 0;

function readPacket(x, pt = 0) {
  let result;
  let version = getBits(x, pt, pt + 3);
  totalVersion += version;
  // console.log("version", version)

  let typeid = getBits(x, pt + 3, pt + 6);
  // console.log("typeid", typeid);

  let currentBit = pt + 6;

  if (typeid == 4) {
    let num = 0n;
    while (getBits(x, currentBit, currentBit + 1) == 1) {
      let bits = BigInt(getBits(x, currentBit + 1, currentBit + 5));

      num <<= 4n;
      num += bits;
      currentBit += 5;
    }
    num <<= 4n;
    num += BigInt(getBits(x, currentBit + 1, currentBit + 5));
    assert(num > 0, "Overflow!");

    currentBit += 5;
    // console.log("num", num);
    result = num;
  } else { // operator
    let lengthTypeId = getBits(x, currentBit, currentBit + 1);
    // console.log({lengthTypeId});

    let vals = [];
    if (lengthTypeId == 0) {
      let subPacketsLength = getBits(x, currentBit + 1, currentBit + 1 + 15);
      currentBit += 16;
      // console.log({subPacketsLength});
      let finalBit = currentBit + subPacketsLength;
      while (currentBit < finalBit) {
        let [nxBit, val] = readPacket(x, currentBit);
        currentBit = nxBit;
        vals.push(val);
      }
      assert(currentBit == finalBit);
    } else {
      let subPacketCount = getBits(x, currentBit + 1, currentBit + 1 + 11);
      currentBit += 12;
      // console.log({subPacketCount});

      for (let i = 0; i < subPacketCount; i++) {
        let [nxBit, val] = readPacket(x, currentBit);
        currentBit = nxBit;
        vals.push(val);
      }
    }

    if (typeid == 0) {
      result = vals.reduce((a, b) => a + b, 0n);
    } else if (typeid == 1) {
      result = vals.reduce((a, b) => a * b, 1n);
    } else if (typeid == 2) {
      result = vals.reduce((a, b) => a < b ? a : b);
    } else if (typeid == 3) {
      result = vals.reduce((a ,b) => a > b ? a : b);
    } else if (typeid == 5) {
      result = (vals[0] > vals[1]) ? 1n : 0n;
      assert(vals.length == 2);
    } else if (typeid == 6) {
      result = (vals[0] < vals[1]) ? 1n : 0n;
      assert(vals.length == 2);
    } else if (typeid == 7) {
      result = (vals[0] == vals[1]) ? 1n : 0n;
      assert(vals.length == 2);
    } else {
      assert(false, "Unexpected position");
    }
    console.log({result, vals, typeid})
  }

  return [currentBit, result];
}

// console.log(getBits(readString("D2FE28"), 0, 3).toString(2));
// console.log(getBits(readString("D2FE28"), 11, 16).toString(2));
// readPacket(readString("D2FE28"));
// readPacket(readString("38006F45291200"))
// readPacket(readString("EE00D40C823060"));

// console.log(totalVersion);

// console.log(readPacket(readString("C200B40A82")))

// for (let [test, expected] of  [
//   ["C200B40A82", 3],
//   ["04005AC33890", 54],
//   ["880086C3E88112", 7],
//   ["CE00C43D881120", 9],
//   ["D8005AC2A8F0", 1],
//   ["F600BC2D8F", 0],
//   ["9C005AC2F8F0", 0],
//   ["9C0141080250320F1802104A08", 1],
// ]) {
//   assert(readPacket(readString(test))[1] == expected, test);
// }

let bytes = readString(input);
let result = readPacket(bytes);
console.log(result, totalVersion);
