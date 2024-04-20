/*khai bao*/

const board = document.getElementById("board");
const restartButton = document.getElementById("restart");

let isCreateMines = false;
let numRows = 9;
let numCols = 9;
let numMines = 10;
let mines = [];
let revealed = [];
let timer;
let game_isRunning = false;
let timer_isRunning = false;
let tick = 0;
let remaining_mines = numMines;
let fist_click_x;
let fist_click_y;
var unrevealedCell;
document.documentElement.style.setProperty('--rowCol', numRows);
document.addEventListener('keydown', handleKeyDown);

/*createBoard*/
function createBoard() {

  game_isRunning = true;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = i;
      cell.dataset.col = j;
      board.appendChild(cell);

      cell.addEventListener("click", handleCellClick);
      cell.addEventListener("contextmenu", handleCellContextMenu);
    }
  }

  revealed = Array(numRows)
    .fill()
    .map(() => Array(numCols).fill(false));
  remaining_mines = numMines;
  isCreateMines = false;
  unrevealedCell = numCols * numRows;
  resetTimer();
}

/*createMine*/
function createMine() {
  mines = [];
  while (mines.length < numMines) {
    const randomRow = Math.floor(Math.random() * numRows);
    const randomCol = Math.floor(Math.random() * numCols);
    if ((randomRow == fist_click_x && randomCol == fist_click_y)) {
      continue;
    }
    const mine = { row: randomRow, col: randomCol };

    if ((!mines.some((m) => m.row === randomRow && m.col === randomCol))) {
      mines.push(mine);
    }
  }
  isCreateMines = true;
}

/*handleCellClick*/
function handleCellClick(event) {
  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  handleF(row, col);
}

/*handleF*/
function handleF(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!isCreateMines) {
    fist_click_x = row;
    fist_click_y = col;
    createMine();
  }
  if (!cell.classList.contains("flag")) {
    if (mines.some((mine) => mine.row === row && mine.col === col)) {
      revealMines();
      stopTimer();
      game_isRunning = false;
    }
    else if (revealed[row][col]) {
      if (countFlag(row, col) == cell.textContent) {
        const directions = [-1, 0, 1];
        for (let i = 0; i < directions.length; i++) {
          for (let j = 0; j < directions.length; j++) {
            const x = row + directions[i];
            const y = col + directions[j];
            if (x >= 0 && x < numRows && y >= 0 && y < numCols && !revealed[x][y]) {
              handleF(x, y);
            }
          }
        }
      }
    }
    else {
      revealEmptyCells(row, col);
      if (checkWin()) {
        remaining_mines = 0;
        revealMinesWin();
        stopTimer();
        game_isRunning = false;
      }
    }
    updateDisplay();
  }
}

/*countFlag*/
function countFlag(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const x = row + i;
      const y = col + j;
      if (x >= 0 && x < numRows && y >= 0 && y < numCols) {
        const cell = document.querySelector(`[data-row="${x}"][data-col="${y}"]`);
        if (cell.classList.contains("flag")) {
          count++;
        }
      }
    }
  }
  return count;
}

/*handleCellContextMenu*/
function handleCellContextMenu(event) {
  if (game_isRunning == true) {
    event.preventDefault();
    const cell = event.target;
    if (!cell.classList.contains("revealed")) {
      if (cell.classList.contains("flag") && remaining_mines < numMines) {
        cell.classList.remove("flag");
        remaining_mines++;
      } else if (!cell.classList.contains("flag")) {
        cell.classList.add("flag");
        remaining_mines--;
      }
    }
    updateDisplay();
  }
}

/*revealMinesWin*/
function revealMinesWin() {
  mines.forEach((mine) => {
    const cell = document.querySelector(
      `[data-row="${mine.row}"][data-col="${mine.col}"]`
    );
    cell.classList.add("revealed");
    cell.innerHTML = '<img src="Assets/Cell/flag.png" alt="mine">';
  });
}

function revealMines() {
  mines.forEach((mine) => {
    const cell = document.querySelector(
      `[data-row="${mine.row}"][data-col="${mine.col}"]`
    );
    cell.classList.add("revealed");
    cell.innerHTML = '<img src="Assets/Cell/mine.png" alt="mine">';
  });
}

/*revealEmptyCells*/
function revealEmptyCells(row, col) {
  if (game_isRunning == true) {
    if (
      row < 0 ||
      row >= numRows ||
      col < 0 ||
      col >= numCols ||
      revealed[row][col]
    ) {
      return;
    }
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add("revealed");
    revealed[row][col] = true;
    unrevealedCell--;

    const minesCount = countAdjacentMines(row, col);
    if (cell.classList.contains("flag")) {
      cell.classList.remove("flag");
      remaining_mines++;
    }
    if (minesCount === 0) {
      revealEmptyCells(row - 1, col - 1);
      revealEmptyCells(row - 1, col);
      revealEmptyCells(row - 1, col + 1);
      revealEmptyCells(row, col - 1);
      revealEmptyCells(row, col + 1);
      revealEmptyCells(row + 1, col - 1);
      revealEmptyCells(row + 1, col);
      revealEmptyCells(row + 1, col + 1);
    } else {
      cell.textContent = minesCount;
    }
    startTimer();
  }
}

/*countAdjacentMines*/
function countAdjacentMines(row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
        if (mines.some((mine) => mine.row === newRow && mine.col === newCol)) {
          count++;
        }
      }
    }
  }
  return count;
}

/*checkWin*/
function checkWin() {
  if (unrevealedCell == numMines) {
    return true;
  }
  return false;
}

/*Timer*/
function startTimer() {
  if (!timer_isRunning) {
    timer_isRunning = true;
    timer = setInterval(updateTimer, 1000);
  }
}

function updateTimer() {
  tick++;
  updateDisplay();
}

function stopTimer() {
  clearInterval(timer);
  timer_isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  timer_isRunning = false;
  tick = 0;
  updateDisplay();
}

function updateDisplay() {
  const remainingString = `${remaining_mines.toString().padStart(2, '0')}`;
  const timeString = `${tick.toString().padStart(2, '0')}`;
  document.getElementById("timer").textContent = timeString;
  document.getElementById("remaining_mines").textContent = remainingString;
}

/*getValue*/
function getValue() {
  numCols = parseInt(document.getElementById("numCols").value);
  numRows = parseInt(document.getElementById("numRows").value);
  numMines = parseInt(document.getElementById("numMines").value);
  if (numMines > (numRows * numRows) / 2) {
    numMines = Math.floor((numRows * numRows) / 2);
    document.getElementById("numMines").value = numMines;
  }
  document.documentElement.style.setProperty('--numCols', numCols);
  document.documentElement.style.setProperty('--numRows', numRows);
}

/*restartButton*/
restartButton.addEventListener("click", () => {
  board.innerHTML = "";
  getValue();
  createBoard();
});

function handleKeyDown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    board.innerHTML = "";
    getValue();
    createBoard();
  }
}
createBoard();

/*Menu Scripts*/
/*nav bar*/
document
  .querySelector(".hamburger-menu")
  .addEventListener("click", function () {
    document.querySelector(".bar").classList.toggle("animate");
    var mobileNav = document.querySelector(".mobile-nav");
    mobileNav.classList.toggle("show");
  });
