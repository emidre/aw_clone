import { Vector2 } from "./vector2";

export interface PathTile {
    vec: Vector2,
    pred: PathTile | null,
    remaining: number
}