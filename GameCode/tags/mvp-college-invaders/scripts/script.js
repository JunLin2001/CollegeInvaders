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
// does not modify the enemy grid
function changeEnemyDirection(enemyGrid, toGoRight) {
  enemyGrid.forEach((enemyRow) => {
    enemyRow.forEach((enemy) => {
      // check if the enemy exists
      if (enemy) {
        if (toGoRight === true) {
          enemy.setDirectionRight(); // bounce off left wall and move right
        } else {
          enemy.setDirectionLeft(); // bounce off right wall and move left
        }
        enemy.moveDown(); // move enemy down
        // check if an enemy has reached the bottom of the player area == game over
        if (enemy.getBottomEdge() >= CANVAS.height - (BOTTOM_PADDING - 40)) {
          isGameOver = true;
        }
      }
    });
  });
}

// get all enemies in the column closest to the left canvas wall bound
// does not modify the enemy grid
function findLeftMostEnemies(enemyList) {
  const leftEnemies = [];
  for (let row = 0; row < enemyList.length; row++) {
    const enemy = enemyList[row][0];
    // if the enemy exists add it to the list of left-most enemies
    // ordering does not matter, list does not need to equal length of entire column
    if (enemy) {
      leftEnemies.push(enemy);
    }
  }

  return leftEnemies;
}

// get the column of enemies closest to the right canvas wall bound
// does not modify the enemy grid
function findRightMostEnemies(enemyList) {
  const rightEnemies = [];
  for (let row = 0; row < enemyList.length; row++) {
    const lastColIndex = enemyList[row].length - 1;
    const enemy = enemyList[row][lastColIndex];
    // if enemy exists add to the list of right-most enemies
    // ordering does not matter, list does not need to equal length of entire column
    if (enemy) {
      rightEnemies.push(enemy);
    }
  }

  return rightEnemies;
}

// get all the enemies that are on the last row in enemy grid
// does not modify the enemy grid
function findBottomMostEnemies(enemyList) {
  const bottomEnemies = [];
  const bottomRowIndex = enemyList.length - 1;
  const bottomRow = enemyList[bottomRowIndex]; // get the bottom-most row of enemies

  // iterate over the bottom-most row on the enemy grid
  for (let col = 0; col < bottomRow.length; col++) {
    const enemy = bottomRow[col];
    // if the enemy exists, add to list of bottom enemies
    if (enemy) {
      bottomEnemies.push(enemy);
    } else {
      // if enemy in bottom row does not exist,
      // then search upwards for the next living enemy
      for (let row = bottomRowIndex - 1; row >= 0; row--) {
        const nextEnemy = enemyList[row][col];
        if (nextEnemy) {
          bottomEnemies.push(nextEnemy); 
          break; // only need the first occurence of the next living enemy
        }
      }
    }
  }

  return bottomEnemies;
}

// if no enemies are alive on the bottom-most row, clears the row
// modifies the enemy grid
function clearEnemyGridRows(enemyList) {
  const bottomRowIndex = enemyList.length - 1;
  for (let col = 0; col < enemyList[bottomRowIndex].length; col++) {
    const enemy = enemyList[bottomRowIndex][col];
    // if at least one enemy exists on the bottom row, do nothing
    if (enemy) {
      return false;
    }
  }

  enemyList.pop(); // remove the last row of the enemy grid if no enemy on bottom row
  return true;
}

// remove any empty columns in the enemy grid
// modifies the enemy grid
function clearEnemyGridColumns(enemyList) {
  // make an array of size equal to enemy grid columns remaining, values all set to 0
  const emptyColumnIndexes = new Array(enemyList[0].length).fill(0);
  // need to check through entire grid to know if there is an empty column
  for (let row = 0; row < enemyList.length; row++) {
    for (let col = 0; col < enemyList[row].length; col++) {
      const isEnemyAlive = enemyList[row][col];
      // if enemy exists, we know that the column is not empty
      if (isEnemyAlive) {
        emptyColumnIndexes[col]++; // increment the corresponding index
      }
    }
  }

  // go through array of column indices
  // if value = 0, then the column denoted by the array index is completely empty
  for (let colIdx = 0; colIdx < emptyColumnIndexes.length; colIdx++) {
    const isNotEmpty = emptyColumnIndexes[colIdx];
    if (!isNotEmpty) {
      // remove the empty column by going through each row at the specified index
      for (let row = 0; row < enemyList.length; row++) {
        const enemyRow = enemyList[row];
        enemyRow.splice(colIdx, 1);
      }
    }
  }

  return true;
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
function checkHealth() {
  let currentHP = health.getCurrenthp();
  if (currentHP == 0) {
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

    //a method to check the
    checkHealth();

    /***  THIS WILL BE REMOVED. ONLY HERE FOR TESTING  ***/
    if (enemyGrid.length === 0) {
      isGameOver = true;
      return;
    }


    // if no enemies are alive, create a new wave of enemies
    if (enemyGrid.length === 0) {
      // TODO: Recreate Enemy Grid when finished with a wave
    } else if (enemyGrid.length > 0) {

      /***  
        THIS NEEDS REFACTORING  
        Clearing the last enemy row will make the grid empty, but will continue to run
      ***/
      clearEnemyGridRows(enemyGrid);
      if (enemyGrid.length === 0) {
        return;
      }

      /*** 
        THIS NEEDS REFACTORING
        If the grid was cleared from the previous call to clearEnemyGridRows()
        This method will throw an error trying to run functions on undefined object
      ***/
      clearEnemyGridColumns(enemyGrid);
      if (enemyGrid.length === 0) {
        return;
      }
      // if any enemies are alive, draw the remaining enemies
      enemyGrid.forEach((enemyRow) => {
        enemyRow.forEach((enemy) => {
          if (enemy) {
            enemy.draw(CANVAS_CONTEXT);
          }
        });
      });
    }

    // check if any of the current left side enemies are still alive
    leftMostEnemies = findLeftMostEnemies(enemyGrid);
    if (leftMostEnemies.length > 0) {
      // check if any of the left most enemies have touched the left canvas wall
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
    bottomMostEnemies = findBottomMostEnemies(enemyGrid);
    if (bottomMostEnemies.length > 0) {
      bottomMostEnemies.forEach((enemy) => {
        if (enemy) {
          const enemyX = enemy.getXCoord() + enemy.getWidth() / 2;
          const enemyY = enemy.getYCoord() + enemy.getHeight();
          const randomDelay = Math.floor(Math.random() * 500);
          const enemyProjSpeed = -3; // should be negative to allow bullets to go down
          const projHit = false;
          enemyProjectileController.shoot(enemyX, enemyY, enemyProjSpeed, projHit, randomDelay);
        }
      });
      enemyProjectileController.draw(CANVAS_CONTEXT);
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

          // decrement player's health
          health.healthModifier(-1);
        }
      });
    }

    // collision detection for Player projectiles
    const playerProjectiles = Bulletcon.getBulletInfo();
    // if there exists any player projectiles
    if (playerProjectiles.length) {
      // compare player projectile edges against all BOTTOM ENEMY edges for overlapping areas
      playerProjectiles.forEach((projectile) => {
        enemyGrid.forEach((enemyRow, rowIndex, enemyGridList) => {
          enemyRow.forEach((enemy, index) => {
            if (enemy) {
              // if bullet hits enemy, destroy enemy, destroy bullet, update score
              if (collisionDetected(enemy, projectile)) {
                console.log("Enemy was hit");
                // destroy bullet on enemy collision
                Bulletcon.destroyBullet(projectile);

                // destroy the enemy that was hit by player bullet
                enemyGridList[rowIndex][index] = false; // removes the enemy from the 2d grid

                // TODO: update player score
              }
            }
          });
        });
      });
    }

    // if game is over, draw "Game Over" screen
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
