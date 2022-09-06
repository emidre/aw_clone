import BuildingObject from "../buildingObject";

export default class HQ extends BuildingObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "HQ"

        // variable
        this.player = _player ?? 0
    }
}