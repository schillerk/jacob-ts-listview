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


  data: LazyArray<T | undefined>
  filter: string

  textFilterFn: (filter: string) => ((e: T | undefined) => boolean)
  elemGenerator: (model: T, i: number) => JSX.Element | null

  hideResultsWhileFiltering?: boolean
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

  componentWillMount() {
    this._runFilter(this.props)
  }

  componentWillReceiveProps(nextProps: FilteredInfiniteListProps<T>) {

    //if filter changed
    if (nextProps.filter !== this.props.filter) {
      this._runFilter(nextProps)
    }
  }

  private _runFilter(props: FilteredInfiniteListProps<T>) {

    //if there is a running async filter, clear it
    if (this.clearAsyncFilterTimeout) {
      this.clearAsyncFilterTimeout()
      this.clearAsyncFilterTimeout = undefined
      this.setState((prevState: FilteredInfiniteListState<T>) => { return { filtering: prevState.filtering - 1 } })
    }

    //filter has some nonempty (new) val, start running it
    if (props.filter) {
      let data: LazyArray<T | undefined> = this.props.data

      this.setState((prevState: FilteredInfiniteListState<T>) => { return { filtering: prevState.filtering + 1 } })


      type IndexedElem<T> = { val: T, idx: number }

      this.clearAsyncFilterTimeout = data
        .map((e: T, idx: number): IndexedElem<T> => {
          return { val: e, idx: idx }
        })
        .asyncFilter(
        (e: IndexedElem<T>) => this.props.textFilterFn(props.filter)(e.val),
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

  render() {

    let filteredData: LazyArray<T | undefined> = this.props.data


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

    return (
      <div>
        <div style={{ color: "gray" }}>
          {
            "Showing "
            + (this.state.filteredEntriesIdxs ? this.state.filteredEntriesIdxs.length + "/" : "")
            + this.props.data.length + " entries minus excludes. "
            + (this.state.filtering > 0 ? "Filtering... " + this.state.filtering + " processes"
              : Util.SPECIAL_CHARS_JS.NBSP)
          }
        </div>

        {
          this.props.hideResultsWhileFiltering && this.state.filtering > 0
            ? "Results filtering..." //#todo animation here
            : <InfiniteList
              containerHeight={this.props.containerHeight}
              fixedElementHeight={this.props.fixedElementHeight}
              // mthis.props.//}
              elements={filteredData.map(this.props.elemGenerator)}
            />
        }
      </div>
    )
  }
}

