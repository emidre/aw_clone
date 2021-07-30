import { TileEncoding, TileSetEncoding, tileSetEncodings } from "./encoding/object_indices"
import { gameHeight, gameWidth } from "./game"
import { GameObject } from "./models/game_object"
import { TerrainObject, _TerrainObject } from "./models/terrain_object"
import Woods from "./models/terrain_objects/woods"
import { UnitObject } from "./models/unit_object"

export default class TileMapTest extends Phaser.Scene {
    map: Phaser.Tilemaps.Tilemap
    terrainLayer: Phaser.Tilemaps.TilemapLayer
    tiles: Phaser.Tilemaps.Tileset
    controls: Phaser.Cameras.Controls.SmoothedKeyControl
    marker: Phaser.GameObjects.Image
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
    posText: Phaser.GameObjects.Text
    lastSelectedTile: Phaser.Tilemaps.Tile

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

        this.map.width = 30
        this.map.height = 30

        this.worldScale = (gameHeight - (this.margin * 2)) / (16 * this.map.height)
        if (this.worldScale < this.maxWorldScale) {
            this.worldScale = this.maxWorldScale
        }

        this.cameras.main.setBounds(-this.tileMapOffsetX, 0, gameWidth, gameHeight)

        this.interfaceCamera = this.cameras.main
        this.interfaceCamera.setBackgroundColor('rgb(150,150,150)')

        this.posText = this.add.text(-this.tileMapOffsetX + 3, 3, 'pos: -1, -1', { fontSize: '8px', fontFamily: "Lucida Console", color: '#000' })

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
    }

    update = (time, delta) => {
        const mousePositionInMapCameraX = this.input.activePointer.worldX + this.tileMapOffsetX + this.mapCamera.scrollX - this.margin
        const mousePositionInMapCameraY = this.input.activePointer.worldY + this.mapCamera.scrollY - this.margin
        const currentTile: Phaser.Tilemaps.Tile = this.terrainLayer.getTileAtWorldXY(mousePositionInMapCameraX, mousePositionInMapCameraY, false, this.mapCamera)

        this.handleSelection(currentTile)
        this.handleMouseInput(currentTile)
        this.handleCamera(delta)

        //this.statusText.setText(`Terrain: ${currentTile.index}`)
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

    handleMouseInput = (currentTile: Phaser.Tilemaps.Tile) => {
        if (this.input.mousePointer.isDown) {
            if (currentTile) {
                this.placeObject(Woods, currentTile)
            }
        }
    }

    handleCamera = (delta) => {
        this.controls.update(delta);

        // if (this.cursors.left.isDown) {
        //     this.cameras.main.x += 4
        // }
        // else if (this.cursors.right.isDown) {
        //     this.cameras.main.x -= 4
        // }

        // if (this.cursors.up.isDown) {
        //     this.cameras.main.y += 4
        // }
        // else if (this.cursors.down.isDown) {
        //     this.cameras.main.y -= 4
        // }
    }

    // Private functions
    // Top-level function for adding anything
    placeObject = (objectClass: GameObject, currentTile: Phaser.Tilemaps.Tile) => {
        const tileSetEncoding: TileSetEncoding = tileSetEncodings[this.tileSet] // maybe make property
        const tileEncoding: TileEncoding = tileSetEncoding[(objectClass as any).objectName]

        const sizeX = tileEncoding.sizeX ?? 1
        const sizeY = tileEncoding.sizeY ?? 1
        const decorations = tileEncoding.decorations ?? tileEncoding.indices.map((_) => false)

        // Bottom right is assumed to be the origin point of the sprite
        tileEncoding.indices.forEach((tileIndex, countingIndex) => {
            const matrixPositionX = Math.abs(countingIndex % sizeX - (sizeX - 1))
            const matrixPositionY = Math.abs(Math.floor(countingIndex / sizeX) - (sizeY - 1))

            const layer = objectClass.prototype instanceof _TerrainObject ? (decorations[countingIndex] == true ? this.decorationLayer : this.terrainLayer) : null // null for now
            this.map.putTileAt(tileIndex, currentTile.x - matrixPositionX, currentTile.y - matrixPositionY, false, layer)
        })
    }
}