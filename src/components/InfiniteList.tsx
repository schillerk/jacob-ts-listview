import * as React from "react"
import * as ReactDOM from 'react-dom'

import { LazyArray } from "../LazyArray"


export interface InfiniteListState {

}

export interface InfiniteListProps extends React.Props<InfiniteList> {
  
  containerHeight: number
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
    this.batchSize = 5
    this.scrollTop = 0
    this._computeVisibleRange()
  }

  componentWillReceiveProps = (nextProps: InfiniteListProps) => {
    this._computeVisibleRange(nextProps)
  }

  private _computeVisibleRange = (props = this.props) => {
    const firstElementIndex = Math.max(Math.floor(Math.floor(
      this.scrollTop / props.fixedElementHeight
    ) / this.batchSize) * this.batchSize, 0)
    const lastElementIndex = Math.min(Math.ceil(Math.ceil(
      (this.scrollTop + props.containerHeight) / props.fixedElementHeight
    ) / this.batchSize) * this.batchSize, props.elements.length - 1)

    const shouldPrepend = this.firstElementIndex !== undefined &&
      firstElementIndex < this.firstElementIndex
    const shouldAppend = this.lastElementIndex !== undefined &&
      lastElementIndex > this.lastElementIndex

    this.firstElementIndex = firstElementIndex
    this.lastElementIndex = lastElementIndex
    return shouldPrepend || shouldAppend
  }

  private _createTopPadding = () => {
    const topPadding = this.firstElementIndex * this.props.fixedElementHeight
    return <div
      style={{ height: topPadding }}
      />
  }

  private _createBottomPadding = () => {
    const bottomPadding = (this.props.elements.length - 1 - this.lastElementIndex) * this.props.fixedElementHeight
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
    const { fixedElementHeight, containerHeight } = this.props

    const scrollTop = this.scrollTop
    const elementTop = elementIndex * fixedElementHeight
    const elementBottom = elementTop + fixedElementHeight

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

