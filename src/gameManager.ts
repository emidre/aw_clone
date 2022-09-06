import UpdateManager from "./updateManager"
import Constants from "./constants"
import { setGameObjectDefaultInstances } from "./setGameObjectDefaultInstances"
import ConsoleManager from "./console_manager"
import TileManager from "./tile_manager"

export default class GameManager extends Phaser.Scene {
    private static _instance: GameManager;

    constructor() {
        super('GameManager')
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }
    
    private posText: Phaser.GameObjects.Text
    private mapCamera: Phaser.Cameras.Scene2D.Camera
    private interfaceCamera: Phaser.Cameras.Scene2D.Camera
    private statusText: Phaser.GameObjects.Text
    private marker: Phaser.GameObjects.Image

    //
    // Public
    //

    //
    // Private
    //

    preload = () => {
        this.load.image('terrainTiles', '../assets/tilemaps/aw_tilemap_normal.png')
        this.load.image('unitTiles', '../assets/tilemaps/aw_tilemap_units_small.png')
        this.load.tilemapTiledJSON('map', '../assets/tilemaps/aw_map.json')
        this.load.atlas("unitAtlas", "../assets/tilemaps/aw_tilemap_units_small.png", "../assets/tilemaps/aw_tilemap_normal.json")
        this.load.image('cursor', '../assets/sprites/cursor.png')

        setGameObjectDefaultInstances()
    }

    create = () => {
        TileManager.Instance.map = this.add.tilemap('map')
        TileManager.Instance.map.width = 20
        TileManager.Instance.map.height = 20

        TileManager.Instance.initializeTileMaps()
        TileManager.Instance.initializeTileData()

        UpdateManager.Instance.worldScale = (Constants.gameHeight - (Constants.margin * 2)) / (16 * TileManager.Instance.map.height)
        if (UpdateManager.Instance.worldScale > Constants.maxWorldScale) {
            UpdateManager.Instance.worldScale = Constants.maxWorldScale
        }
        
        this.cameras.main.setBounds(-Constants.tileMapOffsetX, 0, Constants.gameWidth, Constants.gameHeight)

        this.interfaceCamera = this.cameras.main
        this.interfaceCamera.setBackgroundColor('rgb(150,150,150)')

        this.mapCamera = this.cameras.add(Constants.margin, Constants.margin, Constants.gameHeight - (Constants.margin * 2), Constants.gameHeight - (Constants.margin * 2), true)
        this.mapCamera.setBounds(0, 0, TileManager.Instance.map.width * 16 * UpdateManager.Instance.worldScale, TileManager.Instance.map.height * 16 * UpdateManager.Instance.worldScale)

        TileManager.Instance.initializeTileLayers()

        this.marker = this.add.image(0, 0, 'cursor')
        this.marker.setScale(UpdateManager.Instance.worldScale)

        UpdateManager.Instance.initialize(this.input, this.cameras)

        this.posText = this.add.text(-Constants.tileMapOffsetX + 3, 3, 'pos: -1, -1', { fontSize: '8px', fontFamily: "Lucida Console", color: '#000' })
        ConsoleManager.Instance.consoleText = this.add.text(-Constants.tileMapOffsetX + 75, 3, Constants.consolePrefix, { fontSize: '8px', fontFamily: "Lucida Console", color: '#F00' })
        ConsoleManager.Instance.consoleText.setVisible(false)
        this.statusText = this.add.text(-Constants.tileMapOffsetX - 54 /* this is the magic number, don't question it */ + (Constants.gameHeight - Constants.margin * 2), 3, '', { fontSize: '12px', fontFamily: "Lucida Console", color: '#000' })
    }

    update = (time, delta) => {
        var currentTile : Phaser.Tilemaps.Tile = TileManager.Instance.getCurrentTile(this.input, this.mapCamera)

        UpdateManager.Instance.handleMouseInput(currentTile, this.input)
        UpdateManager.Instance.handleKeyboardInput(this.input)
        UpdateManager.Instance.handleCamera(delta)
        UpdateManager.Instance.handleAnimations(delta, this.time.timeScale)
        UpdateManager.Instance.handleSelection(currentTile, this.posText, this.marker)

        this.setStatusText(currentTile)
    }

    setStatusText = (currentTile: Phaser.Tilemaps.Tile) => {
        this.statusText.setText(
            `
            Terrain: ${currentTile ? TileManager.Instance.terrainData[TileManager.Instance.convertTileTo1DCoords(currentTile)]?.name : "OOB"}\n
            Unit: ${currentTile ? TileManager.Instance.unitData[TileManager.Instance.convertTileTo1DCoords(currentTile)]?.name : "OOB"}\n
            `
        )
    }

    //
    // Getters and Setters
    //
}