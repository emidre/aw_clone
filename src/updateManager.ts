import ConsoleManager from "./consoleManager";
import Constants from "./constants";
import GameManager from "./gameManager"
import PathTile from "./models/pathTile";
import Plains from "./models/playerObjects/terrainObjects/Plains";
import Sea from "./models/playerObjects/terrainObjects/Sea";
import Shoal from "./models/playerObjects/terrainObjects/Shoal";
import TileManager from "./tileManager";

export default class UpdateManager {
    private static _instance: UpdateManager;

    constructor() {
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private _selectedPlayer = 0;
    private _worldScale = 1;
    

    private active: boolean = true
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl
    private keyBackspace: Phaser.Input.Keyboard.Key
    private keyEnter: Phaser.Input.Keyboard.Key
    private keyEscape: Phaser.Input.Keyboard.Key
    private keyF2: Phaser.Input.Keyboard.Key
    private keySpace: Phaser.Input.Keyboard.Key
    private selectedUnitPosition: number = null
    private unitCurrentFrame: number = 0
    private seaCurrentFrame: number = 0
    private unitNextFrame: number = 0
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys

    //
    // Public
    //

    initialize = (input : Phaser.Input.InputPlugin, cameras: Phaser.Cameras.Scene2D.CameraManager) => {
        this.keyF2 = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F2);
        this.keySpace = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyBackspace = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
        this.keyEnter = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keyEscape = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        Constants.letters.forEach((letter) => {
            input.keyboard.addKey(letter.keyCode);
        })
        Constants.numbers.forEach((number) => {
            input.keyboard.addKey(number.keyCode);
        })

        this.cursors = input.keyboard.createCursorKeys()

        var controlConfig = {
            camera: cameras.main,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            acceleration: 0.5,
            drag: 0.45,
            maxSpeed: 0.5
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    }

    handleSelection = (currentTile: Phaser.Tilemaps.Tile, posText: Phaser.GameObjects.Text, marker: Phaser.GameObjects.Image) => {
        if (currentTile) {
            if (!TileManager.Instance.lastSelectedTile || TileManager.Instance.lastSelectedTile.x != currentTile.x || TileManager.Instance.lastSelectedTile.y != currentTile.y) {
                TileManager.Instance.lastSelectedTile = currentTile
                posText.setText('pos: ' + currentTile.x + ", " + currentTile.y)
                marker.setVisible(true)
                marker.setPosition(currentTile.x * 16 * this.worldScale + 11 * this.worldScale, currentTile.y * 16 * this.worldScale + 11 * this.worldScale)

                if (TileManager.Instance.isAnyUnitMoving()) {
                    if (TileManager.Instance.findTile(TileManager.Instance.movementTiles, currentTile)) {
                        TileManager.Instance.showShortestPath(currentTile)
                    } else {
                        TileManager.Instance.clearPath()
                    }
                }
            }
        } else {
            if (TileManager.Instance.lastSelectedTile) {
                TileManager.Instance.lastSelectedTile = null
                posText.setText('pos: -1, -1')
                marker.setVisible(false)
            }
        }
    }


    handleAnimations = (delta, timeScale) => {
        if (!this.active) {
            return;
        }

        // Elapsed time is the delta multiplied by the global rate and the scene timeScale if folowTimeScale is true
        let globalElapsedTime = delta * Constants.rate * (Constants.followTimeScale ? timeScale : 1);
        this.unitNextFrame -= globalElapsedTime * Constants.unitFrameRate

        if (this.unitNextFrame < 0) {
            this.seaCurrentFrame = this.seaCurrentFrame + 1
            this.unitCurrentFrame = this.unitCurrentFrame + 1

            if (this.unitCurrentFrame == 3) {
                this.unitCurrentFrame = 0
            }

            if (this.seaCurrentFrame == 12) {
                this.seaCurrentFrame = 0
            }

            TileManager.Instance.animatedTiles.forEach(
                (animatedTile) => {
                    animatedTile.tiles.forEach((tile) => {
                        let terrainData = TileManager.Instance.terrainData[TileManager.Instance.convertTileTo1DCoords(tile)]
                        
                        if (TileManager.Instance.getSeaTileNames().includes(terrainData.name)) {
                            let tileId = animatedTile.frames[this.seaCurrentFrame];
                            tile.index = tileId
                        } else {
                            let tileId = animatedTile.frames[this.unitCurrentFrame];
                            tile.index = tileId
                        }
                    });
                }
            );
        }

        if (this.unitNextFrame < 0) {
            this.unitNextFrame = Constants.unitFrameDuration
        }
    }

    handleMouseInput = (currentTile: Phaser.Tilemaps.Tile, input: Phaser.Input.InputPlugin) => {
        if (input.mousePointer.isDown) {
            if (currentTile) {
                if (TileManager.Instance.currentBrush) {
                    TileManager.Instance.placeObject(TileManager.Instance.currentBrush, currentTile)
                    return
                }

                const unit = TileManager.Instance.unitData[TileManager.Instance.convertTileTo1DCoords(currentTile)]
                if (TileManager.Instance.movementTiles.find((tile) => tile.vec.x == currentTile.x && tile.vec.y == currentTile.y)) {
                    if (unit) {
                        // attack if enemy
                    } else {
                        // move
                    }
                } else {
                    if (!TileManager.Instance.lastCreatedTile || TileManager.Instance.lastCreatedTile != currentTile) {
                        TileManager.Instance.lastCreatedTile = currentTile

                        if (unit) {
                            TileManager.Instance.movementTiles.forEach((tile) => {
                                TileManager.Instance.statusLayer.putTileAt(TileManager.Instance.getOffsetIndex(35, TileManager.Instance.unitTiles), tile.vec.x, tile.vec.y)
                            })
                            TileManager.Instance.movementTiles = []

                            this.selectedUnitPosition = TileManager.Instance.convertTileTo1DCoords(currentTile)
                            const visitedTiles: Array<PathTile> = TileManager.Instance.visitTilesAroundUnit(unit, currentTile)

                            TileManager.Instance.paintTiles(visitedTiles, TileManager.Instance.getOffsetIndex(6, TileManager.Instance.unitTiles), TileManager.Instance.statusLayer)
                            TileManager.Instance.clearPath()

                            TileManager.Instance.movementTiles = []
                            TileManager.Instance.movementTiles = TileManager.Instance.movementTiles.concat(visitedTiles)
                        } else {
                            TileManager.Instance.paintTiles(TileManager.Instance.movementTiles, TileManager.Instance.getOffsetIndex(35, TileManager.Instance.unitTiles), TileManager.Instance.statusLayer)
                            TileManager.Instance.clearPath()
                            TileManager.Instance.movementTiles = []
                        }
                    }
                }
            }
        }
    }

    handleKeyboardInput = (input: Phaser.Input.InputPlugin) => {
        if (Phaser.Input.Keyboard.JustDown(this.keyF2)) {
            ConsoleManager.Instance.toggleConsole()
        }

        Constants.letters.forEach((letter) => {
            if (Phaser.Input.Keyboard.JustDown(input.keyboard.keys.find((x) => x ? x.keyCode == letter.keyCode : false))) {
                if (ConsoleManager.Instance.consoleActive) {
                    let newText = ConsoleManager.Instance.consoleText.text.substring(Constants.consolePrefix.length) + letter.letter.toLowerCase()

                    const possibleCommands = Constants.listOfCommands.filter((command) => command.startsWith(newText))
                    if (possibleCommands.length == 1 && newText.length < possibleCommands[0].length) {
                        newText = possibleCommands[0]
                    }

                    ConsoleManager.Instance.consoleText.setText(Constants.consolePrefix + newText)
                }
            }
        })

        Constants.numbers.forEach((number) => {
            if (Phaser.Input.Keyboard.JustDown(input.keyboard.keys.find((x) => x ? x.keyCode == number.keyCode : false))) {
                if (ConsoleManager.Instance.consoleActive) {
                    let newText = ConsoleManager.Instance.consoleText.text.substring(Constants.consolePrefix.length) + number.number.toLowerCase()
                    ConsoleManager.Instance.consoleText.setText(Constants.consolePrefix + newText)
                }
            }
        })

        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            if (ConsoleManager.Instance.consoleActive) {
                ConsoleManager.Instance.consoleText.setText(ConsoleManager.Instance.consoleText.text + " ")
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyBackspace)) {
            if (ConsoleManager.Instance.consoleActive) {
                if (ConsoleManager.Instance.consoleText.text.length > Constants.consolePrefix.length) {
                    ConsoleManager.Instance.consoleText.setText(ConsoleManager.Instance.consoleText.text.substr(0, ConsoleManager.Instance.consoleText.text.length - 1))
                }
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            if (ConsoleManager.Instance.consoleActive) {
                if (ConsoleManager.Instance.consoleText.text.length > Constants.consolePrefix.length) {
                    ConsoleManager.Instance.executeCommand(ConsoleManager.Instance.consoleText.text.substring(Constants.consolePrefix.length))
                    ConsoleManager.Instance.consoleText.setText(Constants.consolePrefix)
                }
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyEscape)) {
            if (ConsoleManager.Instance.consoleActive) {
                ConsoleManager.Instance.consoleActive = false
                ConsoleManager.Instance.consoleText.setVisible(false)
                ConsoleManager.Instance.consoleText.setText(Constants.consolePrefix)
            }

            if (this.selectedUnitPosition) {
                this.selectedUnitPosition = null

                TileManager.Instance.movementTiles.forEach((tile) => {
                    TileManager.Instance.statusLayer.putTileAt(TileManager.Instance.getOffsetIndex(35, TileManager.Instance.unitTiles), tile.vec.x, tile.vec.y)
                })
                TileManager.Instance.attackTiles.forEach((tile) => {
                    TileManager.Instance.statusLayer.putTileAt(TileManager.Instance.getOffsetIndex(35, TileManager.Instance.unitTiles), tile.x, tile.y)
                })
                TileManager.Instance.visionTiles.forEach((tile) => {
                    TileManager.Instance.statusLayer.putTileAt(TileManager.Instance.getOffsetIndex(35, TileManager.Instance.unitTiles), tile.x, tile.y)
                })

                TileManager.Instance.clearPath()
                TileManager.Instance.movementTiles = []
                TileManager.Instance.attackTiles = []
                TileManager.Instance.visionTiles = []
            }

            TileManager.Instance.lastCreatedTile = null
            TileManager.Instance.currentBrush = null;
        }
    }

    handleCamera = (delta) => {
        this.controls.update(delta);
    }

    //
    // Private
    //

    //
    // Getters and Setters
    //
    public get selectedPlayer() {
        return this._selectedPlayer;
    }
    public set selectedPlayer(value) {
        this._selectedPlayer = value;
    }

    public get worldScale() {
        return this._worldScale;
    }
    public set worldScale(value) {
        this._worldScale = value;
    }
}