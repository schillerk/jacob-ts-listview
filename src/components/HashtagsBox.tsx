import * as React from "react";

import { LinkedList, Stack } from "../LinkedList"

import { Gestalt, GestaltInstance } from '../domain';
import * as Util from '../util';

export interface HashtagsBoxState {
}

export interface HashtagsBoxProps extends React.Props<HashtagsBox> {
    hashtags: string[]
    onClickTag: (hashtag: string) => void
}


export class HashtagsBox extends React.Component<HashtagsBoxProps, HashtagsBoxState> {
    
    render() {
        return (
            <div style={{border:"1px solid gray",width:"100%",height:"100%"}}>
                <div>Hashtags</div>
                {this.props.hashtags
                    .map((hashtag: string) =>
                        <a href="#" onClick={() => this.props.onClickTag(hashtag)}>{hashtag}</a>)
                    .join(" ")}
            </div>
        )
    }

}
