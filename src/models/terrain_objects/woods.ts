import { TerrainObject } from "../terrain_object";

export default class Woods extends TerrainObject({ objectName: "woods", movementCostInfantry: 1 }) {
    constructor(obj?: Partial<TerrainObject>) {
        super()
        Object.assign(this, obj)
    }
}