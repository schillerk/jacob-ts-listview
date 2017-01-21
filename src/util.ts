import * as _ from "lodash";
import { Gestalt, GestaltsMap, GestaltInstance, GestaltInstancesMap, HydratedGestaltInstance } from './domain';
import * as Immutable from 'immutable'


var count = 0;

// let canvasElement = document.createElement('canvas')
// document.body.appendChild(canvasElement)
// // var c=document.getElementById("myCanvas");
// var ctx = canvasElement.getContext("2d");
// ctx.font = "16px Helvetica";


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

    if (!innerText || !innerText.textContent) { return }

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


export function immSplice<T>(arr: ReadonlyArray<T>, start: number, deleteCount: number, ...items: T[]) {
    return [...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount)]
}



export const encodeHtmlEntity = function (str: string) {
    var buf = [];
    for (var i = str.length - 1; i >= 0; i--) {
        buf.unshift(['&#', str.charCodeAt(i), ';'].join(''));
    }
    return buf.join('');
};


export const extractTags = (text: string): string[] => {
    return _.uniq(text.match(/#[A-Za-z0-9?*]+/g) || [])
}

export const computeHashtagsFromGestaltsMap = (gestalts: GestaltsMap): Immutable.OrderedSet<string> => {
    const allHashtags: { [tag: string]: boolean } = {}

    gestalts.valueSeq().forEach((g: Gestalt) =>
        extractTags(g.text)
            .forEach((tag: string) => {
                allHashtags[tag] = true
            }))
    return Immutable.OrderedSet<string>(_.keys(allHashtags))
}

export const computeHashtagsFromGestaltsArray = (gestalts: Gestalt[]): Immutable.OrderedSet<string> => {
    const allHashtags: { [tag: string]: boolean } = {}

    gestalts.forEach((g) =>
        extractTags(g.text)
            .forEach((tag: string) => {
                allHashtags[tag] = true
            }))

    return Immutable.OrderedSet<string>(_.keys(allHashtags))
}


export const filterEntries = (entries: HydratedGestaltInstance[], filter: string) => {
    const pdFilter = filter.toLowerCase();

    let fNotes = entries
    if (filter !== '') {
        fNotes = entries.filter((currNote) => {
            if (!currNote.gestalt) { throw Error() }
            return currNote.gestalt.text.toLowerCase().indexOf(pdFilter) !== -1
        })
    }

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
    return _.sum(arr) / arr.length;
}



export const W_WIDTH = 11.55
export const LINE_HEIGHT = 23
export const LINE_WIDTH = 685
export const GESTALT_PADDING = 8

export function computeGestaltHeight(text: string): number {
    // let width = ctx.measureText(text).width

    // width,10,50)

    return Math.max(1, Math.ceil(text.length * W_WIDTH / LINE_WIDTH)) * LINE_HEIGHT + GESTALT_PADDING

    // return 0 //Math.max(1, Math.ceil(text.length * W_WIDTH / LINE_WIDTH)) * LINE_HEIGHT + GESTALT_PADDING
}



//   calcHeight = (text: string): number => {
//     // var c=document.getElementById("myCanvas");
//     // var ctx=c.getContext("2d");
//     // ctx.font="30px Arial";
//     // width = ctx.measureText(text))

//     // width,10,50)


//     return Math.max(1, Math.ceil(text.length * W_WIDTH / LINE_WIDTH)) * LINE_HEIGHT + GESTALT_PADDING
//   }





