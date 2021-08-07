import { GameObject, MovementType } from "./game_object";

export abstract class TerrainObject extends GameObject {
    movementCost: Map<MovementType, number> = null
}