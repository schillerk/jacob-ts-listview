import * as _ from "lodash";


export class LazyArray<T>  {
    genElem: (i: number) => T
    length: number
    timeout: number

    constructor(length: number, genElem: (i: number) => T) {
        this.length = length
        this.genElem = genElem
    }


    public static fromArray = <T>(fromArray: T[]): LazyArray<T> => {
        return new LazyArray<T>(fromArray.length, (i: number) => fromArray[i])
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

    filter = (fn: (elem: T, i: number, array: LazyArray<T>) => boolean): LazyArray<T> => {

        let outRay = Array<T>()

        for (let i = 0; i < this.length; i++) {
            if (fn(this.get(i), i, this))
                outRay.push(this.get(i))
        }

        return LazyArray.fromArray(outRay)
    }


    filterRangeReturnsArray = (fn: (elem: T, i: number, array: LazyArray<T>) => boolean, start: number, end: number): T[] => {

        let outRay = Array<T>()

        for (let i = start; i < Math.min(this.length, end); i++) {
            if (fn(this.get(i), i, this))
                outRay.push(this.get(i))
        }

        return outRay
    }

    clearAsyncFilterTimeout = (): void => {
        clearTimeout(this.timeout) //might work? doesn't updated count properly I don't think
    }

    asyncFilter = (
        fn: (elem: T, i: number, array: LazyArray<T>) => boolean,
        callback: (results: LazyArray<T>) => any
    ): (() => void) => {

        this._asyncFilterHelper(
            [], 0, fn, callback)

        return this.clearAsyncFilterTimeout
    }

    private _asyncFilterHelper = (
        resultsSoFar: T[],
        i: number,
        fn: (elem: T, i: number, array: LazyArray<T>) => boolean,
        callback: (allResults:  LazyArray<T>) => any,
    ): void => {
        const CHUNK_SIZE = 1000

        let newResults = this.filterRangeReturnsArray(fn, i, i + CHUNK_SIZE)
        resultsSoFar.push(...newResults)

        if (i < this.length) {
            this.timeout = window.setTimeout(

                () => this._asyncFilterHelper(
                    resultsSoFar,
                    i + CHUNK_SIZE, fn, callback)
                , 0)
        }
        else {
            callback(LazyArray.fromArray(resultsSoFar))
        }
    }

}