import { MovementType } from "../../game_object";
import { UnitObject } from "../unit_objects";

export class MegaTank extends UnitObject {
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