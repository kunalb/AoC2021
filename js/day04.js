import {readLines} from "https://deno.land/std/io/bufio.ts";

let rows = [];
for await (const l of readLines(Deno.stdin)) {
    rows.push(l);
}

let numbers = rows[0].split(",").map(x => parseInt(x, 10));
let i = 2;

let boards = [];
while (i < rows.length) {
    let board = [];
    for (let j = 0; j < 5; j++) {
        board.push(rows[i].trim().split(/ +/).map(x => parseInt(x, 10)));
        i++;
    }
    boards.push(board);
    i++;
}

function testBoard(board) {
    for (let i = 0; i < 5; i++) {
        let row = 0;
        let col = 0;
        for (let j = 0; j < 5; j++) {
            if (board[i][j] == 'x') {
                row++;
            }

            if (board[j][i] == 'x') {
                col++;
            }
        }

        if (row == 5 || col == 5) {
            return true;
        }
    }

    return false;
}

function markBoard(board, number) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (board[i][j] == number) {
                board[i][j] = 'x';
            }
        }
    }
}

function sum(board) {
    let sum = 0;
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (board[i][j] != 'x') {
                sum += board[i][j];
            }
        }
    }

    return sum;
}

function isPart1() {
    return Deno.args.length == 0 || Deno.args[0] == "1";
}

loop:
for (const number of numbers) {
    let remove = []
    let b = 0;
    for (let board of boards) {
        markBoard(board, number);
        if (testBoard(board)) {
            if (isPart1() || boards.length == 1) {
                console.log(sum(board) * number)
                break loop;
            }

            remove.push(b);
        }
        b++;
    }

    for (let r of remove.reverse()) {
        boards.splice(r, 1);
    }
}
