import React from "react";
import AjaxContainer from "./ajax.jsx";
import yaml from "js-yaml";

var _ = require("lodash");

//****************************************
//
//    YAML AJAX containers
//
//****************************************
var AjaxYamlContainer = React.createClass({
  workHorse: function(api, handleUpdate) {
    // Work horse
    fetch(api)
      .then(function(resp) {
        return resp.text();
      })
      .then(function(text) {
        if (typeof text != "undefined" && text) {
          handleUpdate(text);
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  render: function() {
    return <AjaxContainer workHorse={this.workHorse} {...this.props} />;
  },
});

module.exports = AjaxYamlContainer;
