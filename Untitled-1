import * as _ from "lodash";
import { Gestalt, GestaltCollection, GestaltHierarchicalViewItemContents, createGestaltInstance, HydratedGestaltHierarchicalViewItemContents } from './domain';

var count = 0;

export function genGUID() {
    count++;
    return "UNIQUE_ID_" + count.toString();
}

export function objectToArray<T>(object: { [id: string]: T }) {
    var arr: T[] = [];
    for (var key in object) {
        arr.push(object[key]);
    }
    return arr;
}


export enum KEY_CODES {
    UP = 38,
    DOWN = 40,
    ENTER = 13
}

export const SPECIAL_CHARS_JS = {
    NBSP: "\xa0"
}

export function average(arr: number[]) {
    return _.reduce(arr, function (memo, num) {
        return memo + num;
    }, 0) / arr.length;
}

export function hydrateGestaltInstance(gestaltInstanceId: string, allGestalts: { [id: string]: Gestalt },
    allInstances: {[instanceId: string] : GestaltHierarchicalViewItemContents}): HydratedGestaltHierarchicalViewItemContents {
    const currGestaltInstance = allInstances[gestaltInstanceId];
    const currGestalt: Gestalt = allGestalts[currGestaltInstance.gestaltId];
    console.assert(typeof currGestalt !== "undefined", currGestaltInstance.gestaltId + " not in allGestalts")
    const hydratedGestaltInstance: HydratedGestaltHierarchicalViewItemContents = {
        ...currGestaltInstance,

        gestalt: currGestalt,
        hydratedChildren: currGestaltInstance.childInstanceIds === null ?
            null
            : currGestaltInstance.childInstanceIds.map((gi) => {
                return hydrateGestaltInstance(gi, allGestalts, allInstances);
            })
    };

    return hydratedGestaltInstance
}