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
  elemGenerator: (model: T | undefined, i: number) => JSX.Element | null

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

    // if (!_.isEqual(nextProps, this.props)) {
    // this._runFilter(nextProps)
    // }

    // //if filter changed
    if (nextProps.filter !== this.props.filter || nextProps.data !== this.props.data) {
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

    //filter has some nonempty val, start running it
    if (props.filter) {
      let data: LazyArray<T | undefined> = props.data

      this.setState((prevState: FilteredInfiniteListState<T>) => { return { filtering: prevState.filtering + 1 } })


      type IndexedElem<T> = { val: T, idx: number }

      this.clearAsyncFilterTimeout = data
        .map((e: T, idx: number): IndexedElem<T> => {
          return { val: e, idx: idx }
        })
        .asyncFilter(
        (e: IndexedElem<T>) => props.textFilterFn(props.filter)(e.val),
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

    const origData: LazyArray<T | undefined> = this.props.data
    // if(this.state.filteredEntriesIdxs)
    //           console.log(this.state.filteredEntriesIdxs.toArray())


    let filteredDataWithIdx: LazyArray<{ val: T | undefined, idx: number }> | undefined = undefined

    if (this.props.filter) {

      if (this.state.filteredEntriesIdxs) {
        filteredDataWithIdx = this.state.filteredEntriesIdxs
          .map((idx: number) => {
            return {
              val: this.props.data.get(idx),
              idx: idx
            }
          })

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

    const entriesShown = this.props.data.length - this.props.data.numLazyExcluded

    const entriesToRenderGen = filteredDataWithIdx ?
      filteredDataWithIdx.map(eWithIdx => this.props.elemGenerator(eWithIdx.val, eWithIdx.idx))
      :
      origData.map(this.props.elemGenerator)

    return (
      <div>
        <div style={{ color: "gray" }}>
          {
            "Showing "
            + (this.state.filteredEntriesIdxs ? this.state.filteredEntriesIdxs.length + "/" : "")
            + entriesShown + " entries. "
            // + this.props.data.numLazyExcluded
            + (this.state.filtering > 0 ? "Filtering... " + this.state.filtering + " processes"
              : Util.SPECIAL_CHARS_JS.NBSP)
          }
        </div>

        {
          this.props.hideResultsWhileFiltering && this.state.filtering > 0
            ? "Results filtering..." //#todo animation here
            : (entriesToRenderGen.length < 100 //2 * this.props.containerHeight / this.props.fixedElementHeight
              ? <div style={{ maxHeight: this.props.containerHeight, overflow: "auto" }}>
                {entriesToRenderGen.toArray()}</div>
              : <InfiniteList
                containerHeight={this.props.containerHeight}
                fixedElementHeight={this.props.fixedElementHeight}
                // mthis.props.//}
                elements={entriesToRenderGen}
              />)
        }
      </div>
    )
  }
}

