let main = document.querySelector(".main");
const scoreElem = document.getElementById("score");
const nextFigElem = document.getElementById("next-figure");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const gameOver = document.getElementById("game-over");

let field = new Array(20).fill(0).map((el) => new Array(10).fill(0));
console.log(field);

let score = 0;
let gameTimer;
let level_Id = 1;
let isPaused = true;
let Level = {
  1: {
    scoreForLine: 10,
    speed: 400,
    nextLevel: 200,
  },
  2: {
    scoreForLine: 50,
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
let newFigure = getNewFigure();

function draw() {
  let mainHTML = "";
  for (let y = 0; y < field.length; y++) {
    for (let x = 0; x < field[y].length; x++) {
      if (field[y][x] === 1) {
        mainHTML += '<div class="cell movingCell"></div>';
      } else if (field[y][x] === 2) {
        mainHTML += '<div class="cell fixedCell"></div>';
      } else {
        mainHTML += '<div class="cell"></div>';
      }
    }
  }
  main.innerHTML = mainHTML;
}

function drawNextFigure() {
  let nextFigureHTML = "";
  for (let y = 0; y < newFigure.shape.length; y++) {
    for (let x = 0; x < newFigure.shape[y].length; x++) {
      if (newFigure.shape[y][x]) {
        nextFigureHTML += '<div class="cell movingCell"></div>';
      } else {
        nextFigureHTML += '<div class="cellPrev"></div>';
      }
    }
   nextFigureHTML += "<br/>";
  }
  nextFigElem.innerHTML = nextFigureHTML;
}
// удалить фигуру
function deleteFigure() {
  for (let y = 0; y < field.length; y++) {
    for (let x = 0; x < field[y].length; x++) {
      if (field[y][x] === 1) {
        field[y][x] = 0;
      }
    }
  }
}
// Добавить фигуру
function addFigure() {
  deleteFigure();
  for (let y = 0; y < activeFigure.shape.length; y++) {
    for (let x = 0; x < activeFigure.shape[y].length; x++) {
      if (activeFigure.shape[y][x] === 1) {
        field[activeFigure.y + y][activeFigure.x + x] =
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

  if (Collisions()) {
    activeFigure.shape = prevFigureState;
  }
}

// Проверка столкновения
function Collisions() {
  for (let y = 0; y < activeFigure.shape.length; y++) {
    for (let x = 0; x < activeFigure.shape[y].length; x++) {
      if (
        activeFigure.shape[y][x] &&
        (field[activeFigure.y + y] === undefined ||
          field[activeFigure.y + y][activeFigure.x + x] === undefined ||
          field[activeFigure.y + y][activeFigure.x + x] === 2)
      ) {
        return true;
      }
    }
  }
  return false;
}

// Удаляем заполненную линию
function deleteLine() {
  let canDelLine = true,
    filledLines = 0;
  for (let y = 0; y < field.length; y++) {
    for (let x = 0; x < field[y].length; x++) {
      if (field[y][x] !== 2) {
        canDelLine = false;
        break;
      }
    }
    if (canDelLine) {
      field.splice(y, 1);
      field.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      filledLines += 1;
    }
    canDelLine = true;
  }

  switch (filledLines) {
    case 1:
      score += Level[level_Id].scoreForLine;
      break;
    case 2:
      score += Level[level_Id].scoreForLine * 2;
      break;
    case 3:
      score += Level[level_Id].scoreForLine * 4;
      break;
    case 4:
      score += Level[level_Id].scoreForLine * 8;
      break;
  }

  scoreElem.innerHTML = score;

  if (score >= Level[level_Id].nextLevelScore) {
    level_Id++;

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
  for (let y = 0; y < field.length; y++) {
    for (let x = 0; x < field[y].length; x++) {
      if (field[y][x] === 1) {
        field[y][x] = 2;
      }
    }
  }
}

function moveFigureDown() {
  activeFigure.y += 1;
  if (Collisions()) {
    activeFigure.y -= 1;
    fixFigure();
    deleteLine();
    activeFigure = newFigure;
    if (Collisions()) {
      reset();
    }
    newFigure = getNewFigure();
  }
}

function dropFigure() {
  for (let y = activeFigure.y; y < field.length; y++) {
    activeFigure.y += 1;
    if (Collisions()) {
      activeFigure.y -= 1;
      break;
    }
  }
}

function reset() {
  isPaused = true;
  clearTimeout(gameTimer);
  field = new Array(20).fill(0).map((el) => new Array(10).fill(0));
  console.log(field);
  draw();
  gameOver.style.display = "block";
}

document.onkeydown = function (e) {
  if (!isPaused) {
    if (e.keyCode === 37) {
      activeFigure.x -= 1;
      if (Collisions()) {
        activeFigure.x += 1;
      }
    } else if (e.keyCode === 39) {
      activeFigure.x += 1;
      if (Collisions()) {
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
    addFigure();
    draw();
    drawNextFigure();
  }
}

pauseBtn.addEventListener("click", (e) => {
  if (e.target.innerHTML === "Пауза") {
    e.target.innerHTML = "Продолжить...";
    clearTimeout(gameTimer);
  } else {
    e.target.innerHTML = "Пауза";
    gameTimer = setTimeout(startGame, Level[level_Id].speed);
  }
  isPaused = !isPaused;
});

startBtn.addEventListener("click", (e) => {
  e.target.innerHTML = "Старт";
  isPaused = false;
  gameTimer = setTimeout(startGame, Level[level_Id].speed);
  gameOver.style.display = "none";
});

scoreElem.innerHTML = score;

draw();

function startGame() {
  moveFigureDown();
  if (!isPaused) {
    updateGameState();
    gameTimer = setTimeout(startGame, Level[level_Id].speed);
  }
}
