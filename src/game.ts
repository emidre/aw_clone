import * as Phaser from "phaser";
import Constants from "./constants";
import Demo from "./demo";
import GameManager from "./gameManager";

var config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Constants.gameWidth,
  height: Constants.gameHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameManager
};

var game = new Phaser.Game(config);