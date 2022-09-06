import { GameObject, MovementType } from "./gameObject";

export default abstract class TerrainObject extends GameObject {
    movementCost: Map<MovementType, number> = null
}