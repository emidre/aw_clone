import { INVALID_MOVEMENT, MovementType } from "../../gameObject";
import TerrainObject from "../terrainObject";

export default class Woods extends TerrainObject {
    constructor() {
        super()

        this.objectName = "Woods"

        this.movementCost = new Map<MovementType, number>()
        this.movementCost.set(MovementType.Infantry, 1)
        this.movementCost.set(MovementType.Mech, 1)
        this.movementCost.set(MovementType.Tires, 3)
        this.movementCost.set(MovementType.Treads, 2)
        this.movementCost.set(MovementType.Air, 1)
        this.movementCost.set(MovementType.Pipeline, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Oozium, 1)
        this.movementCost.set(MovementType.Ships, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Trans, INVALID_MOVEMENT)

        this.defensiveStars = 2
    }
}