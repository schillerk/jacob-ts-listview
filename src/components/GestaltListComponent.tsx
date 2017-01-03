import * as React from "react";

import { GestaltComponent } from './GestaltComponent'

import { Gestalt, createGestaltInstance, HydratedGestaltHierarchicalViewItemContents } from '../domain';
import * as Util from '../util';

export interface GestaltListState {
    
}

export interface GestaltListProps extends React.Props<GestaltListComponent> {
    gestaltInstances: HydratedGestaltHierarchicalViewItemContents[]

    toggleExpand: (nubGestaltId: string, parentGestaltInstanceId: string) => void
    updateGestaltText: (id: string, newText: string) => void
}


export class GestaltListComponent extends React.Component<GestaltListProps, GestaltListState> {

    render() {
        return (
            <ul>
                {this.props.gestaltInstances.filter(instance => instance.expanded).map(instance => {
                    // const gestaltInstanceId: string = instance.id + "-" + id
                    return (
                        <GestaltComponent
                            key={instance.instanceId}
                            gestaltInstance={instance}
                            // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

                            updateGestaltText={this.props.updateGestaltText}
                            toggleExpand={this.props.toggleExpand}
                            />
                    )
                })}
            </ul>
        )
    }

}
