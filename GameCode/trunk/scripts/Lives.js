/**
 * @todo SEARCH FOR '@todo' TO SEE ITEMS THAT STILL NEED TO BE WORKED ON
 *
 * @file Lives.js
 * @description the Lives class defines methods to track the Player's remaining lives
 * Defines methods to update lives count
 * Defines methods to draw the lives on the canvas screen
 *
 */

import { CANVAS } from "./ui/uiConstants.js";
import Scoreboard from "./Scoreboard.js";

class Lives {
  constructor() {
    this.maxHP = 3; // Maximum lives a Player can have at one time
    this.hp = this.maxHP; // current lives remaining for the Player
    this.tempHPBlock = false; // special Life obtained through special criteria

    // Lives sprite and position
    this.width = 40;
    this.height = 25;
    this.positionY = 10;

    this.hearts = this.hearts.bind(this);
    this.heartSlots = this.heartSlots.bind(this);
    this.healthModifier = this.healthModifier.bind(this);
    this.text = this.text.bind(this);
    this.drawLives = this.drawLives.bind(this);
    this.tempHP = this.tempHP.bind(this);
    this.livesBorder = this.livesBorder.bind(this);
    this.getCurrenthp = this.getCurrenthp.bind(this);
    this.resetHp = this.resetHp.bind(this);
  }

  /**
   * @file Lives.js
   * @method hearts()
   * @description draw the lives sprite
   * @function
   *    - draw the lives sprite at the given x-coord
   *    - predetermined y-coord, width, and height
   * @param {Number} xPosition
   * @returns none
   */
  hearts(xPosition) {
    CANVAS.CONTEXT.fillStyle = "lightgreen";
    CANVAS.CONTEXT.fillRect(xPosition, this.positionY, this.width, this.height);
  }

  // method to draw a darker green border around the lives sprite
  heartSlots(xPosition) {
    CANVAS.CONTEXT.strokeStyle = "green";
    CANVAS.CONTEXT.strokeRect(xPosition, this.positionY, this.width, this.height);
  }

  /**
   * @file Lives.js
   * @method healthModifier()
   * @description update the Player's health depending on the given input
   * @function
   *    - draw the lives sprite at the given x-coord
   *    - predetermined y-coord, width, and height
   * @param {Number} xPosition
   * @returns none
   */
  healthModifier(i) {
    //negative for taking damage, positive for adding health
    this.hp = this.hp + i;

    // if the Player does not have a special temporary life block, add 1 to lives count
    if (this.tempHPBlock == false) {
      this.maxHP = this.maxHP + i;
    }

    // if the Player already has 3 life blocks, do not add any more
    if (this.maxHP > 3) {
      this.maxHP = 3;
    }
  }

  // method to display number of Player lives remaining in plain text
  text() {
    const text = "Lives: " + this.hp;
    CANVAS.CONTEXT.font = "20px Arial";
    CANVAS.CONTEXT.fillText(text, 250, 40);
    CANVAS.CONTEXT.fillStyle = "white";
  }

  // lives shape
  drawLives() {
    for (let i = 1; i <= this.maxHP - 1; i++) {
      //hearts filled
      let j = i * 60;
      this.hearts(j);
      this.heartSlots(j);
    }

    this.livesBorder();
    this.text();
    this.tempHP();
  }

  // method to display the special Temp life block and distinguish it from regular life blocks
  tempHP() {
    //extra lives appearance
    let s = Scoreboard.score;

    // add temp life block each time Player accumulates 10000 points
    // reset the criteria after adding the temp life block
    // dont add a temp life block if player already has 3 lives remaining
    if (s >= 10000 || this.hp > 3) {
      CANVAS.CONTEXT.fillStyle = "DeepSkyBlue";
      CANVAS.CONTEXT.fillRect(3 * 60, 10, 40, 25); // temp life block 
      CANVAS.CONTEXT.strokeStyle = "DarkBlue";
      CANVAS.CONTEXT.strokeRect(3 * 60, 10, 40, 25); // border around temp life block
      this.tempHPBlock = true;
    } else {
      this.tempHPBlock = false;
    }
  }

  // method to draw a border to indicate the section where the lives will be displayed
  livesBorder() {
    if (this.tempHPBlock == false) {
      CANVAS.CONTEXT.strokeStyle = "white";
      CANVAS.CONTEXT.strokeRect(40, 5, 49 * 3, 40);
    } else {
      // if Player has temp life block, widen the lives section border
      CANVAS.CONTEXT.strokeStyle = "white";
      CANVAS.CONTEXT.strokeRect(40, 5, 49 * 4, 40);
    }
  }

  // getter method to return the Player's current life count
  getCurrenthp() {
    return this.hp;
  }

  // method to reset the Player's lives to the initial state
  resetHp() {
    this.maxHP = 3;
    this.hp = this.maxHP;
  }
}
export default Lives;
