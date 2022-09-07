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
    static readonly bitOrientationToIndexForRoads: Map<number, number> = new Map([
        [0b0011, 2],
        [0b1011, 3],
        [0b1001, 4],
        [0b0111, 28],
        [0b1111, 29],
        [0b1101, 30],
        [0b0110, 54],
        [0b1110, 55],
        [0b1100, 56],
        [0b0000, 80],
        [0b1000, 80],
        [0b0010, 80],
        [0b1010, 80],
        [0b0100, 81],
        [0b0001, 81],
        [0b0101, 81],
    ])
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
    static readonly bitOrientationToIndexForPipes: Map<number, number> = new Map([
        [0b0011, 34],
        [0b1001, 35],
        [0b0001, 36],
        [0b0000, 37],
        [0b1010, 37],
        [0b0101, 38],
        [0b0110, 60],
        [0b1100, 61],
        [0b0100, 62],
        [0b0010, 86],
        [0b1000, 87],

        [0b1111, 38],
        [0b0111, 38],
        [0b1101, 38],
        [0b1011, 37],
        [0b1110, 37],
    ])
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
    static readonly orientationToBitmask: Map<Orientation, number> = new Map([
        [Orientation.LEFT, 0b1000],
        [Orientation.TOP, 0b0100],
        [Orientation.RIGHT, 0b0010],
        [Orientation.BOTTOM, 0b0001],
    ])
    static gameObjectDefaultInstances: Map<typeof GameObject, GameObject> = new Map<typeof GameObject, GameObject>()
    static EMPTY_TERRAIN = 1637
}