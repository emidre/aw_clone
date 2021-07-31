import { TileEncoding, TileSetEncoding, tileSetEncodings } from "./encoding/object_indices"
import { gameHeight, gameWidth } from "./game"
import { GameObject } from "./models/game_object"
import { TerrainObject, _TerrainObject } from "./models/terrain_object"
import Mountain from "./models/terrain_objects/mountain"
import Plains from "./models/terrain_objects/plains"
import Woods from "./models/terrain_objects/woods"
import { UnitObject } from "./models/unit_object"

class Letter {
    letter: string
    keyCode: number

    constructor(_letter: string) {
        this.letter = _letter
        this.keyCode = Phaser.Input.Keyboard.KeyCodes[_letter]
    }
}

const letters: Array<Letter> = [
    new Letter("A"),
    new Letter("B"),
    new Letter("C"),
    new Letter("D"),
    new Letter("E"),
    new Letter("F"),
    new Letter("G"),
    new Letter("H"),
    new Letter("I"),
    new Letter("J"),
    new Letter("K"),
    new Letter("L"),
    new Letter("M"),
    new Letter("N"),
    new Letter("O"),
    new Letter("P"),
    new Letter("Q"),
    new Letter("R"),
    new Letter("S"),
    new Letter("T"),
    new Letter("U"),
    new Letter("V"),
    new Letter("W"),
    new Letter("X"),
    new Letter("Y"),
    new Letter("Z"),
]

class Commands {
    static plains = "plains"
    static woods = "woods"
    static mountain = "mountain"
}

const listOfCommands = Object.keys(Commands)
console.log(listOfCommands)

export default class TileMapTest extends Phaser.Scene {
    map: Phaser.Tilemaps.Tilemap
    terrainLayer: Phaser.Tilemaps.TilemapLayer
    tiles: Phaser.Tilemaps.Tileset
    controls: Phaser.Cameras.Controls.SmoothedKeyControl
    marker: Phaser.GameObjects.Image
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    posText: Phaser.GameObjects.Text
    lastSelectedTile: Phaser.Tilemaps.Tile

    terrainData: Array<GameObject>

    worldScale = 1
    maxWorldScale = 2
    tileSet = "aw_tileset_normal"
    decorationLayer: Phaser.Tilemaps.TilemapLayer
    mapCamera: Phaser.Cameras.Scene2D.Camera
    interfaceCamera: Phaser.Cameras.Scene2D.Camera

    margin = 15
    safeDistance = 25
    tileMapOffsetX = (gameWidth + this.safeDistance)
    statusText: Phaser.GameObjects.Text
    keyF2: Phaser.Input.Keyboard.Key
    consoleText: Phaser.GameObjects.Text
    consoleActive: boolean = false
    keySpace: Phaser.Input.Keyboard.Key
    keyBackspace: Phaser.Input.Keyboard.Key

    consolePrefix = "command: "
    keyEnter: Phaser.Input.Keyboard.Key
    currentBrush: GameObject = Plains
    currentTileClass: GameObject

    constructor() {
        super('TileMapTest')
    }

    preload = () => {
        this.load.image('tiles', '../assets/tilemaps/aw_tilemap_normal.png')
        this.load.tilemapTiledJSON('map', '../assets/tilemaps/aw_tilemap_normal.json')

        this.load.image('cursor', '../assets/sprites/cursor.png')
    }

    create = () => {
        this.map = this.add.tilemap('map')
        this.tiles = this.map.addTilesetImage('aw_tileset_normal', 'tiles')

        this.map.width = 20
        this.map.height = 20

        this.terrainData = new Array(this.map.width * this.map.height)
        this.terrainData.fill(Plains)

        this.worldScale = (gameHeight - (this.margin * 2)) / (16 * this.map.height)
        if (this.worldScale < this.maxWorldScale) {
            this.worldScale = this.maxWorldScale
        }

        this.cameras.main.setBounds(-this.tileMapOffsetX, 0, gameWidth, gameHeight)

        this.interfaceCamera = this.cameras.main
        this.interfaceCamera.setBackgroundColor('rgb(150,150,150)')

        this.posText = this.add.text(-this.tileMapOffsetX + 3, 3, 'pos: -1, -1', { fontSize: '8px', fontFamily: "Lucida Console", color: '#000' })
        this.consoleText = this.add.text(-this.tileMapOffsetX + 75, 3, this.consolePrefix, { fontSize: '8px', fontFamily: "Lucida Console", color: '#F00' })
        this.consoleText.setVisible(false)

        this.mapCamera = this.cameras.add(this.margin, this.margin, gameHeight - (this.margin * 2), gameHeight - (this.margin * 2), true)
        this.mapCamera.setBounds(0, 0, this.map.width * 16 * this.worldScale, this.map.height * 16 * this.worldScale)

        this.terrainLayer = this.map.createBlankLayer('terrainLayer', this.tiles)
        this.terrainLayer.setScale(this.worldScale)
        this.terrainLayer.fill(79)

        this.decorationLayer = this.map.createBlankLayer('decorationLayer', this.tiles)
        this.decorationLayer.setScale(this.worldScale)

        this.marker = this.add.image(0, 0, 'cursor')
        this.marker.setScale(this.worldScale)

        this.cursors = this.input.keyboard.createCursorKeys()

        var controlConfig = {
            camera: this.cameras.main,
            left: this.cursors.left,
            right: this.cursors.right,
            up: this.cursors.up,
            down: this.cursors.down,
            acceleration: 0.5,
            drag: 0.45,
            maxSpeed: 0.5
        };

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        this.statusText = this.add.text(-gameWidth + (gameHeight - (this.margin * 2)), 3, '', { fontSize: '12px', fontFamily: "Lucida Console", color: '#000' })

        this.keyF2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F2);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyBackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        letters.forEach((letter) => {
            this.input.keyboard.addKey(letter.keyCode);
        })
    }

    update = (time, delta) => {
        const mousePositionInMapCameraX = this.input.activePointer.worldX + this.tileMapOffsetX + this.mapCamera.scrollX - this.margin
        const mousePositionInMapCameraY = this.input.activePointer.worldY + this.mapCamera.scrollY - this.margin
        const currentTile: Phaser.Tilemaps.Tile = this.terrainLayer.getTileAtWorldXY(mousePositionInMapCameraX, mousePositionInMapCameraY, false, this.mapCamera)

        this.handleSelection(currentTile)
        this.handleMouseInput(currentTile)
        this.handleKeyboardInput()
        this.handleCamera(delta)

        const newCurrentTile: Phaser.Tilemaps.Tile = this.terrainLayer.getTileAtWorldXY(mousePositionInMapCameraX, mousePositionInMapCameraY, false, this.mapCamera)
        this.currentTileClass = newCurrentTile ? this.terrainData[this.convertTo1DCoords(newCurrentTile)] : null

        this.statusText.setText(`Terrain: ${this.currentTileClass ? this.currentTileClass.objectName : "null"}`)
    }

    // Update Helpers
    handleSelection = (currentTile: Phaser.Tilemaps.Tile) => {
        if (currentTile) {
            if (!this.lastSelectedTile || this.lastSelectedTile.x != currentTile.x || this.lastSelectedTile.y != currentTile.y) {
                this.lastSelectedTile = currentTile
                this.posText.setText('pos: ' + currentTile.x + ", " + currentTile.y)
                this.marker.setVisible(true)
                this.marker.setPosition(currentTile.x * 16 * this.worldScale + 11 * this.worldScale, currentTile.y * 16 * this.worldScale + 11 * this.worldScale)
                this.currentTileClass = this.terrainData[this.convertTo1DCoords(currentTile)]
            }
        } else {
            if (this.lastSelectedTile) {
                this.lastSelectedTile = null
                this.posText.setText('pos: -1, -1')
                this.marker.setVisible(false)
                this.currentTileClass = null
            }
        }
    }

    handleMouseInput = (currentTile: Phaser.Tilemaps.Tile) => {
        if (this.input.mousePointer.isDown) {
            if (currentTile) {
                this.placeObject(this.currentBrush, currentTile)
            }
        }
    }

    handleKeyboardInput = () => {
        if (Phaser.Input.Keyboard.JustDown(this.keyF2)) {
            this.toggleConsole()
        }

        letters.forEach((letter) => {
            if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.keys.find((x) => x ? x.keyCode == letter.keyCode : false))) {
                if (this.consoleActive) {
                    let newText = this.consoleText.text.substring(this.consolePrefix.length) + letter.letter.toLowerCase()

                    const possibleCommands = listOfCommands.filter((command) => command.startsWith(newText))
                    if (possibleCommands.length == 1) {
                        newText = possibleCommands[0]
                    }

                    this.consoleText.setText(this.consolePrefix + newText)
                }
            }
        })

        if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
            if (this.consoleActive) {
                this.consoleText.setText(this.consoleText.text + " ")
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyBackspace)) {
            if (this.consoleActive) {
                if (this.consoleText.text.length > this.consolePrefix.length) {
                    this.consoleText.setText(this.consoleText.text.substr(0, this.consoleText.text.length - 1))
                }
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            if (this.consoleActive) {
                if (this.consoleText.text.length > this.consolePrefix.length) {
                    this.executeCommand(this.consoleText.text.substring(this.consolePrefix.length))
                    this.consoleText.setText(this.consolePrefix)
                }
            }
        }
    }

    handleCamera = (delta) => {
        this.controls.update(delta);
    }

    // Private functions
    // Top-level function for adding anything
    placeObject = (objectClass: GameObject, currentTile: Phaser.Tilemaps.Tile) => {
        const tileSetEncoding: TileSetEncoding = tileSetEncodings[this.tileSet] // maybe make property
        const tileEncoding: TileEncoding = tileSetEncoding[(objectClass as any).objectName]

        const sizeX = tileEncoding.sizeX ?? 1
        const sizeY = tileEncoding.sizeY ?? 1
        const decorations = tileEncoding.decorations ?? tileEncoding.indices.map((_) => false)

        if (tileSetEncoding[(this.terrainData[this.convertTo1DCoords(currentTile)] as any).objectName].sizeY == 2) {
            this.map.removeTileAt(currentTile.x, currentTile.y - 1, true, false, this.decorationLayer)
        }
        this.terrainData[this.convertTo1DCoords(currentTile)] = objectClass

        // Bottom right is assumed to be the origin point of the sprite
        tileEncoding.indices.forEach((tileIndex, countingIndex) => {
            const matrixPositionX = Math.abs(countingIndex % sizeX - (sizeX - 1))
            const matrixPositionY = Math.abs(Math.floor(countingIndex / sizeX) - (sizeY - 1))

            const layer = objectClass.prototype instanceof _TerrainObject ? (decorations[countingIndex] == true ? this.decorationLayer : this.terrainLayer) : null // null for now
            this.map.putTileAt(tileIndex, currentTile.x - matrixPositionX, currentTile.y - matrixPositionY, false, layer)
        })
    }

    toggleConsole = () => {
        this.consoleActive = !this.consoleActive
        this.consoleText.setVisible(this.consoleActive)
        if (!this.consoleActive) {
            this.consoleText.setText(this.consolePrefix)
        }
    }

    executeCommand = (command: string) => {
        console.log(`Executing ${command}`)

        switch (command) {
            case Commands.plains: {
                this.currentBrush = Plains;
                break;
            }
            case Commands.woods: {
                this.currentBrush = Woods;
                break;
            }
            case Commands.mountain: {
                this.currentBrush = Mountain;
                break;
            }
        }
    }

    convertTo1DCoords = (tile: Phaser.Tilemaps.Tile) => {
        return tile.y * this.map.width + tile.x
    }
}