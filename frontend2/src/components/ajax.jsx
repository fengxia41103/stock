import React, { useState, useEffect } from "react";
import ProgressComponent from "./progress.jsx";
import { debounce } from "lodash";

//****************************************
//
//    Common AJAX containers
//
//****************************************
function AjaxContainer(props) {
  const [loading, setLoading] = useState(false);

  const getData = () => {
    if (loading) {
      return null;
    } else {
      setLoading(true);
    }

    // Get data
    const { apiUrl, handleUpdate, controller } = props;
    /*     console.log("Getting: " + apiUrl); */
    const signal = controller.signal;

    // Work horse
    fetch(apiUrl)
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        if (typeof json != "undefined" && json) {
          handleUpdate(json);
        }
      })
      .catch(error => {});
  };

  const debounceGetData = debounce(() => {
    getData();
  }, 200);

  useEffect(() => {
    // Get data
    // https://medium.com/@santoshpunase/integrating-apis-in-react-js-constructor-vs-componentwillmount-vs-componentdidmount-e0b98c3efecd
    debounceGetData();
  });

  return (
    // Progress bar
    <ProgressComponent />
  );
}

export default AjaxContainer;
