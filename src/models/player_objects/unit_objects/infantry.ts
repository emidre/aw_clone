import { UnitObject } from "../unit_objects";

export class Infantry extends UnitObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "Infantry"
        this.movement = 3

        // variable
        this.player = _player ?? 0
    }
}