import * as _ from "lodash";
import { Gestalt, GestaltCollection, GestaltInstance, createGestaltInstance, HydratedGestaltInstance } from './domain';

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

export function hydrateGestaltInstanceTree(gestaltInstance: GestaltInstance, allGestalts: { [id: string]: Gestalt }):HydratedGestaltInstance {
    const currGestalt : Gestalt = allGestalts[gestaltInstance.gestaltId];
    console.assert(typeof currGestalt !== "undefined",gestaltInstance.gestaltId + " not in allGestalts")
    const hydratedGestaltInstanceTree: HydratedGestaltInstance = {
        ...gestaltInstance,
        gestalt: currGestalt,
        relatedGestalts: currGestalt.relatedIds.map((id) => {
            return allGestalts[id];
        })
    };

    gestaltInstance.children.filter(c => c.expanded).map((childGestaltInstance) => {
        this.hydrateGestaltInstanceTree(childGestaltInstance, allGestalts)
    });

    return hydratedGestaltInstanceTree
}