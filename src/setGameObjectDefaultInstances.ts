import { Constants } from "./constants"
import { Infantry } from "./models/player_objects/unit_objects/infantry"
import { MegaTank } from "./models/player_objects/unit_objects/megatank"
import { Recon } from "./models/player_objects/unit_objects/recon"
import Mountain from "./models/terrain_objects/mountain"
import Plains from "./models/terrain_objects/plains"
import Woods from "./models/terrain_objects/woods"

export const setGameObjectDefaultInstances = () => {
    Constants.gameObjectDefaultInstances.set(Plains, new Plains())
    Constants.gameObjectDefaultInstances.set(Woods, new Woods())
    Constants.gameObjectDefaultInstances.set(Mountain, new Mountain())
    Constants.gameObjectDefaultInstances.set(Infantry, new Infantry())
    Constants.gameObjectDefaultInstances.set(MegaTank, new MegaTank())
    Constants.gameObjectDefaultInstances.set(Recon, new Recon())
}