import * as React from "react";
import * as _ from "lodash";
import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltCollection, GestaltInstance, createGestaltInstance } from '../domain';
import { GestaltListComponent } from './GestaltListComponent';
import * as Util from '../util';

export interface GestaltComponentState {
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
    gestaltInstanceKey: string
    gestalt: Gestalt
    onChange: (newText: string) => void

    updateGestaltText: (id: string, newText: string) => void
    allGestalts: GestaltCollection
    expandedGestaltInstances?: {
        [gestaltInstanceId: string]: GestaltInstance
    }
    toggleExpandGestaltNub: (nubGestaltInstanceId: string, nubGestaltId: string, parentGestaltInstanceId: string) => void
    setInstanceShouldUpdate: (instanceId: string, shouldUpdate: boolean) => void

}

// #TODO: order comes out randomly, needs to be an OrderedMap
export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
    nodeSpan: HTMLSpanElement
    expandedChildren: { [id: string]: Gestalt } = {}

    constructor(props: GestaltComponentProps) {
        super(props)
    }

    shouldComponentUpdate(nextProps: GestaltComponentProps) {
        // const nextExpandedChildren: { [id: string]: Gestalt } = {}

        // this.props.gestalt.relatedIds.forEach(id => {
        //     const nubKey: string = this.props.gestaltKey + "-" + id

        //     if (nubKey in this.props.expandedGestaltInstanceIds) {
        //         nextExpandedChildren[id] = this.props.allGestalts[id]
        //     }
        // })

        // console.log(nextExpandedChildren, this.expandedChildren,!_.isEqual(Object.keys(this.expandedChildren), Object.keys(nextExpandedChildren)))


        let shouldUpdate = true
        let gestaltInstance = this.props.expandedGestaltInstances[this.props.gestaltInstanceKey]
        //console.error(this.props.gestaltInstanceKey,this.props.expandedGestaltInstanceIds)

        if (gestaltInstance) {
            shouldUpdate = gestaltInstance.shouldUpdate

            // if (this.props.gestalt.text !== nextProps.gestalt.text)
            //     gestaltInstance.shouldUpdate = true
            // else
                // gestaltInstance.shouldUpdate = false
                this.props.setInstanceShouldUpdate(this.props.gestaltInstanceKey, false)
        }
        else {
            console.error("mounting", this.props.gestaltInstanceKey, this.props.expandedGestaltInstances)
        }

        return shouldUpdate


        // let gestaltInstance = this.props.expandedGestaltInstances[this.props.gestaltInstanceKey]
        // //console.error(this.props.gestaltInstanceKey,this.props.expandedGestaltInstanceIds)

        // if (gestaltInstance) {
        //     const textChanged : boolean = this.props.gestalt.text !== nextProps.gestalt.text
        //     const retVal = gestaltInstance.shouldUpdate
        //     gestaltInstance.shouldUpdate = textChanged
        //     // this.props.setInstanceShouldUpdate(this.props.gestaltInstanceKey, textChanged)
        //     return retVal
        // }
        // else {
        //     console.error("mounting", this.props.gestaltInstanceKey, this.props.expandedGestaltInstances)
        //     return true
        // }

        // return (
        // shouldUpdate
        // true
        // || !_.isEqual(Object.keys(this.expandedChildren), Object.keys(nextExpandedChildren))
        // )
        //     ||
        //     Object.keys(nextProps.gestalt.relatedIds).length > 0 && //#hack for tiny lag on first clicks, weirdly fixes it even on those with keys
        //     JSON.stringify(this.props.gestalt.relatedIds) === JSON.stringify(nextProps.gestalt.relatedIds)
        // )
    }

    // expandedGestaltInstanceIdsToGestaltCollection = (expandedGestaltInstanceIds: { [id: string]: boolean }): GestaltCollection => {

    //     return expandedGestaltInstanceIds
    // }

    render(): JSX.Element {


        {/*  onBlur={() => { console.log("blur"); this.setState({ editable: false })  }}
                            ref={(e) => e && e.focus()} */}

        this.expandedChildren = {}


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
                        this.props.onChange(this.nodeSpan.innerText)
                    } }
                    dangerouslySetInnerHTML={{ __html: this.props.gestalt.text }}
                    />

                {/* related gestalts list */}
                <ul style={{ display: 'inline' }}>
                    {this.props.gestalt.relatedIds.map(id => {
                        const MAX_NUB_LENGTH = 20
                        let nubText = this.props.allGestalts[id].text
                        if (nubText.length > MAX_NUB_LENGTH) {
                            nubText = nubText.slice(0, MAX_NUB_LENGTH)
                            nubText += "..."
                        }

                        const nubKey: string = this.props.gestaltInstanceKey + "-" + id


                        if (nubKey in this.props.expandedGestaltInstances) {
                            this.expandedChildren[id] = this.props.allGestalts[id]
                        }

                        return (
                            <li key={nubKey}
                                className='nub'
                                style={
                                    (nubKey in this.props.expandedGestaltInstances) ?
                                        {
                                            background: "lightgray",
                                            borderColor: "darkblue",
                                        }
                                        :
                                        { background: "white" }
                                }
                                onClick={() => this.props.toggleExpandGestaltNub(nubKey, id, this.props.gestaltInstanceKey)}
                                >

                                {
                                    (id in this.props.allGestalts) ?
                                        nubText || Util.SPECIAL_CHARS_JS.NBSP
                                        : (console.error('Invalid id', id, this.props.allGestalts) || "")
                                }
                            </li>
                        )
                    })}
                </ul>


                <GestaltListComponent
                    parentGestaltInstanceId={this.props.gestaltInstanceKey}
                    gestalts={this.expandedChildren}
                    allGestalts={this.props.allGestalts}
                    updateGestaltText={this.props.updateGestaltText}
                    expandedGestaltInstances={this.props.expandedGestaltInstances}
                    toggleExpandGestaltNub={this.props.toggleExpandGestaltNub}
                    setInstanceShouldUpdate={this.props.setInstanceShouldUpdate}
                    />

            </li>
        )
    }

}
