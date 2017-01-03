import * as React from "react";

import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltInstance, createGestaltInstance } from '../domain';
import * as Util from '../util';

export interface SearchAddBoxState {
    searchAddBox: string
}

export interface SearchAddBoxProps extends React.Props<SearchAddBox> {
    onAddGestalt: (text: string) => void
    autoFocus: boolean
    
}


export class SearchAddBox extends React.Component<SearchAddBoxProps, SearchAddBoxState> {
    textarea: HTMLTextAreaElement

    constructor(props: SearchAddBoxProps) {
        super(props);
        this.state={searchAddBox:""}
    }

    focus = () => { this.textarea && this.textarea.focus() }

    render() {
        return (
            <textarea

                    autoFocus={this.props.autoFocus}
                    placeholder="Search/add gestalts: "
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
                        if (e.keyCode === Util.KEY_CODES.ENTER) {
                            e.preventDefault() // prevents onChange
                            this.props.onAddGestalt(e.currentTarget.value)
                            this.setState({ searchAddBox: "" })
                        }
                    }
                    }
                    onChange={(e: React.FormEvent<HTMLTextAreaElement>): void => {
                        this.setState({ searchAddBox: e.currentTarget.value }) //#slow
                    }
                    }
                    ref={(e: HTMLTextAreaElement) => this.textarea=e }
                    tabIndex={2} cols={20} value={this.state.searchAddBox}> {/* #slow */}
{/*                 tabIndex={2} cols={20}> */}

                </textarea>                
        )
    }

}
