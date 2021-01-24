import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import List from './List';
import Checkout from './Checkout';
export default class App extends React.Component<{}, {}> {

  constructor(props: any) {
    super(props);
  }


  render() {
    
    return (
      <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <List />
          </Route>
          <Route path="/list">
            <List />
          </Route>
          <Route path="/checkout">
            <Checkout/>
          </Route>
        </Switch>
      </div>
      </Router>
    )
  }
}
