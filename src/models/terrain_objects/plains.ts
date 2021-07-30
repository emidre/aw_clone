import { TerrainObject } from "../terrain_object";

export default class Plains extends TerrainObject({ objectName: "plains", movementCostInfantry: 1 }) {
    constructor(obj?: Partial<TerrainObject>) {
        super()
        Object.assign(this, obj)
    }
}