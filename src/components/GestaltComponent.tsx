import * as React from "react";
import * as _ from "lodash";
import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltCollection, createGestaltInstance, GestaltHierarchicalViewItemContents, HydratedGestaltHierarchicalViewItemContents } from '../domain';
import { GestaltListComponent } from './GestaltListComponent';
import * as Util from '../util';

declare module "react" {
    interface HTMLProps<T> {
        suppressContentEditableWarning?: boolean
    }
}

export interface GestaltComponentState {
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
    gestaltInstance: HydratedGestaltHierarchicalViewItemContents

    expanded: boolean
    updateGestaltText: (gestaltId: string, newText: string) => void
    toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltHierarchicalViewItemContents) => void
}

// #TODO: order comes out randomly, needs to be an OrderedMap
export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
    nodeSpan: HTMLSpanElement

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
                                //this.props.addGestalt("e.currentTarget.value")
                                //#todo
                                break;
                            case Util.KEY_CODES.DOWN:
                                e.preventDefault()
                                //#todo
                                break;
                            case Util.KEY_CODES.UP:
                                e.preventDefault()
                                //#todo
                                break;
                        }

                    } 
    
    onInput = () => {
        this.props.updateGestaltText(this.props.gestaltInstance.gestaltId, this.nodeSpan.innerText)
    } 

    render(): JSX.Element {
        return (
            <li>
                {/* gestalt body */}

                {/* #NOTE: contentEditable is very expensive when working with a large number of nodes*/}
                <span
                    contentEditable
                    suppressContentEditableWarning
                    ref={(nodeSpan: HTMLSpanElement) => this.nodeSpan = nodeSpan}
                    onKeyDown={this.onKeyDown}
                    onInput={this.onInput}
                >
                    {this.props.gestaltInstance.gestalt.text}
                </span>

                {/* related gestalts list */}
                <ul style={{ display: 'inline' }}>
                    {this.props.gestaltInstance.hydratedChildren.map((nubGestaltInstance: HydratedGestaltHierarchicalViewItemContents) => {
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
                <GestaltListComponent
                    gestaltInstances={this.props.gestaltInstance.hydratedChildren}
                    updateGestaltText={this.props.updateGestaltText}
                    toggleExpand={this.props.toggleExpand}
                    />
            </li>
        )
    }

}
