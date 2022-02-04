import {
  ethers
} from 'ethers';
import React , { useEffect, useState } from "react";
import store from "../../redux/store";
import Logo from "./logo-cr-skull-white.png";
import { Link } from "react-router-dom";
import './navbar.css';

const Navbar = () => {
  let { blockchain, data } = store.getState();
  let { rewardPlusMalus, malusFee, soulsGenerated, croSkulls, rewards, croSkullsStaked } = data
  let { accountBalance, accountAddress } = blockchain
  let rewardFormatted = formatEther(rewardPlusMalus);
  rewardFormatted = rewardFormatted.slice(0, 5 );
  return (
    <nav className="boxed navbar navbar-expand-sm header">
      <Link to="/" className="crLogo">
        <img src={Logo} alt="CroSkull Logo" className="site-logo"/>
      </Link>
      <button
        className="navbar-toggler"
        data-toggle="collapse"
        data-target="#navbarNav"
      >
        <span className="navbar-toggler-icon">X</span>
      </button>
      <div 
        className="flex-v balances"
      >
        <span>Balance</span>
        <span>{ `${ formatEther(accountBalance).slice(0, 5 ) } CRO` }</span>
        <span>{ `${croSkulls.length ? croSkulls.length : 0} Skulls` }</span>
        <span>{ `${ rewardFormatted } Grave` }</span>
      </div>
      <div 
        className="flex-v season"
      >
        <span>Season Stats</span>
        <span>{ `${ croSkullsStaked.length ? croSkullsStaked.length : 0} Skulls` }</span>
        <span>{ `${ formatEther( rewards ).slice(0, 5 ) } Grave` }</span>
        <span>{ `${ rewardFormatted } -(${malusFee}%) Grave` }</span>
      </div>
      <div id="navbarNav" className="collapse navMenu navbar-collapse">
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
            <Link to="/marketplace" className="nav-link">
              Marketplace
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
        </ul>
      </div>
      <div 
        className="flex-v"
      >
        <button
          className="account-button"
        >
          { `${accountAddress.substr(0, 5)}...${accountAddress.substr(39, 41)}` }
        </button>
      </div>
    </nav>
  );
};


const formatEther = (bn) => {
  return ethers.utils.formatEther(bn)
}

export default Navbar;
