//this is a file from the node_modules folder, so we don't need to specify a relative path
//also, there is no need to assign this to a variable
import "materialize-css/dist/css/materialize.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";

import App from "./components/App";
import reducers from "./reducers";

// Development only axios helpers!
import axios from "axios";
window.axios = axios;

const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

//root is defined in public/index.html
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("#root")
);
