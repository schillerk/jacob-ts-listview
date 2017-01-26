import * as React from "react";
import * as _ from "lodash";
// import { Autocomplete } from "./autocomplete"
import { AddRelatedForm } from "./autocomplete-jacob"
import { Gestalt, GestaltsMap, GestaltInstance, HydratedGestaltInstance } from '../domain';

import * as Util from '../util';

declare module "react" {
  interface HTMLProps<T> {
    suppressContentEditableWarning?: boolean
  }
}

import { LazyArray } from "../LazyArray"


import { InfiniteList } from "./InfiniteList"
import { FilteredInfiniteList } from "./FilteredInfiniteList"

// var Infinite: any = require("react-infinite");
// var InfiniteList: any = require("../src/components/InfiniteList");


export interface GestaltComponentState {

}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
  gestaltInstance: HydratedGestaltInstance

  index: number

  getOffsetChild: ((prevSelfNext: number, fromIndex: number) => GestaltComponent | undefined) | undefined

  addGestaltAsChild: (text: string, offset: number) => void
  // indentChild: (childIndex: number) => void

  updateGestaltText: (gestaltId: string, newText: string) => void
  toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance) => void
  addGestalt: (text: string, parentInstanceId?: string, offset?: number, shouldFocus?: boolean) => void
  // commitIndentChild: (parentInstanceId: string, childIndex: number) => void

  //for AddRelatedForm
  filterOptions: LazyArray<Gestalt>
  createAndRelate: (srcGestaltId: string, text: string, expandAndFocusInstanceId?: string) => void
  addRelation: (srcGestaltId: string, tgtGestaltId: string, expandAndFocusInstanceId?: string) => void


  isRoot?: boolean
  filter?: string
  rootChildrenHeights?: number[]

  gestaltComponentOnBlur: (instanceId: string) => void
}

// #TODO: order comes out randomly, needs to be an OrderedMap
export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
  nodeSpan: HTMLSpanElement
  renderedGestaltComponents: GestaltComponent[]

  constructor(props: GestaltComponentProps) {
    super(props)
    this.state = { filteredEntriesIdxs: undefined, filtering: 0 }
  }


  handleArrows = (arrowDir: Util.KEY_CODES) => {
    let compToFocus: GestaltComponent | undefined = undefined
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
    this.props.addGestalt(text, this.props.gestaltInstance.instanceId, offset, true)
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

  private _onTextInputBlur = (e: React.FocusEvent<HTMLElement>) => {
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

  getNext = (): GestaltComponent | undefined => {
    if (this.renderedGestaltComponents.length) //return first child
      return this.renderedGestaltComponents[0]
    else //return next sibling or node after parent
      return this.props.getOffsetChild ? this.props.getOffsetChild(1, this.props.index) : undefined
  }

  getPrev = (): GestaltComponent | undefined => {
    return this.props.getOffsetChild ? this.props.getOffsetChild(-1, this.props.index) : undefined
  }

  //returns prevSelfNext child relative to child at fromIndex
  //prevSelfNext = -1, 0, 1
  getOffsetChild = (prevSelfNext: number, fromIndex: number): GestaltComponent | undefined => {
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

  shouldComponentUpdate(nextProps: GestaltComponentProps, nextState: GestaltComponentState) {

    // if (this.props.gestaltInstance.gestalt.relatedIds.length > 0) {
    //     console.log(this.props.gestaltInstance.gestalt.text, nextProps.gestaltInstance.gestalt.text, "\n",
    //         this.props.gestaltInstance, nextProps.gestaltInstance);
    // }

    // return true;
    return !(
      _.isEqual(nextProps.gestaltInstance, this.props.gestaltInstance)
      && _.isEqual(nextProps.filter, this.props.filter)
      && _.isEqual(nextState, this.state)
      && nextProps.filterOptions === this.props.filterOptions //#todo check if this works
    )


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
    if (!this.props.gestaltInstance.gestaltId) { throw Error() }
    this.props.updateGestaltText(this.props.gestaltInstance.gestaltId, this.nodeSpan.innerText)
  }


  private renderNubs = () => {


  }

  private _genGestaltComponentFromInstance = (instance: HydratedGestaltInstance, i: number): JSX.Element => {
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
        filter={this.props.filter}

        //for AddRelatedForm
        filterOptions={this.props.filterOptions}
        createAndRelate={this.props.createAndRelate}
        addRelation={this.props.addRelation}

        />
    )
  }


  render(): JSX.Element {
    if (!this.props.gestaltInstance.hydratedChildren) {
      throw Error('Node with null hydratedChildren should never be rendered')
    }


    let filteredHydratedChildren: LazyArray<HydratedGestaltInstance> | ReadonlyArray<HydratedGestaltInstance>
      = this.props.gestaltInstance.hydratedChildren

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


    let gestaltBody: JSX.Element | null
    let expandedChildrenListComponent: JSX.Element //infinite list

    let expandedChildGestaltInstances: LazyArray<HydratedGestaltInstance> | HydratedGestaltInstance[]

    let myHeight: number | string = "auto"
    let childrenHeights: number[] | undefined = undefined


    if (this.props.isRoot) { //Is Root. hydratedChildren as LazyArray<HydratedGestaltInstance>

      const hydratedChildrenLazy: LazyArray<HydratedGestaltInstance> =
        this.props.gestaltInstance.hydratedChildren as LazyArray<HydratedGestaltInstance>

      //childrenHeights = _.times(this.props.gestaltInstance.hydratedChildren.length, () => 36)
      // expandedChildGestaltInstances.map((instance, i): number => (
      //   this.calcHeight(instance.gestalt.text)
      // ))
      myHeight = window.innerHeight - 160

      gestaltBody = null


      // finalRndComp.slice(100, 110)
      //onScrollChange={this.props.onScrollChange}
      // elementHeight={childrenHeights}

      // expandedChildrenListComponent = <div>
      //   {expandedChildGestaltInstances.map(this.genGestaltComponentFromInstance).toArray()}
      // </div>

      const HydratedGestaltInstanceFilteredInfiniteList: (new () => FilteredInfiniteList<HydratedGestaltInstance>) = FilteredInfiniteList as any
      expandedChildrenListComponent = <HydratedGestaltInstanceFilteredInfiniteList
        containerHeight={myHeight - 20}
        fixedElementHeight={36}

        data={hydratedChildrenLazy}
        filter={this.props.filter || ""}

        textFilterFn={(filter: string) => (
          (e: HydratedGestaltInstance) => {
            if (!e.gestalt) { throw Error() }
            return (e.gestalt.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
          }
        )
        }

        elemGenerator={this._genGestaltComponentFromInstance}
        />

      // expandedChildrenListComponent = <InfiniteList
      //   containerHeight={myHeight - 20}
      //   fixedElementHeight={36}
      //   // multipleElementHeights={this.props.rootChildrenHeights}
      //   elements={expandedChildGestaltInstances.map(this._genGestaltComponentFromInstance)}
      //   />
      // ElementComponent={GestaltComponent} />

      // gestaltBody = <div style={{ color: "gray" }}>{true || this.state.filtering > 0 ? "Filtering... " + this.state.filtering + " processes" : Util.SPECIAL_CHARS_JS.NBSP}</div>
    }
    else { //Not root. hydratedChildren as HydratedGestaltInstance[]
      if (!this.props.gestaltInstance.gestalt) { throw Error("implies root instance") }

      _.assign(mainLiStyles,
        { height: "34px", borderLeft: "2px solid lightgray", padding: "0px 4px", margin: "8px 0" })

      if (this.props.rootChildrenHeights) {
        console.assert(typeof this.props.gestaltInstance.gestalt.gestaltHeight !== "undefined")
        myHeight = this.props.gestaltInstance.gestalt.gestaltHeight || 36 // #HACK
        // Util.calcHeight(this.props.gestaltInstance.gestalt.text)
        // myHeight = this.calcHeight(this.props.gestaltInstance.gestalt.text)
      }
      myHeight = "auto"

      //only some are expanded when deeper than root
      expandedChildGestaltInstances = (filteredHydratedChildren as ReadonlyArray<HydratedGestaltInstance>)
        .filter(instance => instance.expanded)
      // this.renderedGestaltComponents = Array(expandedChildGestaltInstances.length)
      expandedChildrenListComponent = <div>
        {expandedChildGestaltInstances.map(this._genGestaltComponentFromInstance)}
      </div>

      console.assert(this.props.gestaltInstance.hydratedChildren instanceof Array)

      const gestaltIdsToNubInstances: { [id: string]: HydratedGestaltInstance } = _.keyBy(
        this.props.gestaltInstance.hydratedChildren as HydratedGestaltInstance[],
        (hydratedChild: HydratedGestaltInstance) => hydratedChild.gestaltId
      );

      let highlightedText: string = this.props.gestaltInstance.gestalt.text
      // if(this.props.filter)
      //   highlightedText=highlightedText.replace(new RegExp(this.props.filter, 'g'), "<b>" + this.props.filter + "</b>")

      if (!this.props.gestaltInstance.gestalt.relatedIds) {
        throw Error()
      }

      //gestalt body parts
      const gestaltTextSpan: JSX.Element = <span style={{ padding: "2px 4px", height: "36px" }}
        contentEditable
        suppressContentEditableWarning
        ref={(nodeSpan: HTMLSpanElement) => {
          this.nodeSpan = nodeSpan
        } }
        onKeyDown={this.onKeyDown}
        onInput={this.onInput}
        onFocus={this.moveCaretToEnd}
        onBlur={(e: React.FocusEvent<HTMLElement>) => this._onTextInputBlur(e)}
        // dangerouslySetInnerHTML={{ __html: highlightedText }}
        >
        {highlightedText}
      </span >

      const relatedGestaltNubs: JSX.Element = <ul style={{ display: 'inline' }}>
        {
          this.props.gestaltInstance.gestalt.relatedGestalts.map((nubGestalt: Gestalt) => {
            const MAX_NUB_LENGTH = 20

            let nubText = nubGestalt.text
            if (nubText.length > MAX_NUB_LENGTH) {
              nubText = nubText.slice(0, MAX_NUB_LENGTH)
              nubText += "..."
            }

            const nubInstance: GestaltInstance | undefined = gestaltIdsToNubInstances[nubGestalt.gestaltId]

            return (
              <li key={nubGestalt.gestaltId}
                className='nub'
                style={
                  (nubInstance && nubInstance.expanded) ?
                    {
                      background: "lightgray",
                      borderColor: "darkblue",
                    }
                    :
                    { background: "white" }
                }
                onClick={() => {
                  if (!nubGestalt.gestaltId) { throw Error() }
                  this.props.toggleExpand(nubGestalt.gestaltId, this.props.gestaltInstance)
                } }
                >

                { //assert nubId in this.props.allGestalts
                  // (nubGestalt.gestaltId in this.props.allGestalts) ?
                  nubText || Util.SPECIAL_CHARS_JS.NBSP
                  // : (console.error('Invalid id', nubGestalt, this.props.allGestalts) || "")
                }
              </li>
            )
          })}
      </ul>

      gestaltBody = <div>
        {/* #NOTE: contentEditable is very expensive when working with a large number of nodes*/}
        {gestaltTextSpan}
        <AddRelatedForm
          filterOptions={this.props.filterOptions}
          createAndRelate={(text: string) => {
            if (!this.props.gestaltInstance.gestaltId) { throw Error() }
            return this.props.createAndRelate(this.props.gestaltInstance.gestaltId, text)
          } }
          relateToCurrentIdea={(targetId: string) => {
            if (!this.props.gestaltInstance.gestaltId) { throw Error() }
            return this.props.addRelation(this.props.gestaltInstance.gestaltId, targetId)
          } }
          />
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
