import * as React from "react";

import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, Gestalts, GestaltInstance, createGestaltInstance } from '../domain';
import { GestaltList } from './GestaltList';
import * as Util from '../util';

export interface GestaltComponentState {
    expandedChildren: Gestalts // order comes out randomly, needs to be an OrderedMap #TODO
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
    gestalt: Gestalt
    onChange: (newText: string) => void

    updateGestalt?: (id: string, newText: string) => void
    allGestalts?: Gestalts

}


export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
    nodeSpan: HTMLSpanElement

    constructor(props: GestaltComponentProps) {
        super(props)
        this.state = { expandedChildren: {} }
    }

    shouldComponentUpdate(nextProps: GestaltComponentProps) {
        return (
            this.props.gestalt.text !== nextProps.gestalt.text
            ||
            Object.keys(nextProps.gestalt.relatedIds).length > 0 && //#hack for tiny lag on first clicks, weirdly fixes it even on those with keys
            JSON.stringify(this.props.gestalt.relatedIds) === JSON.stringify(nextProps.gestalt.relatedIds)
        )
    }

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

                        return (
                            <li key={this.props.key+"-"+id}
                                style={{ display: 'inline-block', color: (id in this.state.expandedChildren) ? "gray" : "blue", cursor: "pointer", border: '1px solid lightGray', margin: '4px', padding: '2px' }}
                                onClick={() => {
                                    const expandedChildren = this.state.expandedChildren
                                    if (id in expandedChildren) {
                                        delete expandedChildren[id];
                                    } else {
                                        expandedChildren[id] = this.props.allGestalts[id]
                                    }
                                    this.setState({ expandedChildren: expandedChildren })
                                }
                                }
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

                <GestaltList
                    gestalts={this.state.expandedChildren}
                    allGestalts={this.props.allGestalts}
                    updateGestalt={this.props.updateGestalt}
                    />
            </li>
        )
    }

}
