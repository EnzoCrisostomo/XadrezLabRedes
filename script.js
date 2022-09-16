var moveCount = 0;
var playerColor = 'w';
var abChess = undefined;

const moveList = document.getElementById("move-list");
const moveBlocker = document.getElementById("block");

const sons = {
    move: new Audio("sounds/move.mp3"),
    capture: new Audio("sounds/capture.mp3"),
    check: new Audio("sounds/check.mp3"),
    castle: new Audio("sounds/castle.mp3"),
    stalemate: new Audio("sounds/stalemate.mp3"),
    checkmate: new Audio("sounds/checkmate.mp3"),
}

function playSound(count) {
    if (abChess.isCheckmate(count)) {
        sons.checkmate.play();
    }
    else if (abChess.isCheck(count)) {
        sons.check.play();
    }
    else if (isDraw(count)) {
        sons.stalemate.play();
    }
    else if (wasCapture(count)) {
        sons.capture.play();
    }
    else {
        sons.move.play();
    }
}

function blockTabuleiro(nextToMoveColor) {
    if (nextToMoveColor === playerColor) {
        moveBlocker.style.width = 0;
        moveBlocker.style.height = 0;
    }
    else {
        moveBlocker.style.width = "100%";
        moveBlocker.style.height = "100%";
    }
}

function isDraw(count) {
    return abChess.is50Moves(count) || abChess.isInsufficientMaterial(count) || abChess.isStalemate(count);
}

function wasCapture(count) {
    return countPiecesPawns(abChess.getFEN(count - 1)) > countPiecesPawns(abChess.getFEN(count));
}

function countPiecesPawns(FENstring) {
    let amt = 0;
    for (let char of FENstring) {
        if (/[rnbqkp]/i.test(char)) {
            amt++;
        }
        if (char === ' ') {
            return amt;
        }
    }
    return amt;
}

function onMove() {
    moveCount++;
    playSound(moveCount);
    addMoveToList(moveCount);
    let nextPlayer = abChess.getActiveColor(moveCount);
    blockTabuleiro(nextPlayer);

    if (nextPlayer != playerColor) {
        makeMoveAPI();
    }

    boardPos = moveCount;
}

function novoTabuleiro() {
    document.getElementById("tabuleiro").innerHTML = "";
    var options = {
        width: Math.min(window.innerWidth * 0.66, window.innerHeight * 0.85)
    };
    moveCount = 0;
    moveList.innerHTML = "";

    abChess = new AbChess("tabuleiro", options);
    abChess.setFEN();


    abChess.onMovePlayed(onMove);

    if (playerColor === 'b') {
        abChess.flip();
        makeMoveAPI();
    }
    blockTabuleiro('w');
}

function makeMoveAPI() {
    let options = {
        method: 'POST',
        body: abChess.getFEN(moveCount)
    };
    fetch('https://chess.apurn.com/nextmove', options)
        .then(response => response.text())
        .then(response => {
            let start = response.slice(0, 2);
            let end = response.slice(2, 5);
            let promotion = response.slice(5);
            abChess.play(start, end, promotion);
        })
        .catch(err => console.error(err));
    var habba = "babba"
}


function addMoveToList(count) {
    let moveStr = abChess.getPGN().split(".").at(-1).slice(0, -3);
    moveStr = moveStr.replace("\n", ' ');
    moveStr = `${Math.floor((moveCount + 1) / 2)}. ${moveStr}`;
    if (abChess.getActiveColor(count) == 'w') {
        moveList.lastChild.innerText = moveStr;
    }
    else {
        let newLi = document.createElement("li");
        newLi.innerText = moveStr;
        moveList.appendChild(newLi);
    }
    moveList.scrollTop = moveList.scrollHeight;
}

const colorButton = document.getElementById("trocaCor");
colorButton.addEventListener("click", () => {
    colorButton.innerText = colorButton.innerText === "Brancas" ? "Pretas" : "Brancas";
    playerColor = playerColor === 'w' ? 'b' : 'w'
    novoTabuleiro();
});

const restartButton = document.getElementById("restart");
restartButton.addEventListener("click", novoTabuleiro);

var boardPos = 0;
const backButton = document.getElementById("back");
backButton.addEventListener("click", () => {
    blockTabuleiro();
    if(boardPos > 0)
        boardPos--;

    abChess.setFEN(abChess.getFEN(boardPos));
});
const fowardButton = document.getElementById("foward");
fowardButton.addEventListener("click", () => {
    blockTabuleiro();
    if(boardPos < moveCount)
        boardPos++;

    abChess.setFEN(abChess.getFEN(boardPos));

    if(boardPos == moveCount){
        blockTabuleiro(playerColor);
    }
});

novoTabuleiro();