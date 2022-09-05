import { Constants } from "./constants";
import { TileSetEncoding, tileSetEncodings, TileEncoding } from "./encoding/object_indices";
import GameManager from "./game_manager";
import { GameObject } from "./models/game_object";
import { Orientation } from "./models/orientation";
import { PathTile } from "./models/pathTile";
import { UnitObject } from "./models/player_objects/unit_objects";
import { TerrainObject } from "./models/terrain_object";
import Plains from "./models/terrain_objects/plains";
import { Vector2 } from "./models/vector2";
import UpdateManager from "./update_manager";

export default class TileManager {
    private static _instance: TileManager;

    constructor() {
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private _animatedTiles: Array<{
        frames: Array<number>;
        tiles: Array<Phaser.Tilemaps.Tile>;
    }> = [];
    private _attackTiles: Array<{ x: number; y: number; }> = [];
    private _currentBrush: typeof GameObject = null;
    private _lastCreatedTile: Phaser.Tilemaps.Tile;
    private _lastSelectedTile: Phaser.Tilemaps.Tile;
    private _map: Phaser.Tilemaps.Tilemap;
    private _movementTiles: Array<PathTile> = [];
    private _statusLayer: Phaser.Tilemaps.TilemapLayer;
    private _terrainData: Array<typeof TerrainObject>;
    private _unitData: Array<typeof UnitObject>;
    private _unitTiles: Phaser.Tilemaps.Tileset;
    private _visionTiles: Array<{ x: number; y: number; }> = [];
    
    private decorationLayer: Phaser.Tilemaps.TilemapLayer
    private pathLayer: Phaser.Tilemaps.TilemapLayer
    private terrainLayer: Phaser.Tilemaps.TilemapLayer
    private terrainTiles: Phaser.Tilemaps.Tileset
    private unitLayer: Phaser.Tilemaps.TilemapLayer

    //
    // Public
    //

    initializeTileMaps = () => {
        this.terrainTiles = this.map.addTilesetImage('aw_tileset_normal', 'terrainTiles')
        this.unitTiles = this.map.addTilesetImage('aw_tileset_units_small', 'unitTiles');
    }

    initializeTileData = () => {
        this.terrainData = new Array(this.map.width * this.map.height)
        this.terrainData.fill(Plains)

        this.unitData = new Array(this.map.width * this.map.height)
        this.unitData.fill(null)
    }

    initializeTileLayers = () => {
        this.terrainLayer = this.map.createBlankLayer('terrainLayer', this.terrainTiles)
        this.terrainLayer.setScale(UpdateManager.Instance.worldScale)
        this.terrainLayer.fill(this.getOffsetIndex(78, this.terrainTiles))

        this.unitLayer = this.map.createBlankLayer('unitLayer', this.unitTiles)
        this.unitLayer.setScale(UpdateManager.Instance.worldScale)
        this.unitLayer.fill(this.getOffsetIndex(35, this.unitTiles))

        this.decorationLayer = this.map.createBlankLayer('decorationLayer', this.terrainTiles)
        this.decorationLayer.setScale(UpdateManager.Instance.worldScale)
        this.decorationLayer.fill(this.getOffsetIndex(1052, this.terrainTiles))

        this.statusLayer = this.map.createBlankLayer('statusLayer', this.unitTiles)
        this.statusLayer.setScale(UpdateManager.Instance.worldScale)
        this.statusLayer.fill(this.getOffsetIndex(35, this.unitTiles))

        this.pathLayer = this.map.createBlankLayer('pathLayer', this.unitTiles)
        this.pathLayer.setScale(UpdateManager.Instance.worldScale)
        this.pathLayer.fill(this.getOffsetIndex(35, this.unitTiles))
    }

    getCurrentTile = (input: Phaser.Input.InputPlugin, mapCamera: Phaser.Cameras.Scene2D.Camera) => {
        const mousePositionInMapCameraX = input.activePointer.worldX + Constants.tileMapOffsetX + mapCamera.scrollX - Constants.margin
        const mousePositionInMapCameraY = input.activePointer.worldY + mapCamera.scrollY - Constants.margin
        return this.map.getTileAtWorldXY(mousePositionInMapCameraX, mousePositionInMapCameraY, false, mapCamera, this.terrainLayer)
    }

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
                switch (UpdateManager.Instance.selectedPlayer) {
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

    isAnyUnitMoving = () => {
        return this.movementTiles.length > 0
    }

    convertTileTo1DCoords = (tile: Phaser.Tilemaps.Tile | Vector2) => {
        return tile.y * this.map.width + tile.x
    }

    getOffsetIndex = (index: number, tileset: Phaser.Tilemaps.Tileset) => {
        return tileset.firstgid + index
    }

    showShortestPath(currentTile: Phaser.Tilemaps.Tile | Vector2) {
        let path = this.calculateShortestPath(currentTile)

        for (let i = 0; i < path.length; i++) {
            const curr = path[i];
            const pred = i - 1 >= 0 ? path[i - 1] : null
            const succ = i + 1 >= 0 ? path[i + 1] : null

            const backwardsOrientation = Constants.orientationToBitmask.get(this.findOrientation(pred, curr)) << 4
            const forwardOrientation = Constants.orientationToBitmask.get(this.findOrientation(succ, curr))
            const orientation = backwardsOrientation + forwardOrientation
            const index = Constants.bitOrientationToIndex.get(orientation)

            this.paintTile(curr, this.getOffsetIndex(index, this.unitTiles), this.pathLayer)
        }
    }

    findTile(tiles: PathTile[], tile: PathTile | Vector2) {
        let tmp = (tile as Vector2)
        if ((tile as PathTile).vec) {
            tmp = (tile as PathTile).vec
        }
        return tiles.find((_tile) => _tile.vec.x == tmp.x && _tile.vec.y == tmp.y)
    }

    clearPath = () => {
        this.paintTiles(this.movementTiles, this.getOffsetIndex(35, this.unitTiles), this.pathLayer)
    }

    paintTiles(tiles: PathTile[], index, layer) {
        tiles.forEach((tile) => {
            layer.putTileAt(index, tile.vec.x, tile.vec.y)
        })
    }

    visitTilesAroundUnit(unit: typeof UnitObject, currentTile: Phaser.Tilemaps.Tile) {
        const unitInstance = (Constants.gameObjectDefaultInstances.get(unit) as UnitObject)
        const movement = unitInstance.movement
        const visitedTiles: Array<PathTile> = []
        const outerTiles: Array<PathTile> = []
        const centerTile: PathTile = { vec: new Vector2(currentTile.x, currentTile.y), pred: null, remaining: movement }
        outerTiles.push(centerTile)

        while (outerTiles.length > 0) {
            let outerTile = outerTiles[0]

            let candidate: PathTile
            let terrain: TerrainObject
            let movementCost

            candidate = { vec: new Vector2(outerTile.vec.x - 1, outerTile.vec.y), pred: outerTile, remaining: outerTile.remaining }
            terrain = Constants.gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate.vec)]) as TerrainObject
            movementCost = terrain.movementCost.get(unitInstance.movementType)
            candidate.remaining -= movementCost
            if (this.isTileValid(candidate, visitedTiles))
                outerTiles.push(candidate)
            candidate = { vec: new Vector2(outerTile.vec.x + 1, outerTile.vec.y), pred: outerTile, remaining: outerTile.remaining }
            terrain = Constants.gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate.vec)]) as TerrainObject
            movementCost = terrain.movementCost.get(unitInstance.movementType)
            candidate.remaining -= movementCost
            if (this.isTileValid(candidate, visitedTiles))
                outerTiles.push(candidate)
            candidate = { vec: new Vector2(outerTile.vec.x, outerTile.vec.y - 1), pred: outerTile, remaining: outerTile.remaining }
            terrain = Constants.gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate.vec)]) as TerrainObject
            movementCost = terrain.movementCost.get(unitInstance.movementType)
            candidate.remaining -= movementCost
            if (this.isTileValid(candidate, visitedTiles))
                outerTiles.push(candidate)
            candidate = { vec: new Vector2(outerTile.vec.x, outerTile.vec.y + 1), pred: outerTile, remaining: outerTile.remaining }
            terrain = Constants.gameObjectDefaultInstances.get(this.terrainData[this.convertTileTo1DCoords(candidate.vec)]) as TerrainObject
            movementCost = terrain.movementCost.get(unitInstance.movementType)
            candidate.remaining -= movementCost
            if (this.isTileValid(candidate, visitedTiles))
                outerTiles.push(candidate)

            visitedTiles.push(outerTile)
            outerTiles.splice(0, 1)
        }
        return visitedTiles
    }

    //
    // Private
    //

    private paintTile(tile: PathTile, index, layer) {
        layer.putTileAt(index, tile.vec.x, tile.vec.y)
    }

    private calculateShortestPath(currentTile: Phaser.Tilemaps.Tile | Vector2): Array<PathTile> {
        this.clearPath()
        const currentMovementTiles = this.movementTiles.filter((tile) => tile.vec.x == currentTile.x && tile.vec.y == currentTile.y)
        let currentMovementTile = currentMovementTiles[0]
        currentMovementTiles.forEach((tile) => {
            if (tile.remaining > currentMovementTile.remaining) {
                currentMovementTile = tile
            }
        })
        if (currentMovementTile) {
            let path: Array<PathTile> = [currentMovementTile]
            let pred = currentMovementTile.pred
            while (pred != null) {
                path.push(pred)
                pred = pred.pred
            }
            path = path.reverse()
            return path
        }
    }

    private isTileValid(candidate: PathTile, visitedTiles: Array<PathTile>) {
        if (!((candidate.vec.x < 0 || candidate.vec.x > this.map.width - 1) ||
            (candidate.vec.y < 0 || candidate.vec.y > this.map.height - 1) ||
            candidate.remaining < 0 ||
            this.findTile(visitedTiles, candidate)
        )) {
            return true
        } else {
            return false
        }
    }

    private findOrientation(target: PathTile, ref: PathTile) {
        if (!target || !ref) return Orientation.null
        if (target.vec.x != ref.vec.x) {
            return target.vec.x > ref.vec.x ? Orientation.RIGHT : Orientation.LEFT
        } else if (target.vec.y != ref.vec.y) {
            return target.vec.y > ref.vec.y ? Orientation.BOTTOM : Orientation.TOP
        } else {
            return null
        }
    }

    //
    // Getters and Setters
    //

    public get lastSelectedTile(): Phaser.Tilemaps.Tile {
        return this._lastSelectedTile;
    }
    public set lastSelectedTile(value: Phaser.Tilemaps.Tile) {
        this._lastSelectedTile = value;
    }

    public get lastCreatedTile(): Phaser.Tilemaps.Tile {
        return this._lastCreatedTile;
    }
    public set lastCreatedTile(value: Phaser.Tilemaps.Tile) {
        this._lastCreatedTile = value;
    }

    public get map(): Phaser.Tilemaps.Tilemap {
        return this._map;
    }
    public set map(value: Phaser.Tilemaps.Tilemap) {
        this._map = value;
    }

    public get animatedTiles(): Array<{
        frames: Array<number>;
        tiles: Array<Phaser.Tilemaps.Tile>;
    }> {
        return this._animatedTiles;
    }
    public set animatedTiles(value: Array<{
        frames: Array<number>;
        tiles: Array<Phaser.Tilemaps.Tile>;
    }>) {
        this._animatedTiles = value;
    }

    public get terrainData(): Array<typeof TerrainObject> {
        return this._terrainData;
    }
    public set terrainData(value: Array<typeof TerrainObject>) {
        this._terrainData = value;
    }

    public get unitData(): Array<typeof UnitObject> {
        return this._unitData;
    }
    public set unitData(value: Array<typeof UnitObject>) {
        this._unitData = value;
    }

    public get currentBrush(): typeof GameObject {
        return this._currentBrush;
    }
    public set currentBrush(value: typeof GameObject) {
        this._currentBrush = value;
    }

    public get movementTiles(): Array<PathTile> {
        return this._movementTiles;
    }
    public set movementTiles(value: Array<PathTile>) {
        this._movementTiles = value;
    }

    public get statusLayer(): Phaser.Tilemaps.TilemapLayer {
        return this._statusLayer;
    }
    public set statusLayer(value: Phaser.Tilemaps.TilemapLayer) {
        this._statusLayer = value;
    }

    public get unitTiles(): Phaser.Tilemaps.Tileset {
        return this._unitTiles;
    }
    public set unitTiles(value: Phaser.Tilemaps.Tileset) {
        this._unitTiles = value;
    }

    public get attackTiles(): Array<{ x: number; y: number; }> {
        return this._attackTiles;
    }
    public set attackTiles(value: Array<{ x: number; y: number; }>) {
        this._attackTiles = value;
    }

    public get visionTiles(): Array<{ x: number; y: number; }> {
        return this._visionTiles;
    }
    public set visionTiles(value: Array<{ x: number; y: number; }>) {
        this._visionTiles = value;
    }
}