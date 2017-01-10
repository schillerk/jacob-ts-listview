const LazyListFactory = (data: Array<any>, getter: (index: any) => any) => {
    this.data = data
    this.getter = getter

    const lazyList = new Proxy(this, {
      get(target: any, prop: any) {
        try {
          if (Number.isInteger(Number(prop)) && !(prop in target)) {
            return getter(Number(prop))
          }
        } catch (e) {}

        if (prop in target) {
          return target[prop]
        }

        return LazyListFactory(target.data[prop], getter)
      }
    })

  lazyList[Symbol.iterator] = function * (){
    let index = 0
    while(true) {
      yield lazyList.getter(index)
      index += 1
    }
  }

  return lazyList as Array<any>
}


export default LazyListFactory
