import { MovementType } from "../../game_object";
import { UnitObject } from "../unit_objects";

export class Infantry extends UnitObject {
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