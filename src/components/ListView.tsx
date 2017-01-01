import * as React from "react";
import * as ReactDOM from "react-dom"

import { GestaltListComponent } from './GestaltListComponent'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltCollection, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface ListViewState {
    allGestalts?: { [id: string]: Gestalt }
    expandedGestaltInstanceIds?: {
        [gestaltInstanceId: string]: { expanded: boolean, parentGestaltInstanceId: string, shouldUpdate: boolean }
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
            expandedGestaltInstanceIds: {},
            allGestalts: {
                '0': {
                    gestaltId: '0',
                    text: 'hack with jacob!',
                    relatedIds: [],
                },
                '1': {
                    gestaltId: '1',
                    text: 'build ideaflow!',
                    relatedIds: ['2', '0'],
                },
                '2': {
                    gestaltId: '2',
                    text: 'bring peace to world!',
                    relatedIds: ['1'],
                },
            }

        };

        let newGestalts: GestaltCollection = {}
        const newExpandedGestaltInstanceIds: {
            [gestaltInstanceId: string]: { expanded: boolean, parentGestaltInstanceId: string, shouldUpdate: boolean }
        } = {}

        for (let i = 0; i < 1000; i++) {
            const newGestalt = this.makeNewGestalt(Math.random() + '')
            newGestalts[newGestalt.gestaltId] = newGestalt

            const newGestaltInstanceKey: string = "-" + newGestalt.gestaltId
            newExpandedGestaltInstanceIds[newGestaltInstanceKey] = { expanded: true, parentGestaltInstanceId: null, shouldUpdate: false }
        }
        Object.keys(initState.allGestalts).forEach(id => {
            newExpandedGestaltInstanceIds["-" + id] = { expanded: true, parentGestaltInstanceId: null, shouldUpdate: false }
        })

        this.state = { allGestalts: { ...initState.allGestalts, ...newGestalts }, expandedGestaltInstanceIds: newExpandedGestaltInstanceIds }

    }


    componentDidMount() {
        this.searchAddBox.focus();



    }

    makeNewGestalt = (text: string = '') => {
        const uid: string = Util.genGUID()
        const newGestalt: Gestalt = {
            text: text,
            gestaltId: uid,
            relatedIds: []
        }

        return newGestalt
    }

    addGestalt = (text: string): void => {
        const newGestalt = this.makeNewGestalt(text)


        let gestalts: { [id: string]: Gestalt } = this.state.allGestalts
        gestalts[newGestalt.gestaltId] = newGestalt

        const expandedGestaltInstanceIds = this.state.expandedGestaltInstanceIds
        expandedGestaltInstanceIds["-" + newGestalt.gestaltId] = { expanded: true, parentGestaltInstanceId: null, shouldUpdate: false }
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
        this.setState({ allGestalts: gestalts, expandedGestaltInstanceIds: expandedGestaltInstanceIds })
    }

    toggleExpandGestaltNub = (nubGestaltInstanceId: string, parentGestaltInstanceId: string) => {
        const expandedGestaltInstanceIds = this.state.expandedGestaltInstanceIds
        if (nubGestaltInstanceId in expandedGestaltInstanceIds) {
            delete expandedGestaltInstanceIds[nubGestaltInstanceId];
        } else {
            expandedGestaltInstanceIds[nubGestaltInstanceId] = { expanded: true, parentGestaltInstanceId: parentGestaltInstanceId, shouldUpdate: true }
        }
        //|| expandedGestaltInstanceIds[pGIId]!==null 
        //(typeof expandedGestaltInstanceIds[pGIId] !== "undefined" && console.log("undef pGIId", pGIId) ) ||
        this.setGestaltAndParentsShouldUpdate(parentGestaltInstanceId)

        this.setState({ expandedGestaltInstanceIds: expandedGestaltInstanceIds })
    }

    setGestaltAndParentsShouldUpdate = (gestaltInstanceId: string) => {
        const expandedGestaltInstanceIds = this.state.expandedGestaltInstanceIds

        for (let pGIId: string = gestaltInstanceId; pGIId !== null; pGIId = expandedGestaltInstanceIds[pGIId].parentGestaltInstanceId) {
            console.assert(typeof expandedGestaltInstanceIds[pGIId] !== "undefined", "data structure error", pGIId)
            expandedGestaltInstanceIds[pGIId].shouldUpdate = true;
        }
    }

    updateGestalt = (id: string, newText: string, instanceId: string) => {
        const timeInd=this.updateTimes.push(Date.now()) - 1

        const gestalts = this.state.allGestalts
        gestalts[id].text = newText
        this.setGestaltAndParentsShouldUpdate(instanceId)
        this.setState({ allGestalts: gestalts }, () => {
            this.updateTimes[timeInd]=Date.now()-this.updateTimes[timeInd]
            if(this.updateTimes.length%10==0) console.log("updateGestalt FPS", 1000/Util.average(this.updateTimes))
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
                    addGestalt={this.addGestalt}
                    ref={(instance: SearchAddBox) => this.searchAddBox = instance}
                    />
                <GestaltListComponent
                    gestalts={this.state.allGestalts}
                    allGestalts={this.state.allGestalts}
                    updateGestalt={this.updateGestalt}
                    toggleExpandGestaltNub={this.toggleExpandGestaltNub}
                    expandedGestaltInstanceIds={this.state.expandedGestaltInstanceIds}
                    parentGestaltInstanceId=""
                    />

            </div>
        )
    }

}
