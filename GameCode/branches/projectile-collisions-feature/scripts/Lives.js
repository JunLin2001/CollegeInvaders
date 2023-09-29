
let hp = 3; //temp health to be removed when damaged
class Lives {

  constructor(canvas, maxhp) {
    this.canvas = canvas
    this.width = 40; // default 40
    this.height = 40; // default 40
    this.positionX = (0);
    this.positionY = (15);
    this.drawLives = this.drawLives.bind(this);
  }

  //lives shape
  drawLives(canvContext) {

    for (let i = 1; i <= hp - 1; i++) { //hearts filled
      let j = i * 60;
      this.hearts(canvContext, j);
      this.heartSlots(canvContext, j);
      livesBorder();
    }


    function livesBorder() {
      canvContext.strokeStyle = "white";
      canvContext.strokeRect(20, 5, (60 * hp), 60);
    }


    let text = "Lives: " + hp;
    canvContext.font = "20px Arial";
    canvContext.fillText(text, 80, 85);
    canvContext.fillStyle = "white";
  }

  hearts(canvContext, j) {
    canvContext.fillStyle = "lightgreen";
    canvContext.fillRect(j, this.positionY, this.width, this.height);
  }
  heartSlots(canvContext, j) {
    canvContext.strokeStyle = "green";
    canvContext.strokeRect(j, this.positionY, this.width, this.height);
  }

  damaged() {
    hp = hp - 1;
    if (hp == 0) {
      alert("GAME OVER");
    }
  }



}
export default Lives;