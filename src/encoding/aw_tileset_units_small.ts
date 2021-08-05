import { TileEncoding, TileSetEncoding } from "./object_indices";

// Order: Orange Star Active
// recon (145), antiair, fighter, battleship, infantry_os, mech_os (160), recon_inactive (145 + 18) ...
// lighttank (145 + 36 = 181), artillery, bomber, crusier, infantry_bm, mech_bm (195), ...
// ...
// Order: Blue Moon Active (145 + 216)
// recon (361), antiair, fighter, battleship, infantry_os, mech_os (376), ...
// ...

const firstUnit = 144
const activeSkip = 18
const inactiveSkip = 18
const factionSkip = 216
const numberOfFrames = 3

export let aw_tilemap_units_small_encoding: TileSetEncoding = new Map<string, TileEncoding>()

const orderActive = [
    "active", "inactive"
]
const orderFactions = [
    "orange", "blue", "yellow", "green", "black"
]
const orderUnits = [
    "recon", "antiair", "fighter", "battleship", "infantry_os", "mech_os",
    "lighttank", "artillery", "bomber", "crusier", "infantry_bm", "mech_bm",
    "mediumtank", "rocket", "blackbomb", "sub", "infantry_yc", "mech_yc",
    "neotank", "missile", "stealthbomber", "lander", "infantry_ge", "mech_ge",
    "megatank", "piperunner", "battlecopter", "blackboat", "infantry_bh", "mech_bh",
    "apc", "oozium", "transportcopter", "carrier"
]
const orderAnimation = [1, 2]

// The idea is: infantry, orange star tiles, orange color, active/inactive (whether or not it already did something)
orderActive.forEach((x, x_index) => {
    orderFactions.forEach((y, y_index) => {
        orderUnits.forEach((z, z_index) => {
            let offset = (Math.floor(z_index / 6)) * inactiveSkip

            let indices = [
                firstUnit +
                (x_index * activeSkip) +
                (y_index * factionSkip) +
                z_index * numberOfFrames +
                offset
            ]

            let additionalFrames = []
            orderAnimation.forEach((frame) => {
                additionalFrames.push([indices[0] + frame])
            })

            aw_tilemap_units_small_encoding.set(`${z}_${y}_${x}`, { indices: indices, additionalFrames: additionalFrames })
        })
    })
})