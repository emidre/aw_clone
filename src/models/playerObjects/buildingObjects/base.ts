import { INVALID_MOVEMENT, MovementType } from "../../gameObject";
import BuildingObject from "../buildingObject";

export default class Base extends BuildingObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "Base"

        // variable
        this.player = _player ?? -1

        this.movementCost = new Map<MovementType, number>()
        this.movementCost.set(MovementType.Infantry, 1)
        this.movementCost.set(MovementType.Mech, 1)
        this.movementCost.set(MovementType.Tires, 1)
        this.movementCost.set(MovementType.Treads, 1)
        this.movementCost.set(MovementType.Air, 1)
        this.movementCost.set(MovementType.Pipeline, 1)
        this.movementCost.set(MovementType.Oozium, 1)
        this.movementCost.set(MovementType.Ships, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Trans, INVALID_MOVEMENT)

        this.defensiveStars = 3
    }
}