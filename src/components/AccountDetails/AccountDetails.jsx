import React from "react";
import './AccountDetails.css';
import banner from "./banner.png"
import { ethers } from 'ethers';
import store from "../../redux/store";


const AccountDetails = () => {
  let { blockchain } = store.getState();
  let { accountBalance, accountAddress, contractDetected } = blockchain
  if( contractDetected ){
    accountBalance = formatEther(accountBalance).slice(0, 5 )
  }
  return (
      <div className="container ac-home">
        <h1 className="ac-title">CroSkull NFT</h1>
        <img 
          src={banner} 
          width={"100%"}
          alt="CroSkulls Banner"
        />
        <p className="ac-text ac-br">
          The Croskull is a collection of 6,666 uniquely generated NFTs stored in the Cronos Chain.
        <br></br>
          Each Croskull NFT is based on 6+ attributes with different rarities.
        </p>
        <p className="ac-text ac-br">
        Want to know more? <span><a className="link" href="https://www.croskull.com">Click Here!</a></span>
        </p>
        <hr className="my-4" />
        <p className="ac-text">Account address :</p>
        <h4 className="ac-text">{accountAddress}</h4>
        <p className="ac-text">Account balance :</p>
        <h4 className="ac-text">{accountBalance} CRO</h4>
      </div>
  );
};

const formatEther = num => ethers.utils.formatEther(num)

export default AccountDetails;
