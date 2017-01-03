import * as React from "react";
import * as _ from "lodash";
import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltCollection, GestaltInstance, createGestaltInstance, HydratedGestaltInstance } from '../domain';
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
    updateGestaltText: (gestaltId: string, newText: string) => void
    allGestalts: GestaltCollection
    gestaltInstance: HydratedGestaltInstance
    toggleExpand: (nubGestaltId: string, parentGestaltInstanceId: string) => void
}

// #TODO: order comes out randomly, needs to be an OrderedMap
export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {

    nodeSpan: HTMLSpanElement
    // expandedChildren: { [id: string]: Gestalt } = {}

    shouldComponentUpdate(nextProps: GestaltComponentProps) {

        // if (this.props.gestaltInstance.gestalt.relatedIds.length > 0) {
        //     console.log(this.props.gestaltInstance.gestalt.text, nextProps.gestaltInstance.gestalt.text, "\n",
        //         this.props.gestaltInstance, nextProps.gestaltInstance);
        // }

        // return true;
        return !(_.isEqual(nextProps.gestaltInstance, this.props.gestaltInstance))


        // return !(_.isEqual(this.props.gestaltInstance, nextProps.gestaltInstance))

        // slower by 8fps!
        //   return !(JSON.stringify(this.props.gestaltInstance) === JSON.stringify(nextProps.gestaltInstance) )
    }

    render(): JSX.Element {


        {/*  onBlur={() => { console.log("blur"); this.setState({ editable: false })  }}
                            ref={(e) => e && e.focus()} */}

        // this.expandedChildren = {}

        const myGestalt: Gestalt = this.props.allGestalts[this.props.gestaltInstance.gestaltId];

        return (
            <li>
                {/* gestalt body */}
                {/*
                {
                    this.state.editable ? (
                        <textarea
                            defaultValue={this.props.gestalt.text}
                            onKeyDown={
                                (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
                                    if (e.keyCode === 13) {
                                        e.preventDefault() // prevents onChange
                                        this.setState({ editable: false })
                                    }
                                    e.stopPropagation()
                                }
                            }
                            onBlur={() => {
                                this.setState({ editable: false })
                            } }
                            ref={(e: HTMLTextAreaElement) => e.focus()}
                            />
                        //not ok to use ref as componentDidMount? #hack 



                    ) : (
                            <span onClick={() => { console.log("click"); this.setState({ editable: true }) } }>{this.props.gestalt.text}</span>
                        )
                }
                */ }

                {/* #NOTE: contentEditable is very expensive when working with a large number of nodes*/}
                <span
                    contentEditable
                    suppressContentEditableWarning
                    ref={(nodeSpan: HTMLSpanElement) => this.nodeSpan = nodeSpan}
                    onKeyDown={(e) => {
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

                    } }
                    onInput={() => {
                        this.props.updateGestaltText(this.props.gestaltInstance.gestaltId, this.nodeSpan.innerText)
                    } }
                    >
                    {myGestalt.text}
                </span>

                {/* related gestalts list */}
                <ul style={{ display: 'inline' }}>
                    {this.props.gestaltInstance.hydratedChildren.map((nubGestaltInstance: HydratedGestaltInstance) => {
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
                                onClick={() => this.props.toggleExpand(nubGestaltInstance.gestaltId, this.props.gestaltInstance.instanceId)}
                                >

                                { //assert nubId in this.props.allGestalts
                                    (nubGestaltInstance.gestaltId in this.props.allGestalts) ?
                                        nubText || Util.SPECIAL_CHARS_JS.NBSP
                                        : (console.error('Invalid id', nubGestaltInstance, this.props.allGestalts) || "")
                                }
                            </li>
                        )
                    })}
                </ul>
                <GestaltListComponent
                    gestaltInstances={this.props.gestaltInstance.children.map(gi => {
                        return Util.hydrateGestaltInstance(gi, this.props.allGestalts)
                    })
                    }
                    allGestalts={this.props.allGestalts}
                    updateGestaltText={this.props.updateGestaltText}
                    toggleExpand={this.props.toggleExpand}
                    />
            </li>
        )
    }

}
