import React from "react";
import icon from "./favicon-32x32.png";
import Logo from "./logo-cr-skull-white.png";
import { Link } from "react-router-dom";

const Navbar = ({isAdmin, accountAddress}) => {
  return (
    <nav className="navbar navbar-expand-sm navbar-dark border-shadow header">
        <Link to="/" className="navbar-brand ml-2">
          <img src={Logo} alt="CroSkull Logo" className="site-logo"/>
        </Link>
        <button
          className="navbar-toggler"
          data-toggle="collapse"
          data-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="navbarNav" className="collapse navbar-collapse">
          <ul
            style={{ fontSize: "0.8rem", letterSpacing: "0.2rem" }}
            className="navbar-nav ml-auto"
          >
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>      
            <li className="nav-item">
              <Link to="/tavern" className="nav-link">
                Tavern
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/adventure" className="nav-link">
                Adventure
              </Link>
            </li>
            <li className="nav-item">
              <Link to="" className="nav-link" disabled>
                Shop
              </Link>
            </li>
            <li className="nav-item">
              <Link to="" className="nav-link" disabled>
                Bank
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/marketplace" className="nav-link" disabled>
                Marketplace
              </Link>
            </li>
            <li className="nav-item">
              <Link to="" className="nav-link" disabled>
                Buy Grave$
              </Link>
            </li>
            { isAdmin ?
              <li className="nav-item">
                <Link to="/admin" className="nav-link">
                  Admin Dashboard
                </Link>
              </li>
            : '' }
              <li className="nav-item">
              <Link  className="nav-link">
                  {accountAddress.substring(0,2)}...{accountAddress.substring(38,42)}
                </Link>
            </li>
          </ul>
        </div>
    </nav>
  );
};

export default Navbar;
