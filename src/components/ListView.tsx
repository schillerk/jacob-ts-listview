import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";

import { GestaltComponent } from './GestaltComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltsMap, GestaltInstancesMap, GestaltInstance, HydratedGestaltInstance } from '../domain';
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

        const rootGestalt: Gestalt = this.createGestalt("root text", true)

        initState.allGestalts[rootGestalt.gestaltId] = rootGestalt
        let rootGestaltInstance: GestaltInstance =
            this.createGestaltInstance(rootGestalt.gestaltId, false, initState.allGestalts)

        // rootGestaltInstance.childrenInstanceIds === null at this point
        // rootGestalt.relatedIds === null always

        initState.rootGestaltInstanceId = rootGestaltInstance.instanceId
        initState.allGestaltInstances[rootGestaltInstance.instanceId] = rootGestaltInstance



        //finish populating allGestalts
        for (let i = 0; i < 3; i++) {
            const newGestalt = this.createGestalt(Math.random() + '')
            initState.allGestalts[newGestalt.gestaltId] = newGestalt
        }

        // Object.keys(initState.allGestalts).forEach((id, i) => {

        //     if (id === rootGestalt.gestaltId) {
        //         //skip
        //     }
        //     else {

        //         //rootGestalt.relatedIds.push(id)

        //         // const newGestaltInstance = this.createGestaltInstance(id, true, initState.allGestalts)

        //         // initState.allGestaltInstances[newGestaltInstance.instanceId] = newGestaltInstance

        //         // rootGestaltInstance.childrenInstanceIds.push(newGestaltInstance.instanceId)

        //         //     const instanceId = "-" + id

        //         //     this.createAndExpandGestaltInstance(initState, {
        //         //         gestaltInstanceId: instanceId,
        //         //         gestaltId: id,
        //         //         parentGestaltInstanceId: null,
        //         //         shouldUpdate: false,
        //         //     }, true)

        //         // initState.expandedGestaltInstances["-" + id] = this.createGestaltInstance(instanceId, id, null, false)
        //         // initState.allGestalts[id].instanceAndVisibleNubIds[instanceId] = true

        //     }
        // })


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

    createGestalt = (text: string = '', isRoot?: boolean) => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: isRoot !== undefined && isRoot ? undefined : [],
            isRoot: isRoot !== undefined && isRoot
        }

        return newGestalt
    }

    // Mutates state
    addGestalt = (text: string, offset: number = 0, parentInstanceId: string = this.state.rootGestaltInstanceId, callback?: () => any): void => {
        const newGestalt = this.createGestalt(text)
        const newAllGestalts: GestaltsMap = {
            ...this.state.allGestalts,
            [newGestalt.gestaltId]: newGestalt,
        }

        const newInstance = this.createGestaltInstance(newGestalt.gestaltId)
        if (parentInstanceId === this.state.rootGestaltInstanceId)
            console.log("adding at root")

        const parentGestaltInstance = this.insertChildInstance(
            this.state.allGestaltInstances[parentInstanceId],
            newInstance.instanceId,
            offset
        );
        // rootGestaltInstance
        // newRootGestaltInstance.childrenInstanceIds =
        // rootGestaltInstance.childrenInstanceIds.concat(newInstance.instanceId)
        // this.insertGestaltInstanceIntoParent(rootGestaltInstance, newInstance, offset)

        const newAllGestaltInstances: GestaltInstancesMap = {
            ...this.state.allGestaltInstances,
            [newInstance.instanceId]: newInstance,
            [parentGestaltInstance.instanceId]: parentGestaltInstance
        }

        this.setState({
            allGestaltInstances: newAllGestaltInstances,
            allGestalts: newAllGestalts,
        }, callback)
    }

    //IMMUTABLE
    createGestaltInstance = (gestaltId: string, expanded: boolean = true, allGestalts: GestaltsMap = this.state.allGestalts): GestaltInstance => {
        const newInstanceId: string = Util.genGUID()

        let newGestaltInstance: GestaltInstance = {
            instanceId: newInstanceId,
            gestaltId: gestaltId,
            childrenInstanceIds: (expanded ? [] : null) as string[],
            expanded: expanded
        }

        return newGestaltInstance
    }

    //IMMUTABLE, returns new val for allGestaltInstances
    expandGestaltInstance = (gi: GestaltInstance, allGestalts: GestaltsMap, allGestaltInstances: GestaltInstancesMap): GestaltInstancesMap => {
        const gestalt: Gestalt = allGestalts[gi.gestaltId];

        const giOut: GestaltInstance = { ...gi, expanded: true }

        console.assert(typeof giOut.childrenInstanceIds !== "undefined")
        console.assert(typeof gestalt !== "undefined")

        const newInsts: GestaltInstancesMap = { [giOut.instanceId]: giOut }

        if (giOut.childrenInstanceIds === null) {

            const gestaltIdsToInstantiate: string[] = gestalt.isRoot ?
                _.values(allGestalts).map((g) => g.isRoot ? undefined : g.gestaltId)
                    .filter(id => id !== undefined) :
                gestalt.relatedIds;

            console.assert(typeof gestaltIdsToInstantiate !== undefined);

            giOut.childrenInstanceIds = gestaltIdsToInstantiate.map(id => {
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

    //MUTATOR
    addRelation = (srcGestaltId: string, tgtGestaltId: string, expandInstanceId: string) => {
        //add rel to gestalt
        const srcGestalt: Gestalt = this.state.allGestalts[srcGestaltId];
        const newSrcGestalt: Gestalt = _.assign({}, srcGestalt, {
            relatedIds: srcGestalt.relatedIds.concat(tgtGestaltId)
        });

        //add new GestaltInstances to all relevant existing GestaltInstances
        const instancesOfNewlyRelatedGestalts: GestaltInstancesMap = {};
        const relevantInstanceIdsToNewInstances: {[relevantInstanceId: string]: GestaltInstance} = {};
        for (const currGestaltInstance of _.values(this.state.allGestaltInstances)) {
            if (currGestaltInstance.gestaltId === srcGestaltId) { // find relevant gestalt instances
                const currInstanceId = currGestaltInstance.instanceId;
                const expanded = currInstanceId === expandInstanceId;
                let instanceOfNewlyRelatedGestalt = this.createGestaltInstance(tgtGestaltId, expanded);
                if (expanded) {
                    const newAllInstancesWithNubs = this.expandGestaltInstance(instanceOfNewlyRelatedGestalt, this.state.allGestalts, this.state.allGestaltInstances);
                    instanceOfNewlyRelatedGestalt = newAllInstancesWithNubs[instanceOfNewlyRelatedGestalt.instanceId];

                }
                instancesOfNewlyRelatedGestalts[instanceOfNewlyRelatedGestalt.instanceId] = instanceOfNewlyRelatedGestalt;
                relevantInstanceIdsToNewInstances[currGestaltInstance.instanceId] = instanceOfNewlyRelatedGestalt;
            }
        }

        const newAllGestaltInstances: GestaltInstancesMap = _.assign(
            {},
            instancesOfNewlyRelatedGestalts,
            _.mapValues(this.state.allGestaltInstances, (currGestaltInstance) => {
                if (currGestaltInstance.gestaltId === srcGestaltId) { // if relevant
                    const relevantInstanceId = currGestaltInstance.instanceId;
                    const newlyRelatedInstanceId = relevantInstanceIdsToNewInstances[relevantInstanceId].instanceId;
                    return this.insertChildInstance(currGestaltInstance, newlyRelatedInstanceId);
                } else {
                    return currGestaltInstance;
                }
            })
        );

        this.setState({
            allGestaltInstances: newAllGestaltInstances,
            allGestalts: {
                ...this.state.allGestalts,
                [srcGestaltId]: newSrcGestalt // replace srcGestaltId
            },
        });
    }



    // futureParentGestalt = {
    //         ...futureParentGestalt,
    //         relatedIds: futureParentGestalt.relatedIds.concat(childInstance.gestaltId)
    //     }

    // return 
    // }

    // immutable
    //if no offset, append
    insertChildInstance = (parentGestaltInstance: GestaltInstance, instanceId: string, offset?: number): GestaltInstance => {
        console.assert(
            parentGestaltInstance.childrenInstanceIds !== null && parentGestaltInstance.expanded,
            'trying to insert child into nub instance',
            parentGestaltInstance
        );
        if (typeof offset === "undefined")
            offset = parentGestaltInstance.childrenInstanceIds.length

        const newChildrenInstanceIds =
            Util.immSplice(parentGestaltInstance.childrenInstanceIds, offset, 0, instanceId)

        return {
            ...parentGestaltInstance,
            childrenInstanceIds: newChildrenInstanceIds
        }
    }

    // immutable
    removeChildInstance = (parentGestaltInstance: GestaltInstance, offset: number): GestaltInstance => {
        return {
            ...parentGestaltInstance,
            childrenInstanceIds: Util.immSplice(parentGestaltInstance.childrenInstanceIds, offset, 1)
        }
    }


    commitIndentChild = (parentInstanceId: string, childIndex: number, dedent: boolean = false) => {
        //add child's gestaltId as relatedId to new parent gestalt
        //remove child's gestaltId as relatedId from old parent gestalt
        //add child's gestaltInstanceId as a childs instance id to new parent's gestalt instance
        //remove child's gestaltInstanceId as a childs instance id from old parent's gestalt instance

        let parentGestaltInstance: GestaltInstance = this.state.allGestaltInstances[parentInstanceId]
        let parentGestalt: Gestalt = this.state.allGestalts[parentGestaltInstance.gestaltId]

        console.assert(parentGestalt.gestaltId === parentGestaltInstance.gestaltId)

        const instanceIdListInWhichChildLies: string[] = parentGestaltInstance.childrenInstanceIds
        const childInstanceId: string = instanceIdListInWhichChildLies[childIndex]
        const childInstance: GestaltInstance = this.state.allGestaltInstances[childInstanceId]

        let futureParentGestalt: Gestalt
        let futureParentInstance: GestaltInstance

        if (childIndex - 1 < 0)
            return

        const futureParentInstanceId = instanceIdListInWhichChildLies[childIndex - 1]

        if (!dedent) {
            futureParentInstance = this.state.allGestaltInstances[futureParentInstanceId];
            this.addRelation(futureParentInstance.gestaltId, childInstance.gestaltId, futureParentInstanceId);
        } else {

        }

        //delete old relation
        // parentGestalt = {
        //     ...parentGestalt,
        //     relatedIds: _.without(parentGestalt.relatedIds, childInstance.gestaltId)
        // }

        // //delete from old list
        // parentGestaltInstance = {
        //     ...parentGestaltInstance,
        //     childrenInstanceIds: Util.immSplice(parentGestaltInstance.childrenInstanceIds, childIndex, 1)
        // }



        // this.setState({
        //     allGestaltInstances: {
        //         ...this.state.allGestaltInstances,
        //         [parentInstanceId]: parentGestaltInstance,
        //         [futureParentInstance.instanceId]: futureParentInstance
        //     },
        //     allGestalts: {
        //         ...this.state.allGestalts,
        //         [futureParentGestalt.gestaltId]: futureParentGestalt
        //     },
        // })
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
                    onAddGestalt={(text) => this.addGestalt(text)}
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
                    commitIndentChild={this.commitIndentChild}

                    indentChild={undefined}
                    addGestaltAsChild={(text) => this.addGestalt(text)}
                    getOffsetChild={undefined}
                    focus={() => { } }
                    isRoot
                    />
            </div>
        )
    }
}
