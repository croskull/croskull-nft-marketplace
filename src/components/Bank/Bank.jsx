import React, { useEffect, useState } from "react";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import { playSound } from "../../redux/data/dataActions";
import { ethers } from 'ethers';
import Grave from "../Navbar/grave.png";
import GraveCro from "./grve-cro-pair.png"
import Rude from "./rude.png"
import CoinSound from "./collect-coin.mp3";
import Wishbone from "../../images/wishbone.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown, faQuestionCircle, faExternalLink} from '@fortawesome/free-solid-svg-icons';
import Hut from "./hut.png";
import House from "./house.png"
import Villa from "./villa.png"
import FarmHouse from "./farmhouse.png"
import Mansion from "./mansion.png"
import MetricContainer from "../MetricContainer/MetricContainer";
import { loadBankData, loadFarmData } from "../../redux/bank/bankActions";
import { sendNotification, updateUserBalance } from "../../redux/data/dataActions";
import { loadDexData } from "../../redux/dexscreener/dexscreenerActions";
import './Bank.css';

const mmfLink = "https://mm.finance/swap?outputCurrency=0x9885488cd6864df90eeba6c5d07b35f08ceb05e9"

const Bank = ({ accountAddress }) => {
  const dispatch = useDispatch();

  const [detailsView, setDetailsView] = useState(false)
  const [detailsView2, setDetailsView2] = useState(false)
  const [angleIconFarm, setAngleIconFarm] = useState([]);
  const [angleIconPool, setAngleIconPool] = useState([]);

  let { blockchain, bank, data, dexscreener } = store.getState()
  let { croSkullsBank, croSkullsGrave, croSkullsFarm, lpPair, formatEther } = blockchain
  let { graveInUsd } = dexscreener
  let { userGraveBalance } = data

  const [simulated, setSimulated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [farmView, setfarmView] = useState({
    amountToStake: 0,
    amountToUnstake: 0
  })
  const [currentContract, setContract] = useState({
    amount: 0,
    wishbones: 0,
    duration: 0
  })


  useEffect(() => {
    dispatch(loadBankData())
    dispatch(loadFarmData())
    if( ! graveInUsd )
      dispatch(loadDexData())
  }, [croSkullsBank])


  const handleFieldChange = (event) => {
    let value = event.target ? event.target.value : 0
    let name = event.target ? event.target.id : 0
    setContract({
      ...currentContract,
      [name]: value
    })
  }

  const handleStakeLPChange = (event) => {
    let value = event.target ? event.target.value : 0
    let name = event.target ? event.target.id : 0
    setfarmView({
      ...farmView,
      [name]: value
    })
  }

  const getMax = () => {
    console.log( lpPairBalance )
    setfarmView({
      ...farmView,
      amountToStake: formatEther(lpPairBalance)
    })
  }
  const getMaxStaked = () => {
    setfarmView({
      ...farmView,
      amountToUnstake: formatEther(stakedAmount)
    })
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

  const durations = [14, 30, 60, 180, 365]

  const buildings = [
    "Hut",
    "House",
    "Villa",
    "FarmHouse",
    "Mansion"
  ]

  const buildingImages = [
    Hut,
    House,
    Villa,
    FarmHouse,
    Mansion
  ]
  
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

  /**
   * FARM
   */
  const approveFarm = async () => {
    let approvalTx = lpPair.approve(
      croSkullsFarm.address,
      ethers.constants.MaxUint256.toString()
    )
    await approvalTx.then(
      async (tx) => {
        console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(1)
        dispatch(sendNotification({
          title: `Approved!`,
          message: `Now you can use farm.`,
          tx,
          type: "success"
        }))
        dispatch(playSound(CoinSound))
        dispatch(loadFarmData())
      }
    )
  }

  const stakeLiquidity = async () => {
    let stakeTX = croSkullsFarm.deposit(
      0,
      ethers.utils.parseEther(farmView.amountToStake)
    )
    await stakeTX.then(
      async (tx) => {
        console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(1)
        dispatch(sendNotification({
          title: `Staked!`,
          message: `You staked succesful GRVE/CRO.`,
          tx,
          type: "success"
        }))
        dispatch(playSound(CoinSound))
        dispatch(updateUserBalance())
        dispatch(loadFarmData())
      }
    )
  }
  
  const claimLPRewards = async () => {
    if( ! farmView.amountToUnstake ) return 
    let claimTx = croSkullsFarm.withdraw(
      0,
      ethers.utils.parseEther(farmView.amountToUnstake)
    )
    await claimTx.then(
      async (tx) => {
        console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(1)
        dispatch(sendNotification({
          title: `Claimed!`,
          message: `Claimed succesful GRVE/CRO plus Rewards.`,
          tx,
          type: "success"
        }))
        dispatch(playSound(CoinSound))
        dispatch(updateUserBalance())
        dispatch(loadFarmData())
      }
    )
  }
  /**
   * BANK
   */
  const increaseAllowance = async () => {
    let approvalTx = croSkullsGrave.increaseAllowance(
      croSkullsBank.address,
      ethers.constants.MaxUint256.toString()
    )
    await approvalTx.then(
      async (tx) => {
        console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(1)
        dispatch(sendNotification({
          title: `Approved!`,
          message: `Now you can use Central Bank.`,
          tx,
          type: "success"
        }))
        dispatch(playSound(CoinSound))
        dispatch(loadBankData())
      }
    ) 
  }

  const simulateApy = async () => {
    let { croSkullsBank } = blockchain
    if( currentContract.amount == 0 ) return
    setLoading(true)
    let amount = ethers.utils.parseEther(currentContract.amount)
    let tempSimulated = []
    for(let i = 0; i < durations.length; i++ ){
      let simulatedApy = await croSkullsBank.simulateAPY(
        amount,
        durations[i] * 86400,
        currentContract.wishbones
      )
      let rewards = await simulatedApy[0].toString()
      let apy = await simulatedApy[1].toString()
      tempSimulated.push({
        rewards,
        apy,
        duration: durations[i]
      })
    }
    setSimulated( tempSimulated )
    setLoading(false)
  }

  const claimRewards = async ( contractId ) => {
    if( ! contractId ) return

    let claimRewardsTx = croSkullsBank.claimRewards(
      contractId
    )
    await claimRewardsTx.then(
      async (tx) => {
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(1)
        dispatch(sendNotification({
          title: `Approved!`,
          message: `Contract claimed succesful.`,
          tx,
          type: "success"
        }))
        dispatch(playSound(CoinSound))
        dispatch(updateUserBalance())
        dispatch(loadBankData())
      }
    )
  }

  const subscribeContract = async ( duration ) => {
    let { amount, wishbones } = currentContract
    const DAY_IN_SECONDS = 86400
    if( ! duration || duration < 14 || ! amount ) return

    let newContractTx = croSkullsBank.createContract(
      ethers.utils.parseEther( amount ),
      duration * DAY_IN_SECONDS,
      wishbones
    )
    await newContractTx.then(
      async (tx) => {
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(1)
        dispatch(sendNotification({
          title: `Approved!`,
          message: `Contract created succesful.`,
          tx,
          type: "success"
        }))
        dispatch(playSound(CoinSound))
        dispatch(updateUserBalance())
        dispatch(loadBankData())
      }
    )
  }

  let {
    allowance,
    maxApy,
    totalGraveVolume,
    totalWishbonesVolume,
    totalContractsVolume,
    depositedGrave,
    activeWishbones,
    activeContracts,
    wishboneCost,
    bankFee,
    userActiveContracts,
    userContractsCount,
    pendingRewards,
    totalLiquidity,
    stakedAmount,
    endBlock,
    paidOut,
    rewardPerBlock,
    lpPairAllowance,
    lpPairBalance,
    totalStakedCro
  } = bank

  let {
    croInUsd
  } = store.getState().dexscreener

  let dailyBlockNumber = 15000;

  return (
    <>
      <div className="global-container">
        <div className="sk-row sk-flex gd-container">
            <div className="sk-box">
              <span className="sk-box-content details-value">${ graveInUsd && depositedGrave && totalStakedCro ? parseInt(( totalStakedCro * croInUsd * 2 ) + ( ethers.utils.formatEther(depositedGrave) * graveInUsd )) : 0 }</span>
              <span className="details-title">Total Value Locked</span>
            </div>
            <div className="sk-box">
              <span className="sk-box-content details-value">{ totalGraveVolume ? formatEther(totalGraveVolume) : 0 }</span>
              <span className="details-title">Total Grave Volume</span>
            </div>
            <div className="sk-box">
              <span className="sk-box-content details-value">{ totalWishbonesVolume ? totalWishbonesVolume : 0 }</span>
              <span className="details-title">Total Wishbones Used</span>
            </div>
            <div className="sk-box">
              <span className="sk-box-content details-value">{ activeContracts ? activeContracts : 0 }</span>
              <span className="details-title">Total Contracts Active</span>
            </div>
        </div>
        <div className="sk-row switcher-container">
          <div className="switcher-wrapper">
            <button
              className={`switcher-button view-button ${detailsView ? '' : 'active'}`}
              onClick={
                () => setDetailsView(false)
              }
            >
              🏦 CENTRAL BANK
            </button>
            <button
              className={`switcher-button view-button ${!detailsView ? '' : 'active'}`}
              onClick={
                () => { setDetailsView(true) }
              }
            >
              ⚡️ LP FARM
            </button>
          </div>
          <div className='sk-box' hidden={detailsView}>
            <div className="contract-details sk-box-content">
              <div className="simulate-container">
                <h1>Choose Contract</h1>
                <label>
                  <MetricContainer 
                    label="Grave Amount"
                    tooltip="Amount of GRAVE to Stake in the contract."
                  />
                  <input 
                    type="number"
                    placeholder="0"
                    min="0"
                    id='amount'
                    onChange={ handleFieldChange }
                  >
                  </input>
                </label>
                <label>
                  <MetricContainer 
                    label="Wishbones Amount"
                    tooltip="1 Wishbone cost 0.3 GRAVE, that will be burned at the creation."
                  />
                  <input 
                    type="number"
                    placeholder="0"
                    step="10"
                    min="0" 
                    max="300"
                    className="wishbones"
                    id='wishbones'
                    onChange={ handleFieldChange }
                  ></input>
                  <span>Wishbones Cost: { currentContract.wishbones ? `${ parseInt( currentContract.wishbones * 0.3 )}` :  '0'} GRAVE</span>
                  <span>Total Cost: { currentContract.amount ? `${  parseInt(currentContract.amount) + parseInt( currentContract.wishbones * 0.3 )}` :  '0'} GRAVE</span>
                </label>
                <button
                  className="skull-button" 
                  onClick={() => simulateApy()}
                  disabled={loading ? true : false }
                >
                  { loading ? 'Loading...' : 'Calculate'}
                </button>
              </div>
              <div className="contract-container">
                <div className="contract-content">
                  {
                    simulated ? (
                      simulated.map( (simulation,i) => (
                        <div className="contract-box sk-box" key={i}>
                          <h1>{ buildings[i] }</h1>
                          <img 
                            className="building-image"
                            src={buildingImages[i]}
                          />
                          <MetricContainer 
                            label="Est. rewards"
                            value={ formatEther(simulation.rewards, true) }
                          />
                          <MetricContainer 
                            label="Duration"
                            value={ `${simulation.duration} days` }
                          />
                          <MetricContainer 
                            label="ARY"
                            tooltip="Annualizated Rude Yield: increase exponentially when reach contract end data."
                            value={ `${simulation ? (simulation.apy / 10**5).toFixed(2) : 0 }%` }
                          />
                          {
                            currentContract.amount && allowance == 0  ? (
                              <button 
                                className="skull-button"
                                onClick={() => increaseAllowance() }
                              >
                                Approve
                              </button>
                            ) : currentContract.amount && userGraveBalance > 0 && ethers.BigNumber.from( userGraveBalance ).gte( ethers.utils.parseEther(currentContract.amount) ) ? (
                              <button 
                                className="skull-button"
                                onClick={() => { subscribeContract(simulation.duration) } }
                              >
                                Subscribe
                              </button>
                            ) : (
                              <button 
                                className="skull-button"
                                onClick={ () => window.open(mmfLink) }
                              >
                                Buy Grave
                              </button>
                            )
                          }
                        </div>
                      ))
                    ) : (
                      ''
                    )
                  }
                </div>
              </div>
            </div>
            <h1 
              className="your-contracts"
            >
              Your Contracts ( { userActiveContracts.length ? userActiveContracts.length : '0' } )
            </h1>
            {
            userActiveContracts.length > 0 ? (
              userActiveContracts.map((contract, i) => {
                let ending = formatDate(contract.unlockTimestamp)
                let currentContractId = durations.indexOf(contract.duration/86400)
                return(
                  <>
                    <div className="contract-details sk-box-content" key={i}>
                      <div className="bank-name">
                        <div className="bank-name-img">
                          <img src={ buildingImages[currentContractId] } />
                        </div>
                        <div className="bank-name-text">
                          <h1>{ buildings[currentContractId] } Building</h1>
                          <h3>{dateDiff(contract.startTimestamp,contract.unlockTimestamp)} Days</h3>
                        </div>
                      </div>
                      <MetricContainer
                        label="Amount Staked"
                        value={ formatEther(contract.amount, true ) }
                        icon={Grave}
                        vertical={true}
                        tooltip="Your Grave Staked in this specific contract."
                      />
                      <MetricContainer 
                        label="RUDE Rewards"
                        value={ formatEther(contract.rewards, true ) }
                        vertical={true}
                        icon={Rude}
                        tooltip="Generated RUDE rewards until now."
                      />
                      <MetricContainer 
                        label="ARY"
                        value={ `${(contract.apy / 10 ** 5).toFixed(2)}%` }
                        vertical={true}
                        tooltip="Annualizated Rude Yield: increase exponentially when reach contract end data."
                      />
                      <MetricContainer 
                        label="End"
                        value={ `${ ! contract.isClaimable ? timeConverter(contract.unlockTimestamp) : 0 }` }
                        vertical={true}
                        tooltip={`Created: ${timeConverter(contract.startTimestamp)}`}
                      />
                      <MetricContainer 
                        label="Wishbone Used"
                        value={ contract.usedWishbones }
                        vertical={true}
                        icon={Wishbone}
                        tooltip="Your Grave Staked in this specific contract."
                      />
                      <button 
                        onClick={() => { claimRewards(contract.contractId) }}
                        className="skull-button claim-button"
                        disabled={ contract.isClaimable ? false : true}
                      >
                        Claim
                      </button>
                    </div>
                  </>
                )
              })
            ) : ('')
            }
          </div>
          <div className="sk-box" hidden={!detailsView}>
            <div className="sk-box-content sk-row lp-head-details">
              <h1>GRVE-CRO</h1>
              <span>
                <a 
                  href="https://mm.finance/add/CRO/0x9885488cD6864DF90eeBa6C5d07B35f08CEb05e9"
                  target="_blank"
                >
                  Get LP <FontAwesomeIcon icon={faExternalLink}/>
                </a>
              </span>
              <span>
                <a 
                  href="https://cronoscan.com/address/0x4672d3d945700cc3bdf4a2b6704e429d567dc52c"
                >
                  Contract <FontAwesomeIcon icon={faExternalLink}/>
                </a>
              </span>
              <span>
                <a 
                  href="https://dexscreener.com/cronos/0x4672d3d945700cc3bdf4a2b6704e429d567dc52c"
                >
                  Pair Info <FontAwesomeIcon icon={faExternalLink}/>
                </a>
              </span>
            </div>
            <div className="contract-details sk-box-content">
                <img src={GraveCro} />
                <span className="lpTitle">GRVE-CRO</span>
                <MetricContainer 
                  label="Rewards"
                  value={ formatEther(pendingRewards, true ) }
                  vertical={true}
                  icon={Grave}
                  usdValue={ formatEther(pendingRewards, true ) * graveInUsd }
                />
                <MetricContainer 
                  label="APY"
                  value={ totalStakedCro ? `${(100 / (totalStakedCro * croInUsd * 2) * (dailyBlockNumber * formatEther(rewardPerBlock, true) * graveInUsd * 365 ) ).toFixed(2)}%` : 'Loading' }
                  vertical={true}
                />
                <MetricContainer 
                  label="Staked"
                  value={ formatEther(stakedAmount, true ) }
                  vertical={true}
                  icon={GraveCro}
                  usdValue={ stakedAmount ? `${ (totalStakedCro * croInUsd * 2 * ( 100 / totalLiquidity * stakedAmount ) / 100) }` : 0}
                />
                <MetricContainer 
                  label="Liquidity"
                  value={ totalLiquidity ? `${formatEther(totalLiquidity, true)}` : 'Loading' }
                  vertical={true}
                  tooltip={`${formatEther(totalLiquidity, true)} GRVE/CRO LP`}
                  usdValue={(totalStakedCro * croInUsd * 2)}
                />
                <MetricContainer 
                  label="RPB"
                  value={ totalLiquidity ? formatEther(rewardPerBlock, true) : 'Loading' }
                  vertical={true}
                  tooltip={`Rewards per Block: total amount of GRAVE released for each block.`}
                  usdValue={ formatEther(rewardPerBlock, true) * graveInUsd }
                />
                <MetricContainer 
                  label="End Block"
                  value={ endBlock ? endBlock : 'Loading' }
                  vertical={true}
                />
                <div className="data-row-box angle">
                  <span onClick={() => EnablePool(1)} className="angle"> <FontAwesomeIcon icon={angleIconPool[0] ? faAngleUp : faAngleDown} /></span>
                </div>
              </div>
              <div className="data-container-wrapped" id="pool-1">
                <div className="sk-row switcher-container">
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
                    <h1><img src={Grave} className="skull-icon"></img> Stake GRVE/CRO Earn GRVE</h1>
                    <div className="sk-box-content sk-column">
                      <MetricContainer
                        label="Staked LP"
                        value={ formatEther(stakedAmount, true) }
                        icon={GraveCro}
                      />
                      <MetricContainer
                        label="Pending Rewards"
                        value={ formatEther(pendingRewards, true) }
                        icon={Grave}
                      />
                      <MetricContainer
                        label="Balance LP"
                        value={ formatEther(lpPairBalance, true) }
                        icon={GraveCro}
                      />
                      <div className="input-content">
                        <button 
                          className="skull-button" 
                          onClick={() => getMax()}
                        >
                          MAX
                        </button>
                        <input 
                          id="amountToStake" 
                          type="number" 
                          placeholder="0" 
                          value={farmView.amountToStake}
                          onChange={ handleStakeLPChange } 
                          step=".0000000001"
                        >
                        </input>
                      </div>
                      {
                        lpPairAllowance > 0 ? (
                          <button 
                            className={'skull-button stake-button'} 
                            disabled={ farmView.amountToStake <= formatEther(lpPairBalance, true) ? false : true}
                            onClick={ () => stakeLiquidity() }
                          >
                            STAKE
                          </button>
                        ) : (
                          <button
                            className={'skull-button stake-button'} 
                            onClick={ () => approveFarm() }
                          >
                            Approve
                          </button>
                        )
                      }
                    </div>
                  </div>
                  <div className="sk-box data-box" hidden={!detailsView2}>
                    <h1><img src={Grave} className="skull-icon"></img> Stake GRVE/CRO Earn GRVE</h1>
                    <div className="data-box-content">
                      <span className="balance"> { formatEther(stakedAmount, true) } Staked</span>
                      <div className="input-content">
                        <button 
                          className="skull-button" 
                          onClick={() => getMaxStaked()}
                        >
                          MAX
                        </button>
                        <input
                          id="amountToUntake" 
                          type="number"
                          placeholder="0"
                          value={ farmView.amountToUnstake }
                          onChange={ handleStakeLPChange } 
                          step=".0000000001"></input>
                      </div>
                      <button 
                        className={ 'skull-button claim-button' } 
                        disabled={pendingRewards < 0 ? true : false}
                        onClick={() => claimLPRewards() }
                      >
                        { `Unstake & Claim` }
                      </button>
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
