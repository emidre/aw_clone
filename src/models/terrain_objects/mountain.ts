import { INVALID_MOVEMENT, MovementType } from "../game_object";
import { TerrainObject } from "../terrain_object";

export default class Mountain extends TerrainObject {
    constructor() {
        super()

        this.objectName = "Mountain"
        this.movementCost = new Map<MovementType, number>()
        this.movementCost.set(MovementType.Infantry, 2)
        this.movementCost.set(MovementType.Mech, 1)
        this.movementCost.set(MovementType.Tires, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Treads, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Air, 1)
        this.movementCost.set(MovementType.Pipeline, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Oozium, 1)
        this.movementCost.set(MovementType.Ships, INVALID_MOVEMENT)
        this.movementCost.set(MovementType.Trans, INVALID_MOVEMENT)
    }
}