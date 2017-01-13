import * as React from "react"
import * as ReactDOM from 'react-dom'

export interface InfiniteListState {

}

export interface InfiniteListProps extends React.Props<InfiniteList> {
  containerHeight: number
  elementHeight: number
  elements: any
  ElementComponent: any
  onScroll?: () => void
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
    this.computeVisibleRange()
  }

  componentWillReceiveProps = (nextProps: InfiniteListProps) => {
    this.computeVisibleRange(nextProps)
  }

  computeVisibleRange = (props = this.props) => {
    const firstElementIndex = Math.max(Math.floor(Math.floor(
      this.scrollTop / props.elementHeight
    ) / this.batchSize) * this.batchSize, 0)
    const lastElementIndex = Math.min(Math.ceil(Math.ceil(
      (this.scrollTop + props.containerHeight) / props.elementHeight
    ) / this.batchSize) * this.batchSize, props.elements.length - 1)

    const shouldPrepend = this.firstElementIndex !== undefined &&
      firstElementIndex < this.firstElementIndex
    const shouldAppend = this.lastElementIndex !== undefined &&
      lastElementIndex > this.lastElementIndex

    this.firstElementIndex = firstElementIndex
    this.lastElementIndex = lastElementIndex
    return shouldPrepend || shouldAppend
  }

  createTopPadding = () => {
    const topPadding = this.firstElementIndex * this.props.elementHeight
    return <div
      style={{ height: topPadding }}
      />
  }

  createBottomPadding = () => {
    const bottomPadding = (this.props.elements.length - 1 - this.lastElementIndex) * this.props.elementHeight
    return <div
      style={{ height: bottomPadding }}
      />
  }

  createVisibleElements = () => {
    const elements = []
    for (let i = this.firstElementIndex; i <= this.lastElementIndex; ++i) {
      elements.push(
        // React.createElement(
        //   this.props.ElementComponent,
          this.props.elements[i]
        // )
      )
    }
    return elements
  }

  handleScroll = (e: any) => {
    const scrollableNode = ReactDOM.findDOMNode(this.refs['scrollable'])
    this.scrollTop = scrollableNode.scrollTop

    const needToUpdate = this.computeVisibleRange()
    if (needToUpdate) {
      this.forceUpdate()
    }

    this.props.onScroll && this.props.onScroll()
  }

  render() {
    const { elements, ElementComponent, elementHeight, containerHeight } = this.props
    return <div
      ref='scrollable'
      style={{ height: containerHeight, overflowX: 'hidden', overflowY: 'auto' }}
      onScroll={this.handleScroll}
      >
      {this.createTopPadding()}
      {this.createVisibleElements()}
      {this.createBottomPadding()}
    </div>
  }

  getContainerTopAndBottom = () => {
    const { containerHeight } = this.props

    const containerTop = this.scrollTop
    const containerBottom = this.scrollTop + containerHeight
    return { containerTop, containerBottom }
  }

  scrollToRevealElement = (elementIndex: number) => {
    const { elementHeight, containerHeight } = this.props

    const scrollTop = this.scrollTop
    const elementTop = elementIndex * elementHeight
    const elementBottom = elementTop + elementHeight

    let { containerTop, containerBottom } = this.getContainerTopAndBottom()
    if (containerTop > elementTop) {
      this.scrollTop = elementTop
    }
    ({ containerTop, containerBottom } = this.getContainerTopAndBottom())
    if (containerBottom < elementBottom) {
      this.scrollTop = elementBottom - containerHeight
    }

    const scrollableNode = ReactDOM.findDOMNode(this.refs['scrollable'])
    scrollableNode.scrollTop = this.scrollTop
    const needToUpdate = this.computeVisibleRange()
    if (needToUpdate) {
      this.forceUpdate()
    }
  }

}

