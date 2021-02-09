// footer.js
import React, { Component } from "react";

class Footer extends Component {
  render() {
    return (
      <footer className="page-footer">
        <div className="container">
          <h5>Data source</h5>
          <ul>
            <li>Yahoo!Finance</li>
          </ul>
        </div>
        <div className="footer-copyright">
          <div className="container">
            <i className="fa fa-copyright"></i>
            2021 PY Consulting Ltd.
            <span className="right">
              Made by
              <a href="https://fengxia41103.github.com/myblog">Feng Xia</a>
            </span>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
