export type ObjectName = string;

abstract class _GameObject {
    public static objectName: ObjectName
}

export type GameObject = typeof _GameObject

export function GameObject(mandatory: { objectName: string }) {
    return class extends _GameObject {
        static objectName = mandatory.objectName
    }
}