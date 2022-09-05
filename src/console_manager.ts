import { Constants } from "./constants";
import GameManager from "./game_manager";
import { Commands } from "./models/commands";
import { Infantry } from "./models/player_objects/unit_objects/infantry";
import { MegaTank } from "./models/player_objects/unit_objects/megatank";
import { Recon } from "./models/player_objects/unit_objects/recon";
import Mountain from "./models/terrain_objects/mountain";
import Plains from "./models/terrain_objects/plains";
import Woods from "./models/terrain_objects/woods";
import TileManager from "./tile_manager";
import UpdateManager from "./update_manager";

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
            case Commands.plains: {
                TileManager.Instance.currentBrush = Plains;
                break;
            }
            case Commands.woods: {
                TileManager.Instance.currentBrush = Woods;
                break;
            }
            case Commands.mountain: {
                TileManager.Instance.currentBrush = Mountain;
                break;
            }
            case Commands.selectedplayer: {
                const playerNumber = Number.parseInt(command.split(" ")[1])
                if ([0, 1, 2, 3, 4].includes(playerNumber)) {
                    UpdateManager.Instance.selectedPlayer = playerNumber
                }
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