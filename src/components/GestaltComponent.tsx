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

export interface GestaltComponentState {
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
    gestaltInstance: HydratedGestaltInstance

    index: number

    getOffsetChild: (prevSelfNext: number, fromIndex: number) => GestaltComponent
    focus: () => void

    addGestaltAsChild: (text: string, offset: number) => void
    indentChild: (childIndex: number) => void

    updateGestaltText: (gestaltId: string, newText: string) => void
    toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance) => void
    addGestalt: (text: string, offset: number, parentInstanceId?: string, callback?: () => any) => void
    commitIndentChild: (parentInstanceId: string, childIndex: number) => void

    isRoot?: boolean
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
            compToFocus.focus()
    }

    addGestaltAsChild = (text: string, offset: number = 0): void => {
        this.props.addGestalt(text, offset, this.props.gestaltInstance.instanceId,
            () => { this.renderedGestaltComponents[offset].focus() })
    }

    indentChild = (childIndex: number) => {
        debugger
        this.props.commitIndentChild(this.props.gestaltInstance.instanceId, childIndex)
    }

    focus = () => {
        this.nodeSpan && this.nodeSpan.focus()
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
        return !(_.isEqual(nextProps.gestaltInstance, this.props.gestaltInstance))

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
                // debugger
                e.preventDefault()
                e.stopPropagation()

                this.props.indentChild(this.props.index)
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

    render(): JSX.Element {
        console.assert(this.props.gestaltInstance.expanded && !!this.props.gestaltInstance.hydratedChildren)

        const renderedChildGestaltInstances = this.props.gestaltInstance.hydratedChildren
            .filter(instance => instance.expanded)
        this.renderedGestaltComponents = Array(renderedChildGestaltInstances.length)

        // warn about tricky edge case
        _.mapValues(
            _.groupBy(
                this.props.gestaltInstance.hydratedChildren,
                (hydratedChild) => hydratedChild.gestaltId
            ),
            (hydratedChildren) => {
                if (hydratedChildren.length > 1) {
                    console.warn('multiple instances of same gestalt in children', this.props.gestaltInstance);
                }
            }
        );

        const gestaltIdsToNubInstances = _.keyBy(
            this.props.gestaltInstance.hydratedChildren,
            (hydratedChild) => hydratedChild.gestaltId
        );

        return (
            <li>
                {/* gestalt body */}
                {false && this.props.isRoot ? null
                    :
                    <div>
                        {/* #NOTE: contentEditable is very expensive when working with a large number of nodes*/}

                        <span
                            contentEditable
                            suppressContentEditableWarning
                            ref={(nodeSpan: HTMLSpanElement) => this.nodeSpan = nodeSpan}
                            onKeyDown={this.onKeyDown}
                            onInput={this.onInput}
                            onFocus={this.moveCaretToEnd}
                            >
                            {this.props.gestaltInstance.gestalt.text}
                        </span>


                        {/* related gestalts list */}
                        <ul style={{ display: 'inline' }}>
                            {this.props.isRoot ? null : this.props.gestaltInstance.gestalt.relatedIds.map((relatedId: string) => {
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
                    </div>
                }
                {/* render expanded children */}

                <ul>
                    {
                        renderedChildGestaltInstances.map((instance, i) => {
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
                                    commitIndentChild={this.props.commitIndentChild}

                                    addGestaltAsChild={this.addGestaltAsChild}
                                    indentChild={this.indentChild}

                                    getOffsetChild={this.getOffsetChild}
                                    focus={this.focus}

                                    />
                            )
                        })
                    }
                </ul>
            </li>
        )
    }

}
