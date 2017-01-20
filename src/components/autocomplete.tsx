import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {TextInput, TextInputProps} from './textInput';
import * as $ from "jquery";
import * as Util from '../../util';

enum OptionKind {
    hashtag,
    person,
    relation
}

export interface AutocompleteOption {
    name: string;
    value: number;
    //kind: OptionKind;
}

export interface AutocompleteProps extends React.Props<Autocomplete> {
    options: AutocompleteOption[];
    onChange: (value: string) => void;
    itemClickHandler: (name: string) => void;
    value: string;

}

export interface AutocompleteState {
    inputVal?: string;
    active?: boolean;
}

const PLACEHOLDER_VALUE = "NO_OPTION_SELECTED";

export class Autocomplete extends React.Component<AutocompleteProps, AutocompleteState>{
    
    handleItemClick(value: string){
             
        console.log("clicked item with value " + value);

        var nextState : AutocompleteState = {
            active: false,
            inputVal: ""
        };
        
        this.setState(nextState, () => {
            this.props.itemClickHandler(value);
        });
            
    }

    handleNewItemClick(){

        var nextState : AutocompleteState = {
            active: false,
            inputVal: ""
        };
        
        var capturedInputVal = this.state.inputVal;

        this.setState(nextState, () => {
            this.props.itemClickHandler(capturedInputVal);
        });

    }

    onChangeHandler(val: string){
        var nextState : AutocompleteState = {
            inputVal: val
        };
        this.setState(nextState);
    }

    toggleActive(){

        var nextActiveState = !this.state.active;
        var nextState : AutocompleteState = {
            active: nextActiveState
        };
        this.setState(nextState);
        
    }

    render(){
        var val = this.props.value !== undefined ? this.props.value.toString() : undefined;
        var filteredOptions = this.getFilteredOptions();
        return <div style={STYLES}>
                    <div onClick={this.toggleActive.bind(this)}>
                        <TextInput val={this.state.inputVal} onChange={this.onChangeHandler.bind(this)}>
                        </TextInput>
                    </div>
                    {
                        this.state.active ? 
                        <div style={POPUP_STYLES}>
                            {
                                filteredOptions.map((opt) => {
                                    return (
                                        <div key={opt.name}
                                             className={"autocomplete-option"}
                                             style={OPTION_STYLES}
                                             onClick={() => {this.handleItemClick(opt.name)}}>
                                            {opt.name}
                                        </div>
                                    )
                                })
                            }
                            <div className={"autocomplete-option"} key={Util.getGUID()} onClick={this.handleNewItemClick.bind(this)}>
                                {" + " + this.state.inputVal}
                            </div>
                        </div> : ''
                    }
                </div>
    }

    getFilteredOptions(){
        var filterText = this.state.inputVal.toLowerCase();
        var filtered = 
        this.props.options.filter((opt) => {
            var filterTextLength = filterText.length;
            var subStr = opt.name.substr(0, filterTextLength).toLowerCase();
            return(filterText.localeCompare(subStr) === 0);
        });
        return filtered;
    }

    componentWillMount(){
        var initialState : AutocompleteState = {
            inputVal: ""
        };
        this.setState(initialState);
    }

    selectRef: HTMLSelectElement;
    setRef(elt: HTMLSelectElement){
        this.selectRef = elt;
    }

     sub: JQuery;

    handleWindowClick(e){
        if (ReactDOM.findDOMNode(this).contains(e.target)) {
            return;
        } else {
            var nextState : AutocompleteState = {
                active: false
            };
            this.setState(nextState);
        }
    }

    unsubscribeFn: () => void;
    
    subscribeWindowListener(){
        var handler = (e) => {
            this.handleWindowClick(e);
        }
        this.sub = $(document).bind("click", handler);
        this.unsubscribeFn = () => {
            $(document).unbind("click", handler);
        };
    }

    componentDidMount(){
        this.subscribeWindowListener();
    }

    componentWillUnmount(){
        this.unsubscribeFn();
    }


}

const STYLES = {
    height: "100%",
    width: "100%",
    position: "relative"
}

const POPUP_STYLES = {
    width: 250,
    position: "absolute",
    left: 0,
    backgroundColor: "white",
    border: "1px solid darkgrey",
    boxShadow: "2px 2px 2px 0px rgba(0,0,0,0.75)",
    zIndex: 1
}

const OPTION_STYLES = {
    maxHeight: 25,
    width: "100%",
    display: "flex",
    alignItems: "center",
    paddingLeft: 5,
    boxSizing: "border-box",
    borderBottom: "1px solid #ccc"
}