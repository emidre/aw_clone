import { TileEncoding, TileSetEncoding, tileSetEncodings } from "./encoding/object_indices"
import { gameHeight, gameWidth } from "./game"
import { GameObject } from "./models/game_object"
import { PlayerObject } from "./models/player_object"
import { UnitObject } from "./models/player_objects/unit_objects"
import { Infantry } from "./models/player_objects/unit_objects/infantry"
import { TerrainObject } from "./models/terrain_object"
import Mountain from "./models/terrain_objects/mountain"
import Plains from "./models/terrain_objects/plains"
import Woods from "./models/terrain_objects/woods"
import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import { Recon } from "./models/player_objects/unit_objects/recon"
import { MegaTank } from "./models/player_objects/unit_objects/megatank"

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
class _Number {
    number: string
    name: string
    keyCode: number

    constructor(_number: string, _name) {
        this.number = _number
        this.name = _name
        this.keyCode = Phaser.Input.Keyboard.KeyCodes[_name]
    }
}

const numbers: Array<_Number> = [
    new _Number("0", "ZERO"),
    new _Number("1", "ONE"),
    new _Number("2", "TWO"),
    new _Number("3", "THREE"),
    new _Number("4", "FOUR"),
    new _Number("5", "FIVE"),
    new _Number("6", "SIX"),
    new _Number("7", "SEVEN"),
    new _Number("8", "EIGHT"),
    new _Number("9", "NINE"),
]

const gameObjectDefaultInstances: Map<typeof GameObject, GameObject> = new Map<typeof GameObject, GameObject>()
gameObjectDefaultInstances.set(Plains, new Plains())
gameObjectDefaultInstances.set(Woods, new Woods())
gameObjectDefaultInstances.set(Mountain, new Mountain())
gameObjectDefaultInstances.set(Infantry, new Infantry())
gameObjectDefaultInstances.set(MegaTank, new MegaTank())
gameObjectDefaultInstances.set(Recon, new Recon())

class Commands {
    static plains = "plains"
    static woods = "woods"
    static mountain = "mountain"
    static selectedplayer = "selectedplayer"
    static infantry = "infantry"
    static megatank = "megatank"
    static recon = "recon"
    static clear = "clear"
}

const listOfCommands = Object.keys(Commands)

export default class TileMapTest extends Phaser.Scene {
    map: Phaser.Tilemaps.Tilemap
    terrainLayer: Phaser.Tilemaps.TilemapLayer
    terrainTiles: Phaser.Tilemaps.Tileset
    controls: Phaser.Cameras.Controls.SmoothedKeyControl
    marker: Phaser.GameObjects.Image
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    posText: Phaser.GameObjects.Text
    lastSelectedTile: Phaser.Tilemaps.Tile
    lastCreatedTile: Phaser.Tilemaps.Tile

    terrainData: Array<typeof TerrainObject>

    worldScale = 1
    maxWorldScale = 2
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
    unitCurrentFrame: number = 0
    unitNextFrame: number = 0
    unitFrameRate: number = 1
    unitFrameDuration: number = 333
    selectedUnitPosition: number = null
    movementTiles: Array<{ x: number, y: number }> = []
    attackTiles: Array<{ x: number, y: number }> = []
    visionTiles: Array<{ x: number, y: number }> = []

    consolePrefix = "command: "
    keyEnter: Phaser.Input.Keyboard.Key
    currentBrush: typeof GameObject = null
    currentTileClass: typeof GameObject
    selectedPlayer = 0
    unitLayer: Phaser.Tilemaps.TilemapLayer
    unitTiles: Phaser.Tilemaps.Tileset
    clicked: boolean = false
    unitData: Array<typeof UnitObject>
    currentFrame: number
    active: boolean = true
    animatedTiles: Array<{
        frames: Array<number>,
        tiles: Array<Phaser.Tilemaps.Tile>,
    }> = []
    rate: number = 1
    followTimeScale: boolean = true
    debug: any
    keyEscape: Phaser.Input.Keyboard.Key
    statusLayer: Phaser.Tilemaps.TilemapLayer

    constructor() {
        super('TileMapTest')
    }

    preload = () => {
        this.load.image('terrainTiles', '../assets/tilemaps/aw_tilemap_normal.png')
        this.load.image('unitTiles', '../assets/tilemaps/aw_tilemap_units_small.png')
        //this.load.tilemapTiledJSON('map', '../assets/tilemaps/aw_tilemap_normal.json')
        this.load.tilemapTiledJSON('map', '../assets/tilemaps/aw_map.json')

        this.load.atlas("unitAtlas", "../assets/tilemaps/aw_tilemap_units_small.png", "../assets/tilemaps/aw_tilemap_normal.json")

        this.load.image('cursor', '../assets/sprites/cursor.png')
    }

    create = () => {
        this.map = this.add.tilemap('map')
        this.terrainTiles = this.map.addTilesetImage('aw_tileset_normal', 'terrainTiles')
        this.unitTiles = this.map.addTilesetImage('aw_tileset_units_small', 'unitTiles');

        this.map.width = 20
        this.map.height = 20

        this.terrainData = new Array(this.map.width * this.map.height)
        this.terrainData.fill(Plains)

        this.unitData = new Array(this.map.width * this.map.height)
        this.unitData.fill(null)

        this.worldScale = (gameHeight - (this.margin * 2)) / (16 * this.map.height)
        if (this.worldScale < this.maxWorldScale) {
            this.worldScale = this.maxWorldScale
        }

        this.cameras.main.setBounds(-this.tileMapOffsetX, 0, gameWidth, gameHeight)

        this.interfaceCamera = this.cameras.main
        this.interfaceCamera.setBackgroundColor('rgb(150,150,150)')

        this.mapCamera = this.cameras.add(this.margin, this.margin, gameHeight - (this.margin * 2), gameHeight - (this.margin * 2), true)
        this.mapCamera.setBounds(0, 0, this.map.width * 16 * this.worldScale, this.map.height * 16 * this.worldScale)

        this.posText = this.add.text(-this.tileMapOffsetX + 3, 3, 'pos: -1, -1', { fontSize: '8px', fontFamily: "Lucida Console", color: '#000' })
        this.consoleText = this.add.text(-this.tileMapOffsetX + 75, 3, this.consolePrefix, { fontSize: '8px', fontFamily: "Lucida Console", color: '#F00' })
        this.consoleText.setVisible(false)
        this.statusText = this.add.text(-this.tileMapOffsetX - 54 /* this is the magic number, don't question it */ + (gameHeight - this.margin * 2), 3, '', { fontSize: '12px', fontFamily: "Lucida Console", color: '#000' })

        this.terrainLayer = this.map.createBlankLayer('terrainLayer', this.terrainTiles)
        this.terrainLayer.setScale(this.worldScale)
        this.terrainLayer.fill(this.getOffsetIndex(78, this.terrainTiles))

        this.unitLayer = this.map.createBlankLayer('unitLayer', this.unitTiles)
        this.unitLayer.setScale(this.worldScale)
        this.unitLayer.fill(this.getOffsetIndex(35, this.unitTiles))

        this.decorationLayer = this.map.createBlankLayer('decorationLayer', this.terrainTiles)
        this.decorationLayer.setScale(this.worldScale)
        this.decorationLayer.fill(this.getOffsetIndex(1052, this.terrainTiles))

        this.statusLayer = this.map.createBlankLayer('statusLayer', this.unitTiles)
        this.statusLayer.setScale(this.worldScale)
        this.statusLayer.fill(this.getOffsetIndex(35, this.unitTiles))

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



        this.keyF2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F2);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyBackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keyEscape = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        letters.forEach((letter) => {
            this.input.keyboard.addKey(letter.keyCode);
        })
        numbers.forEach((number) => {
            this.input.keyboard.addKey(number.keyCode);
        })
    }

    update = (time, delta) => {
        const mousePositionInMapCameraX = this.input.activePointer.worldX + this.tileMapOffsetX + this.mapCamera.scrollX - this.margin
        const mousePositionInMapCameraY = this.input.activePointer.worldY + this.mapCamera.scrollY - this.margin
        const currentTile: Phaser.Tilemaps.Tile = this.map.getTileAtWorldXY(mousePositionInMapCameraX, mousePositionInMapCameraY, false, this.mapCamera, this.terrainLayer)

        this.handleMouseInput(currentTile)
        this.handleKeyboardInput()
        this.handleCamera(delta)
        this.handleAnimations(time, delta)
        this.handleSelection(currentTile)

        this.statusText.setText(
            `
            Terrain: ${currentTile ? this.terrainData[this.convertTileTo1DCoords(currentTile)]?.name : "OOB"}\n
            Unit: ${currentTile ? this.unitData[this.convertTileTo1DCoords(currentTile)]?.name : "OOB"}\n
            `
        )
    }

    // Update Helpers
    handleSelection = (currentTile: Phaser.Tilemaps.Tile) => {
        if (currentTile) {
            if (!this.lastSelectedTile || this.lastSelectedTile.x != currentTile.x || this.lastSelectedTile.y != currentTile.y) {
                this.lastSelectedTile = currentTile
                this.posText.setText('pos: ' + currentTile.x + ", " + currentTile.y)
                this.marker.setVisible(true)
                this.marker.setPosition(currentTile.x * 16 * this.worldScale + 11 * this.worldScale, currentTile.y * 16 * this.worldScale + 11 * this.worldScale)
            }
        } else {
            if (this.lastSelectedTile) {
                this.lastSelectedTile = null
                this.posText.setText('pos: -1, -1')
                this.marker.setVisible(false)
            }
        }
    }

    handleAnimations = (time, delta) => {
        if (!this.active) {
            return;
        }
        // Elapsed time is the delta multiplied by the global rate and the scene timeScale if folowTimeScale is true
        let globalElapsedTime = delta * this.rate * (this.followTimeScale ? this.time.timeScale : 1);
        this.unitNextFrame -= globalElapsedTime * this.unitFrameRate;

        if (this.unitNextFrame < 0) {
            this.unitCurrentFrame = this.unitCurrentFrame + 1

            if (this.unitCurrentFrame == 3) {
                this.unitCurrentFrame = 0;
            }

            this.animatedTiles.forEach(
                (animatedTile) => {
                    animatedTile.tiles.forEach((tile) => {
                        let tileId = animatedTile.frames[this.unitCurrentFrame];
                        tile.index = tileId
                    });
                }
            );
        }

        if (this.unitNextFrame < 0) {
            this.unitNextFrame = this.unitFrameDuration
        }
    }

    handleMouseInput = (currentTile: Phaser.Tilemaps.Tile) => {
        if (this.input.mousePointer.isDown) {
            if (currentTile) {
                if (this.currentBrush) {
                    this.placeObject(this.currentBrush, currentTile)
                    return
                }

                const unit = this.unitData[this.convertTileTo1DCoords(currentTile)]
                if (this.movementTiles.find((tile) => tile.x == currentTile.x && tile.y == currentTile.y) && !unit) {
                    // move
                } else {
                    if (!this.lastCreatedTile || this.lastCreatedTile != currentTile) {
                        this.lastCreatedTile = currentTile

                        if (unit) {
                            this.movementTiles.forEach((tile) => {
                                this.statusLayer.putTileAt(this.getOffsetIndex(35, this.unitTiles), tile.x, tile.y)
                            })
                            this.movementTiles = []

                            this.selectedUnitPosition = this.convertTileTo1DCoords(currentTile)
                            const unitInstance = (gameObjectDefaultInstances.get(unit) as UnitObject)
                            const movement = unitInstance.movement
                            const visitedTiles: Array<{ x: number, y: number }> = []
                            const outerTiles: Array<{ x: number, y: number, remaining: number }> = []
                            const newOuterTiles: Array<{ index: number, remaining: number }> = []
                            const centerTile = { x: currentTile.x, y: currentTile.y, remaining: movement }
                            outerTiles.push(centerTile)

                            let firstRun: boolean = true
                            while (outerTiles.length > 0) {
                                let outerTile = outerTiles[0]

                                let candidate: { x: number, y: number, remaining: number }
                                let terrain: TerrainObject
                                let movementCost



                                candidate = { x: outerTile.x - 1, y: outerTile.y, remaining: outerTile.remaining }
                                terrain = gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate)]) as TerrainObject
                                movementCost = terrain.movementCost.get(unitInstance.movementType)
                                candidate.remaining -= movementCost
                                if (this.isTileValid(candidate, visitedTiles, outerTiles)) outerTiles.push(candidate)
                                candidate = { x: outerTile.x + 1, y: outerTile.y, remaining: outerTile.remaining }
                                terrain = gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate)]) as TerrainObject
                                movementCost = terrain.movementCost.get(unitInstance.movementType)
                                candidate.remaining -= movementCost
                                if (this.isTileValid(candidate, visitedTiles, outerTiles)) outerTiles.push(candidate)
                                candidate = { x: outerTile.x, y: outerTile.y - 1, remaining: outerTile.remaining }
                                terrain = gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate)]) as TerrainObject
                                movementCost = terrain.movementCost.get(unitInstance.movementType)
                                candidate.remaining -= movementCost
                                if (this.isTileValid(candidate, visitedTiles, outerTiles)) outerTiles.push(candidate)
                                candidate = { x: outerTile.x, y: outerTile.y + 1, remaining: outerTile.remaining }
                                terrain = gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate)]) as TerrainObject
                                movementCost = terrain.movementCost.get(unitInstance.movementType)
                                candidate.remaining -= movementCost
                                if (this.isTileValid(candidate, visitedTiles, outerTiles)) outerTiles.push(candidate)

                                visitedTiles.push({ x: outerTile.x, y: outerTile.y })
                                outerTiles.splice(0, 1)
                            }

                            visitedTiles.forEach((tile) => {
                                this.statusLayer.putTileAt(this.getOffsetIndex(6, this.unitTiles), tile.x, tile.y)
                            })

                            this.movementTiles = []
                            this.movementTiles = this.movementTiles.concat(visitedTiles)
                        } else {
                            this.movementTiles.forEach((tile) => {
                                this.statusLayer.putTileAt(this.getOffsetIndex(35, this.unitTiles), tile.x, tile.y)
                            })
                            this.movementTiles = []
                        }
                    }
                }
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
                    if (possibleCommands.length == 1 && newText.length < possibleCommands[0].length) {
                        newText = possibleCommands[0]
                    }

                    this.consoleText.setText(this.consolePrefix + newText)
                }
            }
        })

        numbers.forEach((number) => {
            if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.keys.find((x) => x ? x.keyCode == number.keyCode : false))) {
                if (this.consoleActive) {
                    let newText = this.consoleText.text.substring(this.consolePrefix.length) + number.number.toLowerCase()
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

        if (Phaser.Input.Keyboard.JustDown(this.keyEscape)) {
            if (this.consoleActive) {
                this.consoleActive = false
                this.consoleText.setVisible(false)
                this.consoleText.setText(this.consolePrefix)
            }

            if (this.selectedUnitPosition) {
                this.selectedUnitPosition = null

                console.log(this.movementTiles)

                this.movementTiles.forEach((tile) => {
                    this.statusLayer.putTileAt(this.getOffsetIndex(35, this.unitTiles), tile.x, tile.y)
                })
                this.attackTiles.forEach((tile) => {
                    this.statusLayer.putTileAt(this.getOffsetIndex(35, this.unitTiles), tile.x, tile.y)
                })
                this.visionTiles.forEach((tile) => {
                    this.statusLayer.putTileAt(this.getOffsetIndex(35, this.unitTiles), tile.x, tile.y)
                })

                this.movementTiles = []
                this.attackTiles = []
                this.visionTiles = []
            }

            this.lastCreatedTile = null
            this.currentBrush = null;
        }
    }

    handleCamera = (delta) => {
        this.controls.update(delta);
    }

    // Private functions
    // Top-level function for adding anything
    placeObject = (objectClass: typeof GameObject, currentTile: Phaser.Tilemaps.Tile) => {
        let tileSetName = ""
        if (objectClass.prototype instanceof TerrainObject) {
            tileSetName = "aw_tileset_normal"
        } else if (objectClass.prototype instanceof UnitObject) {
            tileSetName = "aw_tileset_units_small"
        }

        const tileSetEncoding: TileSetEncoding = tileSetEncodings[tileSetName]

        if (objectClass.prototype instanceof TerrainObject) {
            const tileEncoding: TileEncoding = tileSetEncoding.get(objectClass.name.toLowerCase())

            const sizeX = tileEncoding.sizeX ?? 1
            const sizeY = tileEncoding.sizeY ?? 1
            const decorations = tileEncoding.decorations ?? tileEncoding.indices.map((_) => false)

            if (tileSetEncoding.get(this.terrainData[this.convertTileTo1DCoords(currentTile)].name.toLowerCase()).sizeY == 2) {
                this.map.putTileAt(this.getOffsetIndex(1052, this.terrainTiles), currentTile.x, currentTile.y - 1, false, this.decorationLayer)
            }
            this.terrainData[this.convertTileTo1DCoords(currentTile)] = objectClass as any

            // Bottom right is assumed to be the origin point of the sprite
            tileEncoding.indices.forEach((tileIndex, countingIndex) => {
                const matrixPositionX = Math.abs(countingIndex % sizeX - (sizeX - 1))
                const matrixPositionY = Math.abs(Math.floor(countingIndex / sizeX) - (sizeY - 1))

                const layer = decorations[countingIndex] == true ? this.decorationLayer : this.terrainLayer
                this.map.putTileAt(this.getOffsetIndex(tileIndex, this.terrainTiles), currentTile.x - matrixPositionX, currentTile.y - matrixPositionY, false, layer)
            })
        } else
            if (objectClass.prototype instanceof UnitObject) {
                let modifier = ""

                if (objectClass.name.toLowerCase() == "infantry") {
                    modifier = "_os" // for now
                }

                let color = ""
                switch (this.selectedPlayer) {
                    case 0: {
                        color = "_orange"
                        break
                    }
                }

                this.unitData[this.convertTileTo1DCoords(currentTile)] = objectClass as any
                let existingAnimationIndex = this.animatedTiles.findIndex((animatedTile) => animatedTile.tiles[0].x == currentTile.x && animatedTile.tiles[0].y == currentTile.y)
                if (existingAnimationIndex != -1) {
                    this.animatedTiles.splice(existingAnimationIndex, 1)
                }

                const tileEncoding: TileEncoding = tileSetEncoding.get(objectClass.name.toLowerCase() + modifier + color + "_active")

                this.map.putTileAt(this.getOffsetIndex(tileEncoding.indices[0], this.unitTiles), currentTile.x, currentTile.y, false, this.unitLayer);

                let animatedTileData = {
                    frames: [],
                    tiles: [],
                };

                animatedTileData.frames.push(this.getOffsetIndex(tileEncoding.indices[0], this.unitTiles))
                animatedTileData.frames.push(this.getOffsetIndex(tileEncoding.additionalFrames[0][0], this.unitTiles))
                animatedTileData.frames.push(this.getOffsetIndex(tileEncoding.additionalFrames[1][0], this.unitTiles))

                animatedTileData.tiles = [this.unitLayer.getTileAt(currentTile.x, currentTile.y)]

                this.animatedTiles.push(animatedTileData);
            }
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
            case Commands.selectedplayer: {
                const playerNumber = Number.parseInt(command.split(" ")[1])
                if ([0, 1, 2, 3, 4].includes(playerNumber)) {
                    this.selectedPlayer = playerNumber;
                }
                break;
            }
            case Commands.infantry: {
                this.currentBrush = Infantry;
                break;
            }
            case Commands.megatank: {
                this.currentBrush = MegaTank;
                break;
            }
            case Commands.recon: {
                this.currentBrush = Recon;
                break;
            }
            case Commands.clear: {
                this.currentBrush = null;
                break;
            }
        }

        this.lastCreatedTile = null
    }

    convertTileTo1DCoords = (tile: Phaser.Tilemaps.Tile | { x: number, y: number }) => {
        return tile.y * this.map.width + tile.x
    }

    getOffsetIndex = (index: number, tileset: Phaser.Tilemaps.Tileset) => {
        return tileset.firstgid + index
    }

    private isTileValid(candidate: { x: number; y: number; remaining: number }, visitedTiles: Array<{ x: number, y: number }>, outerTiles: Array<{ x: number, y: number; remaining: number }>) {
        if (!((candidate.x < 0 || candidate.x > this.map.width - 1) ||
            (candidate.y < 0 || candidate.y > this.map.height - 1) ||
            candidate.remaining < 0 ||
            visitedTiles.find((visitedTile) => visitedTile.x == candidate.x && visitedTile.y == candidate.y)
            //outerTiles.find((outerTile) => outerTile.x == candidate.x && outerTile.y == candidate.y)
        )) {
            return true
        } else {
            return false
        }
    }
}