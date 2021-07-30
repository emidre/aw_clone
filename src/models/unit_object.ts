import { GameObject, ObjectName } from "./game_object";

export abstract class _UnitObject extends GameObject({ objectName: "UnitObjectClass " }) {
    hitpoints: number
}

export type UnitObject = typeof _UnitObject

export function UnitObject(mandatory: { objectName: ObjectName }) {
    return class extends _UnitObject {
        static objectName = mandatory.objectName
    }
}