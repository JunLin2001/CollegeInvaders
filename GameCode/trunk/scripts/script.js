/**
 * @todo SEARCH FOR '@todo' TO SEE ITEMS THAT STILL NEED TO BE WORKED ON
 *
 * @file script.js
 * @description script.js serves as the entry point for the game
 * This file contains logic to handle collisions between the three drawn entities.
 * This file runs code for the different States of the Game
 *    - Menu state - Main menu is displayed
 *    - Running state - Game is being played
 *    - Game Over state - Game over screen is displayed
 *
 * All Components to be drawn on the canvas must go through the startGame() method.
 *
 */

import Player from "./Player.js";
import Lives from "./Lives.js";
import Scoreboard from "./Scoreboard.js";
import BulletControl from "./BulletControl.js";
import EnemyGridController from "./enemy/EnemyGridController.js";
import Menu from "./menu/Menu.js";

import { CANVAS, SCORE_DISPLAY } from "./ui/uiConstants.js";
import { GAME_STATE } from "./gameLogic/gameState.js"; // {MENU, RUNNING, GAME_OVER}

let gameState = GAME_STATE.MENU; // set the initial state of the Game
let trueHighscore = 0; // track the current session's high score

// Image to be used for the Game background
// @todo - can change the dim (brightness)
const BACKGROUND = new Image(0, 0);
BACKGROUND.src = "./images/dim40Background.png";

// projectile handlers
const Bulletcon = new BulletControl(); // player projectile handler
const enemyProjectileController = new BulletControl(); // enemy projectile handler

// ui components
const health = new Lives(); // handle player Lives
const scoreboard = new Scoreboard(health, trueHighscore); // handle updating score

// sprites and sprite handlers
const player = new Player(Bulletcon); // User - controlled sprite
const enemyGridController = new EnemyGridController(); // controller to handle grid of Enemies

// Menu Screen object
const menu = new Menu(player); // use to display various Menu screens

// function to check lives and end the game if Player has no lives remaining
function checkHealth(menuHandler) {
  const currentHP = health.getCurrenthp();
  if (currentHP === 0) {
    gameState = GAME_STATE.GAME_OVER;
    menuHandler.setupGameOverMenuScreen(); // setup to display the Game Over screen
  }
}

// starts a new wave of enemies when the current grid is empty
function createNewEnemyWave(
  enemyGridController,
  playerProjectileController,
  enemyProjectileController
) {
  enemyGridController.createEnemies(); // create new grid of Enemies
  // remove all Player and Enemy projectiles from the screen to prevent bugs where
  // projectile will hit the new wave right when they appear on the screen.
  playerProjectileController.clearBullets();
  enemyProjectileController.clearBullets();
}

// method to draw the Player's lives and the Scores
function drawGameUiComponents(scoreboard, health) {
  scoreboard.drawScoreboard(SCORE_DISPLAY.X_POS, SCORE_DISPLAY.Y_POS);
  health.drawLives(CANVAS.CONTEXT);
}

// method to draw the background image on the canvas screen
function drawCanvas() {
  // the programs job here is to display the backgorund within the Canvas's height and width
  // the CANVAS.WIDTH and CANVAS.HEIGHT blows the image up to mathh the canvas border
  CANVAS.CONTEXT.lineWidth = 4;
  CANVAS.CONTEXT.drawImage(BACKGROUND, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
}

/**
 * @file script.js
 * @method startGame()
 * @description this function will serve as the entry point for the game
 * @function
 *    - This method will run approximately 60 frames per second
 *    - Switch statement to handle different States of the Game (MENU, RUNNING, GAME OVER)
 *    - The first line of this method will be to redraw the Canvas
 * @returns
 */
function startGame() {
  // redraw canvas backdrop on each frame
  drawCanvas();

  // Run code based on which Game state the User is currently in
  switch (gameState) {
    case GAME_STATE.MENU: // User is on the Menu Screen
      menu.draw(); // draw the current selected Menu Option

      // check if User has chosen to start playing the Game
      if (menu.hasGameStarted()) {
        gameState = GAME_STATE.RUNNING;
        // create the grid of enemies (prevents bug that persists grid of Enemies through different runs)
        createNewEnemyWave(enemyGridController, Bulletcon, enemyProjectileController);
      }
      break;

    case GAME_STATE.RUNNING: // Game is currently being played
      drawGameUiComponents(scoreboard, health);
      player.drawPlayer();

      // if no enemies are alive, create a new wave of enemies
      if (!enemyGridController.anyEnemiesAlive()) {
        createNewEnemyWave(enemyGridController, Bulletcon, enemyProjectileController);
        return; // goes to next frame = re-call the startGame() method
      } else {
        enemyGridController.draw(enemyProjectileController); // draw remaining enemies that are still alive
      }

      // checks for collisions between entities projectiles, Enemies and Player
      checkForCollisions();

      // check if the player still has any lives remaining - possible Game Over condition
      checkHealth(menu);

      // If an enemy has crossed into the Player area - possible Game Over condition
      if (enemyGridController.checkIfEnemyMovesPastPlayer()) {
        gameState = GAME_STATE.GAME_OVER; // update the state of the Game to end
        menu.setupGameOverMenuScreen(); // setup to display the Game Over screen
      }

      break;

    case GAME_STATE.GAME_OVER: // Game has ended
      // draw "Game Over" menu screen
      menu.draw(() =>
        // draw the score and the highscore on the Game Over screen
        scoreboard.drawScoreboard(CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2.5)
      );

      // update highscore if Player has a higher current score
      if (scoreboard.score > trueHighscore) {
        trueHighscore = scoreboard.score;
      }

      // check if the User has chosen to Play Again
      if (menu.toPlayAgain()) {
        gameState = GAME_STATE.MENU; // go back to Main Menu
        health.resetHp(); // reset Player Lives for the next run
        scoreboard.resetScore(); // reset the Player's current score. Highscore will persist
      }
      break;

    default: // Entered unknown Game State
      console.log("Error: How did I get here?");
      break;
  }
}

/* ------------------- COLLISIONS ------------------- */

// Method to check if there are any collisions between:
// Enemy projectiles and the Player
// Player projectiles and Enemies
function checkForCollisions() {
  searchForCollisions(enemyProjectileController, playerCollisionHandler); // Enemy Projectiles and Player collisions
  searchForCollisions(Bulletcon, enemyCollisionHandler); // Player projectiles and Enemies collision
  searchForCollisions(Bulletcon, projectileCollisionHandler); // Player Projectile and Enemy Projectile collision
}

// helper method to check which entities collided and run corresponding code
function searchForCollisions(projectileController, collisionHandler) {
  const projectiles = projectileController.getBulletInfo();
  if (projectiles.length) {
    // if any projectiles exist
    projectiles.forEach((projectile) => {
      collisionHandler(projectile);
    });
  }
}

// method to handle collisions between Player projectiles and Enemies in the grid
function enemyCollisionHandler(projectile) {
  enemyGridController.getEnemyGrid().forEach((enemyRow, rowIndex, enemyGrid) => {
    enemyRow.forEach((enemy, index) => {
      if (enemy) {
        // compare enemy projectile edges against player edges for overlapping areas
        // if projectile hits Enemy, destroy Enemy, destroy projectile, update score
        if (collisionDetected(enemy, projectile)) {
          // console.log("Enemy was hit");

          // destroy Player projectile on Enemy collision
          Bulletcon.destroyBullet(projectile);

          // destroy the Enemy that was hit by Player projectile
          enemyGrid[rowIndex][index] = false; // indicate the Enemy was destroyed in the 2d grid

          // update Player score a predetermined amount
          scoreboard.addToScore(250);
        }
      }
    });
  });
}

// method to handle collisions between Enemy projectiles and the Player
function playerCollisionHandler(projectile) {
  // compare Player projectile edges against all Enemy edges for overlapping areas
  // if projectile hits Player, decrease Player lives by 1, destroy projectile
  if (collisionDetected(player, projectile)) {
    // console.log("Player was hit");

    // destroy Enemy projectile that collided with Player sprite
    enemyProjectileController.destroyBullet(projectile);

    // decrement Player's health
    health.healthModifier(-1);
  }
}

// method to handle collisions between Enemy projectile and Player projectile
function projectileCollisionHandler(playerProjectile) {
  const enemyProjectiles = enemyProjectileController.getBulletInfo();
  if (enemyProjectiles.length > 0) {
    enemyProjectiles.forEach((enemyProjectile) => {
      if (collisionDetected(playerProjectile, enemyProjectile)) {
        // destroy both Player and Enemy projectiles on collision
        enemyProjectileController.destroyBullet(enemyProjectile);
        Bulletcon.destroyBullet(playerProjectile);
      }
    });
  }
}

// method to determine if two entities collided by checking the corresponding coordinates of each entity
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
    projectileBottom <= spriteTop || // projectile above the Enemy OR projectile above the Player
    projectileTop >= spriteBottom || // projectile under the Enemy OR projectile under the Player
    projectileLeft >= spriteRight || // projectile right of Enemy OR projectile right of Player
    projectileRight <= spriteLeft // projectile left of Enemy OR projectile left of Player
  ) {
    return false;
  } else {
    return true;
  }
}

//repeatedly calls a function or executes a code snippet, with a fixed time delay between each call calling the function 60 times a second the delay is in miliseconds, 1000 miliseconds is 1 second.
setInterval(startGame, 1000 / 60);
