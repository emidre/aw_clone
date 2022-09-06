import { MovementType } from "../../gameObject";
import { UnitObject } from "../unitObject";

export default class Recon extends UnitObject {
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