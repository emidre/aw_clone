export type ObjectName = string;

export enum MovementType {
    Infantry,
    Mech,
    Tires,
    Treads,
    Air,
    Pipeline,
    Oozium,
    Ships,
    Trans,
}
export const INVALID_MOVEMENT = 1337

export abstract class GameObject {
    objectName: ObjectName = null
}