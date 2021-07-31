import { PlayerObject } from "../player_object";

export abstract class UnitObject extends PlayerObject {
    public movement: number = null
    public movementModifier: number = 0
}