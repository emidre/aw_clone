import { aw_tileset_normal_encoding } from "./aw_tileset_normal"

export interface TileSetEncoding { [key: string]: TileEncoding }

export interface TileEncoding {
    sizeX?: number, // Assumed to be 1
    sizeY?: number, // Assumed to be 1
    indices: Array<number>
    decorations?: Array<boolean> // Usually two tiles, with the upper one being decoration (e.g. any HQ)
}

export const tileSetEncodings = {
    "aw_tileset_normal": aw_tileset_normal_encoding
}