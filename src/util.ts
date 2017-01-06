import * as _ from "lodash";
import { Gestalt, GestaltsMap, GestaltInstance, GestaltInstancesMap, HydratedGestaltInstance } from './domain';

var count = 0;

export function moveCaretToEnd(el: HTMLSpanElement) {
    const range = document.createRange()
    const sel = window.getSelection()

    const innerText = el.childNodes[0]

    if (!innerText) { return }

    range.setStart(innerText, innerText.textContent.length)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)

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


export function immSplice<T>(arr:T[], start:number, deleteCount:number, ...items:T[]) {
  return [ ...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount) ]
}

export enum KEY_CODES {
    UP = 38,
    DOWN = 40,
    ENTER = 13,
    TAB = 9,
}

export const SPECIAL_CHARS_JS = {
    NBSP: "\xa0"
}

export function average(arr: number[]) {
    return _.reduce(arr, function (memo, num) {
        return memo + num;
    }, 0) / arr.length;
}

export function hydrateGestaltInstanceAndChildren(gestaltInstanceId: string, allGestalts: GestaltsMap, allGestaltInstances: GestaltInstancesMap): HydratedGestaltInstance {

    const currInstance: GestaltInstance = allGestaltInstances[gestaltInstanceId];
    console.assert(typeof currInstance !== "undefined", gestaltInstanceId + " not in allGestaltInstances")

    const currGestalt: Gestalt = allGestalts[currInstance.gestaltId];
    console.assert(typeof currGestalt !== "undefined", currInstance.gestaltId + " not in allGestalts")

    const hydratedGestaltInstance: HydratedGestaltInstance = {
        ...currInstance,
        gestalt: currGestalt,
        hydratedChildren: currInstance.childrenInstanceIds === null ?
            null
            : currInstance.childrenInstanceIds.map((instanceId: string) =>
                hydrateGestaltInstanceAndChildren(instanceId, allGestalts, allGestaltInstances))
    };

    console.assert(!(hydratedGestaltInstance.expanded && hydratedGestaltInstance.hydratedChildren===null),"expanded and hyd==null", hydratedGestaltInstance)
    return hydratedGestaltInstance
}