import * as React from "react";

import { GestaltComponent } from './GestaltComponent'

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltListState {

}

export interface GestaltListProps extends React.Props<GestaltList> {
    gestalts: { [id: string]: Gestalt }
}


export class GestaltList extends React.Component<GestaltListProps, GestaltListState> {


    constructor(props: GestaltListProps) {
        super(props);
    }

    render() {
        return (
            <ul>
                {Object.keys(this.props.gestalts).map(id => {
                    return <GestaltComponent
                        key={id}
                        gestalt={this.props.gestalts[id]}
                        />
                })}
            </ul>
        )
    }

}
