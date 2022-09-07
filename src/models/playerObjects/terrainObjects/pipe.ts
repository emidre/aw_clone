import { INVALID_MOVEMENT, MovementType } from "../../gameObject";
import TerrainObject from "../terrainObject";

export default class Pipe extends TerrainObject {
    constructor() {
        super()

        this.objectName = "Pipe"

        this.movementCost = new Map<MovementType, number>()
        this.movementCost.set(MovementType.Infantry, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Mech, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Tires, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Treads, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Air, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Pipeline, 1)
        this.movementCost.set(MovementType.Oozium, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Ships, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Trans, INVALID_MOVEMENT)

        this.defensiveStars = 0
    }
}