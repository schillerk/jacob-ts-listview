
var count = 0;

export function getGUID(){
    count++;
    return "UNIQUE_ID_" + count.toString();
}

export function objectToArray<T>(object: {[id: string]: T}){
    var arr : T[] = [];
    for(var key in object){
        arr.push(object[key]);
    }
    return arr;
}
