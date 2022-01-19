import React, { Component, useEffect, useState } from "react";
import './CroskullAdventure.css';
import banner1 from './bonefire.jpg';
import banner2 from './ice-bonefire.jpg';
import token from './token.png';
import { LazyLoadImage, trackWindowScroll } from "react-lazy-load-image-component";
import CroSkulls from "../../abis/CroSkulls.json";
import { useDispatch, useSelector } from "react-redux";
import { getSkullsData, sendNotification, getStakingData } from "../../redux/data/dataActions";
import { Contract, ethers } from 'ethers';
import store from "../../redux/store";

const CroskullAdventure = () => {

  const [state, setState] = useState( {
    view: 'd',
    croSkulls: [],
    croSkullsStaked: [],
    approval: false,
    stakingStarted: false,
    owner: "",
    malusFee: 0,
    rewardPlusMalus: 0,
    rewards: 0,
    cyclesLastWithdraw: 0
  } )

  const [viewState, setViewState] = useState( {
    selectTavernCr: [],
    selectMissionCr: [],
  })

  const ipfsUri = "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"

  if(window.innerWidth <768) {
    setState({
      view: 'm'
    })
  }

  let dispatch = useDispatch()
  let { blockchain, data } = store.getState()

  useEffect(() => {
    if( blockchain.contractDetected )
      dispatch(getSkullsData())
  }, [blockchain.contractDetected])

  useEffect(() => {
    setState(data)
  }, [data])
  
  const selectTavernCr = e => { //handle stake selects
    console.log(viewState)
    let {selectTavernCr} = viewState;
    console.log(selectTavernCr )
    if ( selectTavernCr && selectTavernCr.includes(e)) {
      for( let i = 0; i < selectTavernCr.length; i++){
        if (selectTavernCr[i] == e) {
          selectTavernCr.splice(i, 1);
        }
      }
    } else {
      selectTavernCr.push(e);
    }
    setViewState({
      ...viewState,
      selectTavernCr: selectTavernCr
    })
  };

  const selectMissionCr = e => { //handle stake selects
    let {selectMissionCr} = viewState;

    if ( selectMissionCr && selectMissionCr.includes(e)) {
      for (var i = 0; i < selectMissionCr.length; i++) {
        if (selectMissionCr[i] == e) {
          selectMissionCr.splice(i, 1);
        }
      }
    } else {
      selectMissionCr.push(e);
    }
    setViewState({
      ...viewState,
      selectMissionCr: selectMissionCr
    })
  };

  const toTavern = async () => { // UnStake Skull
    let { selectMissionCr } = viewState
    let { croSkullsStaking } = blockchain
    let unstakeSkulls;
    if( selectMissionCr.length > 1 ){
      unstakeSkulls =  croSkullsStaking.batchUnstakeSkulls(selectMissionCr)
    }else{
      unstakeSkulls =  croSkullsStaking.unstakeSkull( selectMissionCr[0] )
    }

    await unstakeSkulls.then(
      async (tx) => {
        console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Success!`,
          message: `${selectTavernCr.length} Skull${selectTavernCr.length > 1 ? 's' : ''} unstaked`,
          tx,
          type: "success"
        }))
        dispatch(getSkullsData())
      }
    )
  }

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

  const toMission = async () => { // Stake Skull
    let { selectTavernCr } = viewState
    let { croSkullsStaking } = blockchain
    let stakeSkulls;
    if( selectTavernCr.length > 1 ){
      stakeSkulls =  croSkullsStaking.batchStakeSkulls(selectTavernCr)
    }else{
      stakeSkulls =  croSkullsStaking.stakeSkull( selectTavernCr[0] )
    }

    await stakeSkulls.then(
      async (tx) => {
        console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Success!`,
          message: `${selectTavernCr.length} Skull${selectTavernCr.length > 1 ? 's' : ''} staked`,
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
          message: `${selectTavernCr.length} Skull${selectTavernCr.length > 1 ? 's' : ''} staked`,
          tx,
          type: "success"
        }))
        dispatch(getStakingData())
    })
  }


    let { rewardPlusMalus, rewards, rewardPerCycle, croSkullsStaked, croSkulls, cyclesLastWithdraw, grave } = state;
    let { croSkullsContract, croSkullsStaking, croSkullsGrave } = store.getState().blockchain;
    let totalSkulls = croSkullsStaked ? croSkullsStaked.length + croSkulls.length : 0
    let stakedHours = cyclesLastWithdraw * 10 / 60 / 60
    let days =  parseInt(cyclesLastWithdraw * 10 / 60 / 60 / 24 )
    let hoursDiff = stakedHours - ( days * 24 )
    let hours = parseInt(hoursDiff)
    let stakedMinutes = hoursDiff * 60
    let minutes = parseInt( stakedMinutes - ( hours * 60 ) )
    return (
      <div className="container">
        <p>CroSkull Address: {croSkullsContract.address}</p>
        <p>$Grave Address: {croSkullsGrave.address}</p>
        <p>Staking Address: {croSkullsStaking.address}</p>
        <div>
        <h1 className="adventure-title">{data.loading ? 'Loading...' : 'CroSkull Adventure' }</h1>
        <img src={banner1} className="adventure-banner">
        </img>
        { state.approval ? (
          <div>
        <div className="accordion tavern-container " id="accordionBench">
          <h1 data-toggle="collapse" data-target="#collapseTavern" aria-expanded="true" aria-controls="collapseTavern">Tavern ({croSkulls.length}/{totalSkulls})</h1>
          <div id="collapseTavern" className="collapse" aria-labelledby="headingOne" data-parent="#accordionBench">
            <div className="card-body">
              <div className={"row " + (state.view === 'm' ? 'tavern-mobile-row' : 'tavern-desktop-row')} >
              {
                (state.croSkulls).map(cr =>{
                  return(
                  <div className="col-sm-4" key={cr} >
                    <div >
                      <img src={`${ipfsUri}${cr}.png`} 
                      className={viewState.selectTavernCr ? viewState.selectTavernCr.includes(cr) ? 'selected-card' : 'img-card' : ''} 
                      onClick={() => selectTavernCr(cr)}></img>
                      <span>Token Id: #{cr}</span>
                    </div>
                  </div>
                  );
                })
                }
                </div>
              </div>
              <button type="button" 
                className="btn btn-outline-info btn-sm" 
                onClick={() => toMission()} 
                disabled={ !viewState.selectTavernCr ? true : false }
              >To Mission</button>
            </div>
          </div>
        <div className="adventure-container">
          <div className="pool-container">
            <h1>Adventure Pool</h1>
            <div className="row">
              <div className="col-sm-4">
                  <img src={token} className="adventure-token-img"></img>
                  <h3>BONES</h3>
                  <p>CroSkull.com</p>
              </div>
              <hr></hr>
              <div className="col-sm-4 ca-dd">
                <h3>{rewardPerCycle ? formatEther(rewardPerCycle.toString() ) * 6 * 60 * 24  : '' } GRAVE</h3>
                <p>Daily Distrubution</p>
              </div>
            </div>
          </div>
          <img src={banner2} className="adventure-banner"></img>
          <div className="accordion mission-container" id="accordionMission">
            <h1 data-toggle="collapse" data-target="#collapseMission" aria-expanded="true" aria-controls="collapseMission">Skulls in Mission ({croSkullsStaked.length}/{totalSkulls})</h1>
              <div id="collapseMission" className="collapse" aria-labelledby="headingOne" data-parent="#accordionMission">
                <div className="card-body">
                  <div className={"row " + (state.view === 'm' ? 'mission-mobile-row' : 'mission-desktop-row')}>
                  {
                    (state.croSkullsStaked).map(cr =>{
                      return(
                      <div className="col-sm-4" key={cr} >
                        <div >
                          <img src={`${ipfsUri}${cr}.png`} 
                          className={viewState.selectMissionCr ? viewState.selectMissionCr.includes(cr) ? 'selected-card' : 'img-card' : 'img-card' } 
                          onClick={() => selectMissionCr(cr)}></img>
                          <span>Token Id: #{cr}</span>
                        </div>
                      </div>
                      );
                    })
                    }
                </div>
                </div>
                <button type="button" className="btn btn-outline-info btn-sm" onClick={() => toTavern()} disabled={(viewState.selectMissionCr ? viewState.selectMissionCr.length == 0 ? true: false : '')}>To Tavern</button>
              </div>
          </div>
          <div className="reward-container">
            <h4>Mission Details</h4>
            <p>Available to Withdraw: </p>
            <div className="reward">
              <img src={token} /><span>{rewardPlusMalus ? formatEther( rewards.toString()).substring(0, 8)  : '' } GRAVE</span>
            </div>
            <p>Mission Progress: {days ? days : '0'}d {hours}h {minutes}m / 20 days</p>
            <p>{ croSkullsStaked.length * 3 } GRAVE/Day ≈ { String(croSkullsStaked.length).substring(0, 8)} Skulls * 3 GRAVE / Day</p>
            <button 
              type="button"
              className="btn btn-outline-warning btn-sm"
              onClick={ () => {
                withdrawRewards()
              }}
            >
              Claim
            </button>
          </div>
        </div>
        </div>
        ) : (
        <div>
          <button
            onClick={ ()=> setApprovalforAll()}
          >
            Enable Staking Contract
          </button>
          </div>
          )}
        </div>
      </div>
    );
}

const formatEther = bn => ethers.utils.formatEther(bn)

export default CroskullAdventure;
