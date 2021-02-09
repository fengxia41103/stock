import React, { Component } from "react";
import { isNull } from "lodash";

class ToggleDetails extends Component {
  constructor(props) {
    super(props);
    const { show } = this.props;

    this.state = {
      show: isNull(show) ? true : show,
    };
    this.toggle_details = this.toggle_details.bind(this);
  }

  toggle_details() {
    this.setState({
      show: !this.state.show,
    });
  }

  render() {
    const { title, details } = this.props;
    const { show } = this.state;

    return (
      <div>
        <div
          className={show ? "my-showing" : null}
          onClick={this.toggle_details}
        >
          <i
            className={show ? "fa fa-minus-square-o" : "fa fa-plus-square-o"}
          ></i>
          &nbsp;
          {title}
        </div>

        <div className="">{show ? details : null}</div>
      </div>
    );
  }
}

export default ToggleDetails;
