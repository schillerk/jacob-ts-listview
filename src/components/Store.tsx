import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";

import { GestaltComponent } from './GestaltComponent'
import { SearchAddBox } from './SearchAddBox'
import { HashtagsBox } from './HashtagsBox'
import { ListView } from './ListView'

import { Gestalt, GestaltsMap, GestaltInstancesMap, GestaltInstance, HydratedGestaltInstance } from '../domain';
import * as Util from '../util';

import * as Immutable from 'immutable'
// import * as ImmutableDiff from 'immutablediff'
// var ImmutableDiff: any = require("immutablediff");

export interface StoreState {
    allGestalts?: GestaltsMap
    allGestaltInstances?: GestaltInstancesMap
    rootGestaltInstanceId?: string
    focusedInstanceId?: string
    hashtags?: Immutable.OrderedSet<string>
    rootChildrenHeights?: number[]
}

export interface StoreProps extends React.Props<Store> {

}


export class Store extends React.Component<StoreProps, StoreState> {
    updateTimes: number[] = []
    hashtagTimeout: number


    constructor(props: StoreProps) {
        super(props);

        const initState: StoreState = {
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

        const rootGestalt: Gestalt = Store._createGestalt("root text", true)
        initState.allGestalts = initState.allGestalts.set(rootGestalt.gestaltId, rootGestalt)

        let rootGestaltInstance: GestaltInstance =
            this._createGestaltInstance(rootGestalt.gestaltId, false, initState.allGestalts)

        // rootGestaltInstance.childrenInstanceIds === null at this point
        // rootGestalt.relatedIds === null always

        initState.rootGestaltInstanceId = rootGestaltInstance.instanceId

        initState.allGestaltInstances = initState.allGestaltInstances.set(
            rootGestaltInstance.instanceId, rootGestaltInstance)




        //finish populating allGestalts
        const generatedGestalts: { [id: string]: Gestalt } = {}
        for (let i = 0; i < 3; i++) {
            const newGestalt = Store._createGestalt(Math.random() + '')
            generatedGestalts[newGestalt.gestaltId] = newGestalt
        }

        initState.allGestalts = initState.allGestalts.merge(Immutable.Map(generatedGestalts))
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

        initState.allGestaltInstances = initState.allGestaltInstances.merge(
            Immutable.Map(this._expandGestaltInstance(
                rootGestaltInstance,
                initState.allGestalts,
                initState.allGestaltInstances
            ))
        )

        rootGestaltInstance = initState.allGestaltInstances.get(initState.rootGestaltInstanceId)

        if (!rootGestaltInstance.childrenInstanceIds) { throw Error() }

        rootGestaltInstance.childrenInstanceIds
            .forEach((iId: string) => {
                if (!initState.allGestalts || !initState.allGestaltInstances) {
                    throw Error('All gestalts or other attributes are undefined')
                }
                initState.allGestaltInstances = initState.allGestaltInstances.merge(Immutable.Map(
                    this._expandGestaltInstance(initState.allGestaltInstances.get(iId),
                        initState.allGestalts,
                        initState.allGestaltInstances
                    )
                ))
            }
            )

        if (!initState.allGestaltInstances || !initState.rootGestaltInstanceId) { throw Error() }
        if (!rootGestaltInstance || !rootGestaltInstance.childrenInstanceIds) {throw Error()}
        //load rootChildrenHeights from gestalts
        initState.rootChildrenHeights = rootGestaltInstance.childrenInstanceIds.map(
                iId => {
                    if (!initState.allGestalts || !initState.allGestaltInstances) {
                        throw Error('All gestalts or other attributes are undefined')
                    }
                    let g:Gestalt = initState.allGestalts.get(initState.allGestaltInstances.get(iId).gestaltId)
                    if (typeof g.gestaltHeight === "undefined") {
                        g = {
                            ...g,
                            gestaltHeight: Util.computeGestaltHeight(g.text)
                        }
                    }
                    if (typeof g.gestaltHeight === "undefined") { throw Error() }
                    return g.gestaltHeight
                })

        console.assert(
            initState.allGestaltInstances.filter((g: GestaltInstance) => g.gestaltId == 'UNIQUE_ID_1').size === 1,
            initState.allGestaltInstances.filter((g: GestaltInstance) => g.gestaltId == 'UNIQUE_ID_1').toJS())

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
        //     () => this.setState({ hashtags: Util.computeHashtagsFromAllGestalts(this.state.allGestalts) }), 0)


        if (!this.state.allGestalts) {
          throw Error()
        }
        this.setState({
            hashtags: Util.computeHashtagsFromGestaltsMap(this.state.allGestalts)
        })
    }

    private static _createGestalt = (text: string = '', isRoot?: boolean) => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: isRoot !== undefined && isRoot ? undefined : [],
            isRoot: isRoot !== undefined && isRoot
        }

        return newGestalt
    }

    //#REDUCER
    // Mutates state
    addGestalt = (text: string, offset?: number, parentInstanceId?: string, shouldFocus?: boolean): void => {
        const splitTexts: string[] = text.split("\n\n")
        let textsToAdd: string[]

        if (splitTexts.length > 1 && window.confirm("Split by double linebreak?")) {
            textsToAdd = splitTexts
        }
        else
            textsToAdd = [text]

        this._addGestalts(textsToAdd, offset, parentInstanceId, shouldFocus ? 0 : undefined)
    }

    //#REDUCER
    // default value for parentInstanceId is this.state.rootGestaltInstanceId
    // shouldFocusIdx has no default
    private _addGestalts = (texts: string[], offset: number = 0, parentInstanceId?: string, shouldFocusIdx?: number): void => {
        if (typeof parentInstanceId === "undefined") {
            if (!this.state.rootGestaltInstanceId) {
                throw Error()
            }
            parentInstanceId = this.state.rootGestaltInstanceId
        }
        if (parentInstanceId === this.state.rootGestaltInstanceId)
            console.log("adding at root")
        else  //#TODO
        {
            console.error("ERR: can only add at root for now")
            return
        }

        if (!this.state.allGestaltInstances || !this.state.allGestalts || !this.state.hashtags) {
            throw Error()
        }

        const newGestalts: Gestalt[] = texts.map(text => Store._createGestalt(text))
        const newInstances: GestaltInstance[] = newGestalts.map(g => this._createGestaltInstance(g.gestaltId))

        const updatedParentGestaltInstance: GestaltInstance = Store._insertChildInstances(
            this.state.allGestaltInstances.get(parentInstanceId),
            newInstances.map(nI => nI.instanceId),
            offset
        )

        // else
        //     this.addRelation(parentGestaltInstance.gestaltId, newGestalts.gestaltId) //#todo

        // rootGestaltInstance
        // newRootGestaltInstance.childrenInstanceIds =
        // rootGestaltInstance.childrenInstanceIds.concat(newInstance.instanceId)
        // this.insertGestaltInstanceIntoParent(rootGestaltInstance, newInstance, offset)

        const newAllGestalts: GestaltsMap = this.state.allGestalts.merge(
            Immutable.Map(_.keyBy(newGestalts, g => g.gestaltId))
        )

        const newAllGestaltInstances: GestaltInstancesMap =
            this.state.allGestaltInstances.merge(
                Immutable.Map({
                    ...(_.keyBy(newInstances, i => i.instanceId)),
                    [updatedParentGestaltInstance.instanceId]: updatedParentGestaltInstance
                })
            )

        this.setState({
            allGestaltInstances: newAllGestaltInstances,
            allGestalts: newAllGestalts,
            focusedInstanceId: shouldFocusIdx !== undefined ? newInstances[shouldFocusIdx].instanceId : undefined,
            hashtags: this.state.hashtags.merge(Immutable.Set(Util.computeHashtagsFromGestaltsArray(newGestalts)))
        })
    }

    //#IMMUTABLE
    // allGestalts is this.state.allGestalts by default
    private _createGestaltInstance = (gestaltId: string, expanded: boolean = true, allGestalts?: GestaltsMap): GestaltInstance => {
        if (!allGestalts) {
            allGestalts = this.state.allGestalts
        }
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
    private _expandGestaltInstance = (gi: GestaltInstance, allGestalts: GestaltsMap, allGestaltInstances: GestaltInstancesMap): { [instanceId: string]: GestaltInstance } => {
        const gestalt: Gestalt = allGestalts.get(gi.gestaltId);
        let giOut: GestaltInstance = { ...gi, expanded: true }

        console.assert(typeof giOut.childrenInstanceIds !== "undefined")
        console.assert(typeof gestalt !== "undefined")

        let newInsts: { [instanceId: string]: GestaltInstance } = {}

        if (giOut.childrenInstanceIds === null) {

            let gestaltIdsToInstantiate: string[] =
                gestalt.isRoot
                    ?
                    allGestalts
                        .valueSeq().filter((g: Gestalt) => !g.isRoot)
                        .map((g: Gestalt) => g.gestaltId).toJS()

                    :
                    gestalt.relatedIds;


            console.assert(typeof gestaltIdsToInstantiate !== undefined);
            giOut = {
                ...giOut,
                childrenInstanceIds: gestaltIdsToInstantiate.map(id => {
                    const newInst: GestaltInstance = this._createGestaltInstance(id, false, allGestalts)
                    newInsts[newInst.instanceId] = newInst
                    return newInst.instanceId
                })
            }
        }

        newInsts[giOut.instanceId] = giOut

        return newInsts
    }

    //MUTATOR
    // addRelation = (srcGestaltId: string, tgtGestaltId: string, expandInstanceId: string = undefined) => {
    //     //add rel to gestalt
    //     const srcGestalt: Gestalt = this.state.allGestalts[srcGestaltId];
    //     const newSrcGestalt: Gestalt = _.assign({}, srcGestalt)
    //     if (_.find(srcGestalt.relatedIds, (id) => this.state.allGestalts[id].gestaltId === tgtGestaltId))
    //         _.assign(newSrcGestalt,
    //             { relatedIds: srcGestalt.relatedIds.concat(tgtGestaltId) });

    //     //add new GestaltInstances to all relevant existing GestaltInstances

    //     const instancesOfNewlyRelatedGestaltsAndTheirNubs: GestaltInstancesMap = {};
    //     const relevantInstanceIdsToNewInstances: { [relevantInstanceId: string]: GestaltInstance } = {};

    //     for (const currGestaltInstance of _.values(this.state.allGestaltInstances)) {
    //         if (currGestaltInstance.gestaltId === srcGestaltId && currGestaltInstance.childrenInstanceIds !== null) { // find relevant gestalt instances, determine it isn't a nub w null children
    //             const currInstanceId = currGestaltInstance.instanceId;
    //             const shouldExpand = currInstanceId === expandInstanceId;
    //             let instanceOfNewlyRelatedGestalt = this.createGestaltInstance(tgtGestaltId, shouldExpand);

    //             if (shouldExpand) {
    //                 const newInstanceAndNubs: GestaltInstancesMap = this.expandGestaltInstance(instanceOfNewlyRelatedGestalt, this.state.allGestalts, this.state.allGestaltInstances);
    //                 instanceOfNewlyRelatedGestalt = newInstanceAndNubs[instanceOfNewlyRelatedGestalt.instanceId];
    //                 _.assign(instancesOfNewlyRelatedGestaltsAndTheirNubs, newInstanceAndNubs)
    //             }
    //             instancesOfNewlyRelatedGestaltsAndTheirNubs[instanceOfNewlyRelatedGestalt.instanceId] = instanceOfNewlyRelatedGestalt;
    //             relevantInstanceIdsToNewInstances[currGestaltInstance.instanceId] = instanceOfNewlyRelatedGestalt;
    //         }
    //     }

    //     const newAllGestaltInstances: GestaltInstancesMap = _.assign(
    //         {},
    //         instancesOfNewlyRelatedGestaltsAndTheirNubs,
    //         _.mapValues(this.state.allGestaltInstances, (currGestaltInstance) => {
    //             if (currGestaltInstance.gestaltId === srcGestaltId && currGestaltInstance.childrenInstanceIds !== null) { // if relevant gestalt instance; it isn't a nub w null children
    //                 const relevantInstanceId = currGestaltInstance.instanceId;
    //                 const newlyRelatedInstanceId = relevantInstanceIdsToNewInstances[relevantInstanceId].instanceId;
    //                 return this.insertChildInstances(currGestaltInstance, newlyRelatedInstanceId);
    //             } else {
    //                 return currGestaltInstance;
    //             }
    //         })
    //     );

    //     this.setState({
    //         allGestaltInstances: newAllGestaltInstances,
    //         allGestalts: {
    //             ...this.state.allGestalts,
    //             [srcGestaltId]: newSrcGestalt // replace srcGestaltId
    //         },
    //     });
    // }



    // futureParentGestalt = {
    //         ...futureParentGestalt,
    //         relatedIds: futureParentGestalt.relatedIds.concat(childInstance.gestaltId)
    //     }

    // return
    // }

    // #immutable
    //if no offset, append
    private static _insertChildInstances = (parentGestaltInstance: GestaltInstance, instanceIds: string[], offset?: number): GestaltInstance => {
        console.assert(
            parentGestaltInstance.childrenInstanceIds !== null,
            'trying to insert child into nub instance',
            parentGestaltInstance
        )
        if (!parentGestaltInstance.childrenInstanceIds) { throw Error('trying to insert child into nub instance') }

        if (typeof offset === "undefined")
            offset = parentGestaltInstance.childrenInstanceIds.length

        const newChildrenInstanceIds =
            Util.immSplice(parentGestaltInstance.childrenInstanceIds, offset, 0, ...instanceIds)

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



    //     // this.setState({
    //     //     allGestaltInstances: {
    //     //         ...this.state.allGestaltInstances,
    //     //         [parentInstanceId]: parentGestaltInstance,
    //     //         [futureParentInstance.instanceId]: futureParentInstance
    //     //     },
    //     //     allGestalts: {
    //     //         ...this.state.allGestalts,
    //     //         [futureParentGestalt.gestaltId]: futureParentGestalt
    //     //     },
    //     // })
    // }

    //#REDUCER
    toggleExpand = (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance): void => {
        // NOTE: need to deal with recursive copying of the gestaltInstances object
        //  ^^ should work similarly to findGestaltInstance

        if (!parentGestaltInstance.childrenInstanceIds) { throw Error() }

        const existingChildIdIndex: number = _.findIndex(parentGestaltInstance.childrenInstanceIds,
            childId => {
                if (!this.state.allGestaltInstances) {throw Error()}
                return this.state.allGestaltInstances.get(childId).gestaltId == gestaltToExpandId
            })

        if (!this.state.allGestaltInstances || !this.state.allGestalts) {throw Error()}
        console.assert(existingChildIdIndex !== -1, "child should always be found with current architecture")

        const existingChildInstanceId: string = parentGestaltInstance.childrenInstanceIds[existingChildIdIndex]
        const existingChildInstance: GestaltInstance = this.state.allGestaltInstances.get(existingChildInstanceId)

        let instsToAdd: GestaltInstancesMap

        if (existingChildInstance.expanded) //present and expanded
            instsToAdd = Immutable.Map({ [existingChildInstanceId]: { ...existingChildInstance, expanded: false } })
        // this.collapseGestaltInstance(parentGestaltInstance.children, existingChildIndex)
        else //present and collapsed
        {
            //#TODO move to front of array when expanding and deepFixGestaltInstanceIds?
            instsToAdd = Immutable.Map(this._expandGestaltInstance(existingChildInstance, this.state.allGestalts, this.state.allGestaltInstances))

        }


        this.setState({
            allGestaltInstances: this.state.allGestaltInstances.merge(Immutable.Map(instsToAdd))
        })

    }

    //#REDUCER
    updateGestaltText = (id: string, newText: string) => {
        const timeInd = this.updateTimes.push(Date.now()) - 1
        if (!this.state.allGestaltInstances || !this.state.allGestalts) {throw Error()}

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
        this.setState(
            {
                allGestalts: updatedAllGestalts,
                // hashtags: this.state.hashtags.merge(
                //     Util.computeHashtagsFromGestaltsArray([updatedGestalt])
                // )
            },
            () => {
                if (!this.state.allGestaltInstances || !this.state.allGestalts) {throw Error()}
                //only update hashtags if you wait for half a second
                this.hashtagTimeout = window.setTimeout(
                    () => this.state.allGestalts && this.setState({
                        hashtags:
                        Util.computeHashtagsFromGestaltsMap(this.state.allGestalts)
                    }), 500)

                this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
                if (this.updateTimes.length % 10 == 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
            })
    }

    //#REDUCER
    gestaltComponentOnBlur = (instanceId: string): void => {
        if (this.state.focusedInstanceId === instanceId) {
            this.setState({ focusedInstanceId: undefined })
        }
    }

    //#REDUCER
    // setFilter = (text: string): void => {
    //     this.setState({ filter: text })
    // }

    render() {
        if (!this.state.allGestaltInstances || !this.state.allGestalts || !this.state.rootGestaltInstanceId || !this.state.hashtags) {throw Error()}
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
