import * as React from "react";
import * as ReactDOM from "react-dom"

import { GestaltListComponent } from './GestaltListComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltCollection, GestaltInstance, GestaltInstanceLookupMap, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface ListViewState {
    allGestalts?: { [id: string]: Gestalt }
    gestaltInstances?: GestaltInstance[]
    gestaltInstancesLookupMap: GestaltInstanceLookupMap
}

export interface ListViewProps extends React.Props<ListView> {

}


export class ListView extends React.Component<ListViewProps, ListViewState> {
    searchAddBox: SearchAddBox;
    updateTimes: number[] = []

    constructor(props: ListViewProps) {
        super(props);

        const initState: ListViewState = {
            gestaltInstances: {},
            allGestalts: {
                '0': {
                    gestaltId: '0',
                    text: 'hack with jacob!',
                    relatedIds: [],
                    instanceAndVisibleNubIds: {}
                },
                '1': {
                    gestaltId: '1',
                    text: 'build ideaflow!',
                    relatedIds: ['2', '0'],
                    instanceAndVisibleNubIds: {}

                },
                '2': {
                    gestaltId: '2',
                    text: 'bring peace to world!',
                    relatedIds: ['1'],
                    instanceAndVisibleNubIds: {}

                },
            }

        };

        let newGestalts: GestaltCollection = {}


        for (let i = 0; i < 10; i++) {
            const newGestalt = this.makeNewGestalt(Math.random() + '')
            newGestalts[newGestalt.gestaltId] = newGestalt

            const instanceId: string = "-" + newGestalt.gestaltId
            initState.gestaltInstances[instanceId] =
                this.createGestaltInstance(instanceId, newGestalt.gestaltId, true, null, false)

        }

        Object.keys(initState.allGestalts).forEach(id => {
            const instanceId = "-" + id

            this.createAndExpandGestaltInstance(initState, {
                gestaltInstanceId: instanceId,
                gestaltId: id,
                parentGestaltInstanceId: null,
                shouldUpdate: false,
            }, true)

            // initState.expandedGestaltInstances["-" + id] = this.createGestaltInstance(instanceId, id, null, false)
            // initState.allGestalts[id].instanceAndVisibleNubIds[instanceId] = true

            
        })

        this.state = { allGestalts: { ...initState.allGestalts, ...newGestalts }, gestaltInstances: initState.gestaltInstances }

    }

    createAndExpandGestaltInstance = (theState: ListViewState, gIP: { gestaltInstanceId: string, gestaltId: string, parentGestaltInstanceId: string, shouldUpdate: boolean }, expand: boolean) => {
        if (expand) {
            theState.gestaltInstances[gIP.gestaltInstanceId] =
                this.createGestaltInstance(gIP.gestaltInstanceId, gIP.gestaltId, true, gIP.parentGestaltInstanceId, gIP.shouldUpdate)

            theState.allGestalts[gIP.gestaltId].instanceAndVisibleNubIds[gIP.gestaltInstanceId] = true

            theState.allGestalts[gIP.gestaltId].relatedIds.map((relatedId) => {
                const nubInstanceId = gIP.gestaltInstanceId + '-' + relatedId;
                // initState.allGestalts[id].instanceAndVisibleNubIds[nubInstanceId] = true
                // this.createAndExpandGestaltInstance(initState, {
                //     gestaltInstanceId: nubInstanceId,
                //     gestaltId: relatedId,
                //     parentGestaltInstanceId: instanceId,
                //     shouldUpdate: false,
                // }, true)

                theState.gestaltInstances[nubInstanceId] =
                    this.createGestaltInstance(nubInstanceId, relatedId, false, gIP.gestaltInstanceId, false)

                theState.allGestalts[relatedId].instanceAndVisibleNubIds[nubInstanceId] = false

            })
        } else {
            theState.gestaltInstances[gIP.gestaltInstanceId].expanded = false
            // delete theState.expandedGestaltInstances[gIP.gestaltInstanceId]
            // delete theState.allGestalts[gIP.gestaltId].instanceAndVisibleNubIds[gIP.gestaltInstanceId]
        }
    }

    setInstanceShouldUpdate = (instanceId: string, shouldUpdate: boolean) => {

        const expandedGestaltInstances = this.state.gestaltInstances
        expandedGestaltInstances[instanceId].shouldUpdate = shouldUpdate

        // this.setState({expandedGestaltInstances:expandedGestaltInstances})
    }

    makeNewGestalt = (text: string = '') => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: [],
            instanceAndVisibleNubIds: {}
        }

        return newGestalt
    }

    addGestalt = (text: string): void => {
        const newGestalt = this.makeNewGestalt(text)


        let gestalts: { [id: string]: Gestalt } = this.state.allGestalts
        gestalts[newGestalt.gestaltId] = newGestalt

        const expandedGestaltInstances = this.state.gestaltInstances
        const instanceId = "-" + newGestalt.gestaltId
        // expandedGestaltInstances[instanceId] = this.createGestaltInstance(instanceId, newGestalt.gestaltId, null, false)
        // gestalts[newGestalt.gestaltId].instanceAndVisibleNubIds[instanceId] = true
        this.createAndExpandGestaltInstance(this.state, {
            gestaltInstanceId: instanceId,
            gestaltId: newGestalt.gestaltId,
            parentGestaltInstanceId: null,
            shouldUpdate: false,
        }, true)
        // newGestalts[Object.keys(newGestalts)[0]].text="vvv"
        // newGestalts[Object.keys(newGestalts)[0]].relatedIds.push("ooo")
        //gestalts[Object.keys(gestalts)[0]].relatedIds[0]="ooo"
        // console.log(this.state.gestalts === gestalts, "hi")

        // // newGestalts[uid]= newGestalt 
        // // newGestalts[Object.keys(newGestalts)[0]].text="vvv"
        // // newGestalts[Object.keys(newGestalts)[0]].relatedIds.push("ooo")
        // newGestalts[Object.keys(newGestalts)[0]].relatedIds[0]="ooo"

        // newGestalts[Object.keys(newGestalts)[0]].relatedIds[0]="ooo"

        //no need for an immutable copy, react pick up changes to objects in state!
        // let newGestalts = {
        //     ...this.state.gestalts,
        //     [uid]: newGestalt
        // }
        this.setState({ allGestalts: gestalts, gestaltInstances: expandedGestaltInstances })
    }

    createGestaltInstance = (gestaltInstanceId: string, gestaltId: string, expanded: boolean, parentGestaltInstanceId: string, shouldUpdate: boolean) => {

        return {
            instanceId: gestaltInstanceId,
            gestaltId: gestaltId,
            expanded: expanded,
            parentGestaltInstanceId: parentGestaltInstanceId,
            shouldUpdate: shouldUpdate,
        }
    }


    toggleExpand = (nubGestaltId: string, parentGestaltInstanceId: string) => {
        const expandedGestaltInstances = this.state.gestaltInstances
        const allGestalts = this.state.allGestalts

        if (nubGestaltInstanceId in expandedGestaltInstances && expandedGestaltInstances[nubGestaltInstanceId].expanded === true) {
            this.createAndExpandGestaltInstance(this.state, {
                gestaltInstanceId: nubGestaltInstanceId,
                gestaltId: nubGestaltId,
                parentGestaltInstanceId: parentGestaltInstanceId,
                shouldUpdate: true,
            }, false)

        } else {
            this.createAndExpandGestaltInstance(this.state, {
                gestaltInstanceId: nubGestaltInstanceId,
                gestaltId: nubGestaltId,
                parentGestaltInstanceId: parentGestaltInstanceId,
                shouldUpdate: true,
            }, true)
            // expandedGestaltInstances[nubGestaltInstanceId] =
            //     this.createGestaltInstance(nubGestaltInstanceId, nubGestaltId, parentGestaltInstanceId, true)
            // allGestalts[nubGestaltId].instanceAndVisibleNubIds[nubGestaltInstanceId] = true
        }
        //|| expandedGestaltInstanceIds[pGIId]!==null 
        //(typeof expandedGestaltInstanceIds[pGIId] !== "undefined" && console.log("undef pGIId", pGIId) ) ||
        this.setGestaltAndParentsShouldUpdate(parentGestaltInstanceId)

        this.setState({ gestaltInstances: expandedGestaltInstances })
    }

    setGestaltAndParentsShouldUpdate = (gestaltInstanceId: string) => {
        const expandedGestaltInstances = this.state.gestaltInstances

        for (let gIId: string = gestaltInstanceId; gIId !== null; gIId = expandedGestaltInstances[gIId].parentGestaltInstanceId) {
            console.assert(typeof expandedGestaltInstances[gIId] !== "undefined", "data structure error", gIId)
            expandedGestaltInstances[gIId].shouldUpdate = true;
        }
    }

    updateGestaltText = (id: string, newText: string) => {
        const timeInd = this.updateTimes.push(Date.now()) - 1

        const gestalts = this.state.allGestalts
        gestalts[id].text = newText

        Object.keys(gestalts[id].instanceAndVisibleNubIds).forEach(currInstanceId => {
            this.setGestaltAndParentsShouldUpdate(currInstanceId)
        })

        this.setState({ allGestalts: gestalts }, () => {
            this.updateTimes[timeInd] = Date.now() - this.updateTimes[timeInd]
            if (this.updateTimes.length % 10 == 0) console.log("updateGestalt FPS", 1000 / Util.average(this.updateTimes))
        })
    }


    render() {
        return (
            <div>
                {/*
                    <input
                    type="text"
                    placeholder="Search/add gestalts: "
                    onChange={(e) => {
                        this.setState({ ...this.state, "searchAddBox": ((e.target) as any).value })
                    }
                    }
                    value={this.state.searchAddBox}
                    ref="filter" tabIndex={2} size={150} />
                */}

                {/* 
                    <textarea
                    placeholder="Search/add gestalts: "
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
                        if (e.keyCode === 13) {
                            e.preventDefault() // prevents onChange
                            this.addGestalt(e.currentTarget.value)
                            this.setState({ searchAddBox: "" })
                        }
                    }
                    }
                    onChange={(e: React.FormEvent<HTMLTextAreaElement>): void => {
                        this.setState({ searchAddBox: e.currentTarget.value }) //#slow
                        
                    }
                    }
                    ref={(e: HTMLTextAreaElement) => { this.searchAddBox = e; }}
                    tabIndex={2} cols={20} value={this.state.searchAddBox}> */}
                {/* #slow */}

                {/*                 tabIndex={2} cols={20}> */}

                {/*    </textarea>*/}

                <SearchAddBox
                    autoFocus
                    addGestalt={this.addGestalt}
                    ref={(instance: SearchAddBox) => this.searchAddBox = instance}
                    />
                <GestaltListComponent
                    gestaltInstances={this.state.gestaltInstances}
                    allGestalts={this.state.allGestalts}
                    updateGestaltText={this.updateGestaltText}
                    toggleExpand={this.toggleExpand}
                    />


   

            </div>
        )
    }

}
