
import * as Util from './util';

export interface Gestalt {
    gestaltId: string;
    text: string;
    relatedIds: string[];
    instanceAndVisibleNubIds: {[instanceId:string]: boolean}
}

export interface GestaltCollection {
    [id: string]: Gestalt
}

export interface GestaltInstance {
    instanceId: string;
    expanded: boolean
    parentGestaltInstanceId: string
    shouldUpdate: boolean 

    gestaltId: string;
    // childInstances: GestaltInstance[];
}

export function createGestaltInstance(gestalt: Gestalt) {
    // var newInstance : GestaltInstance = {
    //     instanceId: Util.genGUID(),
    //     childInstances: [],
    //     expanded: true,
    //     gestaltId: gestalt.gestaltId
    // }
    // return newInstance;
}