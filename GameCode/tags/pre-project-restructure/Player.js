
class Player {
  constructor(canvasWidth, canvasHeight, BulletControl, lives) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.BulletControl = BulletControl;
    this.Lives = lives;
    
    // Size of Playership(rectangle)
    this.width = 40; // default 40
    this.height = 20; // default 20
    
    //Starting point of Playership
    this.xPosition = (this.canvasWidth - this.width) / 2;
    this.yPosition = (this.canvasHeight - this.height) / 1.1;

    // check when specific key is pressed
    this.rightPressed = false;
    this.leftPressed = false;
    this.shooting = false;

    // listen for keyboard events
    // need to pass event param if using inside function
    document.addEventListener("keydown", (event) => this.keyDownHandler(event)); 
    document.addEventListener("keyup", (event) => this.keyUpHandler(event));
    
    // method instance binding
    this.drawPlayer = this.drawPlayer.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.keyUpHandler = this.keyUpHandler.bind(this);
    this.movePlayer = this.movePlayer.bind(this);
    this.shoot = this.shoot.bind(this);
  }

  // draws the actual playership
  drawPlayer(canvContext) {
    this.movePlayer();
    canvContext.strokeStyle = "lightgreen";
    canvContext.strokeRect(this.xPosition, this.yPosition, this.width, this.height);
    
    this.shoot();
  }
  
  // First, erase all Canvas -> Draw everything from the beginning in all single frames -> Check key variables pressed 
  // Use fillRect(), strokeRect(), and clearRect() methods to draw squares.
  // All parameters include four types of square x/y coordinates, width/height (in pixels).  
  movePlayer() { 
  	if (this.rightPressed && this.xPosition < (this.canvasWidth - this.width)) {
  	  this.xPosition += 5;
    }
    else if (this.leftPressed && this.xPosition > 0) {
  	  this.xPosition -= 5;
    }
  }


// The shooting method 
  shoot(){
    if(this.shooting){
      //console.log("shooting");
      const speed = 5
      const delay = 10;
      const hit = true;
      const bullet_x = this.xPosition + (this.width / 2) ;
      const bullet_y = this.yPosition - this.height;
      this.BulletControl.shoot(bullet_x, bullet_y, speed, hit, delay);
      //console.log(bullet_y);
      
    }
    
  }

  

  /* ------------------------------------------------------------------------------- */
  /* Event Handlers */
  
  // // Function that occurs when the keyboard is pressed (parameter: event, canvas)
  // // If the keycode and direction of each direction keyboard match, the corresponding variables are true.
  keyDownHandler(event) {
  	if(event.key === "ArrowRight") {
      this.rightPressed = true;
  	}
  	else if(event.key === "ArrowLeft") {
  	  this.leftPressed = true;
    }
    
    //shooting event
    if (event.key === "v"){
      this.shooting = true;
      this.shoot();
    }

    if(event.key === "p")
    {
      console.log("took damage");
      this.Lives.damaged();
    }
    
  }

  // // Function that occurs when the keyboard is not pressed (parameter: e)
  // // If the keycode and direction of each direction keyboard match, the corresponding variables are false > initialization.
  keyUpHandler(event) {
  	if(event.key === "ArrowRight") {
  	  this.rightPressed = false;
      //console.log("releasing right arrow key")
      //console.log("value after release", this.rightPressed);
    }
    else if(event.key === "ArrowLeft") {
  	  this.leftPressed = false;
      //console.log("releasing left arrow key")
    }
      
    else if (event.key === "v"){
      this.shooting = false;
    }
    
  }
}

export default Player;