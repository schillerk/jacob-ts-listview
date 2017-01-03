import * as React from "react";
import * as ReactDOM from "react-dom"

import { GestaltListComponent } from './GestaltListComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltCollection, GestaltInstance, GestaltInstanceLookupMap, createGestaltInstance } from '../domain';
import * as Util from '../util';

export const INSTANCE_ID_DELIMITER = '.'

export interface ListViewState {
    allGestalts?: { [id: string]: Gestalt }
    gestaltInstances?: GestaltInstance[]
}

export interface ListViewProps extends React.Props<ListView> {

}


export class ListView extends React.Component<ListViewProps, ListViewState> {
    searchAddBox: SearchAddBox;
    updateTimes: number[] = []

    constructor(props: ListViewProps) {
        super(props);

        const initState: ListViewState = {
            gestaltInstances: [],
            allGestalts: {
                '0': {
                    gestaltId: '0',
                    text: 'hack with jacob!',
                    relatedIds: [],
                },
                '1': {
                    gestaltId: '1',
                    text: 'build ideaflow!',
                    relatedIds: ['2', '0'],

                },
                '2': {
                    gestaltId: '2',
                    text: 'bring peace to world!',
                    relatedIds: ['1'],

                },
            }

        };

        let newGestalts: GestaltCollection = {}

        //finish populating allGestalts
        for (let i = 0; i < 10; i++) {
            const newGestalt = this.createGestalt(Math.random() + '')
            initState.allGestalts[newGestalt.gestaltId] = newGestalt
        }




        Object.keys(initState.allGestalts).forEach(id => {

initState.gestaltInstances.push(
                this.createGestaltInstance(newGestalt.gestaltId, i))

        //     const instanceId = "-" + id

        //     this.createAndExpandGestaltInstance(initState, {
        //         gestaltInstanceId: instanceId,
        //         gestaltId: id,
        //         parentGestaltInstanceId: null,
        //         shouldUpdate: false,
        //     }, true)

            // initState.expandedGestaltInstances["-" + id] = this.createGestaltInstance(instanceId, id, null, false)
            // initState.allGestalts[id].instanceAndVisibleNubIds[instanceId] = true


        })

        this.state = { allGestalts: { ...initState.allGestalts, ...newGestalts }, 
        gestaltInstances: initState.gestaltInstances }

    }

    createAndExpandGestaltInstance = (theState: ListViewState, gIP: { gestaltInstanceId: string, gestaltId: string, parentGestaltInstanceId: string, shouldUpdate: boolean }, expand: boolean) => {
        if (expand) {
            theState.gestaltInstances[gIP.gestaltInstanceId] =
                this.createGestaltInstance(gIP.gestaltInstanceId, gIP.gestaltId, true, gIP.parentGestaltInstanceId, gIP.shouldUpdate)

            theState.allGestalts[gIP.gestaltId].instanceAndVisibleNubIds[gIP.gestaltInstanceId] = true

            theState.allGestalts[gIP.gestaltId].relatedIds.map((relatedId) => {
                const nubInstanceId = gIP.gestaltInstanceId + '-' + relatedId;
                // initState.allGestalts[id].instanceAndVisibleNubIds[nubInstanceId] = true
                // this.createAndExpandGestaltInstance(initState, {
                //     gestaltInstanceId: nubInstanceId,
                //     gestaltId: relatedId,
                //     parentGestaltInstanceId: instanceId,
                //     shouldUpdate: false,
                // }, true)

                theState.gestaltInstances[nubInstanceId] =
                    this.createGestaltInstance(nubInstanceId, relatedId, false, gIP.gestaltInstanceId, false)

                theState.allGestalts[relatedId].instanceAndVisibleNubIds[nubInstanceId] = false

            })
        } else {
            theState.gestaltInstances[gIP.gestaltInstanceId].expanded = false
            // delete theState.expandedGestaltInstances[gIP.gestaltInstanceId]
            // delete theState.allGestalts[gIP.gestaltId].instanceAndVisibleNubIds[gIP.gestaltInstanceId]
        }
    }

    createGestalt = (text: string = '') => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: [],
        }

        return newGestalt
    }

    addGestalt = (text: string, offset: number): void => {
        const newGestalt = this.createGestalt(text)

        let gestalts: { [id: string]: Gestalt } = {
            ...this.state.allGestalts,
            [newGestalt.gestaltId]: newGestalt
        }

        let instance = this.createGestaltInstance(newGestalt.gestaltId, offset)

        this.setState({
            gestaltInstances: this.insertGestaltInstance(this.state.gestaltInstances, instance, offset),
            allGestalts: gestalts
        })
    }

    createGestaltInstance = (gestaltId: string, index: number, parentGestaltInstance?: GestaltInstance): GestaltInstance => {

        let newInstanceId = String(index)
        if (typeof parentGestaltInstance != 'undefined') {
            let parentInstanceId = parentGestaltInstance.instanceId
            newInstanceId = parentInstanceId + INSTANCE_ID_DELIMITER + newInstanceId
        }

        return {
            instanceId: newInstanceId,
            gestaltId: gestaltId,
            expandedChildren: []
        }
    }

    // Takes a list of gestaltInstances rather than accessing this.state.gestaltInstances
    // to make the method more reusable (i.e. for nested items).
    insertGestaltInstance = (gestaltInstances: GestaltInstance[], gestaltInstance: GestaltInstance, offset: number): GestaltInstance[] => {
        gestaltInstances = gestaltInstances.slice()
        gestaltInstances.splice(offset, 0, gestaltInstance)
        this.deepFixGestaltInstanceIds(gestaltInstances)
        return gestaltInstances
    }

    // In-place, recursive operation on gestaltInstance[]
    // NOTE: This could definitely be optimized more
    deepFixGestaltInstanceIds = (instances: GestaltInstance[], prefix?: string): void => {
        instances.forEach((instance, index) => {
            let correctId = _.filter([prefix, index]).join(INSTANCE_ID_DELIMITER)
            if (instance.instanceId != correctId) {
                instance.instanceId = correctId
            }
            this.deepFixGestaltInstanceIds(instance.expandedChildren, instance.instanceId + INSTANCE_ID_DELIMITER)
        })
    }

    findGestaltInstance = (instanceId: string): GestaltInstance => {
        let idParts = instanceId.split(INSTANCE_ID_DELIMITER)
        let instances = this.state.gestaltInstances
        let instance: GestaltInstance
        idParts.forEach(part => {
            instance = instances[parseInt(part)]
            instances = instance.expandedChildren
        })
        return instance
    }

    toggleExpand = (parentGestaltInstanceId: string, gestaltId: string) => {
        // NOTE: need to deal with recursive copying of the gestaltInstances object
        //  ^^ should work similarly to findGestaltInstance
        // let parentGestaltInstance = this.findGestaltInstance(parentGestaltInstanceId)

        let idParts = parentGestaltInstanceId.split(INSTANCE_ID_DELIMITER)
        let instances: GestaltInstance[]
        let allInstances = instances = this.state.gestaltInstances
        let instance: GestaltInstance
        idParts.forEach(part => {
            instance = { ...instances[parseInt(part)] }
            instances = instance.expandedChildren
        })

        let existingExpandedChild = _.find(parentGestaltInstance.expandedChildren,
            child => child.gestaltId == gestaltId)

        if (existingExpandedChild) {

        }

        const expandedGestaltInstances = this.state.gestaltInstances
        const allGestalts = this.state.allGestalts

        if (nubGestaltInstanceId in expandedGestaltInstances && expandedGestaltInstances[nubGestaltInstanceId].expanded === true) {
            this.createAndExpandGestaltInstance(this.state, {
                gestaltInstanceId: nubGestaltInstanceId,
                gestaltId: nubGestaltId,
                parentGestaltInstanceId: parentGestaltInstanceId,
                shouldUpdate: true,
            }, false)

        } else {
            this.createAndExpandGestaltInstance(this.state, {
                gestaltInstanceId: nubGestaltInstanceId,
                gestaltId: nubGestaltId,
                parentGestaltInstanceId: parentGestaltInstanceId,
                shouldUpdate: true,
            }, true)
            // expandedGestaltInstances[nubGestaltInstanceId] =
            //     this.createGestaltInstance(nubGestaltInstanceId, nubGestaltId, parentGestaltInstanceId, true)
            // allGestalts[nubGestaltId].instanceAndVisibleNubIds[nubGestaltInstanceId] = true
        }
        //|| expandedGestaltInstanceIds[pGIId]!==null 
        //(typeof expandedGestaltInstanceIds[pGIId] !== "undefined" && console.log("undef pGIId", pGIId) ) ||
        this.setGestaltAndParentsShouldUpdate(parentGestaltInstanceId)

        this.setState({ gestaltInstances: expandedGestaltInstances })
    }

    updateGestaltText = (id: string, newText: string) => {
        const timeInd = this.updateTimes.push(Date.now()) - 1

        let updatedGestalt = {
            ...this.state.allGestalts[id],
            text: newText
        }

        let gestalts = {
            ...this.state.allGestalts,
            updatedGestalt
        }

        this.setState({ allGestalts: gestalts }, () => {
            this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
            if (this.updateTimes.length % 10 == 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
        })
    }


    render() {
        return (
            <div>
                <SearchAddBox
                    autoFocus
                    onAddGestalt={this.addGestalt}
                    ref={(instance: SearchAddBox) => this.searchAddBox = instance}
                    />
                <GestaltListComponent
                    gestaltInstances={this.state.gestaltInstances}
                    allGestalts={this.state.allGestalts}
                    updateGestaltText={this.updateGestaltText}
                    toggleExpand={this.toggleExpand}
                    />
            </div>
        )
    }
}
