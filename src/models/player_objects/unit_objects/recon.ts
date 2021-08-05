import { UnitObject } from "../unit_objects";

export class Recon extends UnitObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "Recon"
        this.movement = 8

        // variable
        this.player = _player ?? 0
    }
}