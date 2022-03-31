import React, { useEffect, useState } from "react";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import { playSound } from "../../redux/data/dataActions";
import "react-quill/dist/quill.snow.css";
import Grave from "../Navbar/grave.png";
import Soul from "../Navbar/soul.png";
import GraveBurn from "../Navbar/grave-burn.png";
import Rudes from "./rude.png";
import GraveToRude from "./GraveToRude.png"
import House from "./house.png"
import Fountain from "./Fountain.png"
import Castle from "./castle.png"
import Rude from "./rude.png"
import CoinSound from "./collect-coin.mp3";
import Wishbone from "../../images/wishbone.png"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown, faQuestionCircle, faHourglassHalf, faExternalLink} from '@fortawesome/free-solid-svg-icons';
import './Bank.css';
import MetricContainer from "../MetricContainer/MetricContainer";
const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/";
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/";


const Bank = ({ accountAddress }) => {
  //const dispatch = useDispatch();

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
  const [angleIconFarm, setAngleIconFarm] = useState([]);
  const [angleIconPool, setAngleIconPool] = useState([]);
  const [enableBuildingButton, setEnableBuildingButton] = useState(false);
  const [enableCalculategButton, setEnableCalculateButton] = useState(false);
  const dispatch = useDispatch();

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
    let d = document.getElementById("input-lp");
    d.value = balance
    setInputGrave(balance);
  }
  const getMaxStaked = () => {
    let d = document.getElementById("input-lp-staked");
    d.value = staked
    setInputGraveStaked(staked);
  }

  const EnableFarm = (i) => {
    setFarmAngleState(i);
    let d = document.getElementById("farm-" + i);
    setDetailsView2(false);
    if (d.getAttribute('class').includes('wrapped')) {
      d.setAttribute('class', 'farm-container')
    } else {
      d.setAttribute('class', 'data-container-wrapped')
    }
  }
  const EnablePool = (i) => {
    setPoolAngleState(i);
    let d = document.getElementById("pool-" + i);
    setDetailsView2(false);
    if (d.getAttribute('class').includes('wrapped')) {
      d.setAttribute('class', 'pool-container')
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
    StartTimeStamp: 1647730800,
    unluckTimeStamp: 1648335600,
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

  const contracts = [c1, c2, c3];

  function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
  }

  function dateDiff(date1, date2) {
    var d1 = new Date(date1 * 1000);
    var d2 = new Date(date2 * 1000);
    return (d2 - d1) / 1000 / 24 / 3600;
  }

  function textSelector(d) {
    switch (d) {
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

  function enableBuilding() {
    let d = document.getElementById("input-grave");
    let d2 = document.getElementById("input-wishbones");
    if (d.value >= balance)
      d.value = balance
    console.log(d.value)
    if ((d2.value % 10 == 0 || d2.value == 0) && d.value > 0)
      setEnableBuildingButton(true)
    else {
      setEnableBuildingButton(false)
      //dispatch(wishboneError())
    }
  }

  function enableCalculate() {
    let d = document.getElementById("input-grave");
    console.log(d.value)
    if (d.value > 0)
      setEnableCalculateButton(true)
    else
      setEnableCalculateButton(false)
  }
  const DAY_IN_SEC = 60 * 60 * 24 * 1000;
  const HUNDRED_DAYS_IN_SEC = 100 * DAY_IN_SEC//100 * DAY_IN_SEC;
  function formatDate(data) {
    let timestamp = data*1000 - new Date( ).getTime()
    let tsHours = timestamp / 60 / 60 / 1000
    let days = parseInt(timestamp / DAY_IN_SEC)
    let hoursDiff = tsHours - (days * 24)
    let hours = parseInt(hoursDiff)
    let tsMinutes = hoursDiff * 60
    let minutes = parseInt(tsMinutes - (hours * 60))
    if (timestamp <= 0) {
      days = 0;
      hours = 0;
      minutes = 0;
    }
    return {
      days,
      hours,
      minutes
    }
  }

  const closeModal = (i) => {
    let modal = document.getElementById("modal-pool-"+i);
    modal.style.display = "none";
  }

  const openModal = (i) => {
    let modal = document.getElementById("modal-pool-"+i);
    modal.style.display = "block";
    console.log('qua')
  }


  return (

    <>
      <div className="global-container">
        <div className="sk-row sk-flex gd-container">
            <div className="sk-box">
              <span className="details-value">${locked.toFixed(2)}</span>
              <span className="details-title">Total Value Locked</span>
            </div>
            <div className="sk-box">
              <span className="details-value">{marketCap.toFixed(2)}</span>
              <span className="details-title">Total Grave Volume</span>
            </div>
            <div className="sk-box">
              <span className="details-value">394</span>
              <span className="details-title">Total Wishbones Used</span>
            </div>
            <div className="sk-box">
              <span className="details-value">39</span>
              <span className="details-title">Total Contracts Active</span>
            </div>
        </div>
        <div class="sk-row switcher-container">
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
          <div className='sk-box' hidden={detailsView}>
            <div className="choise-container">
              <div className="simulate-container">
                <h1>Choose Your Contract</h1>
                <label>
                  Grave Amount
                  <input 
                    type="number"
                    placeholder="0"
                    step="10"
                    min="10"
                    max="50000"
                    id='input-grave'
                  >
                  </input>
                </label>
                <label>
                  Wishbone Amount
                  <input 
                    type="number"
                    placeholder="0"
                    step="10"
                    min="0" 
                    max="300"
                    className="wishbones"
                    id='input-wishbones'
                  ></input>
                </label>
                <button className="skull-button" onClick={() => enableCalculate()}>CALCULATE</button>
              </div>
              <div className="contract-container">
                <div className="contract-content">
                  <div className="contract-box sk-box">
                    <span className="sk-flex sk-row">
                      <img src={} />
                      <h1>House building</h1>
                    </span>
                    <MetricContainer 
                      label="Est. rewards"
                      value={ `4553.4` }
                    />
                    <MetricContainer 
                      label="Durartion"
                      value={ `7 days` }
                    />
                    <MetricContainer 
                      label="APY"
                      value={ `128%` }
                    />
                    <button className="skull-button" disabled={!enableBuildingButton}>Subscribe</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>1 WEEK</h1>
                    <MetricContainer 
                      label="APY"
                      value={ `128%` }
                    />
                    <MetricContainer 
                      label="Rewards"
                      value={ `4553.4` }
                      icon={Rude}
                    />
                    <button className="skull-button" disabled={!enableBuildingButton}>Subscribe</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>1 WEEK</h1>
                    <MetricContainer 
                      label="APY"
                      value={ `128%` }
                    />
                    <MetricContainer 
                      label="Rewards"
                      value={ `4553.4` }
                      icon={Rude}
                    />
                    <button className="skull-button" disabled={!enableBuildingButton}>Subscribe</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>1 WEEK</h1>
                    <MetricContainer 
                      label="APY"
                      value={ `128%` }
                    />
                    <MetricContainer 
                      label="Rewards"
                      value={ `4553.4` }
                      icon={Rude}
                    />
                    <button className="skull-button" disabled={!enableBuildingButton}>Subscribe</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>1 WEEK</h1>
                    <MetricContainer 
                      label="APY"
                      value={ `128%` }
                    />
                    <MetricContainer 
                      label="Rewards"
                      value={ `4553.4` }
                      icon={Rude}
                    />
                    <button className="skull-button" disabled={!enableBuildingButton}>Subscribe</button>
                  </div>
                  <div className="contract-box sk-box">
                    <h1>1 WEEK</h1>
                    <MetricContainer 
                      label="APY"
                      value={ `128%` }
                    />
                    <MetricContainer 
                      label="Rewards"
                      value={ `4553.4` }
                      icon={Rude}
                    />
                    <button className="skull-button" disabled={!enableBuildingButton}>Subscribe</button>
                  </div>
                </div>
              </div>
            </div>

            {contracts.map((contract, i) => {
              let ending = formatDate(contract.unluckTimeStamp)
              console.log(ending)
              let finish = (ending.days == 0 && ending.hours == 0 && ending.minutes == 0)
           return(
             <>
              <div className="contract-details sk-box-content">
                <div className="bank-name">
                  <div className="bank-name-img">
                    <img src={imgSelector(dateDiff(contract.StartTimeStamp,contract.unluckTimeStamp))} />
                  </div>
                  <div className="bank-name-text">
                    <h1>{textSelector(dateDiff(contract.StartTimeStamp,contract.unluckTimeStamp))} Building</h1>
                    <h3>{dateDiff(contract.StartTimeStamp,contract.unluckTimeStamp)} Days</h3>
                  </div>
                </div>
                <MetricContainer
                  label="Amount Staked"
                  value={ `833333` }
                  icon={Grave}
                  vertical={true}
                  tooltip="Your Grave Staked in this specific contract."
                />
                <MetricContainer 
                  label="Rewards"
                  value={ `54.3242` }
                  vertical={true}
                  icon={Rude}
                  tooltip=""
                />
                <MetricContainer 
                  label="APY"
                  value={ `40,23%` }
                  vertical={true}
                  tooltip=""
                />
                <MetricContainer 
                  label="End in"
                  value={ `${finish ? timeConverter(contract.unluckTimeStamp) : 0 }` }
                  vertical={true}
                  tooltip={`Creation: ${timeConverter(contract.StartTimeStamp)} </br>End: ${timeConverter(contract.unluckTimeStamp)}`}
                />
                <MetricContainer 
                  label="Wishbone Used"
                  value={ `40` }
                  vertical={true}
                  icon={Wishbone}
                  tooltip="Your Grave Staked in this specific contract."
                />
                <button 
                  onClick={() => dispatch(playSound(CoinSound))}
                  className="skull-button claim-button"
                >
                  Claim
                </button>
              </div>
            </>
           )
          })}
            <div className="data-row-last">
              <span>To Top <FontAwesomeIcon icon={faAngleUp} /></span>
            </div>
          </div>
          <div className="sk-box" hidden={!detailsView}>
          <div className="data-row first">
              <div className="bank-name">
                <div className="bank-name-img">
                  <img src={GraveToRude} />
                </div>
                <div className="bank-name-text">
                  <h1 onClick={() => { openModal(1) }}>GRVE-CRO <FontAwesomeIcon icon={faQuestionCircle}/></h1>
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
                <span>83</span>
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
                <span>835%</span>
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
                <span>833333$</span>
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
                <span>7D</span>
              </div>
              <div className="data-row-box angle">
                <span onClick={() => EnablePool(1)} className="angle"> <FontAwesomeIcon icon={angleIconPool[0] ? faAngleUp : faAngleDown} /></span>
              </div>
            </div>
            <div className="data-container-wrapped" id="pool-1">
              <div class="sk-row switcher-container">
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
                  <h1><img src={Grave} className="skull-icon"></img>Stake Grave Earn $Rude </h1>
                  <hr></hr>
                  <div className="data-box-content">
                    <span>APY/APR:<span>906,86/230,94%</span></span>
                    <span>Staked:<span>{staked.toFixed(2)}<img src={Grave} className="skull-icon"></img></span></span>
                    <span>Profit:<span>{profit.toFixed(2)}<img src={Rudes} className="skull-icon"></img></span></span>
                    <span><span>{profit.toFixed(2)}<img src={Soul} className="skull-icon"></img></span></span>
                    <span className="balance"> {balance.toFixed(2)} Balance</span>
                    <div className="input-content">
                      <button className="skull-button" onClick={() => getMax()}>MAX</button>
                      <input id="input-lp" type="number" placeholder="0" onChange={handleFieldChange} step=".0000000001"></input>
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
                    <span>APY/APR:<span>906,86/230,94%</span></span>
                    <span>Staked:<span>{staked.toFixed(2)}<img src={Grave} className="skull-icon"></img></span></span>
                    <span>Profit:<span>{profit.toFixed(2)}<img src={Rudes} className="skull-icon"></img></span></span>
                    <span><span>{profit.toFixed(2)}<img src={Soul} className="skull-icon"></img></span></span>
                    <span className="balance"> {staked.toFixed(2)} Staked</span>
                    <div className="input-content">
                      <button className="skull-button" onClick={() => getMaxStaked()}>MAX</button>
                      <input id="input-lp-staked" type="number" placeholder="0" onChange={handleFieldChangeStaked} step=".0000000001"></input>
                    </div>
                    <button className={inputGraveStaked > 0 ? 'skull-button stake-button' : 'disabled-button'} disabled={inputGraveStaked < 0 ? true : false}>UNSTAKE</button>
                    <button className={staked > 0 ? 'skull-button unstake-button' : 'disabled-button'} disabled={staked < 0 ? true : false}>UNSTAKE ALL {"&"} CLAIM</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal" id="modal-pool-1">
              <div className="modal-w-content">
                  <div class="modal-pool-head sk-flex">
                    <h1>GRVE-CRO</h1>
                    <span class="close-btn" onClick={() => { closeModal(1) }}>
                      &times;
                    </span>
                  </div>
                  <div className="info-list">
                    <p><a href="https://mm.finance/add/0x9885488cD6864DF90eeBa6C5d07B35f08CEb05e9/0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23">GET GRVE-WCRO <FontAwesomeIcon icon={faExternalLink}/></a></p>
                    <p><a>View Contract <FontAwesomeIcon icon={faExternalLink}/></a></p>
                    <p><a href='https://dexscreener.com/cronos/0x4672d3d945700cc3bdf4a2b6704e429d567dc52c'>See Pair Info <FontAwesomeIcon icon={faExternalLink}/></a></p>
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
