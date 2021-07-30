import * as Phaser from "phaser";
import Demo from "./demo";
import TileMapTest from "./tilemap_test";

export const gameWidth = 1280
export const gameHeight = 720

var config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: TileMapTest
};

var game = new Phaser.Game(config);