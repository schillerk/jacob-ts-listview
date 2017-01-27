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
        // minHeight: "300px"
        return (
            <div className="box" style={{width: "100%", height: "100%" }}>
                <div>Hashtags</div>
                {this.props.hashtags
                    .map((hashtag: string,i:number) =>
                        <a href="#" key={i} onClick={() => this.props.onClickTag(hashtag)} style={{marginRight:"4px",display:"inline-block"}}>{hashtag}</a>)
                }
            </div>
        )
    }

}
