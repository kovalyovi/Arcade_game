// Enemies our player must avoid
const MIN_SPEED = 400;
const MAX_SPEED = 800;
const LEFT_MAX = -250;
const RIGHT_MAX = 750;
const MOVE_HORIZONTAL = 100;
const MOVE_VERTICAL = 85;
const DISTANCE_CORRECTION = 15;
const PLAYER_START_X = 200;
const PLAYER_START_Y = 460;
const BUG_SIZE = 60;
const FIRST_LINE = 50;
const SECOND_LINE = 135;
const THIRD_LINE = 220;
const FOURTH_LINE = 305;
const LIVES_COUNT = 160;


let Enemy = function(position, direction = 1) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = direction > 0 ? 'images/enemy-bug.png' : 'images/enemy-bug-reversed.png';
    this.x = direction > 0 ? LEFT_MAX : RIGHT_MAX;
    this.y = position;
    this.speed = Math.floor(Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED) * direction;
    this.alive = true;
};


// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += dt * this.speed;
    if (this.x < LEFT_MAX || this.x > RIGHT_MAX) {
        this.alive = false;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
class Player {
    constructor() {
        this.sprite = 'images/char-boy.png';
        this.x = PLAYER_START_X;
        this.y = PLAYER_START_Y;
        this.alive = true;
        this.winner = false;
    }

    update(enemy) {
        if (enemy.y === this.y + DISTANCE_CORRECTION) {
            if (Math.floor(enemy.x) + BUG_SIZE  >= this.x &&
                Math.floor(enemy.x) - BUG_SIZE <= this.x) {
                this.alive = false;
                this.restart();
            }
        }
        this.winner = this.y < 0;
    }

    restart() {
        this.y = PLAYER_START_Y;
        this.alive = true;
        lives--;
    }

    render() {
        if (lives > 0) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    }

    updatePosition([newX, newY]) {
        if (!checkRock([newX, newY])) {
            this.x = newX;
            this.y = newY;
        }

        if (checkGem([newX, newY])) {
            gems[0].lives = 0;
            let score = parseInt(document.querySelector('.score-text').innerHTML);
            document.querySelector('.score-text').innerHTML = (++score).toString();
        }
    }

    handleInput(key) {
        if (this.alive) {
            let newX = this.x;
            let newY = this.y;
            if (key === 'left' && this.x > 0) {
                newX = this.x - MOVE_HORIZONTAL;
            } else if (key === 'right' && this.x < 485) {
                newX = this.x + MOVE_HORIZONTAL;
            } else if (key === 'up' && this.y > 0) {
                newY = this.y - MOVE_VERTICAL;
            } else if (key === 'down' && this.y < PLAYER_START_Y) {
                newY = this.y + MOVE_VERTICAL;
            }

            this.updatePosition([newX, newY]);
        }
    }
}

const GemEnum = {
    Blue: 'images/Gem Blue.png',
    Green: 'images/Gem Green.png',
    Orange: 'images/Gem Orange.png'
};

let random = Math.random();
let allEnemies = [];
let player = new Player();
let gems = [];
let rocks = [];
let lives = 5;

class Gem {
    constructor() {
        random = Math.random();
        this.x = MOVE_HORIZONTAL * Math.floor(Math.random() * 5);
        this.y = -50 + MOVE_VERTICAL * Math.floor(Math.random() * 6);
        if (random < 0.33) {
            this.sprite = GemEnum.Blue;
        } else if (random < 0.66) {
            this.sprite = GemEnum.Green;
        } else {
            this.sprite = GemEnum.Orange;
        }
        this.alive = true;
        this.lives = LIVES_COUNT;
    }

    update() {
        this.lives--;
        if (this.lives < 0) {
            this.remove();
        }
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    remove() {
        this.alive = false;
    }
}

function checkRock([newX, newY]) {
    let result = false;
    rocks.map(rock => {
        if (rock.x === newX && rock.y === newY) {
            result = true;
        }
    });
    return result;
}

function checkGem([newX, newY]) {
    let result = false;
    gems.map(gem => {
        if (gem.x === newX && gem.y === newY) {
            result = true;
        }
    });
    return result;
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

//ASYNC create them when less then 4 on the screen - spawn one with interval and range speed.
let gemInterval;

function initializeGame() {
    for (let num = 0; num < 3; num++) {
        let temp = Math.random();
        let position = temp < 0.25 ? FIRST_LINE: temp < 0.5 ? SECOND_LINE : temp < 0.75 ? THIRD_LINE : FOURTH_LINE;
        allEnemies.push(new Enemy(position));

        let column = temp < 0.17 ? 1 : temp < 0.33 ? 2 : temp < 0.50 ? 3 : temp < 0.67 ? 4 : temp < 0.83 ? 5 : 6;
        rocks.push(new Rock(column));
    }

    gemInterval = setInterval(() => gems.push(new Gem()), 5000)
}

function restartGame() {
    allEnemies = [];
    player = new Player();
    rocks = [];
    gems = [];
    lives = 5;

    initializeGame();
    document.querySelector('input').checked = true;
    clearInterval(gemInterval);

    removeTable();
}

function removeTable() {
    let table = document.querySelector('.won');
    if (table) {
        table.parentNode.removeChild(table);

        let gameField = document.querySelector('canvas');
        let characters = document.querySelector('.characters');
        let restartButton = document.querySelector('button');

        gameField.style.display = '';
        characters.style.display = 'inherit';
        restartButton.style.marginTop = "0";
        restartButton.style.position = 'static';
        restartButton.style.top = "0";
    }
}

class Rock {
    constructor(column) {
        this.x = MOVE_HORIZONTAL * column;
        this.y = 375;
        this.sprite = 'images/Rock.png';
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

function changeCharacter(e) {
    let field = e.target;
    if (field.tagName === "IMG") {
        if (field.hasAttribute('src')) {
            player.sprite = field.getAttribute('src');
        }
    }
}

setTimeout(() => {
    document.querySelector('button').addEventListener('click', restartGame);
    document.querySelector('.characters').addEventListener('click', changeCharacter);
}, 1000);
