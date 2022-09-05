export class Vector2 {
    public x: number
    public y: number

    constructor(_x?: number, _y?: number) {
        this.x = _x ?? 0
        this.y = _y ?? 0
    }
}