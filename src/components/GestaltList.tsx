import * as React from "react";

import { GestaltComponent } from './GestaltComponent'

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltListState {

}

export interface GestaltListProps extends React.Props<GestaltList> {
    gestalts: { [id: string]: Gestalt }
    updateGestalt?: (id: string, newText: string) => void
}


export class GestaltList extends React.Component<GestaltListProps, GestaltListState> {
    ulNode: HTMLUListElement

    constructor(props: GestaltListProps) {
        super(props)
    }

    render() {
        const listHeight = Object.keys(this.props.gestalts).length
        return (
            <ul height={`${listHeight}px`} ref={(ulNode: HTMLUListElement) => this.ulNode = ulNode}>
                {Object.keys(this.props.gestalts).reverse().map(id => {
                    return (
                        <GestaltComponent
                            key={id}
                            gestalt={this.props.gestalts[id]}
                            onChange={(newText: string) => this.props.updateGestalt(id, newText)}
                        />
                    )
                })}
            </ul>
        )
    }

}
