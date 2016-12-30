import * as React from "react";
import * as ReactDOM from "react-dom"

import { GestaltList } from './GestaltList'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, Gestalts, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface ListViewState {
    gestalts?: { [id: string]: Gestalt }
    expandedGestaltInstances?: { [id: string]: boolean }
}

export interface ListViewProps extends React.Props<ListView> {

}


export class ListView extends React.Component<ListViewProps, ListViewState> {
    searchAddBox: SearchAddBox;

    constructor(props: ListViewProps) {
        super(props);

        this.state = {
            expandedGestaltInstances: {},
            gestalts: {
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
    }


    componentDidMount() {
        this.searchAddBox.focus();
        let newGestalts: Gestalts = {}

        for (let i = 0; i < 10; i++) {
            const newGestalt = this.makeNewGestalt(Math.random() + '')
            newGestalts[newGestalt.gestaltId] = newGestalt
        }

        this.setState({ gestalts: { ...this.state.gestalts, ...newGestalts } })
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


        let gestalts: { [id: string]: Gestalt } = this.state.gestalts
        gestalts[newGestalt.gestaltId] = newGestalt
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
        this.setState({ gestalts: gestalts })
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
                <GestaltList
                    gestalts={this.state.gestalts}
                    allGestalts={this.state.gestalts}
                    updateGestalt={(id, newText) => {
                        const gestalts = this.state.gestalts
                        gestalts[id].text = newText
                        this.setState({ gestalts: gestalts })
                    } }
                    />

            </div>
        )
    }

}
