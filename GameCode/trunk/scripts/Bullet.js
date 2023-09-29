/**
 * @file Bullet.js
 *
 * @description
 * The Bullet class is the basic structure for how the bullet itself will look like
 * Here the size, length and width are adjusted to fit the approtite projectile being thrown accross the screen for either the player or enemy
 *
 * Movement of the projectile will always be verticle going up or down the screen.
 */

import { CANVAS } from "./ui/uiConstants.js";
import { getSpriteDimensions } from "./spriteDimensions.js";

class Bullet {
  /**
   *
   * @param {coordinate} x - x coordinate of the bullet on the  screen
   * @param {coordinate} y - y coordinate of the bullet on screen
   * @param {number} speed - the speed the bullet will travel up the screen
   */
  constructor(x, y, speed, shooter) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = 20;
    this.height = 25;
    this.shooter = shooter;

    // create Image for the bullet sprite
    this.spritePROJ = new Image();

    // Checker to see who is shooting either the player of the enemy
    if (this.shooter == "player") {
      // player will shoot crumpled balls of paper
      this.spritePROJ.src = "./images/Paperball_2.png";
      this.spriteDimensions = getSpriteDimensions("playerBullet");
    } else {
      // create and animate an enemy projectile
      this.spritePROJ.src = "./images/projectileFpaper.png";
      this.spriteDimensions = getSpriteDimensions("enemyBullet");
    }

    // values used to loop through the images on the spritesheet
    this.spriteImageCount = this.spriteDimensions.imageCount; // retrieve number of images in the spritesheet
    this.frameIndex = 0; // which sprite image in the spritesheet is currently being drawn
    this.frameCount = 0; // counter for how long before moves on to draw the next image in the spritesheet
    this.maxFrameCount = 20; // max count the frameCount can reach before being reset

    this.draw = this.draw.bind(this);
    this.getBottomEdge = this.getBottomEdge.bind(this);
    this.getTopEdge = this.getTopEdge.bind(this);
    this.getRightEdge = this.getRightEdge.bind(this);
    this.getLeftEdge = this.getLeftEdge.bind(this);
  }

  draw() {
    CANVAS.CONTEXT.drawImage(
      this.spritePROJ, // image source
      this.frameIndex * this.spriteDimensions.spriteWidth, // where to start measuring the width of image to draw
      0, // where to start measuring the height of the image to be drawn
      this.spriteDimensions.spriteWidth, // the width of the image that you want to retain when drawn
      this.spriteDimensions.spriteHeight, // the height of the image that you want to retain when drawn
      this.x, // x position on the canvas
      this.y, // y position on the canvas
      this.width, // will scale down the width of the image on the canvas
      this.height // will scale down the height of the image on the canvas
    );

    // simulate a timer to determine when to switch frames in the Enemy spritesheet
    this.frameCount++;

    // the larger the number, the slower the frame transitions
    // the smaller the number, the faster the animation will run
    if (this.frameCount > this.maxFrameCount) {
      this.frameIndex++;
      this.frameCount = 0;
    }

    // start over from first frame after displaying the last frame in the spritesheet
    if (this.frameIndex > this.spriteImageCount - 1) {
      // zero-indexed - subtract 1 from spriteImageCount
      this.frameIndex = 0;
    }

    this.y -= this.speed; // vertical movement
  }

  getBottomEdge() {
    return this.y + this.height;
  }

  getTopEdge() {
    return this.y;
  }

  getRightEdge() {
    return this.x + this.width;
  }

  getLeftEdge() {
    return this.x;
  }
}

export default Bullet;
