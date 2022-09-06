import { MovementType } from "../gameObject";
import PlayerObject from "../playerObject";

export abstract class UnitObject extends PlayerObject {
    public movement: number = null
    public movementType: MovementType = null
    public movementModifier: number = 0
}