import React, { useState } from "react";
import { isNull } from "lodash";

function ToggleDetails(props) {
  const [show, setShow] = useState(isNull(props.show) ? true : props.show);
  const toggle_details = () => {
    setShow(!show);
  };

  const { title, details } = props;
  return (
    <div>
      <div className={show ? "my-showing" : null} onClick={toggle_details}>
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

export default ToggleDetails;
