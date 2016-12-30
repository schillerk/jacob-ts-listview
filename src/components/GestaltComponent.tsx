import * as React from "react";

import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltComponentState {
    editable: boolean
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
    gestalt: Gestalt
    onChange: (newText: string) => void
}


export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {
    nodeSpan: HTMLSpanElement

    constructor(props: GestaltComponentProps) {
        super(props)
        this.state = { editable: false }
    }

    componentDidMount() {
        this.nodeSpan && this.nodeSpan.focus()
    }

    shouldComponentUpdate(nextProps: GestaltComponentProps) {
        return true
        //return this.props.gestalt !== nextProps.gestalt
    }

    render() {
        {/*  onBlur={() => { console.log("blur"); this.setState({ editable: false })  }}
                            ref={(e) => e && e.focus()} */}
        return (
            <li >
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

                    ref={(nodeSpan: HTMLSpanElement) => this.nodeSpan = nodeSpan}
                    onChange={() => this.props.onChange(this.nodeSpan.innerText)}
                    dangerouslySetInnerHTML={{ __html: this.props.gestalt.text }}
                    onClick={(e) => {
                        console.log("click")
                        e.currentTarget.setAttribute('contentEditable', "true")
                        e.currentTarget.focus()
                    }
                    }
                    />

                {/* related gestalts list */}
                <ul style={{ display: 'inline' }}>
                    {this.props.gestalt.relatedIds.map(id => {
                        return (
                            <li key={id} style={{ display: 'inline-block', border: '1px solid gray', margin: '4px', padding: '2px' }}>
                                {id}
                            </li>
                        )
                    })}
                </ul>
            </li>
        )
    }

}
