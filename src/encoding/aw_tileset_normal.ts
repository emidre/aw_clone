import { TileEncoding, TileSetEncoding } from "./object_indices";

export let aw_tileset_normal_encoding: TileSetEncoding = new Map<string, TileEncoding>()

const obj = {
    "plains": {
        indices: [78]
    },
    "woods": {
        sizeY: 2,
        indices: [21, 47],
        decorations: [true, false]
    },
    "mountain": {
        sizeY: 2,
        indices: [23, 49],
        decorations: [true, false]
    }
}

Object.keys(obj).forEach((k) => {
    aw_tileset_normal_encoding.set(k, obj[k])
})