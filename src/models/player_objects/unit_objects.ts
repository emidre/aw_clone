import { MovementType } from "../game_object";
import { PlayerObject } from "../player_object";

export abstract class UnitObject extends PlayerObject {
    public movement: number = null
    public movementType: MovementType = null
    public movementModifier: number = 0
}