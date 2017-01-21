import * as React from "react";
import * as ReactDOM from "react-dom"
import * as _ from "lodash";

import { GestaltComponent } from './GestaltComponent'
import { SearchAddBox } from './SearchAddBox'
import { HashtagsBox } from './HashtagsBox'

import { Gestalt, GestaltsMap, GestaltInstancesMap, GestaltInstance, HydratedGestalt, HydratedGestaltInstance } from '../domain';
import * as Util from '../util';
import { LazyArray } from "../LazyArray"



import * as Immutable from 'immutable'
// import * as ImmutableDiff from 'immutablediff'
// var ImmutableDiff: any = require("immutablediff");

export interface ListViewState {
    filter?: string
}

export interface ListViewProps extends React.Props<ListView> {
    allGestalts: GestaltsMap
    allGestaltInstances: GestaltInstancesMap
    rootGestaltInstanceId: string

    // filter: string
    // setFilter: (text: string) => void

    focusedInstanceId: string | undefined
    hashtags: Immutable.OrderedSet<string>

    gestaltComponentOnBlur: (instanceId: string) => void
    updateGestaltText: (id: string, newText: string) => void
    toggleExpand: (gestaltToExpandId: string, parentGestaltInstance: GestaltInstance) => void
    addGestalt: (text: string, parentInstanceId?: string, offset?: number, shouldFocus?: boolean) => void

}


export class ListView extends React.Component<ListViewProps, ListViewState> {
    searchAddBox: SearchAddBox;

    constructor(props: ListViewProps) {
        super(props)
        this.state = {
            filter: ""
        }
    }

    setFilter = (text: string): void => {
        this.setState({ filter: text })
    }

    onClickTag = (hashtag: string): void => {
        this.setFilter(hashtag)
    }

    // Includes lastHydratedRootGestaltInstance for faster diffing
    //#todo needlessly hydrates nonexpanded nodes
    private static _HydrateGestaltInstanceAndChildren = (
        gestaltInstanceId: string,
        allGestalts: GestaltsMap,
        allGestaltInstances: GestaltInstancesMap,
        focusedInstanceId: string | undefined,
    ): HydratedGestaltInstance => {
        console.assert(typeof gestaltInstanceId === "string")

        const currInstance: GestaltInstance = allGestaltInstances.get(gestaltInstanceId)
        console.assert(typeof currInstance !== "undefined", `${gestaltInstanceId} not in allGestaltInstances`)

        let nextHydChildren: LazyArray<HydratedGestaltInstance> | HydratedGestaltInstance[]


        let hydCurrGestalt: HydratedGestalt | undefined

        //if root
        if (currInstance.gestaltId === undefined) {
            hydCurrGestalt = undefined
            nextHydChildren = new LazyArray<HydratedGestaltInstance>(
                currInstance.childrenInstanceIds.length,
                (i: number) => {
                    if (!currInstance.childrenInstanceIds) { throw Error() }
                    return ListView._HydrateGestaltInstanceAndChildren(
                        currInstance.childrenInstanceIds[i],
                        allGestalts,
                        allGestaltInstances,
                        focusedInstanceId
                    )
                }
            )

            // currInstance.childrenInstanceIds[i]((instanceId: string) =>
            //     _HydrateGestaltInstanceAndChildren(instanceId, allGestalts, allGestaltInstances))
            //     // const newlyHydGesInsts: HydratedGestaltInstance[] = currInstance.childrenInstanceIds.slice(startInd, endInd).map((instanceId: string) =>
            //     //     _HydrateGestaltInstanceAndChildren(instanceId, allGestalts, allGestaltInstances))

            //     // nextHydGesInsts = immSplice(lastHydratedRootGestaltInstance.hydratedChildren,
            //     //     startInd, endInd - startInd, ...newlyHydGesInsts)
        }
        else {
            const currGestalt: Gestalt | undefined = allGestalts.get(currInstance.gestaltId)
            console.assert(typeof currGestalt !== "undefined", `${currInstance.gestaltId} not in allGestalts`)

            hydCurrGestalt = {
                ...currGestalt,
                relatedGestalts: currGestalt.relatedIds.map((id: string) => allGestalts.get(id))
            }

            nextHydChildren = currInstance.childrenInstanceIds.map((instanceId: string) =>
                ListView._HydrateGestaltInstanceAndChildren(instanceId, allGestalts, allGestaltInstances, focusedInstanceId))
        }


        const currHydratedGestaltInstance: HydratedGestaltInstance = {
            ...currInstance,
            gestalt: hydCurrGestalt,
            hydratedChildren: nextHydChildren,
            shouldFocus: focusedInstanceId === currInstance.instanceId
        }

        console.assert(!(currHydratedGestaltInstance.expanded && currHydratedGestaltInstance.hydratedChildren === null),
            "expanded and hydratedChildren===null", currHydratedGestaltInstance)
        console.assert(!(currHydratedGestaltInstance.expanded && focusedInstanceId === currInstance.instanceId),
            "never shouldFocus on nonexpanded node")

        return currHydratedGestaltInstance
    }

    render() {

        const hydratedRootGestaltInstance: HydratedGestaltInstance = ListView._HydrateGestaltInstanceAndChildren(
            this.props.rootGestaltInstanceId,
            this.props.allGestalts,
            this.props.allGestaltInstances,
            this.props.focusedInstanceId,
        )

        return (
            <div>

                <div style={{ marginTop: "45px", float: "right", width: "300px", minHeight: "300px" }}>
                    <HashtagsBox hashtags={this.props.hashtags.toJS()} onClickTag={this.onClickTag} />
                </div>

                <div className="box" style={{ padding: "45px 60px 10px", width: "700px", margin: "0 auto" }}>

                    <SearchAddBox
                        autoFocus
                        onAddGestalt={(text) => {
                            this.props.addGestalt(text)
                            this.setFilter("")
                        } }
                        onChangeText={(text) => {
                            this.setFilter(text)
                        } }

                        ref={(instance: SearchAddBox) => this.searchAddBox = instance}
                        value={this.state.filter || ""}
                        />

                    <GestaltComponent
                        key={this.props.rootGestaltInstanceId}
                        index={0}
                        gestaltInstance={hydratedRootGestaltInstance}
                        // onChange={(newText: string) => this.props.updateGestaltText(instance.gestaltId, newText)}

                        updateGestaltText={this.props.updateGestaltText}
                        toggleExpand={this.props.toggleExpand}
                        addGestalt={this.props.addGestalt}
                        // commitIndentChild={this.props.commitIndentChild}

                        // indentChild={undefined}
                        addGestaltAsChild={(text) => this.props.addGestalt(text)}
                        getOffsetChild={undefined}
                        isRoot
                        filter={this.state.filter}
                        //rootChildrenHeights={this.computeRootChildrenHeights(hydratedRootGestaltInstance)}
                        // rootChildrenHeights={this.props.rootChildrenHeights}

                        gestaltComponentOnBlur={this.props.gestaltComponentOnBlur}
                        />
                </div>
            </div >
        )
    }
}
