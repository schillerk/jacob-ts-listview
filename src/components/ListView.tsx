import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";


import { GestaltListComponent } from './GestaltListComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltCollection, GestaltHierarchicalViewItemContents, GestaltInstanceLookupMap, createGestaltInstance, HydratedGestaltHierarchicalViewItemContents } from '../domain';
import * as Util from '../util';

export interface ListViewState {
    allGestalts?: { [id: string]: Gestalt }
    gestaltInstances?: GestaltHierarchicalViewItemContents[]
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


        //finish populating allGestalts
        for (let i = 0; i < 2; i++) {
            const newGestalt = this.createGestalt(Math.random() + '')
            initState.allGestalts[newGestalt.gestaltId] = newGestalt
        }




        Object.keys(initState.allGestalts).forEach((id, i) => {

            initState.gestaltInstances.push(
                this.createGestaltInstance(id, i, undefined, true, initState.allGestalts)
            )

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
            gestaltInstances: initState.gestaltInstances
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

    addGestalt = (text: string, offset: number = 0, autoFocus:boolean=false): void => {
        const newGestalt = this.createGestalt(text)

        const newAllGestalts: { [id: string]: Gestalt } = {
            ...this.state.allGestalts,
            [newGestalt.gestaltId]: newGestalt
        }

        const newInstance = this.createGestaltInstance(newGestalt.gestaltId, offset, undefined, true, newAllGestalts)

        this.setState({
            gestaltInstances: this.insertGestaltInstance(this.state.gestaltInstances, newInstance, offset),
            allGestalts: newAllGestalts
        })
    }

    createGestaltInstance = (gestaltId: string, index: number, parentGestaltInstance?: GestaltHierarchicalViewItemContents, expanded: boolean = true, allGestalts: { [id: string]: Gestalt } = this.state.allGestalts): GestaltHierarchicalViewItemContents => {
        const newInstanceId = Util.genGUID()
    
        let newPath: number[] = []
        if (parentGestaltInstance) {
            newPath = [...parentGestaltInstance.path]
        }

        newPath.push(index)

        let newGestaltInstance = {
            instanceId: newInstanceId,
            path: newPath,
            gestaltId: gestaltId,
            children: null as GestaltHierarchicalViewItemContents[],
            expanded: false
        }

        if (expanded)
            newGestaltInstance = this.expandGestaltInstance(newGestaltInstance, allGestalts)

        return newGestaltInstance
    }

    //IMMUTABLE OPERATION
    expandGestaltInstance = (gi: GestaltHierarchicalViewItemContents, allGestalts: { [id: string]: Gestalt } = this.state.allGestalts): GestaltHierarchicalViewItemContents => {

        const giOut: GestaltHierarchicalViewItemContents = { ...gi, expanded: true }

        console.assert(typeof giOut.children !== "undefined")
        if (giOut.children === null)
            giOut.children = allGestalts[giOut.gestaltId].relatedIds
                .map((gId: string, i: number) => {
                    return this.createGestaltInstance(gId, i, giOut, false, allGestalts)
                })

        giOut.expanded = true;

        return giOut;
    }

    // Takes a list of gestaltInstances rather than accessing this.state.gestaltInstances
    // to make the method more reusable (i.e. for nested items).
    insertGestaltInstance = (gestaltInstances: GestaltHierarchicalViewItemContents[], gestaltInstance: GestaltHierarchicalViewItemContents, offset: number): GestaltHierarchicalViewItemContents[] => {
        gestaltInstances = gestaltInstances.slice()
        gestaltInstances.splice(offset, 0, gestaltInstance)
        this.deepFixGestaltInstanceIds(gestaltInstances)
        return gestaltInstances
    }

    // In-place, recursive operation on gestaltInstance[]
    // NOTE: This could definitely be optimized more
    deepFixGestaltInstanceIds = (instances: GestaltHierarchicalViewItemContents[], prefix: number[] = []): void => {
        if (typeof instances === "undefined") {
            throw new Error('Instances is undefined')
        }
        if (instances === null) {
            return
        }

        if (instances.length > 0) {
            //#hack to infer prefix
            prefix = instances[0].path.slice(0, -1)
        }

        instances.forEach((instance, index) => {
            let correctPath = [...prefix, index]
            console.assert(correctPath.length > 0, "correctId" + [prefix, index])
            
            // Update the path in case it has changed
            instance.path = correctPath
            
            this.deepFixGestaltInstanceIds(instance.children, correctPath)
        })
    }

/*
    findGestaltInstance = (path: number[]): GestaltHierarchicalViewItemContents => {
        let instances = this.state.gestaltInstances
        let instance: GestaltHierarchicalViewItemContents
        path.forEach(index => {
            instance = instances[index]
            console.assert(typeof instance !== "undefined", "instanceId: " + path + ", part: " + index)

            instances = instance.children
        })
        return instance
    }
*/
    toggleExpand = (gestaltToExpandId: string, parentGestaltInstance: GestaltHierarchicalViewItemContents): void => {
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
        return (
            <div>
                <SearchAddBox
                    autoFocus
                    onAddGestalt={this.addGestalt}
                    ref={(instance: SearchAddBox) => this.searchAddBox = instance}
                    />
                <GestaltListComponent
                    gestaltInstances={this.state.gestaltInstances.map(gis => {
                        return Util.hydrateGestaltInstanceAndChildren(gis, this.state.allGestalts)
                    })}
                    updateGestaltText={this.updateGestaltText}
                    toggleExpand={this.toggleExpand}
                    addGestalt={this.addGestalt}
                    />
            </div>
        )
    }
}
