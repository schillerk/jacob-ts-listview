import * as React from "react";
import * as _ from "lodash";
import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltsMap, GestaltInstance, HydratedGestaltInstance } from '../domain';

import * as Util from '../util';

declare module "react" {
  interface HTMLProps<T> {
    suppressContentEditableWarning?: boolean
  }
}

import { LazyArray } from "../LazyArray"


import { InfiniteList } from "./InfiniteList"

// var Infinite: any = require("react-infinite");
// var InfiniteList: any = require("../src/components/InfiniteList");

export const W_WIDTH = 11.55
export const LINE_HEIGHT = 23
export const LINE_WIDTH = 685
export const GESTALT_PADDING = 8

export interface GestaltComponentState {
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
  gestaltInstance: HydratedGestaltInstance

  index: number

  getOffsetChild: (prevSelfNext: number, fromIndex: number) => GestaltComponent

  addGestaltAsChild: (text: string, offset: number) => void
  // indentChild: (childIndex: number) => void

  updateGestaltText: (gestaltId: string, newText: string) => void
  toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance) => void
  addGestalt: (text: string, offset: number, parentInstanceId?: string, shouldFocus?: boolean) => void
  // commitIndentChild: (parentInstanceId: string, childIndex: number) => void

  isRoot?: boolean
  filter?: string

  gestaltComponentOnBlur: (instanceId: string) => void
}

// #TODO: order comes out randomly, needs to be an OrderedMap
export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
  nodeSpan: HTMLSpanElement
  renderedGestaltComponents: GestaltComponent[]

  handleArrows = (arrowDir: Util.KEY_CODES) => {
    let compToFocus: GestaltComponent = undefined
    switch (arrowDir) {
      case Util.KEY_CODES.UP:
        compToFocus = this.getPrev()
        break
      case Util.KEY_CODES.DOWN:
        compToFocus = this.getNext()
        break

    }

    if (compToFocus)
      compToFocus._syncTextInputFocus()
  }

  addGestaltAsChild = (text: string, offset: number = 0): void => {
    this.props.addGestalt(text, offset, this.props.gestaltInstance.instanceId, true)
  }

  // indentChild = (childIndex: number) => {
  //     this.props.commitIndentChild(this.props.gestaltInstance.instanceId, childIndex)
  // }

  private _syncTextInputFocus = () => {
    if (this.props.gestaltInstance.shouldFocus) {
      if (document.activeElement !== this.nodeSpan)
        this.nodeSpan && this.nodeSpan.focus()
    }
  }

  private _onTextInputBlur = (e: React.FocusEvent<any>) => {
    e.stopPropagation()
    this.props.gestaltComponentOnBlur(this.props.gestaltInstance.instanceId)
  }
  componentDidUpdate() {
    this._syncTextInputFocus()
  }
  componentDidMount() {
    this._syncTextInputFocus()
  }

  getLastChild = (): GestaltComponent => {
    if (this.renderedGestaltComponents.length > 0)
      return this.renderedGestaltComponents[this.renderedGestaltComponents.length - 1].getLastChild()
    else
      return this
  }

  getNext = (): GestaltComponent => {
    if (this.renderedGestaltComponents.length) //return first child
      return this.renderedGestaltComponents[0]
    else //return next sibling or node after parent
      return this.props.getOffsetChild ? this.props.getOffsetChild(1, this.props.index) : undefined
  }

  getPrev = (): GestaltComponent => {
    return this.props.getOffsetChild ? this.props.getOffsetChild(-1, this.props.index) : undefined
  }

  //returns prevSelfNext child relative to child at fromIndex
  //prevSelfNext = -1, 0, 1
  getOffsetChild = (prevSelfNext: number, fromIndex: number): GestaltComponent => {
    const newIndex = fromIndex + prevSelfNext

    if (prevSelfNext < 0) { //going up
      if (newIndex < 0) //hit top of sublist. return parent
        return this.props.getOffsetChild ? this.props.getOffsetChild(0, this.props.index) : undefined

      //return prev sibling's last child
      return this.renderedGestaltComponents[newIndex].getLastChild()
    }
    else { //going down or still
      if (newIndex >= this.renderedGestaltComponents.length) //hit end of sublist. return node after parent
        return this.props.getOffsetChild ? this.props.getOffsetChild(1, this.props.index) : undefined

      //return next sibling or self
      return this.renderedGestaltComponents[newIndex]
    }
  }

  // getPrevChild = (fromIndex: number): GestaltComponent => {

  //     const newIndex = fromIndex - 1

  //     // if (newIndex < 0)
  //         // return this.props.(this.props.index)

  //     return this.renderedGestaltComponents[newIndex]
  // }


  // else if( this.renderedGestaltComponents.length)
  //     this.renderedGestaltComponents[newIndex].focus()


  // //focus child
  // if(this.renderedGestaltComponents.length)
  //     this.renderedGestaltComponents[0]
  // else //focus next sibling
  //     this.props.getNextChild(fromIndex)


  // const newIndex = fromIndex + 1

  // if (newIndex >= this.renderedGestaltComponents.length) {
  //     this.props.handleArrows(Util.KEY_CODES.DOWN, this.props.index)

  // else if( this.renderedGestaltComponents.length)
  //     this.renderedGestaltComponents[newIndex].focus()

  // if (this.renderedGestaltComponents.length)
  //     this.renderedGestaltComponents[this.renderedGestaltComponents.length - 1].focusLast()
  // else
  //     this.focus()

  moveCaretToEnd = (e: React.FocusEvent<HTMLSpanElement>) => {
    Util.moveCaretToEnd(e.currentTarget)
  }

  shouldComponentUpdate(nextProps: GestaltComponentProps) {

    // if (this.props.gestaltInstance.gestalt.relatedIds.length > 0) {
    //     console.log(this.props.gestaltInstance.gestalt.text, nextProps.gestaltInstance.gestalt.text, "\n",
    //         this.props.gestaltInstance, nextProps.gestaltInstance);
    // }

    // return true;
    return !(_.isEqual(nextProps.gestaltInstance, this.props.gestaltInstance)
      && _.isEqual(nextProps.filter, this.props.filter))

    // slower by 8fps!
    //   return !(JSON.stringify(this.props.gestaltInstance) === JSON.stringify(nextProps.gestaltInstance) )
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    switch (e.keyCode) {
      case Util.KEY_CODES.ENTER:
        e.preventDefault()
        e.stopPropagation()

        this.props.addGestaltAsChild("", this.props.index + 1)
        //#todo
        break;
      case Util.KEY_CODES.TAB:
        e.preventDefault()
        e.stopPropagation()

        // this.props.indentChild(this.props.index)
        break;

      case Util.KEY_CODES.DOWN:
      case Util.KEY_CODES.UP:

        e.preventDefault()
        e.stopPropagation()

        this.handleArrows(e.keyCode)
        //#todo
        break;

    }

  }

  onInput = () => {
    this.props.updateGestaltText(this.props.gestaltInstance.gestaltId, this.nodeSpan.innerText)
  }

  calcHeight = (text: string): number => {
    // var c=document.getElementById("myCanvas");
    // var ctx=c.getContext("2d");
    // ctx.font="30px Arial";
    // width = ctx.measureText(text))

    // width,10,50)


    return Math.max(1, Math.ceil(text.length * W_WIDTH / LINE_WIDTH)) * LINE_HEIGHT + GESTALT_PADDING
  }

  private renderNubs = () => {


  }

  private genGestaltComponentFromInstance = (instance: HydratedGestaltInstance, i: number): JSX.Element => {
    // const gestaltInstanceId: string = instance.id + "-" + id
    return (
      <GestaltComponent
        key={instance.instanceId}
        index={i}
        gestaltInstance={instance}
        // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

        // ref={(gc: GestaltComponent) => { gc && (this.renderedGestaltComponents[i] = gc) } }

        updateGestaltText={this.props.updateGestaltText}
        toggleExpand={this.props.toggleExpand}
        addGestalt={this.props.addGestalt}
        // commitIndentChild={this.props.commitIndentChild}

        addGestaltAsChild={this.addGestaltAsChild}
        // indentChild={this.indentChild}

        getOffsetChild={this.getOffsetChild}
        gestaltComponentOnBlur={this.props.gestaltComponentOnBlur}
        />
    )
  }

  render(): JSX.Element {
    console.assert(this.props.gestaltInstance.expanded && !!this.props.gestaltInstance.hydratedChildren)

    let hydratedChildren: LazyArray<HydratedGestaltInstance> | HydratedGestaltInstance[]
      = this.props.gestaltInstance.hydratedChildren

    // if (this.props.isRoot)
    //   hydratedChildren = Util.filterEntries(hydratedChildren, this.props.filter || "")

    // warn about tricky edge case
    // _.mapValues(
    //   _.groupBy(
    //     this.props.gestaltInstance.hydratedChildren,
    //     (hydratedChild) => hydratedChild.gestaltId
    //   ),
    //   (hydratedChildren) => {
    //     if (hydratedChildren.length > 1) {
    //       console.warn('multiple instances of same gestalt in children', this.props.gestaltInstance);
    //     }
    //   }
    // );

    const mainLiStyles = { listStyleType: "none" }


    let gestaltBody: JSX.Element
    let expandedChildrenListComponent: JSX.Element

    let expandedChildGestaltInstances: LazyArray<HydratedGestaltInstance> | HydratedGestaltInstance[]

    let myHeight: number = undefined
    let childrenHeights: number[] = undefined


    if (this.props.isRoot) { //Is Root. hydratedChildren as LazyArray<HydratedGestaltInstance>

      //childrenHeights = _.times(this.props.gestaltInstance.hydratedChildren.length, () => 36)
      // expandedChildGestaltInstances.map((instance, i): number => (
      //   this.calcHeight(instance.gestalt.text)
      // ))
      myHeight = window.innerHeight - 160

      gestaltBody = null

      //all are expanded at root
      expandedChildGestaltInstances = (hydratedChildren as LazyArray<HydratedGestaltInstance>)

      // finalRndComp.slice(100, 110)
      //onScrollChange={this.props.onScrollChange}
      // elementHeight={childrenHeights}

      // expandedChildrenListComponent = <div>
      //   {expandedChildGestaltInstances.map(this.genGestaltComponentFromInstance).toArray()}
      // </div>
      expandedChildrenListComponent = <InfiniteList
        containerHeight={myHeight - 20}
        elementHeight={36}
        elements={expandedChildGestaltInstances.map(this.genGestaltComponentFromInstance)}
        />
      // ElementComponent={GestaltComponent} />

    }
    else { //Not root. hydratedChildren as HydratedGestaltInstance[]
      _.assign(mainLiStyles,
        { height: "34px", borderLeft: "2px solid lightgray", padding: "0px 4px", margin: "8px 0" })

      myHeight = this.calcHeight(this.props.gestaltInstance.gestalt.text)

      //only some are expanded when deeper than root
      expandedChildGestaltInstances = (hydratedChildren as HydratedGestaltInstance[])
        .filter(instance => instance.expanded)
      // this.renderedGestaltComponents = Array(expandedChildGestaltInstances.length)
      expandedChildrenListComponent = <div>
        {expandedChildGestaltInstances.map(this.genGestaltComponentFromInstance)}
      </div>

      const gestaltIdsToNubInstances = _.keyBy(
        this.props.gestaltInstance.hydratedChildren as HydratedGestaltInstance[],
        (hydratedChild) => hydratedChild.gestaltId
      );


      //gestalt body parts
      const gestaltTextSpan = <span style={{ padding: "2px 4px", height: "36px" }}
        contentEditable
        suppressContentEditableWarning
        ref={(nodeSpan: HTMLSpanElement) => {
          this.nodeSpan = nodeSpan
        } }
        onKeyDown={this.onKeyDown}
        onInput={this.onInput}
        onFocus={this.moveCaretToEnd}
        onBlur={ (e:React.FocusEvent<any>) => this._onTextInputBlur(e)}
        >
        {this.props.gestaltInstance.gestalt.text}
      </span>

      const relatedGestaltNubs = <ul style={{ display: 'inline' }}>
        {this.props.isRoot ? null
          : this.props.gestaltInstance.gestalt.relatedIds.map((relatedId: string) => {
            const nubGestaltInstance = gestaltIdsToNubInstances[relatedId];
            const MAX_NUB_LENGTH = 20
            let nubText = nubGestaltInstance.gestalt.text
            if (nubText.length > MAX_NUB_LENGTH) {
              nubText = nubText.slice(0, MAX_NUB_LENGTH)
              nubText += "..."
            }

            return (
              <li key={nubGestaltInstance.gestaltId}
                className='nub'
                style={
                  (nubGestaltInstance.expanded) ?
                    {
                      background: "lightgray",
                      borderColor: "darkblue",
                    }
                    :
                    { background: "white" }
                }
                onClick={() => this.props.toggleExpand(nubGestaltInstance.gestaltId, this.props.gestaltInstance)}
                >

                { //assert nubId in this.props.allGestalts
                  // (nubGestaltInstance.gestaltId in this.props.allGestalts) ?
                  nubText || Util.SPECIAL_CHARS_JS.NBSP
                  // : (console.error('Invalid id', nubGestaltInstance, this.props.allGestalts) || "")
                }
              </li>
            )
          })}
      </ul>

      gestaltBody = <div>
        {/* #NOTE: contentEditable is very expensive when working with a large number of nodes*/}
        {gestaltTextSpan}

        {/* related gestalts nubs list */}
        {relatedGestaltNubs}
      </div>

    }





    return (
      <li style={{ ...mainLiStyles, height: myHeight }}>
        {gestaltBody}

        {/* render expanded children */}
        <ul style={{ paddingLeft: (this.props.isRoot ? 0 : 40) }}>
          {expandedChildrenListComponent}
        </ul>
      </li>
    )
  }

}
