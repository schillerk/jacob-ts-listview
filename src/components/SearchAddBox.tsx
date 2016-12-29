import * as React from "react";

import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface SearchAddBoxState {
    searchAddBox: string
}

export interface SearchAddBoxProps extends React.Props<SearchAddBox> {
    addGestalt: (text: string) => void 
}


export class SearchAddBox extends React.Component<SearchAddBoxProps, SearchAddBoxState> {


    constructor(props: SearchAddBoxProps) {
        super(props);
        this.state={searchAddBox:""}
    }

    render() {
        return (
            <textarea
                    placeholder="Search/add gestalts: "
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
                        if (e.keyCode === 13) {
                            e.preventDefault() // prevents onChange
                            this.props.addGestalt(e.currentTarget.value)
                            this.setState({ searchAddBox: "" })
                        }
                    }
                    }
                    onChange={(e: React.FormEvent<HTMLTextAreaElement>): void => {
                        this.setState({ searchAddBox: e.currentTarget.value }) //#slow
                        
                    }
                    }
                    ref={(e: HTMLTextAreaElement) => { /* this.searchAddBox = e; */ }}
                    tabIndex={2} cols={20} value={this.state.searchAddBox}> {/* #slow */}
{/*                 tabIndex={2} cols={20}> */}

                </textarea>                
        )
    }

}
