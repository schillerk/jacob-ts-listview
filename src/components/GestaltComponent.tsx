import * as React from "react";
import * as _ from "lodash";
import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltCollection, GestaltInstance, createGestaltInstance } from '../domain';
import { GestaltListComponent } from './GestaltListComponent';
import * as Util from '../util';

export interface GestaltComponentState {
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
    gestaltKey: string
    gestalt: Gestalt
    onChange: (newText: string) => void

    updateGestalt: (id: string, newText: string) => void
    allGestalts: GestaltCollection
    expandedGestaltInstanceIds: { [id: string]: boolean }
    toggleExpandGestaltNub: (gestaltInstanceId: string) => void

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

        return (
            true
            // this.props.gestalt.text !== nextProps.gestalt.text
            // || !_.isEqual(Object.keys(this.expandedChildren), Object.keys(nextExpandedChildren))
        )
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

                        const nubKey: string = this.props.gestaltKey + "-" + id


                        if (nubKey in this.props.expandedGestaltInstanceIds) {
                            this.expandedChildren[id] = this.props.allGestalts[id]
                        }

                        return (
                            <li key={nubKey}
                                className='nub'
                                style={
                                    (nubKey in this.props.expandedGestaltInstanceIds) ?
                                        {
                                            background: "lightgray",
                                            borderColor: "darkblue",
                                        }
                                        :
                                        { background: "white" }
                                }
                                onClick={() => this.props.toggleExpandGestaltNub(nubKey)}
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
                    parentGestaltKey={this.props.gestaltKey}
                    gestalts={this.expandedChildren}
                    allGestalts={this.props.allGestalts}
                    updateGestalt={this.props.updateGestalt}
                    expandedGestaltInstanceIds={this.props.expandedGestaltInstanceIds}
                    toggleExpandGestaltNub={this.props.toggleExpandGestaltNub}
                    />

            </li>
        )
    }

}
