import { MovementType } from "../../gameObject";
import { UnitObject } from "../unitObject";

export default class Infantry extends UnitObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "Infantry"
        this.movement = 3
        this.movementType = MovementType.Infantry

        // variable
        this.player = _player ?? 0
    }
}