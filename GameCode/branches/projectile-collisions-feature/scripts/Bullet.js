class Bullet {
  /* speed and hit will come from the bullet control
    delay will be handled by bulletControl*/
  constructor(x, y, speed, hit) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.hit = true; // boolean to judge weather or not someone has been hit(damage)
    this.width = 5;
    this.height = 15;
    this.color = "white";

    this.draw = this.draw.bind(this);
    this.getBottomEdge = this.getBottomEdge.bind(this);
    this.getTopEdge = this.getTopEdge.bind(this);
    this.getRightEdge = this.getRightEdge.bind(this);
    this.getLeftEdge = this.getLeftEdge.bind(this);
  }

  draw(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
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
