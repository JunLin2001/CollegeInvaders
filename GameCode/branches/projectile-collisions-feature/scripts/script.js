import Enemy from "./Enemy.js";
import Player from "./Player.js";
import Lives from "./Lives.js";
import BulletControl from "./BulletControl.js";

// global
const CANVAS = document.getElementById("game-canvas");
const CANVAS_CONTEXT = CANVAS.getContext("2d");

// set canvas dimensions
CANVAS.width = 855; //655
CANVAS.height = 750;

// 4 rows and 5 columns will create 20 enemies
const MAX_ENEMIES_ROWS = 4;
const MAX_ENEMIES_COLS = 5;

// spacing between enemy objects on the canvas
const HORIZONTAL_SPACING = CANVAS.width / MAX_ENEMIES_COLS;
const VERTICAL_SPACING = CANVAS.height / 2 / MAX_ENEMIES_ROWS;

// function to create a grid of enemies with different positions - 2d array
// *** slight bug where some enemies start offscreen --> adjust offsets ***
function createEnemies() {
  const enemyList = [];
  for (let i = 1; i <= MAX_ENEMIES_ROWS; i++) {
    const enemyRow = [];
    for (let j = 1; j <= MAX_ENEMIES_COLS; j++) {
      const xOffset = HORIZONTAL_SPACING * j; // horizontal space between adjacent enemies
      const yOffset = VERTICAL_SPACING * i; // vertical space between enemies

      // create the Enemy object and add to the list of enemies
      const enemy = new Enemy(CANVAS.width, CANVAS.height, xOffset, yOffset);
      enemyRow.push(enemy);
    }
    enemyList.push(enemyRow);
  }
  return enemyList;
}

// change the movement direction of every enemy still alive in the enemy grid
function changeEnemyDirection(enemyGrid, goingRight) {
  enemyGrid.forEach((enemyRow) => {
    enemyRow.forEach((enemy) => {
      if (goingRight === true) {
        enemy.setDirectionRight();
      } else {
        enemy.setDirectionLeft();
      }
    });
  });
}

// get all enemies closest to the left canvas wall
function findLeftMostEnemies(enemyList) {
  return enemyList.map((enemyRow) => enemyRow[0]); // get the first enemy in each row
}

// get all enemies closest to the right canvas wall
function findRightMostEnemies(enemyList) {
  return enemyList.map((enemyRow) => enemyRow[MAX_ENEMIES_COLS - 1]);
}

// get all the enemies that are on the last row in enemy grid
function findBottomMostEnemies(enemyList) {
  return enemyList[enemyList.length - 1];
}

const Bulletcon = new BulletControl(CANVAS);
const enemyProjectileController = new BulletControl(CANVAS);

const health = new Lives(CANVAS);
const player = new Player(CANVAS.width, CANVAS.height, Bulletcon, health);
const enemyGrid = createEnemies();

const leftMostEnemies = findLeftMostEnemies(enemyGrid);
const rightMostEnemies = findRightMostEnemies(enemyGrid);
const bottomMostEnemies = findBottomMostEnemies(enemyGrid);

// this function serves as the entry point for the game and will run at 60 frames per second
function startGame() {
  // redraw canvas backdrop
  CANVAS_CONTEXT.fillStyle = "black";
  CANVAS_CONTEXT.lineWidth = 4;
  CANVAS_CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

  Bulletcon.draw(CANVAS_CONTEXT);
  health.drawLives(CANVAS_CONTEXT);
  player.drawPlayer(CANVAS_CONTEXT);

  // draw all enemies
  enemyGrid.forEach((enemyRow) => {
    enemyRow.forEach((enemy) => {
      enemy.draw(CANVAS_CONTEXT);
    });
  });

  // check if any of the current left side enemies are still alive
  if (leftMostEnemies.length > 0) {
    // check if any of the left most enemies have touched the left canvas wall
    // Fine to check just one enemy if they are all aligned on the same x-coordinate
    if (leftMostEnemies[0].xPosition <= 30) {
      changeEnemyDirection(enemyGrid, true); // if wall hit, make enemies go right
    }
  }

  // check if any of the current right side enemies are still alive
  if (rightMostEnemies.length > 0) {
    if (rightMostEnemies[0].xPosition >= CANVAS.width - 70) {
      // enemy body width is 40
      changeEnemyDirection(enemyGrid, false); // if right wall hit, make enemies go left
    }
  }

  // Only the bottom most enemies should be able to shoot
  // **** Implementation bug -> if one enemy from the bottom row disappears the enemy above should start shooting even if there are still enemies on the row beneath ****
  if (bottomMostEnemies.length > 0) {
    bottomMostEnemies.forEach((enemy) => {
      const enemyX = enemy.getXCoord() + enemy.getWidth() / 2;
      const enemyY = enemy.getYCoord() + enemy.getHeight();
      const randomDelay = Math.floor(Math.random() * 1000);
      const enemyProjSpeed = -3; // should be negative to allow bullets to go down
      const projHit = false;
      enemyProjectileController.shoot(enemyX, enemyY, enemyProjSpeed, projHit, randomDelay);
    });
    enemyProjectileController.draw(CANVAS_CONTEXT);
  }

  // collision detection for enemy projectiles
  const enemyProjectiles = enemyProjectileController.getBulletInfo();
  if (enemyProjectiles.length) {
    // if there exists any enemy projectiles
    // compare enemy projectile edges against player edges for overlapping areas
    enemyProjectiles.forEach((projectile) => {
      if (collisionDetected(player, projectile)) {
        // do something with collision
        console.log("Player was hit");
      }
    });
  }

  // collision detection for Player projectiles
  const playerProjectiles = Bulletcon.getBulletInfo();
  if (playerProjectiles.length) {
    // if there exists any player projectiles
    // compare player projectile edges against all BOTTOM ENEMY edges for overlapping areas
    playerProjectiles.forEach((projectile) => {
      bottomMostEnemies.forEach((enemy) => {
        if (collisionDetected(enemy, projectile)) {
          // do something with collision
          console.log("enemy was hit");
        }
      });
    });
  }
}

function collisionDetected(sprite, projectile) {
  const spriteTop = sprite.getTopEdge();
  const spriteBottom = sprite.getBottomEdge();
  const spriteRight = sprite.getRightEdge();
  const spriteLeft = sprite.getLeftEdge();

  const projectileTop = projectile.getTopEdge();
  const projectileBottom = projectile.getBottomEdge();
  const projectileRight = projectile.getRightEdge();
  const projectileLeft = projectile.getLeftEdge();

  // collision detected if all are conditions are false
  // no collision if at least ONE condition is true
  if (
    projectileBottom <= spriteTop || // projectile above the enemy OR projectile above the player
    projectileTop >= spriteBottom || // projectile under the enemy OR projectile under the player
    projectileLeft >= spriteRight || // projectile right of enemy OR projectile right of player
    projectileRight <= spriteLeft // projectile left of enemy OR projectile left of player
  ) {
    return false;
  } else {
    return true;
  }
}

//repeatedly calls a function or executes a code snippet, with a fixed time delay between each call calling the function 60 times a second the delay is in miliseconds, 1000 miliseconds is 1 second.
setInterval(startGame, 1000 / 60);
