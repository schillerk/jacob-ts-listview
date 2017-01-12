import * as _ from "lodash"
import * as React from "react"
import * as ReactDOM from "react-dom"

import { GestaltComponent } from "./GestaltComponent"
import { SearchAddBox } from "./SearchAddBox"

import {
  Gestalt,
  GestaltInstance,
  GestaltInstancesMap,
  GestaltsMap,
  GestaltToGestaltInstanceMap,
  HydratedGestaltInstance,
} from "../domain"
import * as Util from "../util"


export interface ListViewState {
  gestaltsMap?: GestaltsMap
  gestaltInstancesMap?: GestaltInstancesMap
  gestaltToGestaltInstanceMap?: GestaltToGestaltInstanceMap
  rootGestaltInstanceId?: string
  filter?: string
}

export interface ListViewProps extends React.Props<ListView> {

}

export class ListView extends React.Component<ListViewProps, ListViewState> {
  searchAddBox: SearchAddBox
  updateTimes: number[] = []
  lastHydratedRootGestaltInstance: HydratedGestaltInstance
  firstVisibleElemInd: number
  lastVisibleElemInd: number

  constructor(props: ListViewProps) {
    super(props)

    const initState: ListViewState = {
      gestaltsMap: {
        "0id": {
          gestaltId: "0id",
          text: "hack with jacob!",
          relatedIds: [],
        },
        "1id": {
          gestaltId: "1id",
          text: "build ideaflow!",
          relatedIds: ["2id", "0id"],

        },
        "2id": {
          gestaltId: "2id",
          text: "bring peace to world!",
          relatedIds: ["1id"],

        },
      },
      gestaltInstancesMap: {},
      gestaltToGestaltInstanceMap: {},
      rootGestaltInstanceId: null,
      filter: "",
    }

    const rootGestalt: Gestalt = Util.createGestalt("root text", true)

    initState.gestaltsMap[rootGestalt.gestaltId] = rootGestalt
    let rootGestaltInstance: GestaltInstance = Util.createGestaltInstance(rootGestalt.gestaltId, false)

    // rootGestaltInstance.childrenInstanceIds === null at this point
    // rootGestalt.relatedIds === null always

    initState.rootGestaltInstanceId = rootGestaltInstance.instanceId
    initState.gestaltInstancesMap[rootGestaltInstance.instanceId] = rootGestaltInstance

    // finish populating allGestalts
    for (let i = 0; i < 20000; i++) {
      const newGestalt = Util.createGestalt(Math.random() + "")
      initState.gestaltsMap[newGestalt.gestaltId] = newGestalt
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

    initState.gestaltInstancesMap = {
      ...initState.gestaltInstancesMap,
      ...this.expandGestaltInstance(
        rootGestaltInstance,
        initState.gestaltsMap,
        initState.gestaltInstancesMap,
      ),
    }

    _.each(initState.gestaltInstancesMap as Object, (gestaltInstance, instanceId) => {
      if (_.isEmpty(initState.gestaltToGestaltInstanceMap[gestaltInstance.gestaltId])){
       initState.gestaltToGestaltInstanceMap[gestaltInstance.gestaltId] = []
      }

      ((initState.gestaltToGestaltInstanceMap[gestaltInstance.gestaltId] || []).push(instanceId))
    })

    rootGestaltInstance = initState.gestaltInstancesMap[initState.rootGestaltInstanceId]

    rootGestaltInstance.childrenInstanceIds
      .forEach((iId: string) =>
        _.assign(initState.gestaltInstancesMap,
          this.expandGestaltInstance(initState.gestaltInstancesMap[iId],
            initState.gestaltsMap,
            initState.gestaltInstancesMap,
          ),
        ),
      )

    this.state = initState
  }
  // Mutates state
  addGestalt = (text: string, offset?: number, parentInstanceId?: string, callback?: () => any): void => {
    const splitTexts: string[] = text.split("\n\n")
    let textsToAdd: string[]

    if (splitTexts.length > 1 && window.confirm("Split by double linebreak?")) {
      textsToAdd = splitTexts
    }
    else
      textsToAdd = [text]

    this.addGestalts(textsToAdd, offset, parentInstanceId, callback)
  }

  addGestalts = (texts: string[], offset: number = 0, parentInstanceId: string = this.state.rootGestaltInstanceId, callback?: () => any): void => {
    if (parentInstanceId === this.state.rootGestaltInstanceId)
      console.log("adding at root")
    else  // #TODO
    {
      console.error("ERR: can only add at root for now")
      return
    }

    const newGestalts: Gestalt[] = texts.map((text) => Util.createGestalt(text))
    const newInstances: GestaltInstance[] = newGestalts.map((g) => Util.createGestaltInstance(g.gestaltId))

    const updatedParentGestaltInstance: GestaltInstance = this.insertChildInstances(
      this.state.gestaltInstancesMap[parentInstanceId],
      newInstances.map((nI) => nI.instanceId),
      offset,
    )

    // else
    //     this.addRelation(parentGestaltInstance.gestaltId, newGestalts.gestaltId) //#todo

    // rootGestaltInstance
    // newRootGestaltInstance.childrenInstanceIds =
    // rootGestaltInstance.childrenInstanceIds.concat(newInstance.instanceId)
    // this.insertGestaltInstanceIntoParent(rootGestaltInstance, newInstance, offset)

    const newAllGestalts: GestaltsMap = {
      ...this.state.gestaltsMap,
      ...(_.keyBy(newGestalts, (g) => g.gestaltId)),
    }

    const newAllGestaltInstances: GestaltInstancesMap = {
      ...this.state.gestaltInstancesMap,
      ...(_.keyBy(newInstances, (i) => i.instanceId)),
      [updatedParentGestaltInstance.instanceId]: updatedParentGestaltInstance,
    }

    this.setState({
      gestaltInstancesMap: newAllGestaltInstances,
      gestaltsMap: newAllGestalts,
    }, callback)
  }

  // IMMUTABLE, returns new entries to add to allGestaltInstances
  expandGestaltInstance = (gi: GestaltInstance, allGestalts: GestaltsMap, allGestaltInstances: GestaltInstancesMap): GestaltInstancesMap => {
    const gestalt: Gestalt = allGestalts[gi.gestaltId]

    const giOut: GestaltInstance = { ...gi, expanded: true }

    console.assert(typeof giOut.childrenInstanceIds !== "undefined")
    console.assert(typeof gestalt !== "undefined")

    let updatedGestaltInstances: GestaltInstancesMap = { [giOut.instanceId]: giOut }
    updatedGestaltInstances = Util.updateAncestorInstanceVersions(
      gi.instanceId, updatedGestaltInstances, this.state.gestaltToGestaltInstanceMap)

    if (giOut.childrenInstanceIds === null) {

      const gestaltIdsToInstantiate: string[] = gestalt.isRoot ?
        _.values(allGestalts).map((g) => g.isRoot ? undefined : g.gestaltId)
          .filter((id) => id !== undefined) :
        gestalt.relatedIds

      console.assert(typeof gestaltIdsToInstantiate !== undefined)

      giOut.childrenInstanceIds = gestaltIdsToInstantiate.map((id) => {
        const newInst: GestaltInstance = Util.createGestaltInstance(id, false)
        updatedGestaltInstances[newInst.instanceId] = newInst
        return newInst.instanceId
      })

    }

    return {
      ...updatedGestaltInstances,
    }
  }

  updateGestalt = (updatedGestalt: Gestalt) => {
    const timeInd = this.updateTimes.push(Date.now()) - 1

    const updatedAllGestalts: { [id: string]: Gestalt } = {
      ...this.state.gestaltsMap,
      [updatedGestalt.gestaltId]: updatedGestalt,
    }

    const updatedGestaltInstances = _.reduce(this.state.gestaltToGestaltInstanceMap[updatedGestalt.gestaltId] || [],
      (gestaltInstances, instanceIds) => _.reduce(
        instanceIds,
        (innerGestaltInstances, instanceId) =>
          Util.updateAncestorInstanceVersions(instanceId, innerGestaltInstances, this.state.gestaltToGestaltInstanceMap),
          gestaltInstances),
      this.state.gestaltInstancesMap)

    this.setState({ gestaltsMap: updatedAllGestalts, gestaltInstancesMap: updatedGestaltInstances }, () => {
      this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
      if (this.updateTimes.length % 10 === 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
    })
  }

  // MUTATOR
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

  // immutable
  // if no offset, append
  insertChildInstances = (parentGestaltInstance: GestaltInstance, instanceIds: string[], offset?: number): GestaltInstance => {
    console.assert(
      parentGestaltInstance.childrenInstanceIds !== null,
      "trying to insert child into nub instance",
      parentGestaltInstance,
    )
    if (typeof offset === "undefined")
      offset = parentGestaltInstance.childrenInstanceIds.length

    const newChildrenInstanceIds =
      Util.immSplice(parentGestaltInstance.childrenInstanceIds, offset, 0, ...instanceIds)

    return {
      ...parentGestaltInstance,
      childrenInstanceIds: newChildrenInstanceIds,
    }
  }

  // immutable
  removeChildInstance = (parentGestaltInstance: GestaltInstance, offset: number): GestaltInstance => {
    return {
      ...parentGestaltInstance,
      childrenInstanceIds: Util.immSplice(parentGestaltInstance.childrenInstanceIds, offset, 1),
    }
  }


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


  toggleExpand = (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance): void => {
    // NOTE: need to deal with recursive copying of the gestaltInstances object
    //  ^^ should work similarly to findGestaltInstance

    const existingChildIdIndex: number = _.findIndex(parentGestaltInstance.childrenInstanceIds,
      (childId) => this.state.gestaltInstancesMap[childId].gestaltId === gestaltToExpandId)

    console.assert(existingChildIdIndex !== -1, "child should always be found with current architecture")

    const existingChildInstanceId: string = parentGestaltInstance.childrenInstanceIds[existingChildIdIndex]
    const existingChildInstance: GestaltInstance = this.state.gestaltInstancesMap[existingChildInstanceId]

    let instsToAdd: GestaltInstancesMap

    if (existingChildInstance.expanded) // present and expanded
      instsToAdd = { [existingChildInstanceId]: { ...existingChildInstance, expanded: false } }
    // this.collapseGestaltInstance(parentGestaltInstance.children, existingChildIndex)
    else // present and collapsed
    {
      // #TODO move to front of array when expanding and deepFixGestaltInstanceIds?
      instsToAdd = this.expandGestaltInstance(existingChildInstance, this.state.gestaltsMap, this.state.gestaltInstancesMap)

    }


    this.setState({
      gestaltInstancesMap: { ...this.state.gestaltInstancesMap, ...instsToAdd },
    })

  }

  updateGestaltText = (id: string, newText: string) => {
    const timeInd = this.updateTimes.push(Date.now()) - 1

    // TODO: recompute gestalt.textHeight
    const updatedGestalt: Gestalt = {
      ...this.state.gestaltsMap[id],
      text: newText,
      textHeight: Util.computeTextHeight(newText),
    }

    const updatedAllGestalts: { [gestaltId: string]: Gestalt } = {
      ...this.state.gestaltsMap,
      [updatedGestalt.gestaltId]: updatedGestalt,
    }

    this.setState({ gestaltsMap: updatedAllGestalts }, () => {
      this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
      if (this.updateTimes.length % 10 === 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
    })
  }

  onScrollChange = (firstVisibleElemInd: number, lastVisibleElemInd: number) => {
    this.firstVisibleElemInd = firstVisibleElemInd
    this.lastVisibleElemInd = lastVisibleElemInd
  }

  render() {
    const hydratedRootGestaltInstance = Util.hydrateGestaltInstanceAndChildren(
      this.state.rootGestaltInstanceId,
      this.state.gestaltsMap,
      this.state.gestaltInstancesMap,
      this.lastHydratedRootGestaltInstance,
      this.firstVisibleElemInd,
      this.lastVisibleElemInd,
    )

    this.lastHydratedRootGestaltInstance = hydratedRootGestaltInstance

    return (
      <div>
        <div style={{ padding: "45px 60px 10px", width: "700px", background: "white", margin: "0 auto", border: "1px solid #d6d6d6" }}>
          <SearchAddBox
            autoFocus
            onAddGestalt={(text) => {
              this.addGestalt(text)
              this.setState({ filter: "" })
            } }
            onChangeText={(text) => {
              this.setState({ filter: text })
            } }

            ref={(instance: SearchAddBox) => this.searchAddBox = instance}
            value={this.state.filter}
            />

          <GestaltComponent
            onScrollChange={this.onScrollChange}
            key={this.state.rootGestaltInstanceId}
            index={0}
            gestaltInstance={hydratedRootGestaltInstance}
            // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

            ref={() => { } }

            updateGestaltText={this.updateGestaltText}
            toggleExpand={this.toggleExpand}
            addGestalt={this.addGestalt}
            // commitIndentChild={this.commitIndentChild}

            // indentChild={undefined}
            addGestaltAsChild={(text) => this.addGestalt(text)}
            getOffsetChild={undefined}
            focus={() => { } }
            isRoot
            filter={this.state.filter}
            />
        </div>
      </div>
    )
  }
}