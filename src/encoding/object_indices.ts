import { aw_tilemap_units_small_encoding } from "./aw_tileset_units_small"
import { aw_tileset_normal_encoding } from "./aw_tileset_normal"

export type TileSetEncoding = Map<string, TileEncoding>

export interface TileEncoding {
    sizeX?: number, // Assumed to be 1
    sizeY?: number, // Assumed to be 1
    indices: Array<number>
    additionalFrames?: Array<Array<number>> // The idea is the length of the outer array says how many additional frames there are, with the inner one looking like indices
    decorations?: Array<boolean> // Usually two tiles, with the upper one being decoration (e.g. HQ, Woods, Mountain)
}

export const tileSetEncodings = {
    "aw_tileset_normal": aw_tileset_normal_encoding,
    "aw_tileset_units_small": aw_tilemap_units_small_encoding
}

// create function that allows converting an x, y coord in the tilemap into its correct index using the tilemap width (this will be ever changing)