import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";


import { GestaltListComponent } from './GestaltListComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltCollection, GestaltInstance, GestaltInstanceLookupMap, createGestaltInstance, HydratedGestaltInstance } from '../domain';
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
            }

        };

        let newGestalts: GestaltCollection = {}

        //finish populating allGestalts
        for (let i = 0; i < 1000; i++) {
            const newGestalt = this.createGestalt(Math.random() + '')
            initState.allGestalts[newGestalt.gestaltId] = newGestalt
        }




        Object.keys(initState.allGestalts).forEach((id, i) => {

            initState.gestaltInstances.push(
                this.createGestaltInstance(id, i, undefined, false))

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
            allGestalts: { ...initState.allGestalts, ...newGestalts },
            gestaltInstances: initState.gestaltInstances
        }

    }

    componentWillMount() {
        this.state.gestaltInstances = this.state.gestaltInstances.map(gi => this.expandGestaltInstance(gi))
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

    addGestalt = (text: string, offset: number = 0): void => {


        const newGestalt = this.createGestalt(text)

        const gestalts: { [id: string]: Gestalt } = {
            ...this.state.allGestalts,
            [newGestalt.gestaltId]: newGestalt
        }

        const instance = this.createGestaltInstance(newGestalt.gestaltId, offset)

        this.setState({
            gestaltInstances: this.insertGestaltInstance(this.state.gestaltInstances, instance, offset),
            allGestalts: gestalts
        })
    }

    createGestaltInstance = (gestaltId: string, index: number, parentGestaltInstanceId?: string, expanded: boolean = true): GestaltInstance => {


        let newInstanceId = String(index)
        if (typeof parentGestaltInstanceId !== 'undefined') {
            const parentInstanceId = parentGestaltInstanceId

            newInstanceId = parentInstanceId + INSTANCE_ID_DELIMITER + newInstanceId
        }

        let newGestaltInstance = {
            instanceId: newInstanceId,
            gestaltId: gestaltId,
            children: [] as GestaltInstance[],
            expanded: false
        }
        if (expanded)
            newGestaltInstance = this.expandGestaltInstance(newGestaltInstance)

        return newGestaltInstance
    }

    //IMMUTABLE OPERATION
    expandGestaltInstance = (gi: GestaltInstance): GestaltInstance => {
        const allGestalts = this.state.allGestalts


        const giOut: GestaltInstance = { ...gi }

        giOut.children = allGestalts[giOut.gestaltId].relatedIds
            .map((gId: string, i: number) => {
                return this.createGestaltInstance(gId, i, giOut.instanceId, false)
            })
        giOut.expanded = true;

        return giOut;
    }

    // Takes a list of gestaltInstances rather than accessing this.state.gestaltInstances
    // to make the method more reusable (i.e. for nested items).
    insertGestaltInstance = (gestaltInstances: GestaltInstance[], gestaltInstance: GestaltInstance, offset: number): GestaltInstance[] => {
        gestaltInstances = gestaltInstances.slice()
        gestaltInstances.splice(offset, 0, gestaltInstance)
        this.deepFixGestaltInstanceIds(gestaltInstances)
        return gestaltInstances
    }

    // Takes a list of gestaltInstances rather than accessing this.state.gestaltInstances
    // to make the method more reusable (i.e. for nested items).
    collapseGestaltInstance = (gestaltInstances: GestaltInstance[], index: number): GestaltInstance[] => {
        //TODO: if we're going to persist expansion state of subtree we can't delete instances that are collapsed

        gestaltInstances = gestaltInstances.slice()
        gestaltInstances[index].expanded = false;
        // this.deepFixGestaltInstanceIds(gestaltInstances)
        return gestaltInstances
    }

    // In-place, recursive operation on gestaltInstance[]
    // NOTE: This could definitely be optimized more
    deepFixGestaltInstanceIds = (instances: GestaltInstance[], prefix?: string): void => {
        if (typeof prefix !== "undefined") {
            prefix = prefix + INSTANCE_ID_DELIMITER
        }
        else {
            if (instances.length > 0) {
                //#hack to infer prefix
                prefix = instances[0].instanceId.split(INSTANCE_ID_DELIMITER).slice(0, -1).join(INSTANCE_ID_DELIMITER)
                console.assert(typeof prefix === "string")
                if (prefix !== "")
                    prefix += INSTANCE_ID_DELIMITER
            }
        }

        instances.forEach((instance, index) => {
            let correctId = prefix + String(index)
            console.assert(correctId.length > 0, "correctId" + [prefix, index])
            if (instance.instanceId != correctId) {
                instance.instanceId = correctId
            }
            this.deepFixGestaltInstanceIds(instance.children, instance.instanceId + INSTANCE_ID_DELIMITER)
        })
    }

    findGestaltInstance = (instanceId: string): GestaltInstance => {
        let idParts = instanceId.split(INSTANCE_ID_DELIMITER)
        let instances = this.state.gestaltInstances
        let instance: GestaltInstance
        idParts.forEach(part => {
            instance = instances[parseInt(part)]
            console.assert(typeof instance !== "undefined", "instanceId: " + instanceId + ", part: " + part)

            instances = instance.children
        })
        return instance
    }

    toggleExpand = (gestaltToExpandId: string, parentGestaltInstanceId: string) => {
        // NOTE: need to deal with recursive copying of the gestaltInstances object
        //  ^^ should work similarly to findGestaltInstance
        console.assert(!!parentGestaltInstanceId, "parentGestaltInstanceId: " + parentGestaltInstanceId)

        const parentGestaltInstance = this.findGestaltInstance(parentGestaltInstanceId)

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
            console.error("THIS SHOULD NEVER BE REACHED NOW")
            // const newlyExpandedGestaltInstance: GestaltInstance =
            //     this.createGestaltInstance(gestaltToExpandId, 0, parentGestaltInstance.instanceId)
            // console.log(newlyExpandedGestaltInstance)
            // // parentGestaltInstance.expandedChildren.push(newlyExpandedGestaltInstance)
            // parentGestaltInstance.children =
            //     this.insertGestaltInstance(parentGestaltInstance.children, newlyExpandedGestaltInstance, 0);
        }

        this.setState({})
        // gestaltInstances: this.insertGestaltInstance(parentGestaltInstance.expandedChildren, instance, 0),


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
        return (
            <div>
                <SearchAddBox
                    autoFocus
                    onAddGestalt={this.addGestalt}
                    ref={(instance: SearchAddBox) => this.searchAddBox = instance}
                    />
                <GestaltListComponent
                    gestaltInstances={this.state.gestaltInstances.map(gis => {
                        return Util.hydrateGestaltInstance(gis, this.state.allGestalts)
                    })
                    }
                    allGestalts={this.state.allGestalts}
                    updateGestaltText={this.updateGestaltText}
                    toggleExpand={this.toggleExpand}
                    />
            </div>
        )
    }
}
