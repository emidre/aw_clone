import { TerrainObject } from "../terrain_object";

export default class Mountain extends TerrainObject({ objectName: "mountain", movementCostInfantry: 2 }) {
    constructor(obj?: Partial<TerrainObject>) {
        super()
        Object.assign(this, obj)
    }
}