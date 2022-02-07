import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { getSkullsData, sendNotification, getStakingData, toTavern } from "../../redux/data/dataActions";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import title from './title.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LazyLoadImage } from "react-lazy-load-image-component";
import { faDungeon, faBeer, faFireAlt, faGhost, faSkull, faSkullCrossbones, faRunning, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import './CroskullAdventure.css';
import season1Banner from './season-1-banner.png';


const ipfsUri =  "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"
const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"

const CroskullAdventure = () => {
  let { blockchain, data } = store.getState()

  const [viewState, setViewState] = useState( {
    selectedSkulls: []
  })

  let dispatch = useDispatch()
  const ipfsUri =  ""  || "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"

  useEffect(() => {
    if( blockchain.contractDetected )
      dispatch(getSkullsData())
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
  const HUNDRED_DAYS_IN_SEC = 100 * DAY_IN_SEC;

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

  let { approval, blockTimestamp, rewardPlusMalus, malusFee, startStakeTimestamp, rewards, rewardPerCycle, croSkullsStaked, croSkulls, cyclesLastWithdraw, alreadyClaimed, soulsGenerated } = data;
  let totalSkulls = croSkullsStaked.length > 0 ? croSkullsStaked.length + croSkulls.length : 0
  let globalStartTimestamp = startStakeTimestamp;
  let finishStake = parseInt(globalStartTimestamp) + HUNDRED_DAYS_IN_SEC;
  let diffStake = finishStake - blockTimestamp;
  let malusPercent =  malusFee * 125 / 100  
  let userStakeDate = formatDate( cyclesLastWithdraw * 10 )
  let seasonRemainingDate = formatDate( diffStake )
  let seasonDurationDate = formatDate( blockTimestamp - globalStartTimestamp )
  let seasonProgress = parseInt( 100 / HUNDRED_DAYS_IN_SEC *  (blockTimestamp - globalStartTimestamp ) )
  return (
    <div className="container-fluid adventure">
      <div className="row boxed">
        <div className="col-8 skulls-container">
          <div className="head">
            <div className="col-sm-10">
              <h1>Adventure CroSkulls: {  totalSkulls > 0 ?  `(${croSkullsStaked.length}/${totalSkulls})` : `Loading` } </h1>
            </div>
          </div>
          <div 
            className="skull-viewer"
          >
          <div className="skulls-list in-tavern">
            <div className="flex-display flex-row flex-wrap">
              {
                (croSkullsStaked).map((cr, index) => {
                  return (
                    <div key={cr} className='col-sm-3' >
                      <LazyLoadImage 
                        src={`${ipfsUri480}${cr}.webp`}
                        className={viewState.selectedSkulls.includes(cr) ? 'selected div-skull ' : 'div-skull'} 
                        onClick={() => selectSkull(cr)}
                      />
                      <span className="badge badge-dark rounded">#{cr}</span>
                      <div className="bottom-actions">
                        <button 
                            className="skull-button retire-button"
                            onClick={ () => {
                              dispatch(toTavern(cr))
                            }}
                          > 
                            <FontAwesomeIcon icon={faRunning} /> 
                            Retire
                          </button>
                      </div>
                    </div>
                  );
                })
              }
              </div>
            </div>
          </div>
          <div className="div-button">
            <button className="skull-button retire-button" 
              onClick={() => dispatch( toTavern( croSkullsStaked ) )}
            >Retire All</button>
            <button 
              className="skull-button retire-button" 
              hidden={(viewState.selectedSkulls.length > 0 ? false : true)} 
              onClick={() => dispatch( toTavern( viewState.selectedSkulls ) ) }
            >Retire Selected ({viewState.selectedSkulls.length})</button>
          </div>
        </div>
        <div className="col-4 details-container">
          <img src={season1Banner} width={'75%'} />
          <h1>Chilling Reign</h1>
          <p>{ `Season 1 ends in ${seasonRemainingDate.days}d ${seasonRemainingDate.hours}h ${seasonRemainingDate.minutes}m` }</p>
          <div className="data-container">
            <div className="progress-info season-container">
              <FontAwesomeIcon 
                icon={faDungeon} 
                id="dungeon-icon" 
                size="2x"
                className="icon-container"
              />
              <div class="progress-container">
              Season Progress: <small>{seasonProgress < 50 ? ` ${seasonDurationDate.days}d ${seasonDurationDate.hours}h ${seasonDurationDate.minutes}m` : ``}</small>
                <div class="progress">
                  <div 
                    class="progress-bar bg-success" 
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
              <div class="progress-container">
              Burn Malus:
                <div class="progress">
                  <div 
                    class="progress-bar bg-danger" 
                    role="progressbar" 
                    style={{ width: malusPercent + '%' } /*sostituire con timeElapsed in % */} 
                    aria-valuenow="10"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  > 
                    {malusFee}%
                  </div>
                </div>
              </div>
            </div>
            <div class="metrics-container">
              <div className="metric-container">
                Generated Rewards
                <span>
                  {  formatEther(rewards).slice(0, 5 ) } 
                  <span class="positive">
                    {` (100%)`}
                  </span>
                </span>
              </div>
              <div className="metric-container">
                <span>
                    Withdrawable Rewards
                </span>
                <span>
                  {  formatEther(rewardPlusMalus).slice(0, 5 ) }
                  <span class="negative">
                    {` (-${malusFee}%)`}
                  </span>
                </span>
              </div>
              <div className="metric-container">
                Graves Already Claimed
                <span>
                  { formatEther(alreadyClaimed).slice(0, 5 ) }
                </span>
              </div>
              <div className="metric-container">
                Souls Generated
                <span>
                  { soulsGenerated }
                </span>
              </div>
            </div>
            <button 
              className="btn btn-sm btn-warning claim-button"
              onClick={ () => {
                approval ? 
                withdrawRewards() :
                setApprovalforAll()
              }}
            >
              { approval ?
                'Claim Rewards' :
                'Approve Mission'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatEther = bn => ethers.utils.formatEther(bn)

export default CroskullAdventure;
