export default class _Number {
    number: string
    name: string
    keyCode: number

    constructor(_number: string, _name) {
        this.number = _number
        this.name = _name
        this.keyCode = Phaser.Input.Keyboard.KeyCodes[_name]
    }
}