import { GameObject, ObjectName } from "./game_object";

//export default abstract class TerrainObject extends GameObject({ objectName: "TerrainObject" }) {
// something like movement cost, etc...
//}

export abstract class _TerrainObject extends GameObject({ objectName: "TerrainObjectClass " }) {
    public static movementCostInfantry: number
}

export type TerrainObject = typeof _TerrainObject

export function TerrainObject(mandatory: { objectName: ObjectName, movementCostInfantry: number }) {
    return class extends _TerrainObject {
        static objectName = mandatory.objectName
        static movementCostInfantry = mandatory.movementCostInfantry
    }
}