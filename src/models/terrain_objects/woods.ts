import { TerrainObject } from "../terrain_object";

export default class Woods extends TerrainObject {
    constructor() {
        super()

        this.objectName = "Woods"
        this.movementCostInfantry = 1
    }
}