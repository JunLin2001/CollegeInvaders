import Enemy from "./Enemy.js";
import Player from "./Player.js";
import Lives from "./Lives.js";
import BulletControl from "./BulletControl.js";

let isGameOver = false;

// global
const CANVAS = document.getElementById("game-canvas");
const CANVAS_CONTEXT = CANVAS.getContext("2d");

// set canvas dimensions according to specs doc 640px by 480px
CANVAS.width = 640;
CANVAS.height = 480;

const SIDE_PADDING = 60; // left and right wall bounds according to specs doc
const TOP_PADDING = 40; // top bounds for ui containing score and lives
const BOTTOM_PADDING = 80; // bottom bounds for player area

// 5 rows and 11 columns will create 55 enemies according to specs doc
const MAX_ENEMIES_ROWS = 5;
const MAX_ENEMIES_COLS = 11;

// measurements based on specified size 640px by 480px canvas
const ENEMY_START_AREA_HEIGHT = CANVAS.height - (TOP_PADDING + BOTTOM_PADDING) - 160; // 200px
const ENEMY_START_AREA_WIDTH = CANVAS.width - SIDE_PADDING * 2; // 520px

// spacing between enemy objects on the canvas
// enemy sprites should be adjusted to fit inside a 40px by 40px area (based on 640 x 480px canvas)
const ENEMY_VERTICAL_SPACING = Math.floor(ENEMY_START_AREA_HEIGHT / MAX_ENEMIES_ROWS); // 40px
const ENEMY_HORIZONTAL_SPACING = Math.floor(ENEMY_START_AREA_WIDTH / MAX_ENEMIES_COLS - 7); // 40px

// function to create a grid of enemies with different positions - 2d array
function createEnemies() {
  const enemyList = [];
  for (let i = 1; i <= MAX_ENEMIES_ROWS; i++) {
    const enemyRow = [];
    for (let j = 1; j <= MAX_ENEMIES_COLS; j++) {
      const xOffset = SIDE_PADDING + ENEMY_HORIZONTAL_SPACING * j; // horizontal space between adjacent enemies
      const yOffset = ENEMY_VERTICAL_SPACING * i; // vertical space between enemies

      // create the Enemy object and add to the current enemy row
      const enemy = new Enemy(CANVAS.width, CANVAS.height, xOffset, yOffset);
      enemyRow.push(enemy);
    }

    // add the newly filled enemy row into the list of enemies
    enemyList.push(enemyRow);
  }
  return enemyList;
}

// change the movement direction of every enemy still alive in the enemy grid
// when enemy direction is changed, move all enemies downwards
function changeEnemyDirection(enemyGrid, toGoRight) {
  enemyGrid.forEach((enemyRow) => {
    enemyRow.forEach((enemy) => {
      if (toGoRight === true) {
        enemy.setDirectionRight(); // bounce off left wall and move right
      } else {
        enemy.setDirectionLeft(); // bounce off right wall and move left
      }
      enemy.moveDown(); // move enemy down

      // check if an enemy has reached the bottom of the play area == game over
      if (enemy.getBottomEdge() >= CANVAS.height - (BOTTOM_PADDING - 40)) {
        isGameOver = true;
      }
    });
  });
}




// get all enemies closest to the left canvas wall
function findLeftMostEnemies(enemyList) {
  const leftEnemies = [];
  for (let i = 0; i < enemyList.length; i++) {
    // console.log(enemyList[i][0]);
    leftEnemies.push(enemyList[i][0]);
  }

  return leftEnemies;
}

// get all enemies closest to the right canvas wall
function findRightMostEnemies(enemyList) {
  const rightEnemies = [];
  for (let i = 0; i < enemyList.length; i++) {
    // console.log(enemyList[i][enemyList[i].length - 1]);
    rightEnemies.push(enemyList[i][enemyList[i].length - 1]);
  }

  return rightEnemies;
}

// get all the enemies that are on the last row in enemy grid
function findBottomMostEnemies(enemyList) {
  return enemyList[enemyList.length - 1];
}

const Bulletcon = new BulletControl(CANVAS);
const enemyProjectileController = new BulletControl(CANVAS);

const health = new Lives(CANVAS);
const player = new Player(CANVAS.width, CANVAS.height, Bulletcon, health);

let enemyGrid = createEnemies();
let leftMostEnemies = findLeftMostEnemies(enemyGrid);
let rightMostEnemies = findRightMostEnemies(enemyGrid);
let bottomMostEnemies = findBottomMostEnemies(enemyGrid);

//function to check lives and end the game the same way if enemies reach bottom
function checkHealth(){
  let currentHP = health.getCurrenthp();
  if (currentHP == 0){
    isGameOver = true;
  }

}
// this function serves as the entry point for the game and will run at 60 frames per second
function startGame() {
  // redraw canvas backdrop
  CANVAS_CONTEXT.fillStyle = "black";
  CANVAS_CONTEXT.lineWidth = 4;
  CANVAS_CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

  // if game is not over, draw enemies, draw player, draw bullets
  if (!isGameOver) {
    health.drawLives(CANVAS_CONTEXT);
    player.drawPlayer(CANVAS_CONTEXT);

    //a method to check the lives
    checkHealth(); 
    
    // if no enemies are alive, create a new wave of enemies
    if (enemyGrid.length === 0) {
      // TODO: Recreate Enemy Grid when finished with a wave
    } else if (enemyGrid.length > 0) {
      // if any enemies are alive, draw the remaining enemies
      enemyGrid.forEach((enemyRow) => {
        enemyRow.forEach((enemy) => {
          enemy.draw(CANVAS_CONTEXT);
        });
      });
    }

    leftMostEnemies = findLeftMostEnemies(enemyGrid);
    // check if any of the current left side enemies are still alive
    if (leftMostEnemies.length > 0) {
      // check if any of the left most enemies have touched the left canvas wall
      // Fine to check just one enemy if they are all aligned on the same x-coordinate
      if (leftMostEnemies[0].getLeftEdge() <= SIDE_PADDING) {
        changeEnemyDirection(enemyGrid, true); // if wall hit, make enemies go right
      }
    }

    // check if any of the current right side enemies are still alive
    rightMostEnemies = findRightMostEnemies(enemyGrid);
    if (rightMostEnemies.length > 0) {
      if (rightMostEnemies[0].getRightEdge() >= CANVAS.width - SIDE_PADDING) {
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
        const randomDelay = Math.floor(Math.random() * 2000);
        const enemyProjSpeed = -3; // should be negative to allow bullets to go down
        const projHit = false;
        enemyProjectileController.shoot(enemyX, enemyY, enemyProjSpeed, projHit, randomDelay);
      });
      enemyProjectileController.draw(CANVAS_CONTEXT);
    } else if (bottomMostEnemies.length === 0) {
      // if all enemies on the bottom row have been destroyed, get the next bottom row
      enemyGrid.pop(enemyGrid.length - 1); // remove the empty row that was destroyed
      bottomMostEnemies = findBottomMostEnemies(enemyGrid); // get the next enemy row
    }

    // collision detection for enemy projectiles
    const enemyProjectiles = enemyProjectileController.getBulletInfo();
    // if there exists any enemy projectiles
    if (enemyProjectiles.length) {
      // compare enemy projectile edges against player edges for overlapping areas
      enemyProjectiles.forEach((projectile) => {
        // if bullet hits player, decrease player lives by 1, destroy bullet
        if (collisionDetected(player, projectile)) {
          console.log("Player was hit");
          // destroy bullet that collided with player sprite
          enemyProjectileController.destroyBullet(projectile);

          // TODO: decrement player's health
        }
      });
    }

    // collision detection for Player projectiles
    const playerProjectiles = Bulletcon.getBulletInfo();
    // if there exists any player projectiles
    if (playerProjectiles.length) {
      // compare player projectile edges against all BOTTOM ENEMY edges for overlapping areas
      playerProjectiles.forEach((projectile) => {
        bottomMostEnemies.forEach((enemy, index, bottomEnemies) => {
          // if bullet hits enemy, destroy enemy, destroy bullet, update score
          if (collisionDetected(enemy, projectile)) {
            console.log("Enemy was hit");
            // destroy bullet on enemy collision
            Bulletcon.destroyBullet(projectile);

            // destroy the enemy that was hit by player bullet
            bottomEnemies.splice(index, 1);

            // TODO: update player score
          }
        });
      });
    }

    // if game is over don't draw anything
  } else {
    CANVAS_CONTEXT.fillStyle = "white";
    CANVAS_CONTEXT.font = "50px Arial";
    // TODO: Fix text centering on canvas screen
    CANVAS_CONTEXT.fillText("Game Over", CANVAS.width / 4, CANVAS.height / 2);
    return;
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
