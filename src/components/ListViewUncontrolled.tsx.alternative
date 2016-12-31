import * as React from "react";
import * as ReactDOM from "react-dom"

import { GestaltList } from './GestaltList'
import { SearchAddBox } from './SearchAddBox'

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface ListViewUncontrolledState {
    gestalts?: { [id: string]: Gestalt }
}

export interface ListViewUncontrolledProps extends React.Props<ListViewUncontrolled> {

}


export class ListViewUncontrolled extends React.Component<ListViewUncontrolledProps, ListViewUncontrolledState> {
    searchAddBox: HTMLTextAreaElement;

    constructor(props: ListViewUncontrolledProps) {
        super(props);

        this.state = {
            gestalts: {
                '0': {
                    gestaltId: '0',
                    text: 'hack with jacob!',
                    relatedIds: ['blah', 'bleh', 'bluh']
                }
            }
        };
    }

    componentDidMount() {
        this.searchAddBox.focus();
        for (let i = 0; i < 5000; i++) {
            this.addGestalt(String(Math.random()))
        }
    }

    addGestalt = (text: string): void => {
        let uid: string = Util.genGUID()
        let newGestalt: Gestalt = {
            gestaltId: uid,
            text: text,
            relatedIds: []
        }


        let gestalts: { [id: string]: Gestalt } = this.state.gestalts
        gestalts[uid] = newGestalt
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


                <textarea
                    placeholder="Search/add gestalts: "
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
                        if (e.keyCode === 13) {
                            e.preventDefault() // prevents onChange
                            this.addGestalt(e.currentTarget.value)
                            e.currentTarget.value=""
                        }
                    }
                    }
                    onChange={(e: React.FormEvent<HTMLTextAreaElement>): void => {

                    }
                    }
                    ref={(e: HTMLTextAreaElement) => { this.searchAddBox = e; } }
                    tabIndex={2} cols={20} >


                </textarea>

                <GestaltList
                    gestalts={this.state.gestalts}
                />

            </div>
        )
    }

}
