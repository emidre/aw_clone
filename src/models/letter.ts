export default class Letter {
    letter: string
    keyCode: number

    constructor(_letter: string) {
        this.letter = _letter
        this.keyCode = Phaser.Input.Keyboard.KeyCodes[_letter]
    }
}