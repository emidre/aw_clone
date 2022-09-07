import { MovementType } from "../gameObject";
import PlayerObject from "../playerObject";

export default abstract class TerrainObject extends PlayerObject {
    movementCost: Map<MovementType, number> = null
    defensiveStars: number = null
}