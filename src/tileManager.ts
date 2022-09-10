import Constants from "./constants";
import { TileSetEncoding, tileSetEncodings, TileEncoding } from "./encoding/objectIndices";
import GameManager from "./gameManager";
import { GameObject } from "./models/gameObject";
import { Orientation } from "./models/orientation";
import PathTile from "./models/pathTile";
import BuildingObject from "./models/playerObjects/buildingObject";
import { UnitObject } from "./models/playerObjects/unitObject";
import TerrainObject from "./models/playerObjects/terrainObject";
import Plains from "./models/playerObjects/terrainObjects/Plains";
import Vector2 from "./models/vector2";
import UpdateManager from "./updateManager";
import Roads from "./models/playerObjects/terrainObjects/Roads";
import Pipe from "./models/playerObjects/terrainObjects/Pipe";
import PipeSeam from "./models/playerObjects/terrainObjects/PipeSeam";
import Sea from "./models/playerObjects/terrainObjects/Sea";
import Reef from "./models/playerObjects/terrainObjects/Reef";

type AnimatedTiles = Array<{
    frames: Array<number>;
    tiles: Array<Phaser.Tilemaps.Tile>;
}>;

export default class TileManager {
    private static _instance: TileManager;

    constructor() {
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private _animatedTiles: AnimatedTiles = [];
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
        if ((objectClass.prototype instanceof TerrainObject)  || (objectClass.prototype instanceof BuildingObject)) {
            tileSetName = "aw_tileset_normal"
        } else if (objectClass.prototype instanceof UnitObject) {
            tileSetName = "aw_tileset_units_small"
        }

        const tileSetEncoding: TileSetEncoding = tileSetEncodings[tileSetName]

        if (objectClass.prototype instanceof TerrainObject && !(objectClass.prototype instanceof BuildingObject)) {
            const tileEncoding: TileEncoding = tileSetEncoding.get(objectClass.name.toLowerCase())

            const sizeX = tileEncoding.sizeX ?? 1
            const sizeY = tileEncoding.sizeY ?? 1
            const decorations = tileEncoding.decorations ?? tileEncoding.indices.map((_) => false)

            if (currentTile.y - 1 >= 0) {
                this.map.putTileAt(this.getOffsetIndex(1052, this.terrainTiles), currentTile.x, currentTile.y - 1, false, this.decorationLayer)
            }
            this.terrainData[this.convertTileTo1DCoords(currentTile)] = objectClass as any

            if (objectClass.name == Roads.name) {
                this.unifyTileAndDirectNeighbors(currentTile, Constants.bitOrientationToIndexForRoads, Constants.indexToBitOrientationForRoads, [Roads.name])
                return
            }

            if (objectClass.name == Pipe.name) {
                this.unifyTileAndDirectNeighbors(currentTile, Constants.bitOrientationToIndexForPipes, Constants.indexToBitOrientationForPipes, [Pipe.name, PipeSeam.name])
                return
            }

            if (objectClass.name == PipeSeam.name) {
                if ([37, 41].includes(currentTile.index - 1)) {
                    this.map.putTileAt(this.getOffsetIndex(63, this.terrainTiles), currentTile.x, currentTile.y, false, this.terrainLayer)

                    let animatedTileData = {
                        frames: [],
                        tiles: [],
                    };

                    animatedTileData.frames.push(this.getOffsetIndex(67, this.terrainTiles))
                    animatedTileData.frames.push(this.getOffsetIndex(67, this.terrainTiles))
                    animatedTileData.frames.push(this.getOffsetIndex(63, this.terrainTiles))

                    animatedTileData.tiles = [this.terrainLayer.getTileAt(currentTile.x, currentTile.y)]

                    this.animatedTiles.push(animatedTileData);
                } else if ([38].includes(currentTile.index - 1)) {
                    this.map.putTileAt(this.getOffsetIndex(64, this.terrainTiles), currentTile.x, currentTile.y, false, this.terrainLayer)
                }
                return
            }

            this.clearAnimationsForLayer(currentTile, this.terrainLayer)

            // Bottom right is assumed to be the origin point of the sprite
            tileEncoding.indices.forEach((tileIndex, countingIndex) => {
                const matrixPositionX = Math.abs(countingIndex % sizeX - (sizeX - 1))
                const matrixPositionY = Math.abs(Math.floor(countingIndex / sizeX) - (sizeY - 1))

                const layer = decorations[countingIndex] == true ? this.decorationLayer : this.terrainLayer
                this.map.putTileAt(this.getOffsetIndex(tileIndex, this.terrainTiles), currentTile.x - matrixPositionX, currentTile.y - matrixPositionY, false, layer)
            })

            if (objectClass.name == Sea.name) {
                this.unifyTileAndAllNeighbors(currentTile, Constants.bitOrientationToIndexForSea, Constants.indexToBitOrientationForSea, [Sea.name, Reef.name])
                return
            }
        } else if (objectClass.prototype instanceof UnitObject) {
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

            this.clearAnimationsForLayer(currentTile, this.unitLayer)
            this.unitData[this.convertTileTo1DCoords(currentTile)] = objectClass as any

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
        } else if (objectClass.prototype instanceof BuildingObject) {
            let modifier = ""

            if (objectClass.name.toLowerCase() == "hq") {
                modifier = "_os" // for now
            }

            let color = ""
            switch (UpdateManager.Instance.selectedPlayer) {
                case 0: {
                    color = "_orange"
                    break
                }
                case 1: {
                    color = "_blue"
                    break
                }
            }

            let name = objectClass.name.toLowerCase() + modifier + color + "_active"
            const tileEncoding: TileEncoding = tileSetEncoding.get(name)

            const sizeX = tileEncoding.sizeX ?? 1
            const sizeY = tileEncoding.sizeY ?? 1
            const decorations = tileEncoding.decorations ?? tileEncoding.indices.map((_) => false)

            if (currentTile.y - 1) {
                this.map.putTileAt(this.getOffsetIndex(1052, this.terrainTiles), currentTile.x, currentTile.y - 1, false, this.decorationLayer)
            }
            this.clearAnimationsForLayer(currentTile, this.terrainLayer)
            this.terrainData[this.convertTileTo1DCoords(currentTile)] = objectClass as any

            // Bottom right is assumed to be the origin point of the sprite
            tileEncoding.indices.forEach((tileIndex, countingIndex) => {
                const matrixPositionX = Math.abs(countingIndex % sizeX - (sizeX - 1))
                const matrixPositionY = Math.abs(Math.floor(countingIndex / sizeX) - (sizeY - 1))

                const layer = decorations[countingIndex] == true ? this.decorationLayer : this.terrainLayer
                this.map.putTileAt(this.getOffsetIndex(tileIndex, this.terrainTiles), currentTile.x - matrixPositionX, currentTile.y - matrixPositionY, false, layer)
            })

            let animatedTileData = {
                frames: [],
                tiles: [],
            };

            animatedTileData.frames.push(this.getOffsetIndex(tileEncoding.indices[1], this.terrainTiles))
            animatedTileData.frames.push(this.getOffsetIndex(tileEncoding.indices[1], this.terrainTiles))
            animatedTileData.frames.push(this.getOffsetIndex(tileEncoding.additionalFrames[0][0], this.terrainTiles))

            animatedTileData.tiles = [this.terrainLayer.getTileAt(currentTile.x, currentTile.y)]

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

            const backwardsOrientation = Constants.orientationToBitmaskForMarker.get(this.findOrientation(pred, curr)) << 4
            const forwardOrientation = Constants.orientationToBitmaskForMarker.get(this.findOrientation(succ, curr))
            const orientation = backwardsOrientation + forwardOrientation
            const index = Constants.bitOrientationToIndexForMarker.get(orientation)

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

    private unifyTileAndDirectNeighbors(currentTile: Phaser.Tilemaps.Tile, bitOrientationToIndexMap: Map<number, number[]>, indexToBitOrientationMap: Map<number, number>, namesToCheck: Array<string>) {
        let neighbors = [
            [-1, 0, Constants.orientationToBitmaskDirect.get(Orientation.LEFT)],
            [1, 0, Constants.orientationToBitmaskDirect.get(Orientation.RIGHT)],
            [0, -1, Constants.orientationToBitmaskDirect.get(Orientation.TOP)],
            [0, 1, Constants.orientationToBitmaskDirect.get(Orientation.BOTTOM)],
        ]
        
        this.unifyTilesAndNeighbors(currentTile, bitOrientationToIndexMap, indexToBitOrientationMap, namesToCheck, neighbors)
    }

    private unifyTileAndAllNeighbors(currentTile: Phaser.Tilemaps.Tile, bitOrientationToIndexMap: Map<number, number[]>, indexToBitOrientationMap: Map<number, number>, namesToCheck: Array<string>) {
        let neighbors = [
            [-1, 1, Constants.orientationToBitmaskAll.get(Orientation.BOTTOMLEFT)],
            [-1, 0, Constants.orientationToBitmaskAll.get(Orientation.LEFT)],
            [-1, -1, Constants.orientationToBitmaskAll.get(Orientation.TOPLEFT)],
            [0, -1, Constants.orientationToBitmaskAll.get(Orientation.TOP)],
            [1, -1, Constants.orientationToBitmaskAll.get(Orientation.TOPRIGHT)],
            [1, 0, Constants.orientationToBitmaskAll.get(Orientation.RIGHT)],
            [1, 1, Constants.orientationToBitmaskAll.get(Orientation.BOTTOMRIGHT)],
            [0, 1, Constants.orientationToBitmaskAll.get(Orientation.BOTTOM)],
        ]

        this.unifyTilesAndNeighbors(currentTile, bitOrientationToIndexMap, indexToBitOrientationMap, namesToCheck, neighbors)
    }

    private unifyTilesAndNeighbors(currentTile: Phaser.Tilemaps.Tile, bitOrientationToIndexMap: Map<number, number[]>, indexToBitOrientationMap: Map<number, number>, namesToCheck: Array<string>, neighbors: number[][]) {
        let roadLayout = 0b0
        let newX = 0
        let newY = 0

        neighbors.forEach(entry => {
            newX = currentTile.x + entry[0]
            newY = currentTile.y + entry[1]

            if (this.areCoordinatesWithinBounds(newX, newY)) {
                roadLayout = this.updateNeighborTileAndLayout(newX, newY, roadLayout, entry[2], bitOrientationToIndexMap, indexToBitOrientationMap, namesToCheck, neighbors);
            }
        })

        let newIndex = this.findNewIndex(bitOrientationToIndexMap, roadLayout, neighbors)

        //let newIndex = bitOrientationToIndexMap.get(roadLayout)[0]
        this.map.putTileAt(this.getOffsetIndex(newIndex, this.terrainTiles), currentTile.x, currentTile.y, false, this.terrainLayer)

        if (namesToCheck.includes(Pipe.name) || namesToCheck.includes(PipeSeam.name)) {
            if (Constants.pipesNextAnimationFrame.has(newIndex)) {
                let animatedTileData = {
                    frames: [],
                    tiles: [],
                };

                animatedTileData.frames.push(this.getOffsetIndex(Constants.pipesNextAnimationFrame.get(newIndex), this.terrainTiles))
                animatedTileData.frames.push(this.getOffsetIndex(Constants.pipesNextAnimationFrame.get(newIndex), this.terrainTiles))
                animatedTileData.frames.push(this.getOffsetIndex(newIndex, this.terrainTiles))

                animatedTileData.tiles = [this.terrainLayer.getTileAt(currentTile.x, currentTile.y)]

                this.animatedTiles.push(animatedTileData);
            }
        } else if (namesToCheck.includes(Sea.name) || namesToCheck.includes(Reef.name)) {
            // TBD
        }
    }

    private updateNeighborTileAndLayout(newX: number, newY: number, layout: number, orientationToNeighbor: number, bitOrientationToIndexMap: Map<number, number[]>, indexToBitOrientationMap: Map<number, number>, namesToCheck: Array<string>, neighbors: number[][]) {
        let neighbor = this.terrainLayer.getTileAt(newX, newY);
        let newLayout = layout;
        if (namesToCheck.includes(this.terrainData[this.convertTileTo1DCoords(neighbor)].name)) {
            newLayout += orientationToNeighbor;
            let oldLayout = indexToBitOrientationMap.get(neighbor.index - 1);

            let neighborsX = 0
            let neighborsY = 0

            neighbors.forEach(entry => {
                neighborsX = neighbor.x + entry[0]
                neighborsY = neighbor.y + entry[1]

                if (this.areCoordinatesWithinBounds(neighborsX, neighborsY) && ((oldLayout & entry[2]) == 0)) {
                    let neighborsNeighbor = this.terrainLayer.getTileAt(neighborsX, neighborsY);
                    if (namesToCheck.includes(this.terrainData[this.convertTileTo1DCoords(neighborsNeighbor)].name)) {
                        oldLayout |= entry[2]
                    }
                }
            })

            let newIndex = this.findNewIndex(bitOrientationToIndexMap, oldLayout, neighbors)

            //let newIndex = bitOrientationToIndexMap.get(oldLayout)[0]
            this.clearAnimationsForLayer(this.terrainLayer.getTileAt(newX, newY), this.terrainLayer)
            this.map.putTileAt(this.getOffsetIndex(newIndex, this.terrainTiles), newX, newY, false, this.terrainLayer);

            if (Constants.pipesNextAnimationFrame.has(newIndex)) {
                let animatedTileData = {
                    frames: [],
                    tiles: [],
                };

                animatedTileData.frames.push(this.getOffsetIndex(Constants.pipesNextAnimationFrame.get(newIndex), this.terrainTiles))
                animatedTileData.frames.push(this.getOffsetIndex(Constants.pipesNextAnimationFrame.get(newIndex), this.terrainTiles))
                animatedTileData.frames.push(this.getOffsetIndex(newIndex, this.terrainTiles))

                animatedTileData.tiles = [this.terrainLayer.getTileAt(newX, newY)]

                this.animatedTiles.push(animatedTileData);
            }
        }
        return newLayout;
    }

    private findNewIndex(bitOrientationToIndexMap, layout, neighbors) {
        for (const [k, v] of bitOrientationToIndexMap) {
            let failed = false
            if ((layout & k) == k) {
                let notRequired = layout ^ k

                if (notRequired != 0) {
                    for (var i = (neighbors.length - 1); i >= 0; i--) {
                        let notRequiredBit = (notRequired & (1 << i)) >> i

                        if (notRequiredBit == 1) {
                            let optionalBit = v[1] & (1 << i)

                            if (optionalBit == 0) {
                                failed = true
                            }
                        }
                    }
                }

                if (!failed) {
                    return v[0]
                }
            }
        }
    }

    private getNeighbors(sourceTile: Phaser.Tilemaps.Tile, layer: Phaser.Tilemaps.TilemapLayer): Array<Phaser.Tilemaps.Tile> {
        let neighbors : Array<Phaser.Tilemaps.Tile> = []

        sourceTile.x - 1 >= 0 ? neighbors.push(layer.getTileAt(sourceTile.x - 1, sourceTile.y)) : null
        sourceTile.x + 1 >= 0 ? neighbors.push(layer.getTileAt(sourceTile.x + 1, sourceTile.y)) : null
        sourceTile.y - 1 >= 0 ? neighbors.push(layer.getTileAt(sourceTile.x, sourceTile.y - 1)) : null
        sourceTile.y + 1 >= 0 ? neighbors.push(layer.getTileAt(sourceTile.x, sourceTile.y + 1)) : null

        return neighbors
    }

    private clearAnimationsForLayer(currentTile: Phaser.Tilemaps.Tile, layer: Phaser.Tilemaps.TilemapLayer) {
        this.animatedTiles = this.animatedTiles.filter(animatedTile => {
            return !(animatedTile.tiles[0].x == currentTile.x && animatedTile.tiles[0].y == currentTile.y && animatedTile.tiles[0].layer.tilemapLayer == layer)
        })
    }

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

    private areCoordinatesWithinBounds(x, y) {
        return (x >= 0 && x < this.map.width) && (y >= 0 && y < this.map.height)
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

    private dec2bin(dec) {
        return (dec >>> 0).toString(2);
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