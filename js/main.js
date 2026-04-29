// config
const PIC_PATH = '../assets/img/';
const TOTAL_FISH = 15;
const FISH_EMOJIS = [
    { img: `${PIC_PATH}1-fish-icon.svg`},
    { img: `${PIC_PATH}2-fish-icon.svg`},
    { img: `${PIC_PATH}3-fish-icon.svg`},
    { img: `${PIC_PATH}4-fish-icon.svg`},
    { img: `${PIC_PATH}5-fish-icon.svg`},
    { img: `${PIC_PATH}6-fish-icon.svg`},
    { img: `${PIC_PATH}7-fish-icon.svg`},
    { img: `${PIC_PATH}8-shrimp-icon.svg`},
    { img: `${PIC_PATH}9-crab-icon.svg`},
    { img: `${PIC_PATH}10-fish-icon.svg`},
    { img: `${PIC_PATH}11-fish-icon.svg`}
];
const AQUARIUM_WIDTH = 900;
const AQUARIUM_HEIGHT = 550;
const FISH_SIZE = 40;
const BASE_SPEED = 1.5;

        // state
let fishArray = [],
caughtCount = 0,
gameStartTime = null,
timerInterval = null,
animationFrameId = null,
gameActive = false;

// DOM elements
const aqua = document.querySelector('.aqua');
const caughtEl = document.querySelector('.caught');
const remainingEl = document.querySelector('.remaining');
const timerEl = document.querySelector('.timer');
const victoryScreen = document.querySelector('.victory');
const finalScoreEl = document.querySelector('.final-score');
const finalTimeEl = document.querySelector('.final-time');

// bg bubbles
function createBgBubbles() {
    const container = document.querySelector('.bg-bubbles');
    container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('span');
        bubble.className = 'one-bubble';
        const size = Math.random() * 40 + 10;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.animationDuration = (Math.random() * 15 + 10) + 's';
        bubble.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(bubble);
    }
}

// seaweed
function createSeaweed() {
    const positions = [50, 150, 750, 830, 250, 680];
    positions.forEach((x, i) => {
        const seaweed = document.createElement('span');
        seaweed.className = 'seaweed';
        seaweed.style.left = x + 'px';
        const bladeCount = Math.floor(Math.random() * 2) + 2;
        for (let b = 0; b < bladeCount; b++) {
            const blade = document.createElement('span');
            blade.className = 'seaweed-blade';
            const height = Math.random() * 80 + 40;
            blade.style.height = height + 'px';
            blade.style.left = (b * 10 - 10) + 'px';
            blade.style.animationDuration = (Math.random() * 2 + 2) + 's';
            blade.style.animationDelay = (Math.random() * 1) + 's';
            blade.style.opacity = 0.5 + Math.random() * 0.3;
            seaweed.appendChild(blade);
        }
        aqua.appendChild(seaweed);
    });
}
// Fish class
class Fish {
    constructor(id) {
        this.id = id;
        this.alive = true;
        this.caught = false;
        this.size = FISH_SIZE;
        this.x = Math.random() * (AQUARIUM_WIDTH - this.size - 40) + 20;
        this.y = Math.random() * (AQUARIUM_HEIGHT - this.size - 80) + 20;
        this.speedX = (Math.random() - 0.5) * BASE_SPEED * 2;
        this.speedY = (Math.random() - 0.5) * BASE_SPEED * 2;
        // minimum speed
        if (Math.abs(this.speedX) < 0.3) this.speedX = this.speedX < 0 ? -0.5 : 0.5;
        if (Math.abs(this.speedY) < 0.3) this.speedY = this.speedY < 0 ? -0.5 : 0.5;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
        this.wobbleAmount = Math.random() * 0.5 + 0.2;
        this.turnTimer = Math.random() * 200 + 100;
        const random = Math.floor(Math.random() * FISH_EMOJIS.length);
        this.emoji = FISH_EMOJIS[random].img;
        this.element = null;
        this.createDOM();
    }

    createDOM() {
        const el = document.createElement('div');
        el.className = 'fish';
        el.id = 'fish-' + this.id;
        el.style.width = this.size + 'px';
        el.style.height = this.size + 'px';
        el.innerHTML = `<div class="fish-body">
                            <img src="${this.emoji}" width="${this.size}" height="${this.size}">
                        </div>`;

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.catchFish();
        });

        aqua.appendChild(el);
        this.element = el;
    }

    update() {
        if (!this.alive) return;
        // random direction change
        this.turnTimer--;
        if (this.turnTimer <= 0) {
            this.speedX += (Math.random() - 0.5) * 1.5;
            this.speedY += (Math.random() - 0.5) * 1.5;
            // clamp speed
            const maxSpeed = 3;
            const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
            if (speed > maxSpeed) {
                this.speedX = (this.speedX / speed) * maxSpeed;
                this.speedY = (this.speedY / speed) * maxSpeed;
            }
            this.turnTimer = Math.random() * 200 + 80;
        }

        // Wobble (gentle sine wave movement)
        this.wobblePhase += this.wobbleSpeed;
        const wobbleY = Math.sin(this.wobblePhase) * this.wobbleAmount;
        // Update position
        this.x += this.speedX;
        this.y += this.speedY + wobbleY * 0.3;
        // Bounce off walls with padding
        const padding = 5;
        if (this.x <= padding) {
            this.x = padding;
            this.speedX = Math.abs(this.speedX);
        }
        if (this.x >= AQUARIUM_WIDTH - this.size - padding) {
            this.x = AQUARIUM_WIDTH - this.size - padding;
            this.speedX = -Math.abs(this.speedX);
        }
        if (this.y <= padding) {
            this.y = padding;
            this.speedY = Math.abs(this.speedY);
        }
        if (this.y >= AQUARIUM_HEIGHT - this.size - 50) {
            this.y = AQUARIUM_HEIGHT - this.size - 50;
            this.speedY = -Math.abs(this.speedY);
        }
        // Flip fish based on direction
        const flip = this.speedX > 0 ? 'scaleX(-1)' : 'scaleX(1)';
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) ${flip}`;
    }

    catchFish() {
        if (this.caught || !this.alive) return;
        this.caught = true;
        this.alive = false;
        this.element.classList.add('caught');
        // Create ripple
        createRipple(this.x + this.size / 2, this.y + this.size / 2);
        // Create score popup
        createScorePopup(this.x, this.y);
        // Update score
        caughtCount++;
        caughtEl.textContent = caughtCount;
        remainingEl.textContent = TOTAL_FISH - caughtCount;
        // Remove after animation
        setTimeout(() => {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 500);
        // Check victory
        if (caughtCount >= TOTAL_FISH) {
            setTimeout(() => showVictory(), 600);
        }
    }
}

// effects
function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = (x - 40) + 'px';
    ripple.style.top = (y - 40) + 'px';
    aqua.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function createScorePopup(x, y) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.innerHTML = '+1 &#128032';
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    aqua.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

// clicking on empty area
aqua.addEventListener('click', (e) => {
    if (!gameActive) return;
    const rect = aqua.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createRipple(x, y);
});

// timer
function startTimer() {
    gameStartTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function getElapsedTime() {
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// victory
function showVictory() {
    gameActive = false;
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrameId);

    finalScoreEl.textContent = caughtCount;
    finalTimeEl.textContent = getElapsedTime();

    victoryScreen.classList.add('show');
    spawnConfetti();
}

function spawnConfetti() {
    const colors = ['#fbbf24', '#f59e0b', '#4ade80', '#3b82f6', '#f87171', '#a78bfa', '#fb923c'];
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}

// game looping
function gameLoop() {
    if (!gameActive) return;
    fishArray.forEach(fish => fish.update());
    animationFrameId = requestAnimationFrame(gameLoop);
}

// init-restart
function initGame() {
// Clear existing fish
    fishArray.forEach(f => {
        if (f.element && f.element.parentNode) {
            f.element.parentNode.removeChild(f.element);
        }
    });
// Remove old seaweed
    document.querySelectorAll('.seaweed').forEach(s => s.remove());
// Reset state
    fishArray = [];
    caughtCount = 0;
    gameActive = true;
    caughtEl.textContent = '0';
    remainingEl.textContent = TOTAL_FISH;
    timerEl.textContent = '0:00';
    victoryScreen.classList.remove('show');
// Create seaweed
    createSeaweed();
// Create fish
    for (let i = 0; i < TOTAL_FISH; i++) {
        fishArray.push(new Fish(i));
    }
// Start systems
    startTimer();
    gameLoop();
}

function restartGame() {
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrameId);
    initGame();
}
// Let's begin!
initGame();
createBgBubbles();

const restart = document.querySelector('.restart-btn');
restart.onclick = function() {
    restartGame();
}