
import * as Util from './util';

export interface Gestalt {
    gestaltId: string;
    text: string;
    relatedIds: string[];
}

export interface GestaltCollection {
    [id: string]: Gestalt
}

export interface GestaltInstance {
    instanceId: string;
    gestaltId: string;
    expanded: boolean;
    childInstances: GestaltInstance[];
}

export function createGestaltInstance(gestalt: Gestalt){
    var newInstance : GestaltInstance = {
        instanceId: Util.genGUID(),
        childInstances: [],
        expanded: true,
        gestaltId: gestalt.gestaltId
    }
    return newInstance;
}