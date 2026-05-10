const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const BALL_SIZE = 6;
const GRAVITY = 0.15;
const SPEED = 6;

let mouseX = WIDTH / 2;

let round = 1;
let best = Number(localStorage.getItem("bestScore")) || 0;

document.getElementById("best").innerText = best;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
});

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.hitPowerups = new Set();
  }

  update() {
    this.vy += GRAVITY;
    this.y += this.vy;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

class Powerup {
  constructor(x, y, w, h, type, value) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.value = value;
    this.id = Math.random().toString();
  }

  draw() {
    if (this.type === "mult") {
      ctx.fillStyle = "#2ecc71";
    } else {
      ctx.fillStyle = "#3498db";
    }

    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(
      this.type === "mult" ? `x${this.value}` : "BOUNCE",
      this.x + 10,
      this.y + this.h / 2
    );
  }
}

let balls = [];
let powerups = [];

function randomPowerup(yMin, yMax) {
  const isBounce = Math.random() < 0.15;

  const w = 100 + Math.random() * (WIDTH / 2);
  const h = 30;

  const x = Math.random() * (WIDTH - w);
  const y = yMin + Math.random() * (yMax - yMin);

  if (isBounce) {
    return new Powerup(x, y, w, h, "bounce");
  }

  const multipliers = [2, 2, 2, 3, 3, 4, 6];
  const value = multipliers[Math.floor(Math.random() * multipliers.length)];

  return new Powerup(x, y, w, h, "mult", value);
}

function generateLevel() {
  powerups = [];

  for (let i = 0; i < 10; i++) {
    powerups.push(
      randomPowerup(100, HEIGHT - 200)
    );
  }
}

function startRound(ballCount) {
  balls = [];

  for (let i = 0; i < ballCount; i++) {
    balls.push(new Ball(mouseX, 50));
  }

  generateLevel();
}

startRound(3);

function collision(ball, p) {
  return (
    ball.x > p.x &&
    ball.x < p.x + p.w &&
    ball.y > p.y &&
    ball.y < p.y + p.h
  );
}

function update() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  powerups.forEach(p => p.draw());

  ctx.fillStyle = "red";
  ctx.fillRect(mouseX - 50, 20, 100, 20);

  let nextBalls = [];

  for (let ball of balls) {

    ball.x += (mouseX - ball.x) * 0.03;

    ball.update();

    for (let p of powerups) {

      if (ball.hitPowerups.has(p.id)) continue;

      if (collision(ball, p)) {

        ball.hitPowerups.add(p.id);

        if (p.type === "bounce") {
          ball.y = 0;
          ball.vy = 0;
        }

        if (p.type === "mult") {

          for (let i = 0; i < p.value - 1; i++) {

            const newBall = new Ball(ball.x, ball.y);

            newBall.hitPowerups = new Set(ball.hitPowerups);

            nextBalls.push(newBall);
          }
        }
      }
    }

    ball.draw();
  }

  balls.push(...nextBalls);

  balls = balls.filter(ball => ball.y < HEIGHT + 50);

  if (balls.length === 0) {

    round++;

    const score = Math.floor(Math.random() * 1000);

    if (score > best) {
      best = score;
      localStorage.setItem("bestScore", best);
      document.getElementById("best").innerText = best;
    }

    startRound(3);
  }

  document.getElementById("balls").innerText = balls.length;
  document.getElementById("round").innerText = round;

  requestAnimationFrame(update);
}

update();
