import * as _ from "lodash"
import * as React from "react"
import * as ReactDOM from "react-dom"

import { GestaltComponent } from "./GestaltComponent"
import { SearchAddBox } from "./SearchAddBox"

import {
  Gestalt,
  GestaltIdToGestaltInstanceIdsMap,
  GestaltInstance,
  GestaltInstancesMap,
  GestaltsMap,
} from "../domain"
import * as Util from "../util"

export interface ListViewState {
  gestaltsMap?: GestaltsMap
  gestaltInstancesMap?: GestaltInstancesMap
  gestaltIdToGestaltInstanceIdsMap?: GestaltIdToGestaltInstanceIdsMap
  rootGestaltInstanceId?: string
  filter?: string
}

export interface ListViewProps extends React.Props<ListView> {

}

export class ListView extends React.Component<ListViewProps, ListViewState> {
  protected searchAddBox: SearchAddBox
  protected updateTimes: number[] = []
  protected firstVisibleElemInd: number
  protected lastVisibleElemInd: number

  constructor(props: ListViewProps) {
    super(props)
    this.state = getInitialState()
  }

  public render() {
    return (
      <div>
        <div
          style={{
            background: "white",
            border: "1px solid #d6d6d6",
            margin: "0 auto",
            padding: "45px 60px 10px",
            width: "700px",
          }}
          >
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
            gestaltInstance={this.state.gestaltInstancesMap[this.state.rootGestaltInstanceId]}
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

            gestaltInstancesMap={this.state.gestaltInstancesMap}
            gestaltsMap={this.state.gestaltsMap}
            />
        </div>
      </div>
    )
  }

  protected addGestalt = (text: string, offset?: number, parentInstanceId?: string, callback?: () => any): void => {
    const splitTexts: string[] = text.split("\n\n")
    let textsToAdd: string[]

    if (splitTexts.length > 1 && window.confirm("Split by double linebreak?")) {
      textsToAdd = splitTexts
    } else {
      textsToAdd = [text]
    }

    this.addGestalts(textsToAdd, offset, parentInstanceId, callback)
  }

  protected addGestalts = (
    texts: string[],
    offset: number = 0,
    parentInstanceId: string = this.state.rootGestaltInstanceId,
    callback?: () => any,
  ): void => {
    if (parentInstanceId === this.state.rootGestaltInstanceId){
      console.log("adding at root")
    } else { // #TODO
      console.error("ERR: can only add at root for now")
      return
    }

    const newGestalts: Gestalt[] = texts.map((text) => Util.createGestalt(text))
    const newInstances: GestaltInstance[] = newGestalts.map((g) => Util.createGestaltInstance(g.gestaltId))

    const updatedParentGestaltInstance: GestaltInstance = Util.insertChildInstances(
      this.state.gestaltInstancesMap[parentInstanceId],
      newInstances.map((nI) => nI.instanceId),
      offset,
    )

    // else
    //     this.addRelation(parentGestaltInstance.gestaltId, newGestalts.gestaltId) //#todo

    // rootGestaltInstance
    // newRootGestaltInstance.childIds =
    // rootGestaltInstance.childIds.concat(newInstance.instanceId)
    // this.insertGestaltInstanceIntoParent(rootGestaltInstance, newInstance, offset)

    const updatedGestaltsMap: GestaltsMap = {
      ...this.state.gestaltsMap,
      ...(_.keyBy(newGestalts, (g) => g.gestaltId)),
    }

    let updatedGestaltInstancesMap: GestaltInstancesMap = {
      ...this.state.gestaltInstancesMap,
      [updatedParentGestaltInstance.instanceId]: updatedParentGestaltInstance,
    }

    updatedGestaltInstancesMap = Util.updateAncestorInstanceVersions(
      updatedParentGestaltInstance.instanceId,
      updatedGestaltInstancesMap,
      this.state.gestaltIdToGestaltInstanceIdsMap,
      this.state.rootGestaltInstanceId,
    )

    updatedGestaltInstancesMap = {
      ...updatedGestaltInstancesMap,
      ...(_.keyBy(newInstances, (i) => i.instanceId)),
    }

    this.setState({
      gestaltInstancesMap: updatedGestaltInstancesMap,
      gestaltsMap: updatedGestaltsMap,
    }, callback)
  }

  protected updateGestalt = (nextGestalt: Gestalt) => {
    const timeInd = this.updateTimes.push(Date.now()) - 1

    const previousGestalt = this.state.gestaltsMap[nextGestalt.gestaltId]

    const nextGestaltsMap: GestaltsMap = {
      ...this.state.gestaltsMap,
      [nextGestalt.gestaltId]: nextGestalt,
    }

    let nextGestaltInstancesMap: GestaltInstancesMap = _.reduce(
      this.state.gestaltIdToGestaltInstanceIdsMap[nextGestalt.gestaltId] || [],
      (gestaltInstancesMap, instanceIds) => _.reduce(
        instanceIds,
        (innerGestaltInstancesMap, instanceId) => {
          const instance = innerGestaltInstancesMap[instanceId]

          let nextInnerGestaltInstancesMap = {
            ...innerGestaltInstancesMap,
            [instanceId]: {
              ...instance,
              version: instance.version + 1,
            },
          }

          nextInnerGestaltInstancesMap = Util.updateAncestorInstanceVersions(
            instanceId,
            nextInnerGestaltInstancesMap,
            this.state.gestaltIdToGestaltInstanceIdsMap,
            this.state.rootGestaltInstanceId,
          )

          return nextGestaltInstancesMap
        }, gestaltInstancesMap),
      this.state.gestaltInstancesMap)

/*    // TODO: Update instances of related gestalt. don't assume acyclical
    nextGestaltInstancesMap = _(previousGestalt.relatedIds.concat(nextGestalt.relatedIds))
     .uniq()
     .reduce((gestaltInstancesMap, gestaltId) => this.updateGestalt(nextGestaltsMap[gestaltId]), nextGestaltInstancesMap)
     .value()
*/
    this.setState({ gestaltsMap: nextGestaltsMap, gestaltInstancesMap: nextGestaltInstancesMap }, () => {
      this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
      if (this.updateTimes.length % 10 === 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
    })
  }

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
  //         if (currGestaltInstance.gestaltId === srcGestaltId && currGestaltInstance.childIds !== null) { // find relevant gestalt instances, determine it isn't a nub w null children
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
  //             if (currGestaltInstance.gestaltId === srcGestaltId && currGestaltInstance.childIds !== null) { // if relevant gestalt instance; it isn't a nub w null children
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


  // commitIndentChild = (parentInstanceId: string, childIndex: number, dedent: boolean = false) => {
  //     //add child's gestaltId as relatedId to new parent gestalt
  //     //remove child's gestaltId as relatedId from old parent gestalt
  //     //add child's gestaltInstanceId as a childs instance id to new parent's gestalt instance
  //     //remove child's gestaltInstanceId as a childs instance id from old parent's gestalt instance

  //     let parentGestaltInstance: GestaltInstance = this.state.allGestaltInstances[parentInstanceId]
  //     let parentGestalt: Gestalt = this.state.allGestalts[parentGestaltInstance.gestaltId]

  //     console.assert(parentGestalt.gestaltId === parentGestaltInstance.gestaltId)

  //     const instanceIdListInWhichChildLies: string[] = parentGestaltInstance.childIds
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
  //     //     children: Util.immSplice(parentGestaltInstance.childIds, childIndex, 1)
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

  protected toggleExpand = (instance: GestaltInstance): void => {
    let updatedGestaltInstancesMap: GestaltInstancesMap
    if (instance.expanded) {
      const updatedGestaltInstance = {
        ...instance,
        expanded: false,
        version: instance.version + 1,
      }
      updatedGestaltInstancesMap = {
        ...this.state.gestaltInstancesMap,
        [instance.instanceId]: updatedGestaltInstance,
      }
    } else {
      // #TODO move to front of array when expanding and deepFixGestaltInstanceIds?
      updatedGestaltInstancesMap = Util.expandGestaltInstanceAndCreateChildren(
        instance,
        this.state.gestaltsMap,
        this.state.gestaltInstancesMap,
        this.state.gestaltIdToGestaltInstanceIdsMap,
        this.state.rootGestaltInstanceId,
      )
    }

    updatedGestaltInstancesMap = Util.updateAncestorInstanceVersions(
      instance.instanceId,
      updatedGestaltInstancesMap,
      this.state.gestaltIdToGestaltInstanceIdsMap,
      this.state.rootGestaltInstanceId,
    )

    this.setState({
      gestaltInstancesMap: updatedGestaltInstancesMap,
    })
  }

  protected updateGestaltText = (id: string, newText: string) => {
    const timeInd = this.updateTimes.push(Date.now()) - 1

    // TODO: recompute gestalt.textHeight
    const updatedGestalt: Gestalt = {
      ...this.state.gestaltsMap[id],
      text: newText,
      textHeight: Util.computeTextHeight(newText),
    }

    this.updateGestalt(updatedGestalt)
  }

  protected onScrollChange = (firstVisibleElemInd: number, lastVisibleElemInd: number) => {
    this.firstVisibleElemInd = firstVisibleElemInd
    this.lastVisibleElemInd = lastVisibleElemInd
  }
}

function getInitialState(): ListViewState {
  const initialState: ListViewState = {
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
    gestaltIdToGestaltInstanceIdsMap: {},
    rootGestaltInstanceId: null,
    filter: "",
  }

  const rootGestalt: Gestalt = Util.createGestalt("root text", true)

  initialState.gestaltsMap[rootGestalt.gestaltId] = rootGestalt
  let rootGestaltInstance: GestaltInstance = Util.createGestaltInstance(rootGestalt.gestaltId, false)

  // rootGestaltInstance.childIds === null at this point
  // rootGestalt.relatedIds === null always

  initialState.rootGestaltInstanceId = rootGestaltInstance.instanceId
  initialState.gestaltInstancesMap[rootGestaltInstance.instanceId] = rootGestaltInstance

  // finish populating allGestalts
  for (let i = 0; i < 20000; i++) {
    const newGestalt = Util.createGestalt(Math.random() + "")
    initialState.gestaltsMap[newGestalt.gestaltId] = newGestalt
  }

  // Object.keys(initState.allGestalts).forEach((id, i) => {

  //     if (id === rootGestalt.gestaltId) {
  //         //skip
  //     }
  //     else {

  //         //rootGestalt.relatedIds.push(id)

  //         // const newGestaltInstance = this.createGestaltInstance(id, true, initState.allGestalts)

  //         // initState.allGestaltInstances[newGestaltInstance.instanceId] = newGestaltInstance

  //         // rootGestaltInstance.childIds.push(newGestaltInstance.instanceId)

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

  _.each(initialState.gestaltInstancesMap as Object, (gestaltInstance, instanceId) => {
    if (_.isEmpty(initialState.gestaltIdToGestaltInstanceIdsMap[gestaltInstance.gestaltId])) {
      initialState.gestaltIdToGestaltInstanceIdsMap[gestaltInstance.gestaltId] = []
    }

    ((initialState.gestaltIdToGestaltInstanceIdsMap[gestaltInstance.gestaltId] || []).push(instanceId))
  })

  initialState.gestaltInstancesMap = {
    ...initialState.gestaltInstancesMap,
    ...Util.expandGestaltInstanceAndCreateChildren(
      rootGestaltInstance,
      initialState.gestaltsMap,
      initialState.gestaltInstancesMap,
      initialState.gestaltIdToGestaltInstanceIdsMap,
      initialState.rootGestaltInstanceId,
    ),
  }

  rootGestaltInstance = initialState.gestaltInstancesMap[initialState.rootGestaltInstanceId]

/*  rootGestaltInstance.childInstanceIds
    .forEach((iId: string) =>
      _.assign(initialState.gestaltInstancesMap,
        Util.expandGestaltInstance(
          initialState.gestaltInstancesMap[iId],
          initialState.gestaltsMap,
          initialState.gestaltInstancesMap,
          initialState.gestaltToGestaltInstanceMap,
          initialState.rootGestaltInstanceId,
        ),
      ),
  )*/

  return initialState
}

