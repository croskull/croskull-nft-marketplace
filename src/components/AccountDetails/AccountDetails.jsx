import React, { useEffect,componentDidMount } from "react";
import './AccountDetails.css';
import banner from "./banner.png"
import { ethers } from 'ethers';
import store from "../../redux/store";


const AccountDetails = () => {
  let { blockchain } = store.getState();
  let { accountBalance, accountAddress, contractDetected } = blockchain


  useEffect(() => {
    window.addEventListener("scroll", listenToScroll);
    showCroskullDiv();
    showTavernDiv();
    return () =>
      window.removeEventListener("scroll", listenToScroll);
  }, [])

  const listenToScroll = () => {
    let cr = document.getElementById('croskull-title').offsetTop;
    let tavern = document.getElementById('tavern-title').offsetTop;
    let winScroll = document.body.scrollTop ||
      document.documentElement.scrollTop;

    if ((window.innerHeight + winScroll) >= cr)
      showCroskullDiv()
      if ((window.innerHeight + winScroll) >= tavern)
      showTavernDiv()

    /*
  if ((winScroll - cr) < 100 && (winScroll - cr) > 0)
    showCroskullDiv()
    */


    console.log(cr, winScroll, window.innerHeight);
  };



  function showCroskullDiv() {
    let title = document.getElementById('croskull-title');
    let desc = document.getElementById('croskull-desc');
    let img = document.getElementById('croskull-img');
    let h = document.getElementById('croskull-img').height;
    h=h/2;
    console.log(h);
    title.style.opacity = 1;
    title.style.transform = 'translateY(0%)';
    img.style.opacity = 1;
    img.style.transform = 'translateX(0%)';

    desc.style.opacity = 1;
    desc.style.transform = 'translate(100%,-200%)'
    //desc.style.transform = 'translate(100%,-'+h+'px)';
  }

  function showTavernDiv() {
    let title = document.getElementById('tavern-title');
    let desc = document.getElementById('tavern-desc');
    let img = document.getElementById('tavern-img');

    title.style.opacity = 1;
    title.style.transform = 'translateY(0%)';
    img.style.opacity = 1;
    img.style.transform = 'translateX(0%)';
    let h = document.getElementById('tavern-img').height;
    h=h/2;
    console.log(h);
    desc.style.opacity = 1;
    desc.style.transform = 'translate(100%,-200%)';
  }

  if (contractDetected) {
    accountBalance = formatEther(accountBalance).slice(0, 5)
  }
  return (
    <>
      <div className="container container-prova">

        <div id='croskull-container'>
        <h1 id="croskull-title">What Is CroSkull</h1>
          <img id='croskull-img' src={banner}></img>
    
            
            <div id="croskull-desc">
              The Croskull is a collection of 6,666 uniquely generated NFTs stored in the Cronos Chain.
              <br></br>
              Each Croskull NFT is based on 6+ attributes with different rarities.
            </div>
        </div>

        <div id='tavern-container'>
          <h1 id="tavern-title">What Is Tavern</h1>
          <img id='tavern-img' src={banner}></img>
          <div id="tavern-desc">
            The Croskull is a collection of 6,666 uniquely generated NFTs stored in the Cronos Chain.
            <br></br>
            Each Croskull NFT is based on 6+ attributes with different rarities.
          </div>
        </div>
      </div>
    </>
  );
};

const formatEther = num => ethers.utils.formatEther(num)

export default AccountDetails;
