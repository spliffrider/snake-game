const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const statusEl = document.getElementById('status');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const bestKey = 'snake-best-score';

let snake, direction, nextDirection, food, score, best, loop, started, gameOver;

function reset() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  food = randomFood();
  score = 0;
  started = false;
  gameOver = false;
  updateScore();
  statusEl.textContent = 'Press any arrow key to start.';
  clearInterval(loop);
  draw();
}

function randomFood() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    if (!snake?.some(segment => segment.x === candidate.x && segment.y === candidate.y)) {
      return candidate;
    }
  }
}

function updateScore() {
  scoreEl.textContent = score;
  best = Math.max(Number(localStorage.getItem(bestKey) || 0), score);
  localStorage.setItem(bestKey, best);
  bestEl.textContent = best;
}

function step() {
  if (gameOver || (!started && direction.x === 0 && direction.y === 0)) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver = true;
    statusEl.textContent = `Game over. Final score: ${score}. Press space to restart.`;
    draw();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    updateScore();
    food = randomFood();
    statusEl.textContent = 'Nice.';
  } else {
    snake.pop();
  }

  draw();
}

function drawCell(x, y, color, radius = 4) {
  const pad = 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x * gridSize + pad, y * gridSize + pad, gridSize - pad * 2, gridSize - pad * 2, radius);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#243041';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCell(food.x, food.y, '#f87171', 10);
  snake.forEach((segment, index) => drawCell(segment.x, segment.y, index === 0 ? '#10b981' : '#34d399'));
}

window.addEventListener('keydown', (event) => {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
  };

  if (event.code === 'Space' && gameOver) {
    reset();
    return;
  }

  const move = keyMap[event.key];
  if (!move) return;

  if (move.x === -direction.x && move.y === -direction.y && started) return;
  nextDirection = move;
  if (!started) {
    started = true;
    direction = move;
    nextDirection = move;
    statusEl.textContent = 'Go.';
  }
});

bestEl.textContent = localStorage.getItem(bestKey) || 0;
loop = setInterval(step, 120);
reset();
