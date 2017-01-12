import * as _ from "lodash"
import {
    Gestalt,
    GestaltsMap,
    GestaltInstance,
    GestaltInstancesMap,
    GestaltToGestaltInstanceMap,
    HydratedGestaltInstance,
} from './domain'

var count = 0

let canvasElement = document.createElement('canvas')
document.body.appendChild(canvasElement)
// var c=document.getElementById("myCanvas");
var ctx = canvasElement.getContext("2d");
ctx.font = "16px Helvetica";


export function genGUID() {
    count++;
    return "UNIQUE_ID_" + count.toString();
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


export function objectToArray<T>(object: { [id: string]: T }) {
    var arr: T[] = [];
    for (var key in object) {
        arr.push(object[key]);
    }
    return arr;
}


export function immSplice<T>(arr: T[], start: number, deleteCount: number, ...items: T[]) {
    return [...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount)]
}



export const encodeHtmlEntity = function (str: string) {
    var buf = [];
    for (var i = str.length - 1; i >= 0; i--) {
        buf.unshift(['&#', str.charCodeAt(i), ';'].join(''));
    }
    return buf.join('');
};


export const filterEntries = (entries: HydratedGestaltInstance[], filter: string) => {
    const pdFilter = filter.toLowerCase();

    let fNotes = entries
    if (filter !== '')
        fNotes = entries.filter((currNote) => currNote.gestalt.text.toLowerCase().indexOf(pdFilter) !== -1)

    // const openPlaceHolder = "4309jfei8jnasdf"
    // const closePlaceHolder = "0jf0893489j01q"

    // fNotes = fNotes.map((currNote) => {
    //     let txt = currNote.gestalt.text
    //     if (pdFilter.length > 0) {
    //         const r = new RegExp("(" + pdFilter + ")", "ig")
    //         //txt = txt.replace(r, '<span style="font-weight:bold;background-color: yellow"}>$1</span>')
    //         txt = txt.replace(r, openPlaceHolder + '$1' + closePlaceHolder)
    //         txt = encodeHtmlEntity(txt).replace("&#10;", "<br />")
    //         txt = txt.replace(new RegExp(encodeHtmlEntity(openPlaceHolder), 'g'), '<span style="font-weight:bold;background-color: yellow"}>')
    //         txt = txt.replace(new RegExp(encodeHtmlEntity(closePlaceHolder), 'g'), '</span>')
    //     }
    //     else {
    //         txt = encodeHtmlEntity(txt).replace("&#10;", "<br />")
    //     }

    //     return { ...currNote, gestalt: { ...currNote.gestalt, text: txt } };
    // });


    return fNotes

}


export function average(arr: number[]) {
    return _.reduce(arr, function (memo, num) {
        return memo + num;
    }, 0) / arr.length;
}

// Includes lastHydratedRootGestaltInstance for faster diffing
export function hydrateGestaltInstanceAndChildren(
    gestaltInstanceId: string,
    allGestalts: GestaltsMap,
    allGestaltInstances: GestaltInstancesMap,
    lastHydratedRootGestaltInstance?: HydratedGestaltInstance, startInd?: number, endInd?: number
): HydratedGestaltInstance {

    const currInstance: GestaltInstance = allGestaltInstances[gestaltInstanceId]
    console.assert(typeof currInstance !== "undefined", `${gestaltInstanceId} not in allGestaltInstances`)

    const currGestalt: Gestalt = allGestalts[currInstance.gestaltId]
    console.assert(typeof currGestalt !== "undefined", `${currInstance.gestaltId} not in allGestalts`)

    let nextHydGesInsts
    if (currInstance.childIds === null) {
        return
    } else if (currGestalt.isRoot) {
        const newlyHydGesInsts: HydratedGestaltInstance[] = currInstance.childIds
            .slice(startInd, endInd)
            .map((instanceId: string) => hydrateGestaltInstanceAndChildren(instanceId, allGestalts, allGestaltInstances))

        nextHydGesInsts = immSplice(lastHydratedRootGestaltInstance.hydratedChildren,
            startInd, endInd - startInd, ...newlyHydGesInsts)
    } else {
        nextHydGesInsts = currInstance.childIds.map((instanceId: string) =>
            hydrateGestaltInstanceAndChildren(instanceId, allGestalts, allGestaltInstances))
    }

    const hydratedGestaltInstance: HydratedGestaltInstance = {
        ...currInstance,
        gestalt: currGestalt,
        hydratedChildren: currInstance.childIds === null ?
            null
            : nextHydGesInsts
    }

    console.assert(!(hydratedGestaltInstance.expanded && hydratedGestaltInstance.hydratedChildren === null),
        "expanded and hyd==null", hydratedGestaltInstance)
    return hydratedGestaltInstance
}

export function computeTextHeight(text: string): number {
    let width = ctx.measureText(text).width

    // width,10,50)


    return 0 //Math.max(1, Math.ceil(text.length * W_WIDTH / LINE_WIDTH)) * LINE_HEIGHT + GESTALT_PADDING
}

export function createGestalt(text: string = '', isRoot?: boolean) {
    const uid: string = genGUID()
    const newGestalt: Gestalt = {
        text: text,
        gestaltId: uid,
        relatedIds: isRoot !== undefined && isRoot ? undefined : [],
        isRoot: isRoot !== undefined && isRoot
    }

    return newGestalt
}


export function createGestaltInstance(gestaltId: string, expanded: boolean = true): GestaltInstance {
    const newInstanceId: string = genGUID()

    let newGestaltInstance: GestaltInstance = {
        instanceId: newInstanceId,
        gestaltId,
        childIds: (expanded ? [] : null) as string[],
        expanded,
        version: 0,
        parentInstanceId: gestaltId
    }

    return newGestaltInstance
}

export function updateAncestorInstanceVersions(
    instanceId: string,
    gestaltInstancesMap: GestaltInstancesMap,
    gestaltToGestaltInstanceMap: GestaltToGestaltInstanceMap,
    rootGestaltInstanceId: string
): GestaltInstancesMap {
    if (instanceId === rootGestaltInstanceId) {
        return gestaltInstancesMap
    }

    const instance = gestaltInstancesMap[instanceId]
    if (!instance) {
        return gestaltInstancesMap
    }
    instance.version += 1

    return updateAncestorInstanceVersions(
        instance.parentInstanceId, gestaltInstancesMap, gestaltToGestaltInstanceMap, rootGestaltInstanceId)
}
export function insertChildInstances(
    parentGestaltInstance: GestaltInstance,
    instanceIds: string[],
    offset?: number
): GestaltInstance {
    console.assert(
        parentGestaltInstance.childIds !== null,
        "trying to insert child into nub instance",
        parentGestaltInstance,
    )

    if (typeof offset === "undefined") {
        offset = parentGestaltInstance.childIds.length
    }

    const newchildren = immSplice(parentGestaltInstance.childIds, offset, 0, ...instanceIds)

    return {
        ...parentGestaltInstance,
        children: newchildren,
        version: parentGestaltInstance.version + 1
    }
}

export function removeChildInstance(parentGestaltInstance: GestaltInstance, offset: number): GestaltInstance {
  return {
    ...parentGestaltInstance,
    children: immSplice(parentGestaltInstance.childIds, offset, 1),
  }
}

