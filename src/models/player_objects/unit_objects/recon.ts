import { MovementType } from "../../game_object";
import { UnitObject } from "../unit_objects";

export class Recon extends UnitObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "Recon"
        this.movement = 8
        this.movementType = MovementType.Tires

        // variable
        this.player = _player ?? 0
    }
}