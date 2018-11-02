import axios from "axios";
import { FETCH_USER, FETCH_SURVEYS } from "./types";

export const fetchUser = () => async dispatch => {
  //axis is a lib that allows us to do ajax calls (fetch data)
  const res = await axios.get("/api/current_user");

  //now we dispatch our action our reducers (we always specify a type and a payload (state))
  //the corresponding reducer will pick up the data, modify the sate and cause all components to re-render
  //redux-thunk makes sure that the information is dispatched properly
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = token => async dispatch => {
  const res = await axios.post("/api/stripe", token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitSurvey = (values, history) => async dispatch => {
  const res = await axios.post("/api/surveys", values);

  history.push("/surveys");
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const fetchSurveys = () => async dispatch => {
  const res = await axios.get("/api/surveys");

  dispatch({ type: FETCH_SURVEYS, payload: res.data });
};
