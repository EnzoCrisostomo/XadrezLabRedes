const options = {
    width: Math.min(window.innerWidth * 0.66, window.innerHeight * 0.85)
};

const sons = {
    move: new Audio("sounds/move.mp3"),
    capture: new Audio("sounds/capture.mp3"),
    check: new Audio("sounds/check.mp3"),
    castle: new Audio("sounds/castle.mp3"),
    stalemate: new Audio("sounds/stalemate.mp3"),
    checkmate: new Audio("sounds/checkmate.mp3"),
}

var moveCount = 0;
var playerColor = 'w';


var abChess = new AbChess("tabuleiro", options);
abChess.setFEN();


abChess.onMovePlayed(() => {
    moveCount++;
    playSound(moveCount);
    addMoveToList(moveCount);

    if(abChess.getActiveColor(moveCount) != playerColor){
        makeMoveAPI();
    }
})

function playSound(count){
    if (abChess.isCheckmate(count)) {
        sons.checkmate.play();
    }
    else if (abChess.isCheck(count)) {
        sons.check.play();
    }
    else if (isDraw(count)) {
        sons.stalemate.play();
    }
    else if(wasCapture(count)){
        sons.capture.play();
    }
    else{
        sons.move.play();
    }
}

function isDraw(count){
    return abChess.is50Moves(count) || abChess.isInsufficientMaterial(count) || abChess.isStalemate(count);
}

function wasCapture(count){
    return countPiecesPawns(abChess.getFEN(count - 1)) > countPiecesPawns(abChess.getFEN(count));
}

function countPiecesPawns(FENstring){
    let amt = 0;
    for(let char of FENstring){
        if(/[rnbqkp]/i.test(char)){
            amt++;
        }
        if(char === ' '){
            return amt;
        }
    }
    return amt;
}

function restart(){
    abChess.reset();
    abChess.setFEN();
    moveCount = 0;
}

function makeMoveAPI(){
    let options = {
        method: 'POST',
        body: abChess.getFEN(moveCount)
    };
    fetch('https://chess.apurn.com/nextmove', options)
        .then(response => response.text())
        .then(response => {
            console.log("api move: ", response);
            let start = response.slice(0, 2);
            let end = response.slice(2, 5);
            let promotion = response.slice(5);
            abChess.play(start, end, promotion);
        })
        .catch(err => console.error(err));
    var habba = "babba"
}

const moveList = document.getElementById("move-list");
function addMoveToList(count){
    let moveStr = abChess.getPGN().split(".").at(-1).slice(0, -3);
    if(abChess.getActiveColor(count) == 'w'){
        moveList.lastChild.innerText = moveStr;
    }
    else{
        let newLi = document.createElement("li");
        newLi.innerText = moveStr;
        moveList.appendChild(newLi);
    }

}

const colorButton = document.getElementById("trocaCor"); 
colorButton.addEventListener("click", () => {
    colorButton.innerText = colorButton.innerText === "Brancas" ? "Pretas" : "Brancas";
    playerColor = playerColor === 'w' ? 'b' : 'w';
    abChess.flip();

    restart();

    if(playerColor === 'b'){
        makeMoveAPI();
    }
});

const restartButton = document.getElementById("restart"); 
restartButton.addEventListener("click", restart);