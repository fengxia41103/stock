// main.js
import "es5-shim";
import "es5-shim/es5-sham";
import "console-polyfill";
import "font-awesome/css/font-awesome.css";
import "materialize-loader";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./stylesheets/my.css";

import React, { Component } from "react";
import ReactDom from "react-dom";
import Header from "./header.jsx";
import Footer from "./footer.jsx";
import RootBox from "./rootbox.jsx";

class Page extends Component {
  render() {
    let sth = "";

    return (
      <div id="wrap" style={{ backgroundColor: "#fefefe" }}>
        <Header />
        <RootBox />
        <Footer />
      </div>
    );
  }
}

// bootstrap the application
ReactDom.render(<Page />, document.getElementById("app"));
