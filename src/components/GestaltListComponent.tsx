import * as React from "react";

import { GestaltComponent } from './GestaltComponent'

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltListState {

}

export interface GestaltListProps extends React.Props<GestaltListComponent> {
    parentGestaltInstanceId: string

    gestalts: { [id: string]: Gestalt }
    updateGestaltText: (id: string, newText: string) => void

    allGestalts: { [id: string]: Gestalt }
    expandedGestaltInstances?: {
        [gestaltInstanceId: string]: GestaltInstance
    }
    toggleExpandGestaltNub: (nubGestaltInstanceId: string, nubGestaltId: string, parentGestaltInstanceId: string) => void
    setInstanceShouldUpdate: (instanceId : string, shouldUpdate : boolean) => void

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
                    const gestaltInstanceId: string = this.props.parentGestaltInstanceId + "-" + id
                    return (
                        <GestaltComponent
                            key={gestaltInstanceId}
                            gestaltInstanceKey={gestaltInstanceId}
                            gestalt={this.props.gestalts[id]}
                            onChange={(newText: string) => this.props.updateGestaltText(id, newText)}

                            updateGestaltText={this.props.updateGestaltText}
                            allGestalts={this.props.allGestalts}
                            toggleExpandGestaltNub={this.props.toggleExpandGestaltNub}
                            expandedGestaltInstances={this.props.expandedGestaltInstances}
                            setInstanceShouldUpdate={this.props.setInstanceShouldUpdate}
                            />
                    )
                })}
            </ul>
        )
    }

}
