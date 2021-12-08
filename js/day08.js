import {readLines} from "https://deno.land/std/io/mod.ts";

const isPart1 = (Deno.args.length == 0 || Deno.args[0] == "1");

const lines = [];
for await (const l of readLines(Deno.stdin)) {
    lines.push(l);
}

if (isPart1) {
    const lens = {2: true, 4: true, 3: true, 7: true};
    let total = 0;
    for (const line of lines) {
        let [_, output] = line.split("|")
        output = output.trim();
        const words = output.split(/ +/);
        total += words.filter(word => lens[word.length]).length;
    }
    console.log(total);
    Deno.exit();
}


let sum = 0;
for (const line of lines) {
    let [signals, output] = line.split(" | ");
    signals = signals.trim().split(/ +/);
    output = output.trim().split(/ +/);
    sum += solve(signals, output);
}
console.log(sum);

function find_match(signals, len) {
    return find_matches(signals, len)[0];
}

function find_matches(signals, len) {
    return signals.filter(signal => signal.length == len).map(x => new Set(x));
}

function isSubset(as, bs) {
    for (let a of as) {
        if (!bs.has(a)) {
            return false;
        }
    }
    return true;
}

function equalSet(as, bs) {
    if (as.size != bs.size) {
        return false;
    }

    for (let a of as) {
        if (!bs.has(a)) {
            return false;
        }
    }

    return true;
}

function solve(signals, output) {
    let n = {}, c = {};
    n["1"] = find_match(signals, 2);
    n["4"] = find_match(signals, 4);
    n["7"] = find_match(signals, 3);
    n["8"] = find_match(signals, 7);


    n["069"] = find_matches(signals, 6);
    n["235"] = find_matches(signals, 5);

    c["a"] = [...n["7"]].filter(x => !n["1"].has(x))[0];

    n["6"] = n["069"].filter(x => !isSubset(n["1"], x))[0];
    n["09"] = n["069"].filter(x => x != n["6"]);
    c["c"] = [...n["8"]].filter(x => !n["6"].has(x))[0];
    c["f"] = [...n["1"]].filter(x => x != c["c"])[0];
    n["5"] = n["235"].filter(x => !x.has(c["c"]))[0];
    n["23"] = n["235"].filter(x => x != n["5"]);
    n["2"] = n["23"].filter(x => !x.has(c["f"]))[0];
    n["3"] = n["23"].filter(x => x != n["2"])[0];
    n["0"] = n["09"].filter(x => !isSubset(n["3"], x))[0];
    n["9"] = n["09"].filter(x => x != n["0"])[0];

    let number = 0;
    for (let digit of output) {
        number *= 10;
        let set_digit = new Set(digit);
        for (const [k, d] of Object.entries(n)) {
            if (equalSet(set_digit, d)) {
                number += parseInt(k, 10);
                continue;
            }
        }
    }
    return number;
}
