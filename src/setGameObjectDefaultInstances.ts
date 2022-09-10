import Constants from "./constants"
import Mountain from "./models/playerObjects/terrainObjects/Mountain"
import Pipe from "./models/playerObjects/terrainObjects/Pipe"
import PipeSeam from "./models/playerObjects/terrainObjects/PipeSeam"
import Plains from "./models/playerObjects/terrainObjects/Plains"
import Reef from "./models/playerObjects/terrainObjects/Reef"
import River from "./models/playerObjects/terrainObjects/River"
import Roads from "./models/playerObjects/terrainObjects/Roads"
import Sea from "./models/playerObjects/terrainObjects/Sea"
import Shoal from "./models/playerObjects/terrainObjects/Shoal"
import Woods from "./models/playerObjects/terrainObjects/Woods"
import Base from "./models/playerObjects/buildingObjects/Base"
import HQ from "./models/playerObjects/buildingObjects/HQ"
import Infantry from "./models/playerObjects/unitObjects/Infantry"
import MegaTank from "./models/playerObjects/unitObjects/MegaTank"
import Recon from "./models/playerObjects/unitObjects/Recon"

export const setGameObjectDefaultInstances = () => {
    Constants.gameObjectDefaultInstances.set(Mountain, new Mountain())
    Constants.gameObjectDefaultInstances.set(Pipe, new Pipe())
    Constants.gameObjectDefaultInstances.set(PipeSeam, new PipeSeam())
    Constants.gameObjectDefaultInstances.set(Plains, new Plains())
    Constants.gameObjectDefaultInstances.set(Reef, new Reef())
    Constants.gameObjectDefaultInstances.set(River, new River())
    Constants.gameObjectDefaultInstances.set(Roads, new Roads())
    Constants.gameObjectDefaultInstances.set(Sea, new Sea())
    Constants.gameObjectDefaultInstances.set(Shoal, new Shoal())
    Constants.gameObjectDefaultInstances.set(Woods, new Woods())
    Constants.gameObjectDefaultInstances.set(Base, new Base())
    Constants.gameObjectDefaultInstances.set(HQ, new HQ())
    Constants.gameObjectDefaultInstances.set(Infantry, new Infantry())
    Constants.gameObjectDefaultInstances.set(MegaTank, new MegaTank())
    Constants.gameObjectDefaultInstances.set(Recon, new Recon())
}
