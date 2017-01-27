import * as React from "react";
import { Gestalt } from "../domain"
import { LazyArray } from "../LazyArray"
import { FilteredInfiniteList } from "./FilteredInfiniteList"
import * as Util from '../util';

export interface AddRelatedFormProps extends React.Props<AddRelatedForm> {
  // options: AddRelatedFormOption[];
  // onChange: (value: string) => void;
  // itemClickHandler: (name: string) => void;
  // value: string;
  filterOptions: LazyArray<Gestalt | undefined>

  createAndRelate: (text: string) => void;
  relateToCurrentIdea: (targetId: string) => void

}

export interface AddRelatedFormState {
  inputVal?: string;
  suggestingRelations?: boolean;
  selectedOptionIdx?: number
}

export class AddRelatedForm extends React.Component<AddRelatedFormProps, AddRelatedFormState> {
  addRelated: HTMLElement
  listElem: HTMLElement

  constructor(props: AddRelatedFormProps) {
    super(props);
    this.state = {
      suggestingRelations: false,
      inputVal: '',
    }
    this.state.selectedOptionIdx = this._getNextIdx()

  }

  private _relateToCurrentIdea = (targetId: string) => {
    this.props.relateToCurrentIdea(targetId)
    this.addRelated && this.addRelated.focus()
    setTimeout(() => this.addRelated && this.addRelated.focus(), 10); //#hack
  }

  private _createAndRelateEventHandler = (e: React.SyntheticEvent<any>) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof this.state.inputVal === "undefined") { throw Error() }
    if (this.state.inputVal) {
      this.props.createAndRelate(this.state.inputVal);
      this.setState({ inputVal: '' })
      setTimeout(() => this.addRelated && this.addRelated.focus(), 10); //#hack
    }
  }

  private _relateEventHandler = (e: React.SyntheticEvent<any>, tgtId: string, suggIdx: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (this.state.selectedOptionIdx === undefined) { throw Error() }
    this.props.relateToCurrentIdea(tgtId)
    this.setState((prevState, props) => {
      return { selectedOptionIdx: this._getNextIdx(suggIdx, props.filterOptions, prevState) }
    })

    this.addRelated && this.addRelated.focus()
    setTimeout(() => this.addRelated && this.addRelated.focus(), 10); //#hack
  }




  // addRelated = (id: string) => {
  //   this.setState({ suggestingRelations: false });
  //   this.relateToCurrentIdea(id);

  //   // this.refs.addRelated.focus()
  //   // setTimeout(() => this.refs.addRelated.focus(), 10); //#hack
  // }





  // renderRaw() {
  //   const { relatedNotes } = this.props;
  //   return <span style={{ marginLeft: "150px", lineHeight: "21px" }}>
  //     {relatedNotes.map(({broken, note, relation}) =>
  //       <span key={"relatedNote" + relation.id} style={{ border: "1px solid lightgray", margin: "0 5px", padding: "1px 5px", fontFamily: "Arial, sans serif", fontSize: "12px", color: "maroon" }}>
  //         {"<>"} {relation.userInputText}
  //       </span>)}
  //   </span>
  // }
  private _getNextIdx(selectedOptionIdx = this.state.selectedOptionIdx, filterOptions = this.props.filterOptions, state = this.state) {
    let nextIdx: number
    if (selectedOptionIdx === undefined) {
      nextIdx = 0
    }
    else {
      if (selectedOptionIdx < filterOptions.length) {
        nextIdx = selectedOptionIdx + 1
      }
      else {
        nextIdx = selectedOptionIdx
      }
    }

    while (nextIdx < filterOptions.length && filterOptions.get(nextIdx) === undefined) {
      nextIdx++
    }

    //check end behavior
    if (nextIdx >= filterOptions.length) {
      if (state.inputVal) {
        nextIdx = filterOptions.length
      }
      else { //do nothing
        nextIdx = Math.max(0, filterOptions.length - 1)
      }
    }

    return nextIdx
  }

  private _getPrevIdx(selectedOptionIdx = this.state.selectedOptionIdx, filterOptions = this.props.filterOptions) {
    let nextIdx
    if (selectedOptionIdx === undefined) {
      nextIdx = 0
    }
    else {
      if (selectedOptionIdx > 0)
        nextIdx = selectedOptionIdx - 1
      else
        nextIdx = 0
    }

    while (nextIdx > 0 && filterOptions.get(nextIdx) === undefined) {
      nextIdx--
    }

    return nextIdx
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    switch (e.keyCode) {
      case Util.KEY_CODES.ENTER:
        if (this.state.selectedOptionIdx === undefined) { throw Error() }
        if (this.state.selectedOptionIdx < this.props.filterOptions.length) {
          const selOpt = this.props.filterOptions.get(this.state.selectedOptionIdx)
          if (selOpt === undefined) { throw Error() }
          this._relateEventHandler(e, selOpt.gestaltId, this.state.selectedOptionIdx)
        }
        else {
          this._createAndRelateEventHandler(e)
        }
        // <thi></thi>s.props.addGestaltAsChild("", this.props.index + 1)
        //#todo
        break;
      case Util.KEY_CODES.TAB:
        e.preventDefault()
        e.stopPropagation()

        // this.props.indentChild(this.props.index)
        break;

      case Util.KEY_CODES.DOWN:
        e.preventDefault()
        e.stopPropagation()
        const elemBtm = e.currentTarget.getBoundingClientRect().bottom
        const viewPortBtm = this.listElem.scrollTop + this.listElem.clientHeight
        debugger
        if (elemBtm > viewPortBtm) {
          this.listElem.scrollTop += elemBtm - viewPortBtm
        }
        this.setState((prevState, props: AddRelatedFormProps) => {
          return { selectedOptionIdx: this._getNextIdx(prevState.selectedOptionIdx, props.filterOptions, prevState) }
        })
        break;
      case Util.KEY_CODES.UP:
        e.preventDefault()
        e.stopPropagation()
        this.setState((prevState, props: AddRelatedFormProps) => {
          return { selectedOptionIdx: this._getPrevIdx(prevState.selectedOptionIdx, props.filterOptions) }
        })
        break;

    }

  }

  render() {
    // if (this.props.rawRelations == true) return this.renderRaw();
    if (typeof this.state.inputVal === "undefined") { throw Error() }

    //#todo do this more safely 
    //https://github.com/Microsoft/TypeScript/issues/3960 @mrThomasTeller This approach is not a good solution IMHO since it needs an any cast. For instance, the constructor parameters are not declared...
    const GestaltFilteredInfiniteList: (new () => FilteredInfiniteList<Gestalt>) = FilteredInfiniteList as any

    return (
      <span style={{ position: "relative", margin: "0 0 0 40px", }} >

        {/* add related input and dropdown */}
        <span
          onFocus={() => this.setState({ suggestingRelations: true })}
          // onBlur={() => this.setState({ suggestingRelations: false })}
          onKeyDown={this.onKeyDown}
        >

          {/* add related input */}
          <input
            style={{ position: "relative", width: "120px" }}
            type="text"
            placeholder="+ Add Related"
            onChange={(e) => this.setState({ inputVal: e.currentTarget.value })}
            value={this.state.inputVal}
            ref={(e) => this.addRelated = e} />

          {/* add relations dropdown*/}
          {!this.state.suggestingRelations ? null :
            <ul style={{
              position: "absolute", left: "0px", top: "20px", padding: "0 3px", zIndex: 999, backgroundColor: "white", border: "1px solid lightGray", width: "240px",
              display: (this.state.suggestingRelations ? "block" : "none"),
              listStyleType: "none"
            }}
              ref={(e) => this.listElem = e}>
              <GestaltFilteredInfiniteList
                containerHeight={100}
                fixedElementHeight={36}

                data={this.props.filterOptions}
                filter={this.state.inputVal}

                textFilterFn={(filter: string) => (
                  (g: Gestalt | undefined) => (!!g &&
                    (g.text.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
                  )
                )
                }

                elemGenerator={(suggestion: Gestalt | undefined, idx: number): JSX.Element | null => suggestion ?

                  <li
                    className={"suggestion"
                      + (idx === this.state.selectedOptionIdx
                        ? " selected"
                        : "")
                    }
                    onMouseDown={(e) => {
                      this._relateEventHandler(e, suggestion.gestaltId, idx)
                    }}
                    onMouseOver={e => {
                      this.setState({ selectedOptionIdx: idx })
                    }}
                    key={suggestion.gestaltId}>
                    {suggestion.text}
                  </li> : null
                }

                hideResultsWhileFiltering
              />

              {this.state.inputVal.length <= 0 ? null :
                <li
                  style={{ listStyleType: "none" }}
                  className={"suggestion" +
                    (this.props.filterOptions.length === this.state.selectedOptionIdx
                      ? " selected"
                      : "")
                  }
                  onMouseDown={this._createAndRelateEventHandler}

                  onMouseOver={e => {
                    this.setState({ selectedOptionIdx: this.props.filterOptions.length })
                  }}
                >
                  <span><span style={{ color: "gray" }}>+ add &quot;</span>{this.state.inputVal}<span style={{ color: "gray" }}>&quot; as new idea and relate </span></span>
                </li>
              }
            </ul>
          }

        </span>
      </span>

    );
  }
}
