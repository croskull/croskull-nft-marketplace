import React, { useEffect, useState } from "react";

import "react-quill/dist/quill.snow.css";
import Grave from "../Navbar/grave.png";
import Soul from "../Navbar/soul.png";
import GraveBurn from "../Navbar/grave-burn.png";
import Rudes from "./rude.png";
import GraveToRude from "./GraveToRude.png"
import House from "./house.png"
import Fountain from "./Fountain.png"
import Castle from "./castle.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './Bank.css';
import MetricContainer from "../MetricContainer/MetricContainer";
import { init } from "react-async";
const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/";
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/";


const Bank = ({ accountAddress }) => {
  const [detailsView, setDetailsView] = useState(false)
  const [detailsView2, setDetailsView2] = useState(false)
  const [apy, setApy] = useState(283)
  const [emission, setEmission] = useState(1.523432432423)
  const [marketCap, setMarketCap] = useState(12897)
  const [locked, setLocked] = useState(65874.23432432)
  const [balance, setBalance] = useState(876.9865764875)
  const [profit, setProfit] = useState(7.938387)
  const [staked, setStaked] = useState(87.83736)
  const [inputGrave, setInputGrave] = useState(0)
  const [inputGraveStaked, setInputGraveStaked] = useState(0)
  const [angleIconFarm, setAngleIconFarm] = useState([false, false]);
  const [angleIconPool, setAngleIconPool] = useState([false, false]);




  const handleFieldChange = (event) => {
    let value = event.target.value
    if (value > balance) {
      event.target.value = balance
    }

    setInputGrave(value);
  }
  const handleFieldChangeStaked = (event) => {
    let value = event.target.value
    if (value > staked) {
      event.target.value = staked
    }

    setInputGraveStaked(value);
  }
  const getMax = () => {
    let d = document.getElementById("input-grave");
    d.value = balance
    setInputGrave(balance);
  }
  const getMaxStaked = () => {
    let d = document.getElementById("input-grave-staked");
    d.value = staked
    setInputGraveStaked(staked);
  }

  const EnableFarm = (i) => {
    setFarmAngleState(i);
    let d = document.getElementById("farm-" + i);
    setDetailsView2(false);
    if (d.getAttribute('class').includes('wrapped')) {
      d.setAttribute('class', 'data-container')
    } else {
      d.setAttribute('class', 'data-container-wrapped')
    }
  }
  const EnablePool = (i) => {
    setPoolAngleState(i);
    let d = document.getElementById("pool-" + i);
    setDetailsView2(false);
    if (d.getAttribute('class').includes('wrapped')) {
      d.setAttribute('class', 'data-container')
    } else {
      d.setAttribute('class', 'data-container-wrapped')
    }
  }

  const setFarmAngleState = (i) => {
    let ids = [...angleIconFarm];
    ids[i] = !ids[i];
    setAngleIconFarm(ids);
  }
  const setPoolAngleState = (i) => {
    let ids = [...angleIconPool];
    ids[i - 1] = !ids[i - 1];
    setAngleIconPool(ids);
  }

  const c1 = {
     address: '0xb39384',
     amount: 100,
     StartTimeStamp: 1648677600,
     unluckTimeStamp: 1649282400,
     usedWishbones: 10,
     duration: 14,
     init: 1002
  }
  const c2 = {
    address: '0xb39384',
    amount: 100,
    StartTimeStamp: 1648677600,
    unluckTimeStamp: 1649887200,
    usedWishbones: 10,
    duration: 14,
    init: 1002
 }
 const c3 = {
  address: '0xb39384',
  amount: 100,
  StartTimeStamp: 1648677600,
  unluckTimeStamp: 1650492000,
  usedWishbones: 10,
  duration: 14,
  init: 1002
}

const contracts = [c1,c2,c3];

  function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  function dateDiff(date1,date2){
    var d1 = new Date(date1 * 1000);
    var d2 = new Date(date2 * 1000);
    return (d2-d1)/1000/24/3600;
  }
    
  function textSelector(d)
  {
    switch(d){
      case 7:
        return 'House';
        case 14:
        return 'Fountain';
        case 21:
        return 'Castle';
    }
  }
  function imgSelector(d)
  {

    switch(d){
      case 7:
        return House;
        case 14:
        return Fountain;
        case 21:
        return Castle;
    }
  }
    
  const DAY_IN_SEC = 60 * 60 * 24 * 1000;
  const HUNDRED_DAYS_IN_SEC = 100 * DAY_IN_SEC//100 * DAY_IN_SEC;
  function formatDate(data) {
    let timestamp = data - (new Date( ).getTime() / 1000);
    let tsHours = timestamp / 60 / 60
    let days = parseInt(timestamp / DAY_IN_SEC)
    let hoursDiff = tsHours - (days * 24)
    let hours = parseInt(hoursDiff)
    let tsMinutes = hoursDiff * 60
    let minutes = parseInt(tsMinutes - (hours * 60))
    return {
      days,
      hours,
      minutes
    }
  }
  

  return (

    <>
      <div className="global-container">

        <div className="sk-row sk-flex gd-container">
          <div className="bank-gd-row">
            <div className="bank-gd-box">
              <p><h3>${locked.toFixed(2)}</h3></p>
              <p>Total Value Locked</p>
            </div>
            <div className="bank-gd-box ">
              <p><h3>${marketCap.toFixed(2)}</h3></p>
              <p>Market Cap</p>
            </div>
          </div>
          <div className="bank-gd-row">
            <div className="bank-gd-box ">
              <p><h3>{emission.toFixed(2)} Rude per Grave</h3></p>
              <p>Emission</p>
            </div>
            <div className="bank-gd-box">
              <p><h3>Up to {apy.toFixed(2)}%</h3></p>
              <p>Apy</p>
            </div>
          </div>
        </div>

        <div class="switcher-container">
          <div className="switcher-wrapper">
            <button
              className={`switcher-button view-button ${detailsView ? '' : 'active'}`}
              onClick={
                () => setDetailsView(false)
              }
            >
              FARMS
            </button>
            <button
              className={`switcher-button view-button ${!detailsView ? '' : 'active'}`}
              onClick={
                () => setDetailsView(true)
              }
            >
              POOLS
            </button>
          </div>
          <div className='pool-content' hidden={detailsView}>

            <div className="choise-container">
              <div className="simulate-container">
                <h1>Choose Your Contract</h1>
                <p>Grave Amount</p>
                <input type='number' placeholder="0"></input>
                <p>Wishbone Amount</p>
                <input type='number' placeholder="0" step="10" max="300"></input>
                <br />
                <button className="skull-button">CALCULATE</button>
              </div>
              <div className="contract-container">
                <div className="contract-content">
                  <div className="contract-box sk-box">
                    <h1>1 WEEK</h1>
                    <h3>APY: 129%</h3>
                    <h3>Rewards: 75000</h3>
                    <button className="skull-button">HELP BUILDING!</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>2 WEEK</h1>
                    <h3>APY: 129%</h3>
                    <h3>Rewards: 75000</h3>
                    <button className="skull-button">HELP BUILDING!</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>3 WEEK</h1>
                    <h3>APY: 129%</h3>
                    <h3>Rewards: 75000</h3>
                    <button className="skull-button">HELP BUILDING!</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>1 MONTH</h1>
                    <h3>APY: 129%</h3>
                    <h3>Rewards: 75000</h3>
                    <button className="skull-button">HELP BUILDING!</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>2 MONTH</h1>
                    <h3>APY: 129%</h3>
                    <h3>Rewards: 7500</h3>
                    <button className="skull-button">HELP BUILDING!</button>
                  </div>
                </div>
              </div>
            </div>

           { contracts.map( (contract,i) => {
              let currentTimestamp = parseInt( new Date( ).getTime() / 1000 )
              let raffleDuration = currentTimestamp < contract.StartTimeStamp ? contract.unluckTimeStamp - currentTimestamp : 0
              let ending = formatDate(raffleDuration)
           return(
             <>
            <div className="data-row first">
              <div className="bank-name">
                <div className="bank-name-img">
                  <img src={imgSelector(dateDiff(contract.StartTimeStamp,contract.unluckTimeStamp))} />
                </div>
                <div className="bank-name-text">
                  <h1>{textSelector(dateDiff(contract.StartTimeStamp,contract.unluckTimeStamp))} Building</h1>
                  <h3>{dateDiff(contract.StartTimeStamp,contract.unluckTimeStamp)}Days</h3>
                </div>
              </div>
              <div className="data-row-box only-d">
                <div className="metric-container">
                  <span>Start
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa fa Earned</span>
                    </span>
                  </span>
                </div>
                <p>{timeConverter(contract.StartTimeStamp)}</p>
              </div>
              <div className="data-row-box only-d">
                <div className="metric-container">
                  <span>End
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa fa APR</span>
                    </span>
                  </span>
                </div>
                <p>{timeConverter(contract.unluckTimeStamp)}</p>
              </div>
              <div className="data-row-box ">
                <div className="metric-container">
                  <span>Amount Staked
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa Total Staked</span>
                    </span>
                  </span>
                </div>
                <p>833333<img src={Grave} className='skull-icon' /></p>
              </div>
              <div className="data-row-box ">
                <div className="metric-container">
                  <span>Wishbones
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa fa End In</span>
                    </span>
                  </span>
                </div>
                <p>10</p>
              </div>
              <div className="data-row-box angle">
                <p onClick={() => EnableFarm(i)} className="angle"> <FontAwesomeIcon icon={angleIconFarm[i] ? faAngleUp : faAngleDown} /></p>
              </div>
            </div>

            <div className="data-container-wrapped" id={'farm-'+(i)}>
              <div className="farm-box">
                <h1>Ending in:</h1>
                <h1>3D 5H 45M</h1>
                <h3>APY:<span>500%</span></h3>
                <h3>Rewards: <span>300<img src={Grave} className="skull-icon"/></span></h3>
                <h3> <span>25<img src={Soul} className="skull-icon"/></span></h3>
                <button className="skull-button">CLAIM</button>
              </div>
            </div>
            </>
           )
 })}
            <div className="data-row-last">
              <p>To Top <FontAwesomeIcon icon={faAngleUp} /></p>
            </div>

          </div>










          <div className="farm-content" hidden={!detailsView}>
          <div className="data-row first">
              <div className="bank-name">
                <div className="bank-name-img">
                  <img src={GraveToRude} />
                </div>
                <div className="bank-name-text">
                  <h1>Earn Rude</h1>
                  <h3>Stake Grave</h3>
                </div>
              </div>
              <div className="data-row-box">
                <div className="metric-container">
                  <span>Earned
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa fa Earned</span>
                    </span>
                  </span>
                </div>
                <p>83</p>
              </div>
              <div className="data-row-box">
                <div className="metric-container">
                  <span>APR
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa fa APR</span>
                    </span>
                  </span>
                </div>
                <p>835%</p>
              </div>
              <div className="data-row-box only-d">
                <div className="metric-container">
                  <span>Total Staked
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa Total Staked</span>
                    </span>
                  </span>
                </div>
                <p>833333$</p>
              </div>
              <div className="data-row-box only-d">
                <div className="metric-container">
                  <span>End in
                    <span className="tooltip-toggle">
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="tooltip-icon"
                      />
                      <span className="sk-tooltip">Cosa fa End In</span>
                    </span>
                  </span>
                </div>
                <p>7D</p>
              </div>
              <div className="data-row-box angle">
                <p onClick={() => EnablePool(1)} className="angle"> <FontAwesomeIcon icon={angleIconPool[0] ? faAngleUp : faAngleDown} /></p>
              </div>
            </div>

            <div className="data-container-wrapped" id="pool-1">
              <div class="switcher-container">
                <div className="switcher-wrapper">
                  <button
                    className={`switcher-button view-button ${detailsView2 ? '' : 'active'}`}
                    onClick={
                      () => setDetailsView2(false)
                    }
                  >
                    Stake
                  </button>
                  <button
                    className={`switcher-button view-button ${!detailsView2 ? '' : 'active'}`}
                    onClick={
                      () => setDetailsView2(true)
                    }
                  >
                    Unstake
                  </button>
                </div>

                <div className="sk-box data-box" hidden={detailsView2}>
                  <h1><img src={Grave} className="skull-icon"></img>Stake Grave Earn $Rude</h1>
                  <hr></hr>
                  <div className="data-box-content">
                    <p>APY/APR:<span>906,86/230,94%</span></p>
                    <p>Staked:<span>{staked.toFixed(2)}<img src={Grave} className="skull-icon"></img></span></p>
                    <p>Profit:<span>{profit.toFixed(2)}<img src={Rudes} className="skull-icon"></img></span></p>
                    <p><span>{profit.toFixed(2)}<img src={Soul} className="skull-icon"></img></span></p>
                    <p className="balance"> {balance.toFixed(2)} Balance</p>
                    <div className="input-content">
                      <button className="skull-button" onClick={() => getMax()}>MAX</button>
                      <input id="input-grave" type="number" placeholder="0" onChange={handleFieldChange} step=".0000000001"></input>
                    </div>
                    <button className={inputGrave > 0 ? 'skull-button stake-button' : 'disabled-button'} disabled={inputGrave < 0 ? true : false}>STAKE</button>
                    <button className={profit > 0 ? 'skull-button claim-button' : 'disabled-button'} disabled={profit < 0 ? true : false}>CLAIM</button>
                    <button className={staked > 0 ? 'skull-button unstake-button' : 'disabled-button'} disabled={staked < 0 ? true : false}>UNSTAKE ALL {"&"} CLAIM</button>
                  </div>
                </div>

                <div className="sk-box data-box" hidden={!detailsView2}>
                  <h1><img src={Grave} className="skull-icon"></img>Stake Grave Earn $Rude</h1>
                  <hr></hr>
                  <div className="data-box-content">
                    <p>APY/APR:<span>906,86/230,94%</span></p>
                    <p>Staked:<span>{staked.toFixed(2)}<img src={Grave} className="skull-icon"></img></span></p>
                    <p>Profit:<span>{profit.toFixed(2)}<img src={Rudes} className="skull-icon"></img></span></p>
                    <p><span>{profit.toFixed(2)}<img src={Soul} className="skull-icon"></img></span></p>
                    <p className="balance"> {staked.toFixed(2)} Staked</p>
                    <div className="input-content">
                      <button className="skull-button" onClick={() => getMaxStaked()}>MAX</button>
                      <input id="input-grave-staked" type="number" placeholder="0" onChange={handleFieldChangeStaked} step=".0000000001"></input>
                    </div>
                    <button className={inputGraveStaked > 0 ? 'skull-button stake-button' : 'disabled-button'} disabled={inputGraveStaked < 0 ? true : false}>UNSTAKE</button>
                    <button className={staked > 0 ? 'skull-button unstake-button' : 'disabled-button'} disabled={staked < 0 ? true : false}>UNSTAKE ALL {"&"} CLAIM</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


export default Bank;
