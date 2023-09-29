import { getSpriteDimensions } from "./spriteDimensions.js";

class Enemy {
  constructor(canvasWidth, canvasHeight, xOffset, yOffset) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // enemy dimensions that will be used to draw the enemy sprite on the canvas
    this.width = 30;
    this.height = 40;

    // enemy starting positioning based on offsets from adjacent enemies
    this.xPosition = xOffset;
    this.yPosition = yOffset;

    // enemy direction to determine if moving left or right
    // enemy will always be moving down and never up
    this.isGoingRight = true;

    // enemy sprite to be drawn from a spritesheet
    this.sprite = new Image();
    this.sprite.src = "./images/ezteach.png";
    this.frameIndex = 0; // which frame in the spritesheet is currently being drawn
    this.frameCount = 0; // how long before move on to draw the next frame in spritesheet

    // method binding to this object
    this.draw = this.draw.bind(this);
    this.move = this.move.bind(this);
    this.setDirectionRight = this.setDirectionRight.bind(this);
    this.setDirectionLeft = this.setDirectionLeft.bind(this);
    this.getXCoord = this.getXCoord.bind(this);
    this.getYCoord = this.getYCoord.bind(this);
    this.getHeight = this.getHeight.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.getBottomEdge = this.getBottomEdge.bind(this);
    this.getTopEdge = this.getTopEdge.bind(this);
    this.getRightEdge = this.getRightEdge.bind(this);
    this.getLeftEdge = this.getLeftEdge.bind(this);
  }

  // method to draw the enemy sprite onto the canvas
  draw(canvasCtx) {
    this.move();

    // get the dimensions of each frame on the corresponding spritesheet
    const { spriteWidth, spriteHeight } = getSpriteDimensions("ezTeach");

    // canvas context .drawImage() documentation
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    canvasCtx.drawImage(
      this.sprite, // image source
      this.frameIndex * spriteWidth, // where to start measuring the width of the image to be drawn
      0, // where to start measuring the height of the image to be drawn
      spriteWidth, // the width of the image that you want to retain when drawn
      spriteHeight, // the height of the image that you want to retain when drawn
      this.xPosition, // x position on the canvas
      this.yPosition, // y position on the canvas
      this.width, // will scale down the width of the image on the canvas
      this.height // will scale down the height of the image on the canvas
    );

    // simulate a timer as to when to switch frames in the spritesheet
    this.frameCount = this.frameCount + 1;

    // the larger the number, the slower the frame transitions
    // the smaller the number, the faster the animation will run
    if (this.frameCount > 20) {
      this.frameIndex = this.frameIndex + 1;
      this.frameCount = 0;
    }

    // start over from first frame after displaying the last frame in the spritesheet
    if (this.frameIndex > 2) {
      this.frameIndex = 0;
    }
  }

  // move the enemy horizontally based on the direction it is going
  move() {
    if (this.isGoingRight === true) {
      this.xPosition += 1;
    } else {
      this.xPosition -= 1;
    }
  }

  // setters for the direction that the enemy is moving
  setDirectionRight() {
    this.isGoingRight = true;
  }

  setDirectionLeft() {
    this.isGoingRight = false;
  }

  moveDown() {
    this.yPosition = this.yPosition + 20;
  }

  // getters
  getXCoord() {
    return this.xPosition;
  }

  getYCoord() {
    return this.yPosition;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getBottomEdge() {
    return this.yPosition + this.height;
  }

  getTopEdge() {
    return this.yPosition;
  }

  getRightEdge() {
    return this.xPosition + this.width;
  }

  getLeftEdge() {
    return this.xPosition;
  }
}

export default Enemy;
