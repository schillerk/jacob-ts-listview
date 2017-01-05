import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";


import { GestaltListComponent } from './GestaltListComponent'
import { GestaltComponent } from './GestaltComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltsMap, GestaltInstancesMap, GestaltInstance, GestaltInstanceLookupMap, createGestaltInstance, HydratedGestaltInstance } from '../domain';
import * as Util from '../util';


export interface ListViewState {
    allGestalts?: GestaltsMap
    allGestaltInstances?: GestaltInstancesMap
    rootGestaltInstanceId?: string
}

export interface ListViewProps extends React.Props<ListView> {

}


export class ListView extends React.Component<ListViewProps, ListViewState> {
    searchAddBox: SearchAddBox;
    updateTimes: number[] = []

    constructor(props: ListViewProps) {
        super(props);

        const initState: ListViewState = {
            allGestaltInstances: {},
            allGestalts: {
                '0id': {
                    gestaltId: '0id',
                    text: 'hack with jacob!',
                    relatedIds: [],
                },
                '1id': {
                    gestaltId: '1id',
                    text: 'build ideaflow!',
                    relatedIds: ['2id', '0id'],

                },
                '2id': {
                    gestaltId: '2id',
                    text: 'bring peace to world!',
                    relatedIds: ['1id'],

                },
            },
            rootGestaltInstanceId: "ROOT"
        };


        //finish populating allGestalts
        for (let i = 0; i < 2; i++) {
            const newGestalt = this.createGestalt(Math.random() + '')
            initState.allGestalts[newGestalt.gestaltId] = newGestalt
        }


        const rootGestaltInstance = this.createGestaltInstance(initState.rootGestaltInstanceId, 0, undefined, true, initState.allGestalts)

        initState.allGestaltInstances[rootGestaltInstance.instanceId] = rootGestaltInstance

        this.insertGestaltInstanceIntoParent(
            initState.allGestaltInstances[initState.rootGestaltInstanceId], rootGestaltInstance, 0)


        Object.keys(initState.allGestalts).forEach((id, i) => {

            const newGestaltInstance = this.createGestaltInstance(id, i, undefined, true, initState.allGestalts)

            initState.allGestaltInstances[newGestaltInstance.instanceId] = newGestaltInstance

            this.insertGestaltInstanceIntoParent(
                initState.allGestaltInstances[initState.rootGestaltInstanceId], newGestaltInstance, 0)

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

        this.state = {
            allGestalts: initState.allGestalts,
            allGestaltInstances: initState.allGestaltInstances
        }

    }


    // createAndExpandGestaltInstance = (theState: ListViewState, gIP: { gestaltInstanceId: string, gestaltId: string, parentGestaltInstanceId: string, shouldUpdate: boolean }, expand: boolean) => {
    //     if (expand) {
    //         theState.gestaltInstances[gIP.gestaltInstanceId] =
    //             this.createGestaltInstance(gIP.gestaltInstanceId, gIP.gestaltId, true, gIP.parentGestaltInstanceId, gIP.shouldUpdate)

    //         theState.allGestalts[gIP.gestaltId].instanceAndVisibleNubIds[gIP.gestaltInstanceId] = true

    //         theState.allGestalts[gIP.gestaltId].relatedIds.map((relatedId) => {
    //             const nubInstanceId = gIP.gestaltInstanceId + '-' + relatedId;
    //             // initState.allGestalts[id].instanceAndVisibleNubIds[nubInstanceId] = true
    //             // this.createAndExpandGestaltInstance(initState, {
    //             //     gestaltInstanceId: nubInstanceId,
    //             //     gestaltId: relatedId,
    //             //     parentGestaltInstanceId: instanceId,
    //             //     shouldUpdate: false,
    //             // }, true)

    //             theState.gestaltInstances[nubInstanceId] =
    //                 this.createGestaltInstance(nubInstanceId, relatedId, false, gIP.gestaltInstanceId, false)

    //             theState.allGestalts[relatedId].instanceAndVisibleNubIds[nubInstanceId] = false

    //         })
    //     } else {
    //         theState.gestaltInstances[gIP.gestaltInstanceId].expanded = false
    //         // delete theState.expandedGestaltInstances[gIP.gestaltInstanceId]
    //         // delete theState.allGestalts[gIP.gestaltId].instanceAndVisibleNubIds[gIP.gestaltInstanceId]
    //     }
    // }

    createGestalt = (text: string = '') => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: [],
        }

        return newGestalt
    }

    // Mutates state
    addGestalt = (text: string, offset: number = 0, autoFocus: boolean = false): void => {
        const newGestalt = this.createGestalt(text)

        const newAllGestalts: GestaltsMap = {
            ...this.state.allGestalts,
            [newGestalt.gestaltId]: newGestalt
        }
        const rootGestaltInstance = this.state.allGestaltInstances[this.state.rootGestaltInstanceId]
        const newInstance = this.createGestaltInstance(newGestalt.gestaltId, offset, undefined, true, newAllGestalts)
        this.insertGestaltInstanceIntoParent(rootGestaltInstance, newInstance, offset)


        const newAllGestaltInstances: GestaltInstancesMap = {
            ...this.state.allGestaltInstances,
            [newInstance.instanceId]: newInstance
        }

        this.setState({
            allGestaltInstances: newAllGestaltInstances,
            allGestalts: newAllGestalts
        })
    }

    createGestaltInstance = (gestaltId: string, index: number, parentGestaltInstance?: GestaltInstance, expanded: boolean = true, allGestalts: GestaltsMap = this.state.allGestalts): GestaltInstance => {
        const newInstanceId = Util.genGUID()

        let newGestaltInstance = {
            instanceId: newInstanceId,
            gestaltId: gestaltId,
            children: null as GestaltInstance[],
            expanded: false
        }

        if (expanded)
            newGestaltInstance = this.expandGestaltInstance(newGestaltInstance, allGestalts)

        return newGestaltInstance
    }

    //IMMUTABLE OPERATION
    expandGestaltInstance = (gi: GestaltInstance, allGestalts: GestaltsMap = this.state.allGestalts): GestaltInstance => {

        const giOut: GestaltInstance = { ...gi, expanded: true }

        console.assert(typeof giOut.children !== "undefined")
        if (giOut.children === null)
            giOut.children = allGestalts[giOut.gestaltId].relatedIds
                .map((gId: string, i: number) => {
                    return this.createGestaltInstance(gId, i, giOut, false, allGestalts)
                })

        giOut.expanded = true;

        return giOut;
    }

    // immutable
    insertGestaltInstanceIntoParent = (parentGestaltInstance: GestaltInstance, gestaltInstance: GestaltInstance, offset: number): GestaltInstance => {
        return {
            ...parentGestaltInstance,
            children: [...parentGestaltInstance.children].splice(offset, 0, gestaltInstance)
        }
    }

    toggleExpand = (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance): void => {
        // NOTE: need to deal with recursive copying of the gestaltInstances object
        //  ^^ should work similarly to findGestaltInstance

        const existingChildIndex = _.findIndex(parentGestaltInstance.children,
            child => child.gestaltId == gestaltToExpandId)

        if (existingChildIndex !== -1) {
            const existingChild = parentGestaltInstance.children[existingChildIndex]

            if (existingChild.expanded) //present and expanded
                parentGestaltInstance.children[existingChildIndex] = { ...existingChild, expanded: false }
            // this.collapseGestaltInstance(parentGestaltInstance.children, existingChildIndex)
            else //present and collapsed 
            {
                //#TODO move to front of array when expanding and deepFixGestaltInstanceIds?
                parentGestaltInstance.children[existingChildIndex] = this.expandGestaltInstance(existingChild)
            }
        } else { //not yet added
            console.error("ERROR: child should always be found with current architecture")
        }

        this.setState({})

    }

    updateGestaltText = (id: string, newText: string) => {
        const timeInd = this.updateTimes.push(Date.now()) - 1
        const updatedGestalt: Gestalt = {
            ...this.state.allGestalts[id],
            text: newText
        }

        const updatedAllGestalts: { [gestaltId: string]: Gestalt } = {
            ...this.state.allGestalts,
            [updatedGestalt.gestaltId]: updatedGestalt
        }

        this.setState({ allGestalts: updatedAllGestalts }, () => {
            this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
            if (this.updateTimes.length % 10 == 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
        })
    }

    render() {
        const hydratedRootGestaltInstance = Util.hydrateGestaltInstanceAndChildren(
            this.state.allGestaltInstances[this.state.rootGestaltInstanceId],
            this.state.allGestalts
        )

        return (
            <div>
                <SearchAddBox
                    autoFocus
                    onAddGestalt={this.addGestalt}
                    ref={(instance: SearchAddBox) => this.searchAddBox = instance}
                    />

                <GestaltComponent
                    key={this.state.rootGestaltInstanceId}
                    index={0}
                    gestaltInstance={hydratedRootGestaltInstance}
                    // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

                    ref={() => { } }

                    updateGestaltText={this.updateGestaltText}
                    toggleExpand={this.toggleExpand}
                    addGestalt={this.addGestalt}
                    handleArrows={() => { } }
                    isRoot
                    />
            </div>
        )
    }
}
