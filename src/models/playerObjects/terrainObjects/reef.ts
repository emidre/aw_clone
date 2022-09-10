import { INVALID_MOVEMENT, MovementType } from "../../gameObject";
import TerrainObject from "../terrainObject";

export default class Reef extends TerrainObject {
    constructor() {
        super()

        this.objectName = "Reef"

        this.movementCost = new Map<MovementType, number>()
        this.movementCost.set(MovementType.Infantry, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Mech, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Tires, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Treads, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Air, 1)
        this.movementCost.set(MovementType.Pipeline, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Oozium, 1)
        this.movementCost.set(MovementType.Ships, 2)
        this.movementCost.set(MovementType.Trans, 2)

        this.defensiveStars = 1
    }
}