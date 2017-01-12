import * as React from "react";
import * as _ from "lodash";
import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltsMap, GestaltInstance, GestaltInstancesMap } from '../domain';

import * as Util from '../util';

declare module "react" {
  interface HTMLProps<T> {
    suppressContentEditableWarning?: boolean
  }
}

var Infinite: any = require("react-infinite");

export const W_WIDTH = 11.55
export const LINE_HEIGHT = 23
export const LINE_WIDTH = 685
export const GESTALT_PADDING = 8

export const estimateHeight = (text: string): number => {
  // var c=document.getElementById("myCanvas");
  // var ctx=c.getContext("2d");
  // ctx.font="30px Arial";
  // width = ctx.measureText(text))

  // width,10,50)

  return Math.max(1, Math.ceil(text.length * W_WIDTH / LINE_WIDTH)) * LINE_HEIGHT + GESTALT_PADDING
}

export interface GestaltComponentState {
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
  gestaltInstance: GestaltInstance

  index: number

  getOffsetChild: (prevSelfNext: number, fromIndex: number) => GestaltComponent
  focus: () => void

  addGestaltAsChild: (text: string, offset: number) => void
  // indentChild: (childIndex: number) => void

  updateGestaltText: (gestaltId: string, newText: string) => void
  toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance) => void
  addGestalt: (text: string, offset: number, parentInstanceId?: string, callback?: () => any) => void
  // commitIndentChild: (parentInstanceId: string, childIndex: number) => void
  onScrollChange?: (firstVisibleElemInd: number, lastVisibleElemInd: number)=> void

  isRoot?: boolean
  filter?: string

  gestaltInstancesMap: GestaltInstancesMap
  gestaltsMap: GestaltsMap
}

// #TODO: order comes out randomly, needs to be an OrderedMap
export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
  nodeSpan: HTMLSpanElement
  renderedGestaltComponents: GestaltComponent[]

  public shouldComponentUpdate(nextProps: GestaltComponentProps) {
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

  public render(): JSX.Element {
    console.assert(this.props.gestaltInstance.expanded && !!this.props.gestaltInstance.childInstanceIds)
    const currentGestalt = this.props.gestaltsMap[this.props.gestaltInstance.gestaltId]

    let childGestaltInstances = this.props.gestaltInstance.childInstanceIds
      .map((instanceId) => this.props.gestaltInstancesMap[instanceId])

    if (this.props.isRoot) {
      childGestaltInstances = Util.filterEntries(childGestaltInstances, this.props.gestaltsMap, this.props.filter || "")
    }

    const renderedChildGestaltInstances = childGestaltInstances.filter((instance) => instance.expanded)
    this.renderedGestaltComponents = Array(renderedChildGestaltInstances.length)

    // warn about tricky edge case
    _.mapValues(
      _.groupBy(
        childGestaltInstances,
        (instance) => instance.gestaltId
      ),
      (childInstances) => {
        if (childInstances.length > 1) {
          console.warn("multiple instances of same gestalt in children", this.props.gestaltInstance);
        }
      }
    )

    const gestaltIdsToNubInstances = _.keyBy(childGestaltInstances, (instance) => instance.gestaltId)

    const mainLiStyles = _.assign(
      { listStyleType: "none" },
      this.props.isRoot ? {} : {
        height: "34px",
        borderLeft: "2px solid lightgray",
        padding: "0px 4px",
        margin: "8px 0",
      })

    let myHeight: number
    let childrenHeights: number[]

    if (this.props.isRoot) {
      childrenHeights = renderedChildGestaltInstances.map(
        (instance, i): number => estimateHeight(currentGestalt.text))
      myHeight = window.innerHeight - 160
    } else {
      myHeight = estimateHeight(currentGestalt.text)
    }

    const finalRenderedChildrenComponents: JSX.Element[] = renderedChildGestaltInstances
      .map((instance, i): JSX.Element => {
        // const gestaltInstanceId: string = instance.id + "-" + id
        return (
          <GestaltComponent
            key={instance.instanceId}
            index={i}
            gestaltInstance={instance}
            // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

            ref={(gc: GestaltComponent) => { gc && (this.renderedGestaltComponents[i] = gc) } }

            updateGestaltText={this.props.updateGestaltText}
            toggleExpand={this.props.toggleExpand}
            addGestalt={this.props.addGestalt}
            // commitIndentChild={this.props.commitIndentChild}

            addGestaltAsChild={this.addGestaltAsChild}
            // indentChild={this.indentChild}

            getOffsetChild={this.getOffsetChild}
            focus={this.focus}

            gestaltInstancesMap={this.props.gestaltInstancesMap}
            gestaltsMap={this.props.gestaltsMap}
          />
        )
      })

    return (
      <li style={{ ...mainLiStyles, height: myHeight }}>
        {/* gestalt body */}
        {true && this.props.isRoot ? null
          :
          <div>
            {/* #NOTE: contentEditable is very expensive when working with a large number of nodes*/}

            <span style={{ padding: "2px 4px", height: "36px" }}
              contentEditable
              suppressContentEditableWarning
              ref={(nodeSpan: HTMLSpanElement) => this.nodeSpan = nodeSpan}
              onKeyDown={this.onKeyDown}
              onInput={this.onInput}
              onFocus={this.moveCaretToEnd}
              >
              {currentGestalt.text}
            </span>


            {/* related gestalts list */}
            <ul style={{ display: "inline" }}>
              {this.props.isRoot ? null : currentGestalt.relatedIds.map((relatedId: string) => {
                const nubGestaltInstance = gestaltIdsToNubInstances[relatedId];
                const MAX_NUB_LENGTH = 20
                let nubText = this.props.gestaltsMap[nubGestaltInstance.gestaltId].text
                if (nubText.length > MAX_NUB_LENGTH) {
                  nubText = `${nubText.slice(0, MAX_NUB_LENGTH)}...`
                }

                return (
                  <li key={nubGestaltInstance.gestaltId}
                    className="nub"
                    style={ (nubGestaltInstance.expanded) ?
                      {
                        background: "lightgray",
                        borderColor: "darkblue",
                      } : {
                        background: "white",
                      }
                    }
                    onClick={() => this.props.toggleExpand(nubGestaltInstance.gestaltId, this.props.gestaltInstance)}
                    >

                    { // assert nubId in this.props.allGestalts
                      // (nubGestaltInstance.gestaltId in this.props.allGestalts) ?
                      nubText || Util.SPECIAL_CHARS_JS.NBSP
                      // : (console.error('Invalid id', nubGestaltInstance, this.props.allGestalts) || "")
                    }
                  </li>
                )
              })}
            </ul>
          </div>
        }
        {/* render expanded children */}
        <ul style={{ paddingLeft: (this.props.isRoot ? 0 : 40) }}>
          {
            this.props.isRoot ?
              // finalRndComp.slice(100, 110)
              <Infinite
                onScrollChange={this.props.onScrollChange}
                containerHeight={myHeight - 20}
                elementHeight={childrenHeights}
              >
                {finalRenderedChildrenComponents}
              </Infinite> :
              finalRenderedChildrenComponents
          }

        </ul>
      </li>
    )
  }

  protected handleArrows = (arrowDir: Util.KEY_CODES) => {
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
      compToFocus.focus()
  }

  protected addGestaltAsChild = (text: string, offset: number = 0): void => {
    this.props.addGestalt(text, offset, this.props.gestaltInstance.instanceId,
      () => { this.renderedGestaltComponents[offset].focus() })
  }

  // indentChild = (childIndex: number) => {
  //     this.props.commitIndentChild(this.props.gestaltInstance.instanceId, childIndex)
  // }

  protected focus = () => {
    this.nodeSpan && this.nodeSpan.focus()
  }

  protected getLastChild = (): GestaltComponent => {
    if (this.renderedGestaltComponents.length > 0) {
      return this.renderedGestaltComponents[this.renderedGestaltComponents.length - 1].getLastChild()
    } else {
      return this
    }
  }

  protected getNext = (): GestaltComponent => {
    if (this.renderedGestaltComponents.length) {//return first child
      return this.renderedGestaltComponents[0]
    } else { //return next sibling or node after parent
      return this.props.getOffsetChild ? this.props.getOffsetChild(1, this.props.index) : undefined
    }
  }

  protected getPrev = (): GestaltComponent => {
    return this.props.getOffsetChild ? this.props.getOffsetChild(-1, this.props.index) : undefined
  }

  //returns prevSelfNext child relative to child at fromIndex
  //prevSelfNext = -1, 0, 1
  protected getOffsetChild = (prevSelfNext: number, fromIndex: number): GestaltComponent => {
    const newIndex = fromIndex + prevSelfNext

    if (prevSelfNext < 0) { //going up
      if (newIndex < 0) {//hit top of sublist. return parent
        return this.props.getOffsetChild ? this.props.getOffsetChild(0, this.props.index) : undefined
      }

      //return prev sibling's last child
      return this.renderedGestaltComponents[newIndex].getLastChild()
    }
    else { //going down or still
      if (newIndex >= this.renderedGestaltComponents.length) {//hit end of sublist. return node after parent
        return this.props.getOffsetChild ? this.props.getOffsetChild(1, this.props.index) : undefined
      }

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

  protected moveCaretToEnd = (e: React.FocusEvent<HTMLSpanElement>) => {
    Util.moveCaretToEnd(e.currentTarget)
  }

  protected onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    switch (e.keyCode) {
      case Util.KEY_CODES.ENTER:
        e.preventDefault()
        e.stopPropagation()
        this.props.addGestaltAsChild("", this.props.index + 1)
        // #todo
        break;
      case Util.KEY_CODES.TAB:
        e.preventDefault()
        e.stopPropagation()

        // this.props.indentChild(this.props.index)
        break
      case Util.KEY_CODES.DOWN:
      case Util.KEY_CODES.UP:
        e.preventDefault()
        e.stopPropagation()
        this.handleArrows(e.keyCode)
        // #todo
        break;
      default:
        break
    }
  }

  protected onInput = () => {
    this.props.updateGestaltText(this.props.gestaltInstance.gestaltId, this.nodeSpan.innerText)
  }
}
