import * as _ from "lodash";


export class LazyArray<T>  {
    genElem: (i: number) => T
    length: number

    constructor(length: number, genElem: (i: number) => T) {
        this.length = length
        this.genElem = genElem
    }

    slice = (start: number = 0, end: number = this.length) => {

        if (start < 0 || start >= this.length)
            throw new Error("Lazy Array Index Out of Bounds")
        if (end < 0 || end >= this.length)
            throw new Error("Lazy Array Index Out of Bounds")


        let outRay = _.times((end - start), i => this.genElem(start + i))
        return outRay
    }

    get = (i: number) => {
        if (i < 0 || i >= this.length)
            throw new Error("Lazy Array Index Out of Bounds")

        return this.genElem(i)
    }

    map = <O>(fn: (elem: T, i: number) => O): LazyArray<O> => {
        return new LazyArray<O>(this.length,
            (i) => fn(this.get(i), i)
        )
    }
    
    toArray = (): T[] => {
        let out = new Array(this.length)
        for (let i = 0; i < this.length; i++) {
            out[i] = this.get(i)
        }
        return out
    }

}