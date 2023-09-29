// utility function
// can be used to retrieve different spritesheet dimensions based on which sprite is being requested
export function getSpriteDimensions(spriteType) {
  switch (spriteType) {
    case "ezTeach":
      return {
        // dimensions for each frame (rectangle) in the images/ezteach.png spritesheet
        spriteWidth: 550,
        spriteHeight: 800,
      };
    default:
      return {
        spriteWidth: 100,
        spriteHeight: 100,
      };
  }
}
