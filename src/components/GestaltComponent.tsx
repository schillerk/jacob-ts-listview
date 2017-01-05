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

    handleArrows: (arrowDir: Util.KEY_CODES, fromIndex: number) => void

    updateGestaltText: (gestaltId: string, newText: string) => void
    toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance) => void
    addGestalt: (text: string, offset: number) => void

    isRoot?: boolean
}

// #TODO: order comes out randomly, needs to be an OrderedMap
export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
    nodeSpan: HTMLSpanElement
    renderedGestaltComponents: GestaltComponent[]

    handleArrows = (arrowDir: Util.KEY_CODES, fromIndex: number) => {
        let dir: number = 0

        switch (arrowDir) {
            case Util.KEY_CODES.DOWN:
                dir = 1
                break
            case Util.KEY_CODES.UP:
                dir = -1
                break
        }

        const newIndex = fromIndex + dir

        if (newIndex < 0 || newIndex >= this.renderedGestaltComponents.length) {
            return
        }

        this.renderedGestaltComponents[newIndex].focus()
    }

    focus = () => { this.nodeSpan && this.nodeSpan.focus() }

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
                this.props.addGestalt("", this.props.index + 1)
                //#todo
                break;

            case Util.KEY_CODES.DOWN:
            case Util.KEY_CODES.UP:

                e.preventDefault()
                this.props.handleArrows(e.keyCode, this.props.index)
                //#todo
                break;

        }

    }

    onInput = () => {
        this.props.updateGestaltText(this.props.gestaltInstance.gestaltId, this.nodeSpan.innerText)
    }

    render(): JSX.Element {
        const renderedGestaltInstances = this.props.gestaltInstance.hydratedChildren
            .filter(instance => instance.expanded)
        this.renderedGestaltComponents = Array(renderedGestaltInstances.length)

        return false && !this.props.gestaltInstance.expanded ? null : (
            <li>
                {/* gestalt body */}
                {this.props.isRoot ? null
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
                            {false && !this.props.gestaltInstance.hydratedChildren ? []
                                : this.props.gestaltInstance.hydratedChildren.map((nubGestaltInstance: HydratedGestaltInstance) => {
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
                {false && !this.props.gestaltInstance.hydratedChildren ? null
                    :
                    <ul>
                        {
                            renderedGestaltInstances.map((instance, i) => {
                                // const gestaltInstanceId: string = instance.id + "-" + id
                                return (
                                    <GestaltComponent
                                        key={instance.instanceId}
                                        index={i}
                                        gestaltInstance={instance}
                                        // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

                                        ref={(gc: GestaltComponent) => { this.renderedGestaltComponents[i] = gc } }

                                        updateGestaltText={this.props.updateGestaltText}
                                        toggleExpand={this.props.toggleExpand}
                                        addGestalt={this.props.addGestalt}
                                        handleArrows={this.handleArrows}

                                        />
                                )
                            })
                        }
                    </ul>

                }
            </li>
        )
    }

}
