// header.js
import React, { Component } from "react";
import "./stylesheets/header.sass";

class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="myheader text-right">
        <div className="container">
          <h1>Stock Market Analysis</h1>
          <p>Make . Money . Better</p>
        </div>
      </div>
    );
  }
}

export default Header;
