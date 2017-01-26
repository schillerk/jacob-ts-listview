import * as React from "react"
import * as ReactDOM from 'react-dom'

import { LazyArray } from "../LazyArray"
import * as _ from "lodash";


import { InfiniteList } from "./InfiniteList"
import * as Util from '../util';



export interface FilteredInfiniteListState<T> {
  filtering?: number
  filteredEntriesIdxs?: LazyArray<number> | undefined
}

export interface FilteredInfiniteListProps<T> extends React.Props<FilteredInfiniteList<T>> {

  containerHeight: number

  //needs one of these two
  fixedElementHeight?: number
  multipleElementHeights?: number[] //todo


  data: LazyArray<T>
  filter: string
  excludes?: T[]

  textFilterFn: (filter: string) => ((e: T) => boolean)
  elemGenerator: (model: T, i: number) => JSX.Element

}

// Required props: elements, ElementComponent, elementHeight, containerHeight
export class FilteredInfiniteList<T> extends React.Component<FilteredInfiniteListProps<T>, FilteredInfiniteListState<T>> {
  clearAsyncFilterTimeout: (() => void) | undefined

  constructor(props: FilteredInfiniteListProps<T>) {
    super(props)
    this.state = {
      filtering: 0
    }
    console.assert(!(typeof props.fixedElementHeight === "undefined" && typeof props.multipleElementHeights === "undefined"))
  }

  componentWillUnmount() {
    if (this.clearAsyncFilterTimeout) {
      this.clearAsyncFilterTimeout()
      this.clearAsyncFilterTimeout = undefined
    }
  }

  componentWillReceiveProps(nextProps: FilteredInfiniteListProps<T>) {

    //if filter changed
    if (nextProps.filter !== this.props.filter) {

      //if there is a running async filter, clear it
      if (this.clearAsyncFilterTimeout) {
        this.clearAsyncFilterTimeout()
        this.clearAsyncFilterTimeout = undefined
        this.setState((prevState: FilteredInfiniteListState<T>) => { return { filtering: prevState.filtering - 1 } })
      }

      //filter has some nonempty (new) val, start running it
      if (nextProps.filter) {
        let data: LazyArray<T> = this.props.data

        this.setState((prevState: FilteredInfiniteListState<T>) => { return { filtering: prevState.filtering + 1 } })


        type IndexedElem<T> = { val: T, idx: number }

        this.clearAsyncFilterTimeout = data
          .map((e: T, idx: number): IndexedElem<T> => {
            return { val: e, idx: idx }
          }).
          asyncFilter(
          (e: IndexedElem<T>) => this.props.textFilterFn(nextProps.filter)(e.val),
          (results: LazyArray<{ val: T, idx: number }>) => {
            this.clearAsyncFilterTimeout = undefined
            this.setState((prevState: FilteredInfiniteListState<T>) => {
              return {
                filtering: prevState.filtering - 1,
                filteredEntriesIdxs: results.map((r) => r.idx)
              }
            })

          }
          )

      }
      else { // filter cleared
        if (this.state.filteredEntriesIdxs) {
          this.setState({ filteredEntriesIdxs: undefined })
        }
      }

    }

  }


  render() {

    let filteredData: LazyArray<T | undefined> = this.props.data

    if (this.props.excludes)
      filteredData = filteredData.map((e: T) => {
        if (!this.props.excludes) { throw Error() }
        return _.includes(this.props.excludes, e) ? undefined : e
      })

    if (this.props.filter) {

      if (this.state.filteredEntriesIdxs) {
        filteredData = this.state.filteredEntriesIdxs
          .map((idx: number) => this.props.data.get(idx))
      }
      // data =
      // data = (data as LazyArray<T>).filter(this.textFilterFn)
      // data = LazyArray.fromArray(Util.filterEntries(
      //   (data as LazyArray<T>).toArray(),
      //   this.props.filter))
    }

    //childrenHeights = _.times(this.props.gestaltInstance.data.length, () => 36)
    // expandedChildGestaltInstances.map((instance, i): number => (
    //   this.calcHeight(instance.gestalt.text)
    // ))


    return <div>
      <div style={{ color: "gray" }}>{true || this.state.filtering > 0 ? "Filtering... " + this.state.filtering + " processes" : Util.SPECIAL_CHARS_JS.NBSP}</div>
      <InfiniteList
        containerHeight={this.props.containerHeight}
        fixedElementHeight={this.props.fixedElementHeight}
        // mthis.props.//}
        elements={filteredData.map(this.props.elemGenerator)}
        />
    </div>
  }
}

