import Constants from "./constants"
import Mountain from "./models/playerObjects/terrainObjects/Mountain"
import Plains from "./models/playerObjects/terrainObjects/Plains"
import Roads from "./models/playerObjects/terrainObjects/Roads"
import Woods from "./models/playerObjects/terrainObjects/Woods"
import Base from "./models/playerObjects/buildingObjects/Base"
import HQ from "./models/playerObjects/buildingObjects/HQ"
import Infantry from "./models/playerObjects/unitObjects/Infantry"
import MegaTank from "./models/playerObjects/unitObjects/MegaTank"
import Recon from "./models/playerObjects/unitObjects/Recon"

export const setGameObjectDefaultInstances = () => {
    Constants.gameObjectDefaultInstances.set(Mountain, new Mountain())
    Constants.gameObjectDefaultInstances.set(Plains, new Plains())
    Constants.gameObjectDefaultInstances.set(Roads, new Roads())
    Constants.gameObjectDefaultInstances.set(Woods, new Woods())
    Constants.gameObjectDefaultInstances.set(Base, new Base())
    Constants.gameObjectDefaultInstances.set(HQ, new HQ())
    Constants.gameObjectDefaultInstances.set(Infantry, new Infantry())
    Constants.gameObjectDefaultInstances.set(MegaTank, new MegaTank())
    Constants.gameObjectDefaultInstances.set(Recon, new Recon())
}
