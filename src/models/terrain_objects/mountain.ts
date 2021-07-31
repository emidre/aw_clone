import { TerrainObject } from "../terrain_object";

export default class Mountain extends TerrainObject {
    constructor() {
        super()

        this.objectName = "Mountain"
        this.movementCostInfantry = 2
    }
}