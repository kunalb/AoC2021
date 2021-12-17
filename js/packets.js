import { assert } from "https://deno.land/std@0.117.0/testing/asserts.ts";

export function readString(input) {
  const inputArray = new Uint8Array(input.length / 2);
  for (let i = 0; i < input.length - 1; i+=2) {
    inputArray[Math.floor(i / 2)] = parseInt(input[i]  + input[i + 1], 16);
  }

  return inputArray;
}

function getBits(x, start, end) {
  const startIndex = Math.floor(start / 8);
  const endIndex = Math.ceil(end / 8);
  let result = ((1 << (8 - start % 8)) - 1) & x[startIndex];
  for (let i = startIndex + 1; i < endIndex; i++) {
    result <<= 8;
    result += x[i];
  }
  result >>= end % 8 == 0 ? 0 : 8 - end % 8;
  return result;
}

export function readPacket(x, pt = 0) {
  const packet = {}
  packet["startBit"] = pt;
  packet["children"] = [];

  let result;
  packet["version"] = getBits(x, pt, pt + 3);

  const typeid = getBits(x, pt + 3, pt + 6);
  packet["typeid"] = typeid;

  let bit = pt + 6;

  if (typeid == 4) {
    let num = 0n;
    while (getBits(x, bit, bit + 1) == 1) {
      num <<= 4n;
      num += BigInt(getBits(x, bit + 1, bit + 5));
      bit += 5;
    }
    num <<= 4n;
    num += BigInt(getBits(x, bit + 1, bit + 5));
    assert(num >= 0, "Overflow!");

    bit += 5;
    result = num;
  } else { // operator
    const lengthTypeId = getBits(x, bit, bit + 1);

    const vals = [];
    if (lengthTypeId == 0) {
      const subPacketsLength = getBits(x, bit + 1, bit + 1 + 15);
      bit += 16;
      const finalBit = bit + subPacketsLength;
      while (bit < finalBit) {
        const child = readPacket(x, bit);
        packet["children"].push(child);
        const {endBit: nxBit, result: val, ..._} = child;
        bit = nxBit;
        vals.push(val);
      }
      assert(bit == finalBit);
    } else {
      const subPacketCount = getBits(x, bit + 1, bit + 1 + 11);
      bit += 12;
      for (let i = 0; i < subPacketCount; i++) {
        const child = readPacket(x, bit);
        packet["children"].push(child);
        const {endBit: nxBit, result: val, ..._} = child;
        bit = nxBit;
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
  }

  packet["result"] = result;
  packet["endBit"] = bit;
  return packet;
}
