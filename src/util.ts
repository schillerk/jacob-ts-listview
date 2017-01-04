import * as _ from "lodash";
import { Gestalt, GestaltCollection, GestaltHierarchicalViewItemContents, createGestaltInstance, HydratedGestaltHierarchicalViewItemContents } from './domain';

var count = 0;

export function moveCursorToEnd(el:any) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

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

export function hydrateGestaltInstanceAndChildren(gestaltInstance: GestaltHierarchicalViewItemContents, allGestalts: { [id: string]: Gestalt }): HydratedGestaltHierarchicalViewItemContents {
    const currGestalt: Gestalt = allGestalts[gestaltInstance.gestaltId];
    console.assert(typeof currGestalt !== "undefined", gestaltInstance.gestaltId + " not in allGestalts")
    const hydratedGestaltInstance: HydratedGestaltHierarchicalViewItemContents = {
        ...gestaltInstance,
        gestalt: currGestalt,
        hydratedChildren: gestaltInstance.children === null ?
            null
            : gestaltInstance.children.map((gi) => {
                return this.hydrateGestaltInstanceAndChildren(gi, allGestalts);
            })
    };

    return hydratedGestaltInstance
}