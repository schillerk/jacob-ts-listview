import * as React from "react";

import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltInstance } from '../domain';
import * as Util from '../util';

export interface SearchAddBoxState {
}

export interface SearchAddBoxProps extends React.Props<SearchAddBox> {
    onAddGestalt: (text: string) => void
    onChangeText: (text: string) => void
    autoFocus: boolean
    value: string

}


export class SearchAddBox extends React.Component<SearchAddBoxProps, SearchAddBoxState> {
    textarea: HTMLTextAreaElement

    constructor(props: SearchAddBoxProps) {
        super(props);
        this.state = { searchAddBox: "" }
    }

    focus = () => { this.textarea && this.textarea.focus() }

    onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.keyCode === Util.KEY_CODES.ENTER && !e.shiftKey) {
            e.preventDefault() // prevents onChange

            this.props.onAddGestalt(e.currentTarget.value)

        }
    }

    onChange = (e: React.FormEvent<HTMLTextAreaElement>): void => {
        this.props.onChangeText(e.currentTarget.value) //#slow
    }

    render() {
        return (
            <textarea

                autoFocus={this.props.autoFocus}
                placeholder="Search/add gestalts: "
                onKeyDown={this.onKeyDown}
                onChange={this.onChange}
                ref={(e: HTMLTextAreaElement) => this.textarea = e}
                tabIndex={2}
                value={this.props.value}
                style={{width:"100%", height:"40px"}}
                > {/* #slow */}
                {/*                 tabIndex={2} cols={20}> */}

            </textarea>
        )
    }

}
