import * as React from "react"
import * as ReactDOM from 'react-dom'

import { LazyArray } from "../LazyArray"
import * as _ from "lodash";


export interface InfiniteListState {

}

export interface InfiniteListProps extends React.Props<InfiniteList> {

  containerHeight: number

  //needs one of these two
  fixedElementHeight?: number
  multipleElementHeights?: number[] //todo

  elements: LazyArray<JSX.Element>
  ElementComponent?: any
}

// Required props: elements, ElementComponent, elementHeight, containerHeight
export class InfiniteList extends React.Component<InfiniteListProps, InfiniteListState> {
  batchSize: number
  scrollTop: number
  firstElementIndex: number
  lastElementIndex: number

  constructor(props: InfiniteListProps) {
    super(props)
    console.assert(!(typeof props.fixedElementHeight === "undefined" && typeof props.multipleElementHeights === "undefined"))

    this.batchSize = 5
    this.scrollTop = 0
    this._computeVisibleRange()
  }

  componentWillReceiveProps = (nextProps: InfiniteListProps) => {
    this._computeVisibleRange(nextProps)
  }

  private _computeVisibleRange = (props = this.props) => {
    let firstElementIndex
    let lastElementIndex
    if (props.multipleElementHeights) { //todo
      //todo? doesn't integrate batchsize?
      let heightSoFar = 0
      for (let i = 0; heightSoFar <= this.scrollTop; i++) {
        console.assert(i < props.multipleElementHeights.length)
        heightSoFar += props.multipleElementHeights[i]
        firstElementIndex = i
      }

      for (let i = firstElementIndex; heightSoFar <= this.scrollTop + props.containerHeight; i++) {
        console.assert(i < props.multipleElementHeights.length)
        heightSoFar += props.multipleElementHeights[i]
        lastElementIndex = i
      }
    }
    else {
      firstElementIndex = Math.max(Math.floor(Math.floor(
        this.scrollTop / props.fixedElementHeight
      ) / this.batchSize) * this.batchSize, 0)
      lastElementIndex = Math.min(Math.ceil(Math.ceil(
        (this.scrollTop + props.containerHeight) / props.fixedElementHeight
      ) / this.batchSize) * this.batchSize, props.elements.length - 1)
    }

    const shouldPrepend = this.firstElementIndex !== undefined &&
      firstElementIndex < this.firstElementIndex
    const shouldAppend = this.lastElementIndex !== undefined &&
      lastElementIndex > this.lastElementIndex

    this.firstElementIndex = firstElementIndex
    this.lastElementIndex = lastElementIndex
    return shouldPrepend || shouldAppend
  }

  private _createTopPadding = () => {
    let topPadding

    if (this.props.multipleElementHeights)
      topPadding = _.sum(this.props.multipleElementHeights.slice(0, this.firstElementIndex))
    else
      topPadding = this.firstElementIndex * this.props.fixedElementHeight

    return <div
      style={{ height: topPadding }}
      />
  }

  private _createBottomPadding = () => {
    let bottomPadding
    if (this.props.multipleElementHeights)
      bottomPadding = _.sum(this.props.multipleElementHeights.slice(this.lastElementIndex + 1))
    else
      bottomPadding = (this.props.elements.length - 1 - this.lastElementIndex) * this.props.fixedElementHeight

    return <div
      style={{ height: bottomPadding }}
      />
  }

  private _createVisibleElements = () => {
    const elements = []
    for (let i = this.firstElementIndex; i <= this.lastElementIndex; ++i) {
      elements.push(
        // React.createElement(
        //   this.props.ElementComponent,
        this.props.elements.get(i)
        // )
      )
    }
    return elements
  }

  private _handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollableNode = ReactDOM.findDOMNode(this.refs['scrollable'])
    this.scrollTop = scrollableNode.scrollTop

    const needToUpdate = this._computeVisibleRange()
    if (needToUpdate) {
      this.forceUpdate()
    }

    // this.props.onScroll && this.props.onScroll()
  }


  private _getContainerTopAndBottom = () => {
    const { containerHeight } = this.props

    const containerTop = this.scrollTop
    const containerBottom = this.scrollTop + containerHeight
    return { containerTop, containerBottom }
  }

  scrollToRevealElement = (elementIndex: number) => {
    const { multipleElementHeights, fixedElementHeight, containerHeight } = this.props

    const scrollTop = this.scrollTop
    const elementTop = multipleElementHeights ?
      _.sum(multipleElementHeights.slice(0, elementIndex))
      : elementIndex * fixedElementHeight
    const elementBottom = multipleElementHeights ? multipleElementHeights[elementIndex]
      : elementTop + fixedElementHeight

    let { containerTop, containerBottom } = this._getContainerTopAndBottom()
    if (containerTop > elementTop) {
      this.scrollTop = elementTop
    }
    ({ containerTop, containerBottom } = this._getContainerTopAndBottom())
    if (containerBottom < elementBottom) {
      this.scrollTop = elementBottom - containerHeight
    }

    const scrollableNode = ReactDOM.findDOMNode(this.refs['scrollable'])
    scrollableNode.scrollTop = this.scrollTop
    const needToUpdate = this._computeVisibleRange()
    if (needToUpdate) {
      this.forceUpdate()
    }
  }


  render() {
    const { elements, ElementComponent, fixedElementHeight, containerHeight } = this.props
    return <div
      ref='scrollable'
      style={{ height: containerHeight, overflowX: 'hidden', overflowY: 'auto' }}
      onScroll={this._handleScroll}
      >
      {this._createTopPadding()}
      {this._createVisibleElements()}
      {this._createBottomPadding()}
    </div>
  }
}

