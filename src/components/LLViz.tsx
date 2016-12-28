import * as React from "react";

import {LinkedList, Stack} from "../LinkedList"

// export interface LLVizProps {

// }

interface LLVizState {
    theList: Stack<string>
    lastPopped: string
}


export class LLViz extends React.Component<undefined, LLVizState> {

    
  constructor(props:undefined) {
    super(props);
    this.state = { theList: new LinkedList<string>(), lastPopped: "" };
  }

    render() {
        return <div>
            Stack: 
            <div>
                "{this.state.theList.toString() || "\u00a0"}"
            </div>
            <div>
                [{this.state.theList.toArray().map((e)=>e.toString()+", ")  || "\u00a0"}]
            </div>
            <button onClick={(): void  => { this.state.theList.push("yo"+Math.round(Math.random()*10)); this.forceUpdate()} }>push</button>
            <br />
            <button onClick={(): void =>  { this.state.lastPopped=this.state.theList.pop(); this.forceUpdate(); return }  }>pop</button><span>{this.state.lastPopped}</span>
        </div>
    }

}
