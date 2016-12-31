import * as React from "react";

import { GestaltComponent } from './GestaltComponent'

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltListState {

}

export interface GestaltListProps extends React.Props<GestaltListComponent> {
    parentGestaltKey: string

    gestalts: { [id: string]: Gestalt }
    updateGestalt: (id: string, newText: string) => void

    allGestalts: { [id: string]: Gestalt }
    expandedGestaltInstanceIds: { [id: string]: boolean }
    toggleExpandGestaltNub: (gestaltInstanceId: string) => void

}


export class GestaltListComponent extends React.Component<GestaltListProps, GestaltListState> {


    constructor(props: GestaltListProps) {
        super(props);
    }


    // shouldComponentUpdate(nextProps: GestaltListProps) {
    //     return true
    // }

    render() {
        return (
            <ul>
                {Object.keys(this.props.gestalts).reverse().map(id => {
                    const gestaltKey: string = this.props.parentGestaltKey + "-" + id

                    return (
                        <GestaltComponent
                            key={gestaltKey}
                            gestaltKey={gestaltKey}
                            gestalt={this.props.gestalts[id]}
                            onChange={(newText: string) => this.props.updateGestalt(id, newText)}

                            updateGestalt={this.props.updateGestalt}
                            allGestalts={this.props.allGestalts}
                            toggleExpandGestaltNub={this.props.toggleExpandGestaltNub}
                            expandedGestaltInstanceIds={this.props.expandedGestaltInstanceIds}
                            />
                    )
                })}
            </ul>
        )
    }

}
