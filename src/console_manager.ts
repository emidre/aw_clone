import Constants from "./constants";
import Commands from "./models/commands";
import Base from "./models/playerObjects/buildingObjects/Base";
import HQ from "./models/playerObjects/buildingObjects/HQ";
import Infantry from "./models/playerObjects/unitObjects/Infantry";
import MegaTank from "./models/playerObjects/unitObjects/MegaTank";
import Recon from "./models/playerObjects/unitObjects/Recon";
import Mountain from "./models/playerObjects/terrainObjects/Mountain";
import Plains from "./models/playerObjects/terrainObjects/Plains";
import Woods from "./models/playerObjects/terrainObjects/Woods";
import TileManager from "./tileManager";
import UpdateManager from "./updateManager";
import Roads from "./models/playerObjects/terrainObjects/Roads";

export default class ConsoleManager {
    private static _instance: ConsoleManager;

    constructor() {
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private _consoleText: Phaser.GameObjects.Text;
    private _consoleActive: boolean = false;

    //
    // Public
    //

    toggleConsole = () => {
        this.consoleActive = !this.consoleActive
        this._consoleText.setVisible(this.consoleActive)
        if (!this.consoleActive) {
            this._consoleText.setText(Constants.consolePrefix)
        }
    }

    executeCommand = (command: string) => {
        console.log(`Executing ${command}`)

        switch (command) {
            //
            // Objects
            //

            case Commands.mountain: {
                TileManager.Instance.currentBrush = Mountain;
                break;
            }
            case Commands.plains: {
                TileManager.Instance.currentBrush = Plains;
                break;
            }
            case Commands.roads: {
                TileManager.Instance.currentBrush = Roads;
                break;
            }
            case Commands.woods: {
                TileManager.Instance.currentBrush = Woods;
                break;
            }
            case Commands.base: {
                TileManager.Instance.currentBrush = Base;
                break;
            }
            case Commands.hq: {
                TileManager.Instance.currentBrush = HQ;
                break;
            }
            case Commands.infantry: {
                TileManager.Instance.currentBrush = Infantry;
                break;
            }
            case Commands.megatank: {
                TileManager.Instance.currentBrush = MegaTank;
                break;
            }
            case Commands.recon: {
                TileManager.Instance.currentBrush = Recon;
                break;
            }

            //
            // Other
            //

            case Commands.selectedplayer: {
                const playerNumber = Number.parseInt(command.split(" ")[1])
                if ([0, 1, 2, 3, 4].includes(playerNumber)) {
                    UpdateManager.Instance.selectedPlayer = playerNumber
                }
                break;
            }
            case Commands.clear: {
                TileManager.Instance.currentBrush = null;
                break;
            }
        }

        TileManager.Instance.lastCreatedTile = null;
    }

    //
    // Private
    //

    //
    // Getters and Setters
    //

    public get consoleText(): Phaser.GameObjects.Text {
        return this._consoleText;
    }
    public set consoleText(value: Phaser.GameObjects.Text) {
        this._consoleText = value;
    }

    public get consoleActive(): boolean {
        return this._consoleActive;
    }
    public set consoleActive(value: boolean) {
        this._consoleActive = value;
    }
}