let main = document.querySelector(".main");
const scroeElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const nextFigureElem = document.getElementById("next-figure");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const gameOver = document.getElementById("game-over");

let playField = new Array(20).fill(0).map((el) => new Array(10).fill(0));
console.log(playField);

let defaultField;

let score = 0;
let gameTimerID;
let currentLevel = 1;
let isPaused = true;
let possibleLevels = {
  1: {
    scorePerLine: 10,
    speed: 400,
    nextLevelScore: 200,
  },
  2: {
    scorePerLine: 50,
    speed: 100,
    nextLevelScore: Infinity,
  },
};

let figures = {
  O: [
    [1, 1],
    [1, 1],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
};

let activeFigure = getNewFigure();
let nextFigure = getNewFigure();

function draw() {
  let mainInnerHTML = "";
  for (let y = 0; y < playField.length; y++) {
    for (let x = 0; x < playField[y].length; x++) {
      if (playField[y][x] === 1) {
        mainInnerHTML += '<div class="cell movingCell"></div>';
      } else if (playField[y][x] === 2) {
        mainInnerHTML += '<div class="cell fixedCell"></div>';
      } else {
        mainInnerHTML += '<div class="cell"></div>';
      }
    }
  }
  main.innerHTML = mainInnerHTML;
}

function drawNextFigure() {
  let nextFigureInnerHTML = "";
  for (let y = 0; y < nextFigure.shape.length; y++) {
    for (let x = 0; x < nextFigure.shape[y].length; x++) {
      if (nextFigure.shape[y][x]) {
        nextFigureInnerHTML += '<div class="cell movingCell"></div>';
      } else {
        nextFigureInnerHTML += '<div class="cell"></div>';
      }
    }
    nextFigureInnerHTML += "<br/>";
  }
  nextFigureElem.innerHTML = nextFigureInnerHTML;
}

function removePrevActiveFigure() {
  for (let y = 0; y < playField.length; y++) {
    for (let x = 0; x < playField[y].length; x++) {
      if (playField[y][x] === 1) {
        playField[y][x] = 0;
      }
    }
  }
}

function addActiveFigure() {
  removePrevActiveFigure();
  for (let y = 0; y < activeFigure.shape.length; y++) {
    for (let x = 0; x < activeFigure.shape[y].length; x++) {
      if (activeFigure.shape[y][x] === 1) {
        playField[activeFigure.y + y][activeFigure.x + x] =
          activeFigure.shape[y][x];
      }
    }
  }
}
// Поворот фигуры
function rotateFigure() {
  const prevFigureState = activeFigure.shape;

  activeFigure.shape = activeFigure.shape[0].map((val, index) =>
    activeFigure.shape.map((row) => row[index]).reverse()
  );

  if (hasCollisions()) {
    activeFigure.shape = prevFigureState;
  }
}

// Проверка столкновения
function hasCollisions() {
  for (let y = 0; y < activeFigure.shape.length; y++) {
    for (let x = 0; x < activeFigure.shape[y].length; x++) {
      if (
        activeFigure.shape[y][x] &&
        (playField[activeFigure.y + y] === undefined ||
          playField[activeFigure.y + y][activeFigure.x + x] === undefined ||
          playField[activeFigure.y + y][activeFigure.x + x] === 2)
      ) {
        return true;
      }
    }
  }
  return false;
}

// Удаляем заполненную линию
function removeFullLines() {
  let canRemoveLine = true,
    filledLines = 0;
  for (let y = 0; y < playField.length; y++) {
    for (let x = 0; x < playField[y].length; x++) {
      if (playField[y][x] !== 2) {
        canRemoveLine = false;
        break;
      }
    }
    if (canRemoveLine) {
      playField.splice(y, 1);
      playField.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      filledLines += 1;
    }
    canRemoveLine = true;
  }

  switch (filledLines) {
    case 1:
      score += possibleLevels[currentLevel].scorePerLine;
      break;
    case 2:
      score += possibleLevels[currentLevel].scorePerLine * 2;
      break;
    case 3:
      score += possibleLevels[currentLevel].scorePerLine * 4;
      break;
    case 4:
      score += possibleLevels[currentLevel].scorePerLine * 8;
      break;
  }

  scroeElem.innerHTML = score;

  if (score >= possibleLevels[currentLevel].nextLevelScore) {
    currentLevel++;
    levelElem.innerHTML = currentLevel;
  }
}

function getNewFigure() {
  const possibleFigures = "IOLJTSZ";
  const rand = Math.floor(Math.random() * 7);
  const newFigure = figures[possibleFigures[rand]];

  return {
    x: Math.floor((10 - newFigure[0].length) / 2),
    y: 0,
    shape: newFigure,
  };
}

function fixFigure() {
  for (let y = 0; y < playField.length; y++) {
    for (let x = 0; x < playField[y].length; x++) {
      if (playField[y][x] === 1) {
        playField[y][x] = 2;
      }
    }
  }
}

function moveFigureDown() {
  activeFigure.y += 1;
  if (hasCollisions()) {
    activeFigure.y -= 1;
    fixFigure();
    removeFullLines();
    activeFigure = nextFigure;
    if (hasCollisions()) {
      reset();
    }
    nextFigure = getNewFigure();
  }
}

function dropFigure() {
  for (let y = activeFigure.y; y < playField.length; y++) {
    activeFigure.y += 1;
    if (hasCollisions()) {
      activeFigure.y -= 1;
      break;
    }
  }
}

function reset() {
  isPaused = true;
  clearTimeout(gameTimerID);
  playField = new Array(20).fill(0).map((el) => new Array(10).fill(0));
  console.log(playField);
  draw();
  gameOver.style.display = "block";
}

document.onkeydown = function (e) {
  if (!isPaused) {
    if (e.keyCode === 37) {
      activeFigure.x -= 1;
      if (hasCollisions()) {
        activeFigure.x += 1;
      }
    } else if (e.keyCode === 39) {
      activeFigure.x += 1;
      if (hasCollisions()) {
        activeFigure.x -= 1;
      }
    } else if (e.keyCode === 40) {
      moveFigureDown();
    } else if (e.keyCode === 38) {
      rotateFigure();
    } else if (e.keyCode === 32) {
      dropFigure();
    }

    updateGameState();
  }
};

function updateGameState() {
  if (!isPaused) {
    addActiveFigure();
    draw();
    drawNextFigure();
  }
}

pauseBtn.addEventListener("click", (e) => {
  if (e.target.innerHTML === "Пауза") {
    e.target.innerHTML = "Продолжить...";
    clearTimeout(gameTimerID);
  } else {
    e.target.innerHTML = "Пауза";
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
  isPaused = !isPaused;
});

startBtn.addEventListener("click", (e) => {
  e.target.innerHTML = "Старт";
  isPaused = false;
  gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  gameOver.style.display = "none";
});

scroeElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

draw();

function startGame() {
  moveFigureDown();
  if (!isPaused) {
    updateGameState();
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
  }
}
