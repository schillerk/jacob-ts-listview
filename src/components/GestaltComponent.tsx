import * as React from "react";

import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltComponentState {
    editable:boolean
}

export interface GestaltComponentProps extends React.Props<GestaltComponent> {
    gestalt: Gestalt
}


export class GestaltComponent extends React.Component<GestaltComponentProps, GestaltComponentState> {


    constructor(props: GestaltComponentProps) {
        super(props)
        this.state={editable:false}
    }

    shouldComponentUpdate(nextProps: GestaltComponentProps) {
        return this.props.gestalt !== nextProps.gestalt
    }

    render() {
        return (
            <li>
                {this.props.gestalt.text}
                <ul style={{display: 'inline'}}>
                    {this.props.gestalt.relatedIds.map(id => {
                        return (
                            <li key={id} style={{display: 'inline-block', border: '1px solid gray', margin: '4px', padding: '2px'}}>
                                <span onChange={()=> this.setState({editable:true}) } contentEditable>{id}</span>
                            </li>
                        )
                    })}
                </ul>
            </li>
        )
    }

}
