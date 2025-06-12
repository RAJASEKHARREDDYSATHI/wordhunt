const wordGrid = document.getElementById("wordGrid");
const wordList = document.getElementById("wordList");
const message = document.getElementById("gameMessage");
const resetButton = document.getElementById("resetButton");
const gameContainer = document.getElementById("gameContainer");
const difficultySelection = document.getElementById("difficultySelection");
const timerDisplay = document.getElementById("timer");
const levelLabel = document.getElementById("levelLabel");
const tickingSound = document.getElementById("tickingSound");
const bgMusic = document.getElementById("bgMusic");

let gridSize = 10;
let currentGrid = [];
let currentWords = [];
let selectedCells = [];
let foundWords = new Set();
let isMouseDown = false;
let timer;
let timeLeft;

const difficulties = {
    very_easy: [["CAT", "DOG", "SUN", "CAR", "BUS"]],
    easy: [["TABLE", "APPLE", "GRAPE", "FISH", "BALL"]],
    medium: [["KEYBOARD", "ALGORITHM", "PYTHON", "BUTTON"]],
    hard: [["ZEPHYR", "JUXTAPOSE", "XYLOPHONE", "QUIZZICAL"]]
};

const levelTimes = {
    very_easy: 60,
    easy: 90,
    medium: 120,
    hard: 150
};

document.getElementById("darkModeToggle").addEventListener("change", e => {
    document.body.classList.toggle("dark", e.target.checked);
});

document.getElementById("gridSizeToggle").addEventListener("change", e => {
    gridSize = e.target.checked ? 14 : 10;
});

document.getElementById("musicToggle").addEventListener("change", e => {
    e.target.checked ? bgMusic.play() : bgMusic.pause();
});

function getRandomLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function generateGrid(words) {
    currentGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

    for (let word of words) {
        let placed = false;
        while (!placed) {
            let dir = Math.floor(Math.random() * 2); // 0: horizontal, 1: vertical
            let row = Math.floor(Math.random() * gridSize);
            let col = Math.floor(Math.random() * gridSize);

            if (dir === 0 && col + word.length <= gridSize &&
                currentGrid[row].slice(col, col + word.length).every((c, i) => c === "" || c === word[i])) {
                for (let i = 0; i < word.length; i++) currentGrid[row][col + i] = word[i];
                placed = true;
            } else if (dir === 1 && row + word.length <= gridSize &&
                currentGrid.slice(row, row + word.length).every((r, i) => r[col] === "" || r[col] === word[i])) {
                for (let i = 0; i < word.length; i++) currentGrid[row + i][col] = word[i];
                placed = true;
            }
        }
    }

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (!currentGrid[r][c]) currentGrid[r][c] = getRandomLetter();
        }
    }
}

function renderGrid() {
    wordGrid.innerHTML = "";
    wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;

    currentGrid.forEach((row, r) => {
        row.forEach((char, c) => {
            const cell = document.createElement("div");
            cell.textContent = char;
            cell.className = "grid-cell";
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener("mousedown", handleMouseDown);
            cell.addEventListener("mouseenter", handleMouseEnter);
            wordGrid.appendChild(cell);
        });
    });
    document.body.addEventListener("mouseup", handleMouseUp);
}

function renderWordList(words) {
    wordList.innerHTML = "";
    words.forEach(word => {
        const li = document.createElement("li");
        li.textContent = word;
        li.id = `word-${word}`;
        wordList.appendChild(li);
    });
}

function handleMouseDown(e) {
    isMouseDown = true;
    selectedCells = [];
    clearSelection();
    selectCell(e.target);
}

function handleMouseEnter(e) {
    if (!isMouseDown) return;
    selectCell(e.target);
}

function handleMouseUp() {
    isMouseDown = false;
    checkWord();
}

function selectCell(cell) {
    if (!cell.classList.contains("grid-cell") || cell.classList.contains("matched") || selectedCells.includes(cell)) return;
    selectedCells.push(cell);
    cell.classList.add("selected");
}

function clearSelection() {
    document.querySelectorAll(".grid-cell.selected").forEach(c => c.classList.remove("selected"));
    selectedCells = [];
}

function checkWord() {
    let word = selectedCells.map(cell => cell.textContent).join("");
    let reversed = word.split("").reverse().join("");
    let found = currentWords.find(w => w === word || w === reversed);

    if (found && !foundWords.has(found)) {
        selectedCells.forEach(cell => cell.classList.add("matched"));
        document.getElementById(`word-${found}`).classList.add("found");
        foundWords.add(found);
    }

    clearSelection();
    if (foundWords.size === currentWords.length) endGame(true);
}

function startGame(level) {
    difficultySelection.style.display = "none";
    gameContainer.style.display = "flex";
    levelLabel.textContent = `Level: ${level.replace('_', ' ').toUpperCase()}`;
    currentWords = difficulties[level][0];
    foundWords.clear();
    message.style.display = "none";
    resetButton.style.display = "none";
    generateGrid(currentWords);
    renderGrid();
    renderWordList(currentWords);
    timeLeft = levelTimes[level];
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timerDisplay.style.display = "block";
    updateTimerDisplay();
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 10) tickingSound.play().catch(() => {});
        if (timeLeft <= 0) endGame(false);
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    timerDisplay.style.color = timeLeft <= 10 ? "red" : "#333";
}

function endGame(won) {
    clearInterval(timer);
    const msg = won ? "🎉 Congratulations! You found all the words!" : "⏰ Time's up! Better luck next time!";
    alert(msg);
    message.textContent = msg;
    message.style.display = "block";
    resetButton.style.display = "inline-block";
}

function resetGame() {
    difficultySelection.style.display = "flex";
    gameContainer.style.display = "none";
    levelLabel.textContent = "";
    clearInterval(timer);
}

resetGame();
