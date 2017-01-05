import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";

import { GestaltComponent } from './GestaltComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltsMap, GestaltInstancesMap, GestaltInstance, GestaltInstanceLookupMap, HydratedGestaltInstance } from '../domain';
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
        };

        const rootGestalt: Gestalt = this.createGestalt("root text")
        initState.allGestalts[rootGestalt.gestaltId] = rootGestalt
        let rootGestaltInstance: GestaltInstance =
            this.createGestaltInstance(rootGestalt.gestaltId, false, initState.allGestalts)
        // rootGestaltInstance.childrenInstanceIds = []

        initState.rootGestaltInstanceId = rootGestaltInstance.instanceId
        initState.allGestaltInstances[rootGestaltInstance.instanceId] = rootGestaltInstance



        //finish populating allGestalts
        for (let i = 0; i < 3; i++) {
            const newGestalt = this.createGestalt(Math.random() + '')
            initState.allGestalts[newGestalt.gestaltId] = newGestalt
        }

        Object.keys(initState.allGestalts).forEach((id, i) => {

            if (id === rootGestalt.gestaltId) {
                //skip
            }
            else {

                rootGestalt.relatedIds.push(id)

                // const newGestaltInstance = this.createGestaltInstance(id, true, initState.allGestalts)

                // initState.allGestaltInstances[newGestaltInstance.instanceId] = newGestaltInstance

                // rootGestaltInstance.childrenInstanceIds.push(newGestaltInstance.instanceId)

                //     const instanceId = "-" + id

                //     this.createAndExpandGestaltInstance(initState, {
                //         gestaltInstanceId: instanceId,
                //         gestaltId: id,
                //         parentGestaltInstanceId: null,
                //         shouldUpdate: false,
                //     }, true)

                // initState.expandedGestaltInstances["-" + id] = this.createGestaltInstance(instanceId, id, null, false)
                // initState.allGestalts[id].instanceAndVisibleNubIds[instanceId] = true

            }
        })


        initState.allGestaltInstances =
            this.expandGestaltInstance(
                rootGestaltInstance,
                initState.allGestalts,
                initState.allGestaltInstances
            )

        rootGestaltInstance = initState.allGestaltInstances[initState.rootGestaltInstanceId]

        rootGestaltInstance.childrenInstanceIds
            .forEach((iId: string) =>
                initState.allGestaltInstances = this.expandGestaltInstance(
                    initState.allGestaltInstances[iId],
                    initState.allGestalts,
                    initState.allGestaltInstances
                )
            )


        this.state = initState

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

        const rootGestaltInstance = this.state.allGestaltInstances[this.state.rootGestaltInstanceId]
        const rootGestalt = this.state.allGestalts[rootGestaltInstance.gestaltId]

        const newRootGestalt = {
            ...rootGestalt,
            relatedIds: [...rootGestalt.relatedIds, newGestalt.gestaltId]
        }

        const newAllGestalts: GestaltsMap = {
            ...this.state.allGestalts,
            [newGestalt.gestaltId]: newGestalt,
            [rootGestalt.gestaltId]: rootGestalt
        }

        const newInstance = this.createGestaltInstance(newGestalt.gestaltId, true, newAllGestalts)
        const newRootGestaltInstance = this.insertGestaltInstanceIntoParent(rootGestaltInstance, newInstance, offset)

        const newAllGestaltInstances: GestaltInstancesMap = {
            ...this.state.allGestaltInstances,
            [newInstance.instanceId]: newInstance,
            [newRootGestaltInstance.instanceId]: newRootGestaltInstance
        }

        this.setState({
            allGestaltInstances: newAllGestaltInstances,
            allGestalts: newAllGestalts
        })
    }

    createGestaltInstance = (gestaltId: string, expanded: boolean = true, allGestalts: GestaltsMap = this.state.allGestalts): GestaltInstance => {
        const newInstanceId: string = Util.genGUID()

        let newGestaltInstance: GestaltInstance = {
            instanceId: newInstanceId,
            gestaltId: gestaltId,
            childrenInstanceIds: null as string[],
            expanded: expanded
        }

        return newGestaltInstance
    }

    //IMMUTABLE, returns new val for allGestaltInstances
    expandGestaltInstance = (gi: GestaltInstance, allGestalts: GestaltsMap, allGestaltInstances: GestaltInstancesMap): GestaltInstancesMap => {

        const giOut: GestaltInstance = { ...gi, expanded: true }

        console.assert(typeof giOut.childrenInstanceIds !== "undefined")
        console.assert(typeof allGestalts[giOut.gestaltId] !== "undefined")

        const newInsts: GestaltInstancesMap = { [giOut.instanceId]: giOut }

        if (giOut.childrenInstanceIds === null) {

            giOut.childrenInstanceIds = allGestalts[giOut.gestaltId].relatedIds.map(id => {
                const newInst: GestaltInstance = this.createGestaltInstance(id, false, allGestalts)
                newInsts[newInst.instanceId] = newInst
                return newInst.instanceId
            })
        }

        return {
            ...allGestaltInstances,
            ...newInsts,
        }
    }

    // immutable
    insertGestaltInstanceIntoParent = (parentGestaltInstance: GestaltInstance, gestaltInstance: GestaltInstance, offset: number): GestaltInstance => {
        return {
            ...parentGestaltInstance,
            childrenInstanceIds: [...parentGestaltInstance.childrenInstanceIds].splice(offset, 0, gestaltInstance.instanceId)
        }
    }

    toggleExpand = (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance): void => {
        // NOTE: need to deal with recursive copying of the gestaltInstances object
        //  ^^ should work similarly to findGestaltInstance

        const existingChildIdIndex: number = _.findIndex(parentGestaltInstance.childrenInstanceIds,
            childId => this.state.allGestaltInstances[childId].gestaltId == gestaltToExpandId)

        console.assert(existingChildIdIndex !== -1, "child should always be found with current architecture")

        const existingChildInstanceId: string = parentGestaltInstance.childrenInstanceIds[existingChildIdIndex]
        const existingChildInstance: GestaltInstance = this.state.allGestaltInstances[existingChildInstanceId]

        if (existingChildInstance.expanded) //present and expanded
            this.state.allGestaltInstances[existingChildInstanceId] = { ...existingChildInstance, expanded: false }
        // this.collapseGestaltInstance(parentGestaltInstance.children, existingChildIndex)
        else //present and collapsed 
        {
            //#TODO move to front of array when expanding and deepFixGestaltInstanceIds?
            this.state.allGestaltInstances =
                this.expandGestaltInstance(existingChildInstance, this.state.allGestalts, this.state.allGestaltInstances)
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
            this.state.rootGestaltInstanceId,
            this.state.allGestalts,
            this.state.allGestaltInstances
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
