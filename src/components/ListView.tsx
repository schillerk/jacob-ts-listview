import * as React from "react";

import { GestaltList } from './GestaltList'

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface ListViewState {
    searchAddBox: string
    gestalts: { [id: string]: Gestalt }
}

export interface ListViewProps extends React.Props<ListView> {

}


export class ListView extends React.Component<ListViewProps, ListViewState> {


    constructor(props: ListViewProps) {
        super(props);

        this.state = {
            searchAddBox: "",
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
        // real way to focus search add box
    }

    addGestaltAndClearTextBox(text: string): void {
        console.log('add')
        let uid: string = Util.getGUID()
        let newGestalt: Gestalt = {
            gestaltId: uid,
            text: text,
            relatedIds: []
        }
        let newGestalts = {
            ...this.state.gestalts,
            [uid]: newGestalt
        }
        this.setState({ ...this.state, gestalts: newGestalts, searchAddBox: "" })
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

                <textarea
                    placeholder="Search/add gestalts: "
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
                        console.log(e.keyCode)
                        let target: any = e.target
                        if (e.keyCode === 13) {
                            e.preventDefault() // prevents onChange
                            this.addGestaltAndClearTextBox(target.value)
                        }
                    }
                    }
                    onChange={(e: React.FormEvent<HTMLTextAreaElement>): void => {
                        let target: any = e.target
                        this.setState({ ...this.state, searchAddBox: target.value })
                    }
                    }
                    ref={(searchAddBox) => searchAddBox.focus() /* #hack */ } tabIndex={2} cols={20} value={this.state.searchAddBox}>

                </textarea>
                <GestaltList
                    gestalts={this.state.gestalts}
                    />

            </div>
        )
    }

}
