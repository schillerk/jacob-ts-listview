import * as React from "react";

import { GestaltComponent } from './GestaltComponent'

import * as _ from "lodash";


import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltListState {

}

export interface GestaltListProps extends React.Props<GestaltListComponent> {
    parentGestaltInstanceKey: string

    gestalts: { [gestaltId: string]: Gestalt } 

    updateGestalt: (id: string, newText: string) => void

    allGestalts: { [id: string]: Gestalt }
    whichNubsAreExpanded: { [instanceId: string]: { [id: string]: boolean } }
    
    toggleExpandGestaltNub: (gestaltInstanceIdToToggle: string, parentGestaltInstanceId: string) => void



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
                {_.values(this.props.gestalts).reverse().map(g => {
                    const gestaltInstanceKey: string = this.props.parentGestaltInstanceKey + "-" + g.gestaltId

                    return (
                        <GestaltComponent
                            key={gestaltInstanceKey}
                            gestaltInstanceKey={gestaltInstanceKey}
                            gestalt={g}
                            onChange={(newText: string) => this.props.updateGestalt(g.gestaltId, newText)}

                            updateGestalt={this.props.updateGestalt}
                            allGestalts={this.props.allGestalts}
                            toggleExpandGestaltNub={this.props.toggleExpandGestaltNub}
                            whichNubsAreExpanded={this.props.whichNubsAreExpanded}
                            />
                    )
                })}
            </ul>
        )
    }

}
