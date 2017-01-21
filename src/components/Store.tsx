import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";

import { GestaltComponent } from './GestaltComponent'
import { SearchAddBox } from './SearchAddBox'
import { HashtagsBox } from './HashtagsBox'
import { ListView } from './ListView'

import { Gestalt, GestaltsMap, GestaltInstancesMap, GestaltInstance, HydratedGestaltInstance } from '../domain';
import * as Util from '../util';
import { LazyArray } from "../LazyArray"

import * as Immutable from 'immutable'
// import * as ImmutableDiff from 'immutablediff'
// var ImmutableDiff: any = require("immutablediff");

export interface StoreState {
    allGestalts?: GestaltsMap
    allGestaltInstances?: GestaltInstancesMap
    rootGestaltInstanceId?: string
    focusedInstanceId?: string
    hashtags?: Immutable.OrderedSet<string>
    // rootChildrenHeights?: number[]
}

export interface StoreProps extends React.Props<Store> {

}


export class Store extends React.Component<StoreProps, StoreState> {
    updateTimes: number[] = []
    hashtagTimeout: number


    constructor(props: StoreProps) {
        super(props);

        const NUM_EXTRA_GESTALTS_TO_GEN:number=500000

        let initState: StoreState = {
            focusedInstanceId: undefined, //undefined lets the search/add box steal the focus on load
            // filter: "",
            hashtags: Immutable.OrderedSet<string>(),
            allGestaltInstances: Immutable.Map<string, GestaltInstance>(),
            allGestalts: Immutable.Map<string, Gestalt>({
                '0id': {
                    gestaltId: '0id',
                    text: 'hack with jacob! #todo',
                    relatedIds: [],
                },
                '1id': {
                    gestaltId: '1id',
                    text: 'build ideaflow!  #todo',
                    relatedIds: ['2id', '0id'],

                },
                '2id': {
                    gestaltId: '2id',
                    text: 'bring peace to world! #goal',
                    relatedIds: ['1id'],

                },
            })
        }

        if (!initState.allGestalts || !initState.allGestaltInstances) {
            throw Error('All gestalts or other attribute is undefined')
        }

        //create root instance
        let rootGestaltInstance: GestaltInstance =
            Store._CreateGestaltInstance(undefined, true, initState.allGestalts)

        initState.rootGestaltInstanceId = rootGestaltInstance.instanceId

        initState.allGestaltInstances = initState.allGestaltInstances
            .set(rootGestaltInstance.instanceId, rootGestaltInstance)


        //add manually added gestalts in initState to allGestaltInstances and as children to root

        //mutables for the foreach #tricky -- forEach doesn't work with immutables because function saves initial value of initState.allGestaltInstances instead of changing it iteratively
        const childInstanceIdsToAdd: string[] = []
        const gestaltInstancesToAddMap: { [id: string]: GestaltInstance } = {}
        initState.allGestalts.forEach((g: Gestalt) => {
            const newInst = Store._CreateGestaltInstance(g.gestaltId)
            gestaltInstancesToAddMap[newInst.instanceId] = newInst
            childInstanceIdsToAdd.push(newInst.instanceId)
        })

        //add to global instances registry
        initState.allGestaltInstances = initState.allGestaltInstances
            .merge(Immutable.Map(gestaltInstancesToAddMap))

        //add as children of root
        initState.allGestaltInstances = initState.allGestaltInstances
            .set(rootGestaltInstance.instanceId,
            Store._InsertChildInstanceIds(rootGestaltInstance, childInstanceIdsToAdd))



        //finish populating allGestalts
        const generatedGestalts: string[] = []
        for (let i = 0; i < NUM_EXTRA_GESTALTS_TO_GEN; i++) {
            const newGestaltTxt = Math.random() + ''
            generatedGestalts.push(newGestaltTxt)
        }
        initState = { ...initState, ...Store._AddGestalts(initState, generatedGestalts) }

        if (!initState.allGestalts || !initState.allGestaltInstances || !initState.rootGestaltInstanceId) {
            throw Error('All gestalts or other attribute is undefined')
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



        rootGestaltInstance = initState.allGestaltInstances.get(initState.rootGestaltInstanceId)


        // if (!initState.allGestaltInstances || !initState.rootGestaltInstanceId) { throw Error() }
        // if (!rootGestaltInstance || !rootGestaltInstance.childrenInstanceIds) { throw Error() }
        //load rootChildrenHeights from gestalts
        // initState.rootChildrenHeights = rootGestaltInstance.childrenInstanceIds.map(
        //     iId => {
        //         if (!initState.allGestalts || !initState.allGestaltInstances) {
        //             throw Error('All gestalts or other attributes are undefined')
        //         }
        //         const gi: GestaltInstance = initState.allGestaltInstances.get(iId)
        //         if (!gi.gestaltId) { throw Error("root") }

        //         let g: Gestalt = initState.allGestalts.get(gi.gestaltId)
        //         if (typeof g.gestaltHeight === "undefined") {
        //             g = {
        //                 ...g,
        //                 gestaltHeight: Util.computeGestaltHeight(g.text)
        //             }
        //         }
        //         if (typeof g.gestaltHeight === "undefined") { throw Error() }
        //         return g.gestaltHeight
        //     })

        //confirm only one root node, ie g.gestaltId === undefined
        console.assert(
            initState.allGestaltInstances.filter((g: GestaltInstance) => g.gestaltId === undefined).size === 1,
            initState.allGestaltInstances.filter((g: GestaltInstance) => g.gestaltId === undefined).toJS(),
            initState.allGestaltInstances.toJS())

        this.state = initState


    }

    //#tt
    // getRootChildrenHeights(rootInstance: GestaltInstance, state: StoreState = this.state, filter: string = this.props.filter): number[] {
    //     return (state.allGestaltInstances.get(state.rootGestaltInstanceId)
    //         .childrenInstanceIds.map(
    //         iId => {
    //             const g = state.allGestalts.get(state.allGestaltInstances.get(iId).gestaltId)
    //             if (typeof g.gestaltHeight === "undefined")
    //                 g.gestaltHeight = Util.computeGestaltHeight(g.text)

    //             return g.gestaltHeight
    //         }
    //         )
    //     )
    // }


    componentDidMount() {

        //unneeded?
        // setTimeout(
        //     () => this.setState((prevState)=>{ return { hashtags: Util.computeHashtagsFromAllGestalts(this.state.allGestalts) }}), 0)


        this.setState((prevState) => {
            if (!prevState.allGestalts) { throw Error() }
            return {
                hashtags: Util.computeHashtagsFromGestaltsMap(prevState.allGestalts)
            }
        })
    }

    private static _CreateGestalt = (text: string = '') => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: [],
        }

        return newGestalt
    }

    // #REDUCER
    // Mutates state
    addGestalt = (text: string, parentInstanceId?: string, instanceOffset?: number, shouldFocus?: boolean): void => {
        const splitTexts: string[] = text.split("\n\n")
        let textsToAdd: string[]

        if (splitTexts.length > 1 && window.confirm("Split by double linebreak?")) {
            textsToAdd = splitTexts
        }
        else
            textsToAdd = [text]

        this.setState((prevState) => {
            return {
                ...prevState,
                ...Store._AddGestalts(prevState, textsToAdd, parentInstanceId, instanceOffset, shouldFocus ? 0 : undefined)
            }
        })
    }

    //#REDUCER
    // default value for parentInstanceId is this.state.rootGestaltInstanceId
    // shouldFocusIdx has no default
    //returns new partial StoreState
    private static _AddGestalts = (state: StoreState, texts: string[], parentInstanceId?: string, instanceOffset: number = 0, shouldFocusIdx?: number): StoreState => {
        if (typeof parentInstanceId === "undefined") {
            if (!state.rootGestaltInstanceId) {
                throw Error()
            }
            parentInstanceId = state.rootGestaltInstanceId
        }
        if (parentInstanceId === state.rootGestaltInstanceId) {
            console.log("adding at root")
        }
        else  //#TODO
        {
            throw Error("ERR: can only add at root for now")
        }

        if (!state.allGestaltInstances || !state.allGestalts || !state.hashtags) {
            throw Error()
        }

        const newGestalts: Gestalt[] = texts.map(text => Store._CreateGestalt(text))
        const newInstances: GestaltInstance[] = newGestalts.map(g => Store._CreateGestaltInstance(g.gestaltId))

        const updatedParentGestaltInstance: GestaltInstance = Store._InsertChildInstanceIds(
            state.allGestaltInstances.get(parentInstanceId),
            newInstances.map(nI => nI.instanceId),
            instanceOffset
        )

        // else
        //     this.addRelation(parentGestaltInstance.gestaltId, newGestalts.gestaltId) //#todo

        // rootGestaltInstance
        // newRootGestaltInstance.childrenInstanceIds =
        // rootGestaltInstance.childrenInstanceIds.concat(newInstance.instanceId)
        // this.insertGestaltInstanceIntoParent(rootGestaltInstance, newInstance, offset)

        const newAllGestalts: GestaltsMap = state.allGestalts.merge(
            Immutable.Map(_.keyBy(newGestalts, g => g.gestaltId))
        )

        const newAllGestaltInstances: GestaltInstancesMap =
            state.allGestaltInstances.merge(
                Immutable.Map({
                    ...(_.keyBy(newInstances, i => i.instanceId)),
                    [updatedParentGestaltInstance.instanceId]: updatedParentGestaltInstance
                })
            )

        return {
            allGestaltInstances: newAllGestaltInstances,
            allGestalts: newAllGestalts,
            focusedInstanceId: shouldFocusIdx !== undefined ? newInstances[shouldFocusIdx].instanceId : undefined,
            hashtags: state.hashtags.merge(Immutable.Set(Util.computeHashtagsFromGestaltsArray(newGestalts)))
        }
    }

    //#IMMUTABLE
    // allGestalts is this.state.allGestalts by default. gestaltId = undefined if root
    //afterwards add newly created instance to registry
    private static _CreateGestaltInstance = (gestaltId: string | undefined, expanded: boolean = true, allGestalts?: GestaltsMap): GestaltInstance => {

        const newInstanceId: string = Util.genGUID()

        let newGestaltInstance: GestaltInstance = {
            instanceId: newInstanceId,
            gestaltId: gestaltId,
            childrenInstanceIds: (expanded ? [] : null) as string[],
            expanded: expanded
        }

        return newGestaltInstance
    }

    //#IMMUTABLE, returns new entries to add to allGestaltInstances
    // private _expandGestaltInstance = (gi: GestaltInstance, allGestalts: GestaltsMap, allGestaltInstances: GestaltInstancesMap): GestaltInstancesMap => {
    //     let giOut: GestaltInstance = { ...gi, expanded: true }

    //     console.assert(typeof giOut.childrenInstanceIds !== "undefined")

    //     let newInsts: { [instanceId: string]: GestaltInstance } = {}

    //     let gestaltIdsToInstantiate: ReadonlyArray<string>

    //     //is root
    //     if (gi.gestaltId === undefined) {
    //         gestaltIdsToInstantiate = allGestalts.valueSeq().map((g: Gestalt) => g.gestaltId).toJS()
    //         // allGestalts.valueSeq().sortBy(g => g.dateCreated).map((g: Gestalt) => g.gestaltId).toJS()

    //     }
    //     //nonrooot instance
    //     else {
    //         const gestalt: Gestalt = allGestalts.get(gi.gestaltId);
    //         console.assert(typeof gestalt !== "undefined")

    //         gestaltIdsToInstantiate = gestalt.relatedIds

    //     }

    //     console.assert(typeof gestaltIdsToInstantiate !== undefined);

    //     giOut = {
    //         ...giOut,
    //         childrenInstanceIds: gestaltIdsToInstantiate.map(id => {
    //             const newInst: GestaltInstance = Store._CreateGestaltInstance(id, false, allGestalts)
    //             newInsts[newInst.instanceId] = newInst
    //             return newInst.instanceId
    //         })
    //     }
    // }

    // newInsts[giOut.instanceId] = giOut

    //     return newInsts
    // }

    //#REDUCER
    addRelation = (srcGestaltId: string, tgtGestaltId: string, expandAndFocusInstanceId?: string) => {
        if (!this.state.allGestalts || !this.state.allGestaltInstances || !this.state.rootGestaltInstanceId) { throw Error() }
        //can't relate to root gestalt -- #todo refactor and remove root gestalt
        console.assert(srcGestaltId
            !== this.state.allGestaltInstances.get(this.state.rootGestaltInstanceId).gestaltId)

        //add rel to gestalt
        const srcGestalt: Gestalt = this.state.allGestalts.get(srcGestaltId);
        if (!srcGestalt.relatedIds) { throw Error('no relatedIds -- this should only be case on rootGestalt?') }

        let newSrcGestalt: Gestalt = _.assign({}, srcGestalt)

        //if not already there, add new relation
        if (!_.find(srcGestalt.relatedIds, (id: string) => id === tgtGestaltId)) {
            newSrcGestalt = _.assign({}, newSrcGestalt,
                { relatedIds: srcGestalt.relatedIds.concat(tgtGestaltId) });
        }
        else {
            console.warn("Gestalt already related", srcGestaltId, tgtGestaltId)
        }

        //add new GestaltInstances to all relevant existing GestaltInstances
        // const instancesOfNewlyRelatedGestaltsAndTheirNubs: GestaltInstancesMap = {};
        // const relevantInstanceIdsToNewInstances: { [relevantInstanceId: string]: GestaltInstance } = {};

        // for (const currGestaltInstance of _.values(this.state.allGestaltInstances)) {
        //     if (currGestaltInstance.gestaltId === srcGestaltId && currGestaltInstance.childrenInstanceIds !== null) { // find relevant gestalt instances, determine it isn't a nub w null children
        //         const currInstanceId = currGestaltInstance.instanceId;
        //         const shouldExpand = currInstanceId === expandAndFocusInstanceId;
        //         let instanceOfNewlyRelatedGestalt = this.createGestaltInstance(tgtGestaltId, shouldExpand);

        //         if (shouldExpand) {
        //             const newInstanceAndNubs: GestaltInstancesMap = this.expandGestaltInstance(instanceOfNewlyRelatedGestalt, this.state.allGestalts, this.state.allGestaltInstances);
        //             instanceOfNewlyRelatedGestalt = newInstanceAndNubs[instanceOfNewlyRelatedGestalt.instanceId];
        //             _.assign(instancesOfNewlyRelatedGestaltsAndTheirNubs, newInstanceAndNubs)
        //         }
        //         instancesOfNewlyRelatedGestaltsAndTheirNubs[instanceOfNewlyRelatedGestalt.instanceId] = instanceOfNewlyRelatedGestalt;
        //         relevantInstanceIdsToNewInstances[currGestaltInstance.instanceId] = instanceOfNewlyRelatedGestalt;
        //     }
        // }

        // const newAllGestaltInstances: GestaltInstancesMap = _.assign(
        //     {},
        //     instancesOfNewlyRelatedGestaltsAndTheirNubs,
        //     _.mapValues(this.state.allGestaltInstances, (currGestaltInstance) => {
        //         if (currGestaltInstance.gestaltId === srcGestaltId && currGestaltInstance.childrenInstanceIds !== null) { // if relevant gestalt instance; it isn't a nub w null children
        //             const relevantInstanceId = currGestaltInstance.instanceId;
        //             const newlyRelatedInstanceId = relevantInstanceIdsToNewInstances[relevantInstanceId].instanceId;
        //             return this.insertChildInstances(currGestaltInstance, newlyRelatedInstanceId);
        //         } else {
        //             return currGestaltInstance;
        //         }
        //     })
        // );

        this.setState((prevState) => {
            if (!prevState.allGestalts) { throw Error() }
            return {
                // allGestaltInstances: newAllGestaltInstances,
                allGestalts: prevState.allGestalts.set(srcGestaltId, newSrcGestalt)
                // {
                //     ...this.state.allGestalts,
                //     [srcGestaltId]: newSrcGestalt // replace srcGestaltId
                // },
            }
        });
    }



    // futureParentGestalt = {
    //         ...futureParentGestalt,
    //         relatedIds: futureParentGestalt.relatedIds.concat(childInstance.gestaltId)
    //     }

    // return
    // }

    // #immutable returns updated parentGestaltInstance
    //if no offset, append
    private static _InsertChildInstanceIds = (parentGestaltInstance: GestaltInstance, instanceIds: string[], offset?: number): GestaltInstance => {
        console.assert(
            parentGestaltInstance.childrenInstanceIds !== null,
            'trying to insert child into nub instance',
            parentGestaltInstance
        )
        if (!parentGestaltInstance.childrenInstanceIds) { throw Error('trying to insert child into nub instance') }

        if (typeof offset === "undefined")
            offset = parentGestaltInstance.childrenInstanceIds.length

        const newChildrenInstanceIds = parentGestaltInstance.childrenInstanceIds.slice(0,offset)
            .concat(instanceIds)
            .concat(parentGestaltInstance.childrenInstanceIds.slice(offset+instanceIds.length))

            //below leads to call stack size exceeded error with 200k instanceIds
            // Util.immSplice(parentGestaltInstance.childrenInstanceIds, offset, 0, ...instanceIds)

        return {
            ...parentGestaltInstance,
            childrenInstanceIds: newChildrenInstanceIds
        }
    }

    // #immutable
    // private static removeChildInstance = (parentGestaltInstance: GestaltInstance, offset: number): GestaltInstance => {
    //     return {
    //         ...parentGestaltInstance,
    //         childrenInstanceIds: Util.immSplice(parentGestaltInstance.childrenInstanceIds, offset, 1)
    //     }
    // }


    // commitIndentChild = (parentInstanceId: string, childIndex: number, dedent: boolean = false) => {
    //     //add child's gestaltId as relatedId to new parent gestalt
    //     //remove child's gestaltId as relatedId from old parent gestalt
    //     //add child's gestaltInstanceId as a childs instance id to new parent's gestalt instance
    //     //remove child's gestaltInstanceId as a childs instance id from old parent's gestalt instance

    //     let parentGestaltInstance: GestaltInstance = this.state.allGestaltInstances[parentInstanceId]
    //     let parentGestalt: Gestalt = this.state.allGestalts[parentGestaltInstance.gestaltId]

    //     console.assert(parentGestalt.gestaltId === parentGestaltInstance.gestaltId)

    //     const instanceIdListInWhichChildLies: string[] = parentGestaltInstance.childrenInstanceIds
    //     const childInstanceId: string = instanceIdListInWhichChildLies[childIndex]
    //     const childInstance: GestaltInstance = this.state.allGestaltInstances[childInstanceId]

    //     let futureParentGestalt: Gestalt
    //     let futureParentInstance: GestaltInstance

    //     if (childIndex - 1 < 0)
    //         return

    //     const futureParentInstanceId = instanceIdListInWhichChildLies[childIndex - 1]

    //     if (!dedent) {
    //         futureParentInstance = this.state.allGestaltInstances[futureParentInstanceId];
    //         this.addRelation(futureParentInstance.gestaltId, childInstance.gestaltId, futureParentInstanceId);
    //     } else {

    //     }

    //     //delete old relation
    //     // parentGestalt = {
    //     //     ...parentGestalt,
    //     //     relatedIds: _.without(parentGestalt.relatedIds, childInstance.gestaltId)
    //     // }

    //     // //delete from old list
    //     // parentGestaltInstance = {
    //     //     ...parentGestaltInstance,
    //     //     childrenInstanceIds: Util.immSplice(parentGestaltInstance.childrenInstanceIds, childIndex, 1)
    //     // }



    //     // this.setState((prevState)=>{ return {
    //     //     allGestaltInstances: {
    //     //         ...this.state.allGestaltInstances,
    //     //         [parentInstanceId]: parentGestaltInstance,
    //     //         [futureParentInstance.instanceId]: futureParentInstance
    //     //     },
    //     //     allGestalts: {
    //     //         ...this.state.allGestalts,
    //     //         [futureParentGestalt.gestaltId]: futureParentGestalt
    //     //     },
    //     // }})
    // }

    //#REDUCER
    toggleExpand = (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance): void => {

        if (!this.state.allGestaltInstances || !this.state.allGestalts) { throw Error() }

        const existingChildIdIndex: number = _.findIndex(parentGestaltInstance.childrenInstanceIds,
            childId => {
                if (!this.state.allGestaltInstances) { throw Error() }
                return this.state.allGestaltInstances.get(childId).gestaltId == gestaltToExpandId
            })

        let nextChildrenInstanceIds: string[]
        let instance: GestaltInstance
        debugger
        //not found, then create new expanded gestalt instance
        if (existingChildIdIndex === -1) {
            instance = Store._CreateGestaltInstance(gestaltToExpandId, true, this.state.allGestalts)
            nextChildrenInstanceIds = [instance.instanceId]
                .concat(parentGestaltInstance.childrenInstanceIds as string[])

            //add newly created instance to registry
            this.setState((prevState) => {
                if (!prevState.allGestaltInstances) { throw Error() }
                return {
                    allGestaltInstances: prevState.allGestaltInstances
                        .set(instance.instanceId, instance)
                }
            })
        }
        else { //else toggle expanded on found one
            const instanceId = parentGestaltInstance.childrenInstanceIds[existingChildIdIndex]
            instance = this.state.allGestaltInstances.get(instanceId)
            instance = { ...instance, expanded: !instance.expanded }

            this.setState((prevState) => {
                if (!prevState.allGestaltInstances) { throw Error() }
                return {
                    allGestaltInstances: prevState.allGestaltInstances
                        .set(instance.instanceId, instance)
                }
            })

            //move to beginning of array
            nextChildrenInstanceIds = Util.immSplice(parentGestaltInstance.childrenInstanceIds, existingChildIdIndex, 1)
            nextChildrenInstanceIds.unshift(instance.instanceId)

        }

        this.setState((prevState: StoreState) => {
            if (!prevState.allGestaltInstances) { throw Error() }
            return {
                allGestaltInstances: prevState.allGestaltInstances
                    .set(parentGestaltInstance.instanceId,
                    {
                        ...prevState.allGestaltInstances.get(parentGestaltInstance.instanceId),
                        childrenInstanceIds: nextChildrenInstanceIds
                    })
            }
        })

    }

    //#REDUCER
    updateGestaltText = (id: string, newText: string) => {
        const timeInd = this.updateTimes.push(Date.now()) - 1
        if (!this.state.allGestaltInstances || !this.state.allGestalts) { throw Error() }

        // TODO: recompute gestalt.textHeight
        const updatedGestalt: Gestalt = {
            ...this.state.allGestalts.get(id),
            text: newText,
            gestaltHeight: Util.computeGestaltHeight(newText)
        }

        const updatedAllGestalts: GestaltsMap = this.state.allGestalts.merge(Immutable.Map({ [updatedGestalt.gestaltId]: updatedGestalt }))

        // this.state.hashtags.merge(
        //                 Util.computeHashtagsFromGestaltsMap(Immutable.Map(_.keyBy(newGestalts, g => g.gestaltId)))

        window.clearTimeout(this.hashtagTimeout)
        this.setState((prevState) => {
            return {
                allGestalts: updatedAllGestalts,
                // hashtags: this.state.hashtags.merge(
                //     Util.computeHashtagsFromGestaltsArray([updatedGestalt])
                // )
            }
        },
            () => {
                if (!this.state.allGestaltInstances || !this.state.allGestalts) { throw Error() }
                //only update hashtags if you wait for half a second
                this.hashtagTimeout = window.setTimeout(
                    () => this.state.allGestalts && this.setState((prevState) => {
                        if (!prevState.allGestalts) { throw Error() }
                        return {
                            hashtags:
                            Util.computeHashtagsFromGestaltsMap(prevState.allGestalts)
                        }
                    }), 500)

                this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
                if (this.updateTimes.length % 10 == 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
            })
    }

    //#REDUCER
    gestaltComponentOnBlur = (instanceId: string): void => {
        if (this.state.focusedInstanceId === instanceId) {
            this.setState((prevState) => { return { focusedInstanceId: undefined } })
        }
    }



    //#REDUCER
    // setFilter = (text: string): void => {
    //     this.setState((prevState)=>{ return { filter: text }})
    // }

    render() {
        if (!this.state.allGestaltInstances || !this.state.allGestalts || !this.state.rootGestaltInstanceId || !this.state.hashtags) { throw Error() }
        return (
            <ListView
                allGestalts={this.state.allGestalts}
                allGestaltInstances={this.state.allGestaltInstances}
                rootGestaltInstanceId={this.state.rootGestaltInstanceId}

                // filter={this.state.filter}
                // setFilter={this.setFilter}


                focusedInstanceId={this.state.focusedInstanceId}

                hashtags={this.state.hashtags}
                // rootChildrenHeights={this.state.rootChildrenHeights}

                gestaltComponentOnBlur={this.gestaltComponentOnBlur}
                updateGestaltText={this.updateGestaltText}

                toggleExpand={this.toggleExpand}
                addGestalt={this.addGestalt}

                />
        )
    }
}
