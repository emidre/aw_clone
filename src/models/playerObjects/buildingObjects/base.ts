import BuildingObject from "../buildingObject";

export default class Base extends BuildingObject {
    constructor(_player?: number) {
        super()

        // const
        this.objectName = "Base"

        // variable
        this.player = _player ?? 0
    }
}