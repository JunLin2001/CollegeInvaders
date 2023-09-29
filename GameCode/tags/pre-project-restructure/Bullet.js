class Bullet {
  //x = player coordinates on player
  //y = player coordinates on player
  /* speed and hit will come from the bullet control
    delay will be handled by bulletControl*/
  constructor(x, y, speed, hit) {
    this.x = x;
    this.y = y;
    this.speed = speed;

    // boolean to judge weather or not someone has been hit(damage)
    this.hit = true;
    this.width = 5;
    this.height = 15;
    this.color = "white";

    this.draw = this.draw.bind(this);
  }


  draw(ctx) {
    // vertical movement
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    this.y -= this.speed;

  }



}
export default Bullet;