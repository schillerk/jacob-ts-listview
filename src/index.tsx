import * as React from "react";
import * as ReactDOM from "react-dom";

import { ListView } from "./components/ListView";


// import { ListViewSlow1 } from "./components/ListViewSlow1";
// import { ListViewUncontrolled } from "./components/ListViewUncontrolled";

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';



const App = () => (
  <MuiThemeProvider>
    <ListView />
  </MuiThemeProvider>
);


ReactDOM.render(
    <App />,

    //<ListViewUncontrolled />,
    // <ListViewSlow1 />,

    document.getElementById("app-container")
);