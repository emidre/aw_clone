import Commands from "./models/commands"
import { GameObject } from "./models/gameObject"
import Letter from "./models/letter"
import _Number from "./models/number"
import { Orientation } from "./models/orientation"

export default abstract class Constants {
    static readonly rate: number = 1
    static readonly followTimeScale: boolean = true
    static readonly unitFrameRate: number = 1
    static readonly unitFrameDuration: number = 333
    static readonly letters: Array<Letter> = [new Letter("A"), new Letter("B"), new Letter("C"), new Letter("D"), new Letter("E"), new Letter("F"), new Letter("G"), new Letter("H"), new Letter("I"), new Letter("J"), new Letter("K"), new Letter("L"), new Letter("M"), new Letter("N"), new Letter("O"), new Letter("P"), new Letter("Q"), new Letter("R"), new Letter("S"), new Letter("T"), new Letter("U"), new Letter("V"), new Letter("W"), new Letter("X"), new Letter("Y"), new Letter("Z")]
    static readonly numbers: Array<_Number> = [ new _Number("0", "ZERO"), new _Number("1", "ONE"), new _Number("2", "TWO"), new _Number("3", "THREE"), new _Number("4", "FOUR"), new _Number("5", "FIVE"), new _Number("6", "SIX"), new _Number("7", "SEVEN"), new _Number("8", "EIGHT"), new _Number("9", "NINE")]
    static readonly listOfCommands = Object.keys(Commands)
    static readonly maxWorldScale = 2
    static readonly margin = 15
    static readonly safeDistance = 25
    static readonly consolePrefix = "command: "
    static readonly gameWidth = 1280
    static readonly gameHeight = 720
    static readonly tileMapOffsetX = (Constants.gameWidth + Constants.safeDistance)
    static readonly bitOrientationToIndexForMarker: Map<number, number> = new Map([
        [0b00011000, 0],
        [0b01000001, 36],
        [0b01000010, 72],
        [0b00010010, 108],
        [0b01101000, 1],
        [0b01001000, 37],
        [0b10000010, 73],
        [0b01100001, 2],
        [0b01100100, 38],
        [0b00100110, 74],
        [0b10000100, 39],
        [0b00101000, 75],
        [0b10000001, 111],
        [0b01000110, 40],
        [0b01100010, 76],
        [0b10000110, 112],
        [0b00010100, 5],
        [0b00100100, 41],
        [0b00100001, 77],
        [0b00010110, 113],
    ])
    static readonly orientationToBitmaskForMarker: Map<Orientation, number> = new Map([
        [Orientation.TOP, 0b0010],
        [Orientation.BOTTOM, 0b0100],
        [Orientation.LEFT, 0b0110],
        [Orientation.RIGHT, 0b1000],
        [Orientation.null, 0b0001],
    ])
    // Roads
    static readonly bitOrientationToIndexForRoads: [number, number, number, number?][] = [
        [0b0011, 2, 0],
        [0b1011, 3, 0],
        [0b1001, 4, 0],
        [0b0111, 28, 0],
        [0b1111, 29, 0],
        [0b1101, 30, 0],
        [0b0110, 54, 0],
        [0b1110, 55, 0],
        [0b1100, 56, 0],
        [0b0000, 80, 0],
        [0b1000, 80, 0],
        [0b0010, 80, 0],
        [0b1010, 80, 0],
        [0b0100, 81, 0],
        [0b0001, 81, 0],
        [0b0101, 81, 0],
    ]
    static readonly indexToBitOrientationForRoads: Map<number, number> = new Map([
        [2, 0b0011],
        [3, 0b1011],
        [4, 0b1001],
        [28, 0b0111],
        [29, 0b1111],
        [30, 0b1101],
        [54, 0b0110],
        [55, 0b1110],
        [56, 0b1100],
        [80, 0b0000],
        [81, 0b0000],
    ])
    // Pipes
    static readonly bitOrientationToIndexForPipes: [number, number, number, number?][] = [
        [0b0011, 34, 0],
        [0b1001, 35, 0],
        [0b0001, 36, 0],
        [0b0000, 37, 0],
        [0b1010, 37, 0],
        [0b0101, 38, 0],
        [0b0110, 60, 0],
        [0b1100, 61, 0],
        [0b0100, 62, 0],
        [0b0010, 86, 0],
        [0b1000, 87, 0],
        [0b1111, 38, 0],
        [0b0111, 38, 0],
        [0b1101, 38, 0],
        [0b1011, 37, 0],
        [0b1110, 37, 0],
    ]
    static readonly indexToBitOrientationForPipes: Map<number, number> = new Map([
        [34, 0b0011],
        [35, 0b1001],
        [36, 0b0001],
        [37, 0b0000],
        [38, 0b0101],
        [60, 0b0110],
        [61, 0b1100],
        [62, 0b0100],
        [86, 0b0010],
        [87, 0b1000],
    ])
    static readonly pipesNextAnimationFrame: Map<number, number> = new Map([
        [37, 41],
        [60, 39],
        [61, 40],
        [63, 67],
        [86, 65],
        [87, 66],
    ])
    // Sea
    // left top right bottom
    // Idea: Do required sea tiles, and optional sea tiles. That you you keep the number of entries in the map small.
    // In the Code, find all neighbors which are land, then set the optional bits to zero and find the key in the map.
    // 0: Required, 1: Optional
    static readonly bitOrientationToIndexForSea: [number, number, number, number?][] = [
        // Row 1
        [0b000_0_011_1, 104, 0b101_0_100_0],
        [0b110_0_011_1, 105, 0b001_0_100_0],
        [0b110_0_000_1, 106, 0b001_0_101_0],
        [0b000_0_000_1, 107, 0b101_0_101_0],
        [0b111_1_110_1, 108, 0b000_0_000_0],
        [0b011_1_111_1, 109, 0b000_0_000_0],
        [0b000_1_110_1, 110, 0b101_0_000_0],
        [0b011_1_000_1, 111, 0b000_0_101_0],
        [0b110_1_011_1, 112, 0b000_0_000_0],
        [0b111_1_010_1, 113, 0b000_0_000_0],
        [0b011_1_010_1, 114, 0b000_0_000_0],
        [0b010_1_110_1, 115, 0b000_0_000_0],

        // Row 2
        [0b000_1_111_1, 130, 0b101_0_000_0],
        [0b111_1_111_1, 131, 0b000_0_000_0],
        [0b111_1_000_1, 132, 0b000_0_101_0],
        [0b000_1_000_1, 133, 0b101_0_101_0],
        [0b111_1_011_1, 134, 0b000_0_000_0],
        [0b110_1_111_1, 135, 0b000_0_000_0],
        [0b000_1_010_1, 136, 0b101_0_000_0],
        [0b010_1_000_1, 137, 0b000_0_101_0],
        [0b010_1_111_1, 138, 0b000_0_000_0],
        [0b011_1_110_1, 139, 0b000_0_000_0],
        [0b110_1_010_1, 140, 0b000_0_000_0],
        [0b010_1_011_1, 141, 0b000_0_000_0],

        // Row 3
        [0b000_1_110_0, 156, 0b101_0_001_0],
        [0b011_1_110_0, 157, 0b100_0_001_0],
        [0b011_1_000_0, 158, 0b100_0_101_0],
        [0b000_1_000_0, 159, 0b101_0_101_0],
        [0b000_0_010_1, 160, 0b101_0_100_0],
        [0b010_0_000_1, 161, 0b001_0_101_0],
        [0b000_1_011_1, 162, 0b101_0_000_0],
        [0b110_1_000_1, 163, 0b000_0_101_0],
        [0b110_0_010_1, 164, 0b001_0_100_0],
        [0b010_0_010_1, 165, 0b001_0_100_0],
        [0b010_0_011_1, 166, 0b001_0_100_0],
        [0b010_1_010_1, 167, 0b000_0_000_0],
        
        // Row 4
        [0b000_0_010_0, 182, 0b101_0_101_0],
        [0b010_0_010_0, 183, 0b101_0_101_0],
        [0b010_0_000_0, 184, 0b101_0_101_0],
        [0b000_0_000_0, 185, 0b101_0_101_0],
        [0b000_1_010_0, 186, 0b101_0_001_0],
        [0b010_1_000_0, 187, 0b100_0_101_0],
        [0b110_1_110_1, 188, 0b000_0_000_0],
        [0b011_1_011_1, 189, 0b000_0_000_0],
        [0b011_1_010_0, 190, 0b100_0_001_0],
        [0b010_1_010_0, 191, 0b100_0_001_0],
        [0b010_1_110_0, 192, 0b100_0_001_0],
    ]
    static indexToBitOrientationForSea: Map<number, number> = new Map<number, number>()

    // Beach
    // left top right bottom
    static readonly bitOrientationToIndexForShoal: [number, number, number, number?][] = [
        // Row 1
        [0b0001, 116, 0b1000, 0b0010],
        [0b0001, 117, 0b0010, 0b1000],
        [0b0010, 118, 0b0100, 0b0001],
        [0b1010, 119, 0b0100, 0b0001],
        [0b1000, 120, 0b0100, 0b0001],
        [0b0000, 121, 0b0100, 0b0001],
        [0b0000, 122, 0b0010, 0b1101],
        [0b0000, 123, 0b0000, 0b0011],
        [0b0000, 124, 0b0000, 0b1001],

        // Row 2
        [0b0101, 142, 0b1000, 0b0010],
        [0b0101, 143, 0b0010, 0b1000],
        [0b0010, 144, 0b0001, 0b0100],
        [0b1010, 145, 0b0001, 0b0100],
        [0b1000, 146, 0b0001, 0b0100],
        [0b0000, 147, 0b0001, 0b0100],
        [0b0000, 148, 0b1000, 0b0111],
        [0b0000, 149, 0b0000, 0b0110],
        [0b0000, 150, 0b0000, 0b1100],

        // Row 3
        [0b0100, 168, 0b1000, 0b0010],
        [0b0100, 169, 0b0010, 0b1000],
        [0b0000, 170, 0b0100, 0b1011],
        [0b0010, 171, 0b0000, 0b1001],
        [0b1000, 172, 0b0000, 0b0011],
        [0b0001, 173, 0b0000, 0b0110],
        [0b0001, 174, 0b0000, 0b1100],
        [0b0011, 175, 0b0000, 0b1100],
        [0b1001, 176, 0b0000, 0b0110],

        // Row 4
        [0b0000, 194, 0b1000, 0b0010],
        [0b0000, 195, 0b0010, 0b1000],
        [0b0000, 196, 0b0001, 0b1110],
        [0b0010, 197, 0b0000, 0b1100],
        [0b1000, 198, 0b0000, 0b0110],
        [0b0100, 199, 0b0000, 0b0011],
        [0b0100, 200, 0b0000, 0b1001],
        [0b0110, 201, 0b0000, 0b1001],
        [0b1100, 202, 0b0000, 0b0011],
    ]
    static indexToBitOrientationForShoal: Map<number, number> = new Map<number, number>()

    static readonly orientationToBitmaskDirect: Map<Orientation, number> = new Map([
        [Orientation.LEFT, 0b1000],
        [Orientation.TOP, 0b0100],
        [Orientation.RIGHT, 0b0010],
        [Orientation.BOTTOM, 0b0001],
    ])
    static readonly orientationToBitmaskAll: Map<Orientation, number> = new Map([
        [Orientation.BOTTOMLEFT, 0b100_0_000_0],
        [Orientation.LEFT, 0b010_0_000_0],
        [Orientation.TOPLEFT, 0b001_0_000_0],
        [Orientation.TOP, 0b000_1_000_0],
        [Orientation.TOPRIGHT, 0b000_0_100_0],
        [Orientation.RIGHT, 0b000_0_010_0],
        [Orientation.BOTTOMRIGHT, 0b000_0_001_0],
        [Orientation.BOTTOM, 0b000_0_000_1],
    ])
    static gameObjectDefaultInstances: Map<typeof GameObject, GameObject> = new Map<typeof GameObject, GameObject>()
    static EMPTY_TERRAIN = 1637
}

Constants.bitOrientationToIndexForSea.forEach((x) => {
    Constants.indexToBitOrientationForSea.set(x[1], x[0])
})

Constants.bitOrientationToIndexForShoal.forEach((x) => {
    Constants.indexToBitOrientationForShoal.set(x[1], x[0])
})