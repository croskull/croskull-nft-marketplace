import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { getSkullsData, sendNotification, getStakingData, toTavern } from "../../redux/data/dataActions";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import title from './title.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LazyLoadImage } from "react-lazy-load-image-component";
import Grave from "../Navbar/grave.png";
import GraveBurn from "../Navbar/grave-burn.png";
import Skull from "../Navbar/skull.png";
import GraveMined from "../Navbar/grave-mined.png";
import GraveAvailable from "../Navbar/grave-available.png";
import SkullAdventure from '../Navbar/skull-adventure.png';
import Soul from "../Navbar/soul.png";
import { faDungeon, faFireAlt, faRunning } from '@fortawesome/free-solid-svg-icons';
import './adventure.css';
import season1Banner from './season-1-banner.png';


const ipfsUri =  "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"
const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"

const CroskullAdventure = () => {
  let { blockchain, data } = store.getState()

  const [viewState, setViewState] = useState( {
    selectedSkulls: []
  })

  const [detailsView, setDetailsView] = useState(false)

  let dispatch = useDispatch()
  const ipfsUri =  ""  || "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"

  useEffect(() => {
    if( blockchain.contractDetected )
      return //dispatch(getSkullsData())
  }, [blockchain.contractDetected])
  
  const selectSkull = e => { //handle stake selects
    let {selectedSkulls} = viewState;
    console.log(selectedSkulls )
    if ( selectedSkulls && selectedSkulls.includes(e)) {
      for( let i = 0; i < selectedSkulls.length; i++){
        if (selectedSkulls[i] == e) {
          selectedSkulls.splice(i, 1);
        }
      }
    } else {
      selectedSkulls.push(e);
    }
    setViewState({
      ...viewState,
      selectedSkulls: selectedSkulls
    })
  };

  //to be moved inside reducer 

  const withdrawRewards = async () => {
    let { croSkullsStaking } = blockchain

    let withDrawTx = croSkullsStaking.withdraw()
    await withDrawTx.then(
      async (tx) => {
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Success!`,
          message: `Withdraw succesful`,
          tx,
          type: "success"
        }))
        dispatch(getSkullsData())
      }
    )
  }

  const setApprovalforAll = async () => {
    let { croSkullsStaking, croSkullsContract } = blockchain
    let approvalTx = croSkullsContract.setApprovalForAll(
      croSkullsStaking.address,
      true
    )
    await approvalTx.then( async ( tx ) => {
      console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "default"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Approved!`,
          message: `Approved Succesful`,
          tx,
          type: "success"
        }))
        dispatch(getStakingData())
    })
  }


  const DAY_IN_SEC = 60 * 60 * 24;
  const HUNDRED_DAYS_IN_SEC = 100 * DAY_IN_SEC//100 * DAY_IN_SEC;

  const formatDate = ( timestamp ) => {
    let tsHours = timestamp / 60 / 60
    let days =  parseInt( timestamp / DAY_IN_SEC )
    let hoursDiff = tsHours - ( days * 24 )
    let hours = parseInt(hoursDiff)
    let tsMinutes = hoursDiff * 60
    let minutes = parseInt( tsMinutes - ( hours * 60 ) )
    return {
      days,
      hours,
      minutes
    }
  }

  let { 
    approval, 
    blockTimestamp, 
    rewardPlusMalus, 
    malusFee, 
    startStakeTimestamp, 
    rewards, 
    advancedMetadata, 
    croSkullsStaked, 
    croSkulls, 
    cyclesLastWithdraw, 
    alreadyClaimed, 
    soulsGenerated,
    totalSkullsStaked,
    totalWithdrawedGraves,
    totalWithdrawedSouls,
    daysLastWithdraw,
    burnedGraves
  } = data

  let totalSkulls = croSkullsStaked.length > 0 ? croSkullsStaked.length + croSkulls.length : 0
  let globalStartTimestamp = startStakeTimestamp;
  let finishStake = parseInt(globalStartTimestamp) + HUNDRED_DAYS_IN_SEC;
  let diffStake = finishStake - blockTimestamp;
  let malusPercent = ( 800 - ( 25 * daysLastWithdraw ) ) / 10
  let userStakeDate = formatDate( cyclesLastWithdraw * 10 )
  let seasonRemainingDate = formatDate( diffStake )
  let seasonDurationDate = formatDate( blockTimestamp - globalStartTimestamp )
  let seasonProgress = parseInt( 100 / HUNDRED_DAYS_IN_SEC *  (blockTimestamp - globalStartTimestamp ) )
  burnedGraves = burnedGraves ?  burnedGraves : 0
  let burnedPercent = burnedGraves ? parseFloat(100 / 45990000 * formatEther(burnedGraves)).toFixed(3) : 0
  return (
    <>
      <div className="sk-flex sk-row">
        <div className="sk-container wd-66">
          <div className="sk-box">
            <div className="tab-head">
              <h2>Skulls in Adventure {  totalSkulls > 0 ?  `(${croSkullsStaked.length}/${totalSkulls})` : `Loading` } </h2>
            </div>
            <div className="sk-box-content sk-column">
              <div className={`skulls-list in-adventure active`}>
                <div className="list-head">
                  <div className="div-button">
                    {
                      croSkullsStaked.length > 0 ? 
                      (
                      <button className="skull-button retire-button" 
                        onClick={() => dispatch(toTavern( croSkullsStaked ))}
                      >
                        Retire All ({ croSkullsStaked.length })
                      </button> 
                      ) : ('')
                    }
                    <button 
                      className="skull-button retire-button" 
                      hidden={(viewState.selectedSkulls.length > 0 ? false : true)} 
                      onClick={() => dispatch(toTavern(viewState.selectedSkulls))}
                    >
                      Retire Selected { viewState.selectedSkulls.length }
                    </button>
                  </div>
                </div>
                <div className="sk-row skull-grid">
                  {
                  (croSkullsStaked).map((cr, index) => {
                    let data = advancedMetadata[cr-1]
                    return (
                    <div key={cr} className="skull-item" >
                      <div 
                        className={viewState.selectedSkulls.includes(cr) ? 'selected card' : 'card'} 
                        onClick={() => selectSkull(cr)}
                      >
                        <LazyLoadImage
                          src={`${ipfsUri480}${cr}.webp`}
                        />
                        <div className="floating-badges-container">
                          <span className="badge id">{cr}</span>
                          <span className="badge rank">Rank {data ? data.rank : ''}</span>
                        </div>
                        <div className="bottom-actions">
                          <button 
                            className="skull-button retire-button"
                            onClick={ () => {
                              dispatch(toTavern(cr))
                              setViewState({
                                ...viewState,
                                selectedSkulls: []
                              })
                            }}
                          > 
                            <FontAwesomeIcon icon={faRunning} /> 
                            Retire
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sk-container wd-33">
          <div className="sk-flex sk-column">
            <img 
              src={season1Banner}  
              className="adventure-image"
            />
            <div className="sk-box sk-flex sk-column">
              <div className="progress-info season-container">
                <FontAwesomeIcon 
                  icon={faDungeon} 
                  id="dungeon-icon" 
                  size="2x"
                  className="icon-container"
                />
                <div className="progress-container">
                Season Progress
                <small>{seasonProgress < 50 ? ` ${seasonDurationDate.days}d ${seasonDurationDate.hours}h ${seasonDurationDate.minutes}m` : ``}</small>
                  <div className="progress">
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: seasonProgress + '%' } /*sostituire con timeElapsed in % */} 
                      aria-valuenow="10" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    > 
                      { seasonProgress >= 50 ? `${seasonProgress}% - ${seasonDurationDate.days}d ${seasonDurationDate.hours}h ${seasonDurationDate.minutes}m` : `${seasonProgress}%` }
                    </div>
                  </div>
                </div>
              </div>
              <div className="progress-info malus-container">
                <FontAwesomeIcon 
                  icon={faFireAlt} 
                  id="burn-icon" 
                  size="2x"
                  className="icon-container"
                />
                <div className="progress-container">
                  Burn Malus
                  <div className="progress">
                    <div 
                      className="progress-bar bg-danger" 
                      role="progressbar" 
                      style={{ width: malusPercent + '%' } /*sostituire con timeElapsed in % */} 
                      aria-valuenow="10"
                      aria-valuemin="0"
                      aria-valuemax="80"
                    > 
                      { malusPercent }%
                    </div>
                  </div>
                </div>
              </div>
              <div className="sk-box-content switcher-wrapper">
                  <button
                    className={`skull-button view-button ${ detailsView ? '' : 'active'}`}
                    onClick={
                      () => setDetailsView(false)
                    }
                  >
                    Your Stats
                  </button>
                  <button
                    className={`skull-button view-button ${ ! detailsView ? '' : 'active'}`}
                    onClick={
                      () => setDetailsView(true)
                    }
                  >
                    Global Stats
                  </button>
              </div>
              <div className={`sk-box-content sk-column ${ ! detailsView ? 'show' : 'hide'}`}>
                <div className="metric-container">
                  <span>Your Skulls</span>
                  <span className="metric-icon">
                    { croSkulls.length }
                    <img 
                      className="skull-icon"
                      src={SkullAdventure}
                    />
                  </span>
                </div>
                <div className="metric-container">
                  Mined Grave
                  <span>
                    {  `${formatEther(rewards)}` } 
                    <span className="positive">
                      {` (100%)`}
                    </span>
                  </span>
                </div>
                <div className="metric-container">
                  <span>
                    Current Malus
                  </span>
                  <span>
                    {  `${formatEther(rewardPlusMalus)}` }
                    <span className="negative">
                      {` (-${malusPercent}%)`}
                    </span>
                  </span>
                </div>
                <div className="metric-container">
                  Claimed Grave
                  <span className="metric-icon">
                    { `${formatEther(alreadyClaimed)}`  }
                    <img 
                      className="skull-icon"
                      src={Grave} 
                    />
                  </span>
                </div>
                <div className="metric-container">
                  Mined Soul
                  <span className="metric-icon">
                    { soulsGenerated }
                    <img 
                      className="skull-icon"
                      src={Soul} 
                    />
                  </span>
                </div>
              </div>
              <div className={`sk-box-content sk-column ${ detailsView ? 'show' : 'hide'}`}>
                <div className="metric-container">
                  <span>Skulls Staked</span>
                  <span className="metric-icon">
                    { totalSkullsStaked }
                    <img 
                      className="skull-icon"
                      src={SkullAdventure}
                    />
                  </span>
                </div>
                <div className="metric-container">
                  <span>
                    Mined Grave
                  </span>
                  <span className="metric-icon">
                    { formatEther(totalWithdrawedGraves) }
                    <img
                      className="skull-icon"
                      src={GraveMined}
                    />
                  </span>
                </div>
                <div className="metric-container">
                  <span>
                    Burned Grave
                  </span>
                  <span className="metric-icon">
                    { formatEther(burnedGraves) }
                    {` (${burnedPercent}%)`}
                    <img
                      className="skull-icon"
                      src={GraveBurn}
                    />
                  </span>
                </div>
                <div className="metric-container">
                  Mined Soul
                  <span className="metric-icon">
                    { totalWithdrawedSouls }
                    <img 
                      className="skull-icon"
                      src={Soul} 
                    />
                  </span>
                </div>
              </div>
              {
                ! approval ?
                (
                <button 
                  className="sk-claim-btn"
                  onClick={ () => {
                    setApprovalforAll()
                  }}
                >
                  Approve Adventure
                </button>
                ):(
                <button 
                  className="sk-claim-btn"
                  onClick={ () => {
                    withdrawRewards()
                  }}
                  disabled={ rewardPlusMalus > 0 ? false : true }
                >
                  {rewardPlusMalus > 0 ? `Claim GRAVE` : 'Generate GRAVE First'}
                </button>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const formatEther = bn => parseFloat(ethers.utils.formatEther(bn)).toFixed(2)

export default CroskullAdventure;
