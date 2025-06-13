const gridSize = 10;
let selectedCells = [];
let currentWords = [];
let foundWords = new Set();
let timerInterval;
let totalTime = 60;
let currentLevel = '';
let tickingStarted = false;
let gameActive = true;

const wordGrid = document.getElementById("wordGrid");
const wordList = document.getElementById("wordList");
const timerDisplay = document.getElementById("timer");
const timerCircle = document.getElementById("timerCircle");
const tickingSound = document.getElementById("tickingSound");
const popupOverlay = document.getElementById("popupOverlay");

const difficulties = {
  very_easy: ["CAT", "DOG", "SUN", "BAT", "HAT"],
  easy: ["TREE", "FISH", "BIRD", "BOOK", "LION"],
  medium: ["PLANET", "PYTHON", "BUTTON", "SCHOOL", "GUITAR"],
  hard: ["KNOWLEDGE", "COMPUTER", "DIFFICULT", "LANGUAGE", "SCIENCE"]
};

function startGame(level) {
  currentLevel = level;
  document.getElementById("difficultySelection").style.display = "none";
  document.getElementById("gameContainer").style.display = "flex";
  currentWords = difficulties[level];
  foundWords.clear();
  selectedCells = [];
  gameActive = true;
  generateGrid();
  populateWords();
  startTimer(60);
}

function generateGrid() {
  wordGrid.innerHTML = "";
  wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

  // Place words
  currentWords.forEach(word => {
    const placed = placeWord(grid, word);
    if (!placed) console.warn("Failed to place word:", word);
  });

  // Fill random letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
      const cell = document.createElement("div");
      cell.textContent = grid[r][c];
      cell.classList.add("grid-cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      wordGrid.appendChild(cell);
    }
  }
}

function placeWord(grid, word) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [-1, 1],
    [0, -1], [-1, 0], [-1, -1], [1, -1]
  ];
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);

    let r = row, c = col;
    let canPlace = true;

    for (let i = 0; i < word.length; i++) {
      if (r < 0 || c < 0 || r >= gridSize || c >= gridSize || (grid[r][c] && grid[r][c] !== word[i])) {
        canPlace = false;
        break;
      }
      r += dir[0];
      c += dir[1];
    }

    if (canPlace) {
      r = row;
      c = col;
      for (let i = 0; i < word.length; i++) {
        grid[r][c] = word[i];
        r += dir[0];
        c += dir[1];
      }
      return true;
    }
  }
  return false;
}

function populateWords() {
  wordList.innerHTML = "";
  currentWords.forEach(word => {
    const li = document.createElement("li");
    li.textContent = word;
    li.id = `word-${word}`;
    wordList.appendChild(li);
  });
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  totalTime = seconds;
  tickingStarted = false;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    totalTime--;
    updateTimerDisplay();

    if (totalTime === 9 && !tickingStarted) {
      tickingSound.currentTime = 0;
      tickingSound.play();
      tickingStarted = true;
    }

    if (totalTime === 0) {
      tickingSound.pause();
      tickingSound.currentTime = 0;
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDisplay.textContent = `Time Left: ${totalTime}s`;
  const offset = 282.6 * (1 - totalTime / 60);
  timerCircle.style.strokeDashoffset = offset;
}

function clearSelection() {
  selectedCells.forEach(cell => cell.classList.remove("selected"));
  selectedCells = [];
}

function handleMouseDown(e) {
  if (!gameActive) return;
  clearSelection();
  if (e.target.classList.contains("grid-cell")) {
    selectedCells.push(e.target);
    e.target.classList.add("selected");
  }
}

// ... (previous code remains the same until handleMouseEnter)

function handleMouseEnter(e) {
  if (!gameActive || selectedCells.length === 0) return;
  
  const target = e.target;
  if (!target.classList.contains("grid-cell")) return;
  
  const lastCell = selectedCells[selectedCells.length - 1];
  const lastRow = parseInt(lastCell.dataset.row);
  const lastCol = parseInt(lastCell.dataset.col);
  const targetRow = parseInt(target.dataset.row);
  const targetCol = parseInt(target.dataset.col);
  
  // Only allow adjacent cells (including diagonals)
  const rowDiff = Math.abs(targetRow - lastRow);
  const colDiff = Math.abs(targetCol - lastCol);
  
  if (rowDiff <= 1 && colDiff <= 1 && !selectedCells.includes(target)) {
    selectedCells.push(target);
    target.classList.add("selected");
  }
}

// ... (rest of the code remains the same)
function handleMouseUp() {
  if (!gameActive) return;
  checkWord();
}

function isStraightOrDiagonalPath(cells) {
  if (cells.length < 2) return false;
  const [first, second] = cells;
  const dRow = second.dataset.row - first.dataset.row;
  const dCol = second.dataset.col - first.dataset.col;

  const rowStep = dRow === 0 ? 0 : dRow / Math.abs(dRow);
  const colStep = dCol === 0 ? 0 : dCol / Math.abs(dCol);

  for (let i = 1; i < cells.length; i++) {
    const prev = cells[i - 1];
    const curr = cells[i];
    const rDiff = curr.dataset.row - prev.dataset.row;
    const cDiff = curr.dataset.col - prev.dataset.col;
    if (rDiff != rowStep || cDiff != colStep) return false;
  }
  return true;
}

function checkWord() {
  if (!isStraightOrDiagonalPath(selectedCells)) {
    clearSelection();
    return;
  }
  const word = selectedCells.map(c => c.textContent).join("");
  const reversed = word.split("").reverse().join("");
  const found = currentWords.find(w => w === word || w === reversed);

  if (found && !foundWords.has(found)) {
    selectedCells.forEach(cell => cell.classList.add("matched"));
    document.getElementById(`word-${found}`).classList.add("found");
    foundWords.add(found);
  }
  clearSelection();
  if (foundWords.size === currentWords.length) endGame(true);
}

function endGame(won) {
  gameActive = false;
  clearInterval(timerInterval);
  
  if (won) {
    // Show success message
    const message = "Congratulations! You found all words!";
    alert(message); // You can replace this with a prettier notification
  } else {
    // Show time's up popup
    popupOverlay.style.display = "flex";
  }
}

function resetGame() {
  popupOverlay.style.display = "none";
  startGame(currentLevel);
}

function goBack() {
  clearInterval(timerInterval);
  popupOverlay.style.display = "none";
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("difficultySelection").style.display = "flex";
}

// Event Listeners
wordGrid.addEventListener("mousedown", handleMouseDown);
wordGrid.addEventListener("mouseover", handleMouseEnter);
wordGrid.addEventListener("mouseup", handleMouseUp);

// Touch Events
wordGrid.addEventListener("touchstart", e => {
  if (!gameActive) return;
  const target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
  if (target?.classList.contains("grid-cell")) handleMouseDown({ target });
});

wordGrid.addEventListener("touchmove", e => {
  if (!gameActive || selectedCells.length === 0) return;
  const target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
  if (target?.classList.contains("grid-cell")) handleMouseEnter({ target });
});

wordGrid.addEventListener("touchend", handleMouseUp);
