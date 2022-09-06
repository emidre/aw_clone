import { TileEncoding, TileSetEncoding } from "./objectIndices";

export let aw_tileset_normal_encoding: TileSetEncoding = new Map<string, TileEncoding>()

//
// Terrain
//

const terrain = {
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

Object.keys(terrain).forEach((k) => {
    aw_tileset_normal_encoding.set(k, terrain[k])
})

//
// Buildings
//

const firstInactive = 1079
const firstBuilding = 1118
const animationSkip = 13
const factionSkip = 52
const decorationSkip = 26

const orderFactions = [
    "orange", "blue", "green", "yellow", "black"
]
const orderBuildings = [
    "hq_os", "hq_bm", "hq_ge", "hq_yc", "hq_bh",
    "city", "base", "airport", "port", "tower", "radar",
]

orderFactions.forEach((y, y_index) => {
    orderBuildings.forEach((z, z_index) => {
        let indices = []
        if (z_index == 6) {
            indices.push(1046)
        } else {
            indices.push(
                firstBuilding +
                (y_index * factionSkip) +
                z_index -
                decorationSkip
            )
        }
        indices.push(firstBuilding +
            (y_index * factionSkip) +
            z_index)

        let additionalFrames = []
        additionalFrames.push([indices[1] + animationSkip])

        aw_tileset_normal_encoding.set(`${z}_${y}_active`, { sizeY: 2, indices: indices, additionalFrames: additionalFrames, decorations: [true, false] })

        let inactive_indices = []
        inactive_indices.push(firstInactive + z_index - decorationSkip)
        inactive_indices.push(inactive_indices[0] + decorationSkip)
        aw_tileset_normal_encoding.set(`${z}_${y}_inactive`, { sizeY: 2, indices: indices, decorations: [true, false] })
    })
})
