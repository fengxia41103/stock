import React, { Component } from "react";
import { isNull, isUndefined } from "lodash";
import AjaxContainer from "./ajax.jsx";

class Fetch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      get_data: false,
      controller: new AbortController(),
    };

    this.handleUpdate = this.handleUpdate.bind(this);
    this.render_data = this.render_data.bind(this);
  }

  handleUpdate(data) {
    this.setState({
      data: data,
      get_data: false,
    });
  }

  componentDidMount() {
    // set flag after mount
    const { data } = this.state;
    if (isNull(data)) {
      this.setState({
        get_data: true,
      });
    }
  }

  componentWillUnmount() {
    // signal to cancel ongoing fetch
    const { controller } = this.state;
    controller.abort();
  }

  render_data(data) {
    return "render data";
  }

  render() {
    const { data, get_data, controller } = this.state;
    const { api } = this.props;

    // u can define `resource` either in state
    // or in props
    let resource = this.state.resource;
    if (isUndefined(resource) || isNull(resource)) {
      resource = this.props.resource;
    }

    // go get data
    if (get_data) {
      const query = api + encodeURI(resource);
      return (
        <AjaxContainer
          apiUrl={query}
          handleUpdate={this.handleUpdate}
          controller={controller}
        />
      );
    }

    // initial rendering
    if (isNull(data)) return null;

    // data is here
    return this.render_data(data);
  }
}

export default Fetch;
