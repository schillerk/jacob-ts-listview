import * as React from "react";
import * as ReactDOM from "react-dom"

import { GestaltListComponent } from './GestaltListComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltCollection, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface ListViewState {
    allGestalts?: { [id: string]: Gestalt }
    expandedGestaltInstances?: {
        [gestaltInstanceId: string]: GestaltInstance
    }


}

export interface ListViewProps extends React.Props<ListView> {

}


export class ListView extends React.Component<ListViewProps, ListViewState> {
    searchAddBox: SearchAddBox;
    updateTimes: number[] = []

    constructor(props: ListViewProps) {
        super(props);

        const initState: ListViewState = {
            expandedGestaltInstances: {},
            allGestalts: {
                '0': {
                    gestaltId: '0',
                    text: 'hack with jacob!',
                    relatedIds: [],
                    instanceIds: {}
                },
                '1': {
                    gestaltId: '1',
                    text: 'build ideaflow!',
                    relatedIds: ['2', '0'],
                    instanceIds: {}

                },
                '2': {
                    gestaltId: '2',
                    text: 'bring peace to world!',
                    relatedIds: ['1'],
                    instanceIds: {}

                },
            }

        };

        let newGestalts: GestaltCollection = {}
        const newExpandedGestaltInstances: {
            [gestaltInstanceId: string]: GestaltInstance
        } = {}

        for (let i = 0; i < 10; i++) {
            const newGestalt = this.makeNewGestalt(Math.random() + '')
            newGestalts[newGestalt.gestaltId] = newGestalt

            const instanceId: string = "-" + newGestalt.gestaltId
            newExpandedGestaltInstances[instanceId] = 
                this.createGestaltInstance(instanceId, newGestalt.gestaltId, null, false)
        }

        Object.keys(initState.allGestalts).forEach(id => {
            const instanceId = "-" + id
            newExpandedGestaltInstances["-" + id] = this.createGestaltInstance(instanceId, id, null, false)
            initState.allGestalts[id].instanceIds[instanceId] = true
        })

        this.state = { allGestalts: { ...initState.allGestalts, ...newGestalts }, expandedGestaltInstances: newExpandedGestaltInstances }

    }

    setInstanceShouldUpdate = (instanceId: string, shouldUpdate: boolean) => {

        const expandedGestaltInstances = this.state.expandedGestaltInstances
        expandedGestaltInstances[instanceId].shouldUpdate = shouldUpdate

        // this.setState({expandedGestaltInstances:expandedGestaltInstances})
    }

    makeNewGestalt = (text: string = '') => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: [],
            instanceIds: {}
        }

        return newGestalt
    }

    addGestalt = (text: string): void => {
        const newGestalt = this.makeNewGestalt(text)


        let gestalts: { [id: string]: Gestalt } = this.state.allGestalts
        gestalts[newGestalt.gestaltId] = newGestalt

        const expandedGestaltInstances = this.state.expandedGestaltInstances
        const instanceId = "-" + newGestalt.gestaltId
        expandedGestaltInstances[instanceId] = this.createGestaltInstance(instanceId, newGestalt.gestaltId, null, false)
        gestalts[newGestalt.gestaltId].instanceIds[instanceId] = true

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
        this.setState({ allGestalts: gestalts, expandedGestaltInstances: expandedGestaltInstances })
    }

    createGestaltInstance = (gestaltInstanceId: string, gestaltId: string, parentGestaltInstanceId: string, shouldUpdate: boolean) => {

        return {
            instanceId: gestaltInstanceId,
            gestaltId: gestaltId,
            expanded: true,
            parentGestaltInstanceId: parentGestaltInstanceId,
            shouldUpdate: shouldUpdate,
        }
    }


    toggleExpandGestaltNub = (nubGestaltInstanceId: string, nubGestaltId: string, parentGestaltInstanceId: string) => {
        const expandedGestaltInstances = this.state.expandedGestaltInstances
        const allGestalts = this.state.allGestalts

        if (nubGestaltInstanceId in expandedGestaltInstances) {
            delete expandedGestaltInstances[nubGestaltInstanceId];
            delete allGestalts[nubGestaltId].instanceIds[nubGestaltInstanceId]

        } else {
            expandedGestaltInstances[nubGestaltInstanceId] =
                this.createGestaltInstance(nubGestaltInstanceId, nubGestaltId, parentGestaltInstanceId, true)
            allGestalts[nubGestaltId].instanceIds[nubGestaltInstanceId] = true
        }
        //|| expandedGestaltInstanceIds[pGIId]!==null 
        //(typeof expandedGestaltInstanceIds[pGIId] !== "undefined" && console.log("undef pGIId", pGIId) ) ||
        this.setGestaltAndParentsShouldUpdate(parentGestaltInstanceId)

        this.setState({ expandedGestaltInstances: expandedGestaltInstances })
    }

    setGestaltAndParentsShouldUpdate = (gestaltInstanceId: string) => {
        const expandedGestaltInstances = this.state.expandedGestaltInstances

        for (let gIId: string = gestaltInstanceId; gIId !== null; gIId = expandedGestaltInstances[gIId].parentGestaltInstanceId) {
            console.assert(typeof expandedGestaltInstances[gIId] !== "undefined", "data structure error", gIId)
            expandedGestaltInstances[gIId].shouldUpdate = true;
        }
    }

    updateGestaltText = (id: string, newText: string) => {
        const timeInd = this.updateTimes.push(Date.now()) - 1

        const gestalts = this.state.allGestalts
        gestalts[id].text = newText

        Object.keys(gestalts[id].instanceIds).forEach(currInstanceId => {
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
                    gestalts={this.state.allGestalts}
                    allGestalts={this.state.allGestalts}
                    updateGestaltText={this.updateGestaltText}
                    toggleExpandGestaltNub={this.toggleExpandGestaltNub}
                    expandedGestaltInstances={this.state.expandedGestaltInstances}
                    parentGestaltInstanceId=""
                    setInstanceShouldUpdate={this.setInstanceShouldUpdate}
                    />

            </div>
        )
    }

}
