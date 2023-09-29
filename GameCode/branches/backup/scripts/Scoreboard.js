let score = 0;
class Scoreboard {
  /* scoreboard properties */
  
  // constructor 
  constructor(canvas)
  {
    this.canvas = canvas
    this.width = 20; // default 40
    this.height = 20; // default 40
    this.positionX = (0);
    this.positionY = (10);
    this.drawScoreboard = this.drawScoreboard.bind(this);
  }

  /* functions */
  // update score
  addToScore(num)
  {
    score += num;
  }
  // player current score
  drawScoreboard(canvContext)
  { 
    let text 
    if(score > 99)
    {
      text = "Score: 00"+ score;
    }
    else if(score > 999)
    {
      text = "Score: 0"+ score;
    }
    else if(score > 9)
    {
      text = "Score: 000"+ score;
    }
    else
    {
      text = "Score: 0000"+ score;
    }
    
    canvContext.font = "20px Arial";
    canvContext.fillText(text, 500 , 40);
    canvContext.fillStyle = "white";

  }
}

export default Scoreboard;