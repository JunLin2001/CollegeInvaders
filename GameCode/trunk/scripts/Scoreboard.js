/**
 * @todo SEARCH FOR '@todo' TO SEE ITEMS THAT STILL NEED TO BE WORKED ON
 *
 * @file Scoreboard.js
 * @description The Scoreboard class will define methods to draw the Player's current score on the canvas
 * Define methods to draw the sessions' Highscore on the canvas
 * Update the Player's current score
 * Update the extra life score count, used to determine when the Player receives and extra life
 */

import { CANVAS } from "./ui/uiConstants.js";

class Scoreboard {
  constructor(health, trueHighscore) {
    this.score = 0; // Player's current score
    this.scoreStorage = 0; // keeps track of extra lives score criteria
    this.highscore = trueHighscore;
    this.health = health;

    this.addToScore = this.addToScore.bind(this);
    this.addExtra = this.addExtra.bind(this);
    this.trackHighScore = this.trackHighScore.bind(this);
    this.resetScore = this.resetScore.bind(this);
    this.drawScoreboard = this.drawScoreboard.bind(this);
  }

  /**
   * @file Scoreboard.js
   * @method addToScore()
   * @description method to update the current score and the extra life score criteria
   * @function
   *    - add to the Player's current score
   *    - add to the extra life score
   * @param {Number} num
   * @returns none
   */
  addToScore(num) {
    this.score += num;
    this.scoreStorage += num;
  }

  // method to add the extra life every time the Player acquires 10,000 points
  addExtra() {
    if (this.scoreStorage == 10000) {
      this.scoreStorage -= 10000;
      this.health.healthModifier(1);
    }
  }

  // method to update the highscore if Player's current score exceeds the previous highscore
  trackHighScore() {
    if (this.score > this.highscore) {
      this.highscore = this.score;
    }
  }

  // method to reset the Player's current score and the extra life score count
  resetScore() {
    this.score = 0;
    this.scoreStorage = 0;
  }

  // method to draw both the Player's current score and the Highscore to the canvas screen
  // this method will be called continuously
  drawScoreboard(xPos, yPos) {
    const scoreText = "Score: " + this.score;
    const highScoreText = "Highscore: " + this.highscore;
    CANVAS.CONTEXT.font = "20px Arial";
    CANVAS.CONTEXT.fillStyle = "white";

    CANVAS.CONTEXT.fillText(scoreText, xPos, yPos);
    CANVAS.CONTEXT.fillText(highScoreText, xPos, yPos + 20);

    this.trackHighScore();
    this.addExtra();
  }
}

export default Scoreboard;
