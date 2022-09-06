import { MovementType } from "../../gameObject";
import { UnitObject } from "../unitObject";

export default class MegaTank extends UnitObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "megatank"
        this.movement = 4
        this.movementType = MovementType.Treads

        // variable
        this.player = _player ?? 0
    }
}