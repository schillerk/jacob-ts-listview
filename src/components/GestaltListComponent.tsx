import * as React from "react";
import * as ReactDOM from "react-dom";

import { GestaltComponent } from './GestaltComponent'

import { Gestalt, createGestaltInstance, GestaltInstance, HydratedGestaltInstance } from '../domain';
import * as Util from '../util';

export interface GestaltListState {

}

export interface GestaltListProps extends React.Props<GestaltListComponent> {
    allGestaltInstances: HydratedGestaltInstance[]

    toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance) => void
    updateGestaltText: (id: string, newText: string) => void
    addGestalt: (text: string, offset: number) => void
}


export class GestaltListComponent extends React.Component<GestaltListProps, GestaltListState> {
    renderedGestaltComponents: GestaltComponent[]


    handleArrows = (arrowDir: Util.KEY_CODES, fromIndex: number) => {
        let dir: number = 0

        switch (arrowDir) {
            case Util.KEY_CODES.DOWN:
                dir = 1
                break
            case Util.KEY_CODES.UP:
                dir = -1
                break
        }

        const newIndex = fromIndex + dir

        if (newIndex < 0 || newIndex >= this.renderedGestaltComponents.length) {
            return
        }

        this.renderedGestaltComponents[newIndex].focus()
    }

    render() {
        const renderedGestaltInstances = this.props.allGestaltInstances.filter(instance => instance.expanded)
        this.renderedGestaltComponents = Array(renderedGestaltInstances.length)

        return (
            <ul>
                {
                    renderedGestaltInstances.map((instance, i) => {
                        // const gestaltInstanceId: string = instance.id + "-" + id
                        return (
                            <GestaltComponent
                                key={instance.instanceId}
                                index={i}
                                gestaltInstance={instance}
                                // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

                                ref={(gc: GestaltComponent) => { this.renderedGestaltComponents[i] = gc } }

                                updateGestaltText={this.props.updateGestaltText}
                                toggleExpand={this.props.toggleExpand}
                                addGestalt={this.props.addGestalt}
                                handleArrows={this.handleArrows}

                                />
                        )
                    })
                }
            </ul>
        )
    }

}
