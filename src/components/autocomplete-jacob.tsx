import * as React from "react";
import { Gestalt } from "../domain"

export interface AddRelatedFormProps extends React.Props<AddRelatedForm> {
  // options: AddRelatedFormOption[];
  // onChange: (value: string) => void;
  // itemClickHandler: (name: string) => void;
  // value: string;
  createAndRelate: (text: string) => void;
  relateToCurrentIdea: (targetId: string) => void

}

export interface AddRelatedFormState {
  inputVal?: string;
  suggestingRelations?: boolean;
}

export class AddRelatedForm extends React.Component<AddRelatedFormProps, AddRelatedFormState> {

  constructor(props: AddRelatedFormProps) {
    super(props);
    this.state = {
      suggestingRelations: false,
      inputVal: '',
    }
  }

  relateToCurrentIdea = (targetId: string) => {
    this.props.relateToCurrentIdea(targetId)
  }

  // addRelated = (id: string) => {
  //   this.setState({ suggestingRelations: false });
  //   this.relateToCurrentIdea(id);

  //   // this.refs.addRelated.focus()
  //   // setTimeout(() => this.refs.addRelated.focus(), 10); //#hack
  // }


  //#question should i make this a pure function of props?
  filteredSuggestions = () => {
    if (!this.state.suggestingRelations) return [];

    const {note, allNotes, relatedNotes} = this.props;


    let suggestions = allNotes.filter((currNote) =>
      true
      && note
      && currNote.id !== note.id
      && !relatedNotes.find(n => n.id === currNote.id)
    )

    suggestions = filterEntries(suggestions, this.state.inputVal)

    return suggestions

  }



  createAndRelate = (text: string) => {
    this.props.createAndRelate(text);
    this.setState({ inputVal: '' })
  }

  // renderRaw() {
  //   const { relatedNotes } = this.props;
  //   return <span style={{ marginLeft: "150px", lineHeight: "21px" }}>
  //     {relatedNotes.map(({broken, note, relation}) =>
  //       <span key={"relatedNote" + relation.id} style={{ border: "1px solid lightgray", margin: "0 5px", padding: "1px 5px", fontFamily: "Arial, sans serif", fontSize: "12px", color: "maroon" }}>
  //         {"<>"} {relation.userInputText}
  //       </span>)}
  //   </span>
  // }

  render() {
    // if (this.props.rawRelations == true) return this.renderRaw();
    if (typeof this.state.inputVal === "undefined") { throw Error() }
    return (
      <span style={{ position: "relative", margin: "0 40px", }}>

        {/* add related input and dropdown */}
        <span
          style={{ width: "120px" }}
          onFocus={() => this.setState({ suggestingRelations: true })}
          onBlur={() => this.setState({ suggestingRelations: false })}
          >

          {/* add related input */}
          <input
            style={{ position: "absolute", left: "0px", width: "120px" }}
            type="text"
            placeholder="+ Add Related"
            onChange={(e) => this.setState({ inputVal: e.currentTarget.value })}
            value={this.state.inputVal}
            ref="addRelated" />

          {/* add relations dropdown*/}
          <ul style={{
            position: "absolute", left: "0px", top: "20px", padding: "0 3px", zIndex: 999, backgroundColor: "white", width: "120px",
            display: (this.state.suggestingRelations ? "block" : "none")
          }}>
            {this.filteredSuggestions()
              .map((suggestion: Gestalt) => {
                return <li
                  className="suggestion"
                  onMouseDown={() => this.addRelated(suggestion.gestaltId)}
                  key={suggestion.gestaltId}>
                  {suggestion.text}
                </li>
              })}
            <li
              className="suggestion"
              onMouseDown={() => {
                if (typeof this.state.inputVal === "undefined") { throw Error() }
                this.createAndRelate(this.state.inputVal)
              } }
              >
              {this.state.inputVal.length > 0 ?
                <span><span style={{ color: "gray" }}>+ add &quot;</span>{this.state.inputVal}<span style={{ color: "gray" }}>&quot; as new idea and relate </span></span>
                : ''}
            </li>
          </ul>

        </span>
      </span>

    );
  }
}

AddRelatedForm.propTypes = {
  allNotes: React.PropTypes.array.isRequired,
  // rawRelations: React.PropTypes.bool.isRequired,
  relatedNotes: React.PropTypes.array.isRequired,
  relateToCurrentIdea: React.PropTypes.func.isRequired,
  addNote: React.PropTypes.func.isRequired,
  note: React.PropTypes.object.isRequired,

  addRelation: React.PropTypes.func.isRequired,
  relations: React.PropTypes.array.isRequired,
  editNote: React.PropTypes.func.isRequired
};
