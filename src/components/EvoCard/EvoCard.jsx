import React, {useState} from "react";
import MetricContainer from "../MetricContainer/MetricContainer";
import EvoStat from "./EvoStat/EvoStat";
import { sendNotification, fetchBalances } from "../../redux/data/dataActions";
import { useDispatch } from "react-redux";
import './EvoCard.css';
import Power from "../images/power.svg"
import STR from "../images/str.svg";
import DEX from "../images/dex.svg";
import INT from "../images/int.svg";
import WISD from "../images/wisd.svg";
import CONST from "../images/const.svg";
import CHAR from "../images/char.svg";
import store from "../../redux/store";
import SRank from "../images/s-rank.png";
import SPRank from "../images/s-plus-rank.png";
import ARank from "../images/a-rank.png";
import BRank from "../images/b-rank.png";
import GraveIcon from "../images/grave.png"
import Souls from "../images/soul.png"
import Rude from "../images/rude.png"
import ReactPlayer from 'react-player'
import {BigNumber, ethers} from 'ethers';
import { loadEvoSkulls } from "../../redux/evo/evoActions";
import { loadPets } from "../../redux/pet/petActions";
import AnimatedEvo from "../images/evo-animated.webp"
import AnimatedPet from "../images/pet-animated.webp"
import { updateState } from "../../redux/evo/evoActions"
import { petUpdateState } from "../../redux/pet/petActions"


const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/";
const baseEvoMp4 = "https://croskull.mypinata.cloud/ipfs/QmfTC3SBfQNywvndLRyps6tdWveiYzGWLhYzzh6ZRefSjP/"
const baseEvoImage = "https://croskull.mypinata.cloud/ipfs/QmW7N2usEp2z8Xy2oFxy9Vsh7XYR9EeZEdmVoz5UnFDEtw/"


const EvoCard = ({ evo = false, type = 'evoskull', readOnly = false}) => {
    let dispatch = useDispatch()
    const { utils } = ethers
    let { blockchain, data, evo: evo_state, pet } = store.getState()
    let { formatDate, accountAddress, evoSkullsContract, croSkullsSouls, croSkullsRude, formatEther } = blockchain
    let { soulsBalance, rudeBalance } = data
    let contract = false;
    let reloadAction, soulsUpdater, rudeUpdater;
    let rudeAllowance, soulsAllowance;
    if( type == 'evoskull'){
        rudeAllowance = evo_state.rudeAllowance
        soulsAllowance = evo_state.soulsAllowance
        contract = blockchain.evoSkullsContract
        reloadAction = () => dispatch(loadEvoSkulls())
        rudeUpdater = () => dispatch( updateState({
            "key": "rudeAllowance",
            "value": ethers.constants.MaxUint256.toString()
        }))
        soulsUpdater = () => dispatch( updateState({
            "key": "soulsAllowance",
            "value": ethers.constants.MaxUint256.toString()
        }))
    }else{
        rudeAllowance = pet.rudeAllowance
        soulsAllowance = pet.soulsAllowance
        contract = blockchain.petSeasonOne
        reloadAction = () => dispatch(loadPets())
        rudeUpdater = () => dispatch( petUpdateState({
            "key": "rudeAllowance",
            "value": ethers.constants.MaxUint256.toString()
        }))
        soulsUpdater = () => dispatch( petUpdateState({
            "key": "soulsAllowance",
            "value": ethers.constants.MaxUint256.toString()
        }))   
    }
    let [ experience, setExperience ] = useState(0)
    let [ experienceView, setExperienceView ] = useState(false)
    let [ levelupView, setLevelupView ] = useState(false)
    const evoDemo = {
        id: 1,
        currentToken: {
            stamina: 14,
            charisma: 13,
            intelligence: 14,
            strength: 14,
            dexterity: 14,
            constitution: 14,
            wisdom: 14,
            experience: 1293,
            power: 83,
            level: 9,
            stamina: 10
        },
        owner: "",
        isLevelable: false,
        isClaimable: false,
        imageURL: type == 'evoskull' ? AnimatedEvo : AnimatedPet,
        nextLvlExp: 40
    }

    if( ! evo ) evo = evoDemo

    let ipfsMetadata = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes( `${evo.id}`  )
        ).replace('0x','')
    ipfsMetadata =  evo.imageURL ? evo.imageURL : `${baseEvoMp4}${ipfsMetadata}.mp4`
    
    let current = evo.currentToken
    let rankIcon = BRank
    let isOwner = accountAddress.toLowerCase() == evo.owner.toLowerCase()
    
    if( current.power > 0 && current.power <= 50 )
        rankIcon = BRank

    if(  current.power > 50 && current.power <= 70)
        rankIcon = ARank

    if( current.power > 70 && current.power <= 85 )
        rankIcon = SRank

    if(  current.power > 85 )
        rankIcon = SPRank

    const claimRewards = async () => {
        let claimTx = contract.claimRewards(evo.id)
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
                    title: `Grave Claimed!`,
                    message: `Yo received 9 $GRVE.`,
                    tx,
                    type: "success"
                }))
                reloadAction()
                dispatch(fetchBalances())
            }
        )
    }
    const levelUp = async ( ) => {
        let rudeCost = evo.upgradeCost
        if(  rudeAllowance == 0 ) {
            let approveExp = croSkullsRude.approve(
                contract.address,
                ethers.constants.MaxUint256
            )
            await approveExp.then(
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
                        title: `Ok Approval!`,
                        message: `Now you can levelup.`,
                        tx,
                        type: "success"
                    }))
                    reloadAction()
                    rudeUpdater()
                }
              )
        }else{
            if( rudeBalance => rudeCost ){
                let addExpTx = contract.levelUp(
                    evo.id
                )
                await addExpTx.then(
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
                        title: `Level UP!`,
                        message: `EvoSkull level is Increased!`,
                        tx,
                        type: "success"
                      }))
                      reloadAction()
                      dispatch(fetchBalances())
                    }
                  )
            }
        }
    }

    const addExperience = async ( ) => {
        if(  soulsAllowance == 0 ) {
            let approveExp = croSkullsSouls.approve(
                contract.address,
                ethers.constants.MaxUint256
            )
            await approveExp.then(
                async (tx) => {
                    dispatch(sendNotification({
                        title: `Transaction Sent`,
                        message: 'Waiting for confirmation...',
                        tx,
                        type: "info"
                    }))
                    await tx.wait(1)
                    dispatch(sendNotification({
                        title: `Ok Approval!`,
                        message: `Now you can add experience.`,
                        tx,
                        type: "success"
                    }))
                    soulsUpdater()
                }
              )
        }else{
            let amount = experience
            if( soulsBalance => amount && amount ){
                let addExpTx = contract.addExperience(
                    evo.id,
                    amount
                )
                await addExpTx.then(
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
                        title: `Experience Added!`,
                        message: `Skull received new experience.`,
                        tx,
                        type: "success"
                      }))
                      dispatch(reloadAction())
                      dispatch(fetchBalances())
                    }
                )
            }
        }
    }

    const RenderStaminaBar = () => {
        let staminaBar = [];
        const staminaSpan = (active, i) => {  
            return (
                <span className={ active ? `active` : ``} key={i}></span>
            )
        }

        let maxStamina = (10 + parseInt(current.level))

        for( let i = 0; i < maxStamina; i++){
                staminaBar[i] = staminaSpan( i < current.stamina ? true : false, i)
        }
        let nextClaim = parseInt(current.lastClaimTimestamp) + ( 3600 * 24 )
        let claimDiff =  parseInt(nextClaim) - parseInt(Date.now() / 1000)
        let nextClaimFormatted = formatDate( claimDiff, true)
        return (
            <div className="evo-mid-bar">
                {
                isOwner && ! readOnly &&
                    type == 'evoskull' ? (
                        <span className="evo-claim stat">
                            <img 
                                className="evo-claim-button"
                                src={GraveIcon}
                                onClick={ () => evo.isClaimable ? claimRewards() : '' }
                                disabled={evo.isClaimable ? false : true }
                            />
                            <span className="stat-tooltip">
                                { evo.isClaimable ? `Claim Grave` : `Next claim in: ${ nextClaimFormatted }.` }
                            </span>
                        </span>
                    ) : ('')
                }
                <div className="stamina-bar stat">
                    <div className="stamina-bar-container">
                        { staminaBar }
                    </div>
                    <span>
                        { 
                            current.stamina ? 
                            `${current.stamina}/${maxStamina}` : 
                            isOwner ?
                            `Restore` :
                            `No stamina` 
                        }
                    </span>
                    <span className="stat-tooltip">Stamina</span>
                </div>
            </div>
        )
    }

    const renderExperienceDialog = () => {
        let experiencePercent = parseInt( 100 / parseInt(soulsBalance) * experience)
        return (
            <div className="sk-box experience-dialog">
                <span className="exp-heading">
                    <img className="souls-icon" src={Souls} />
                    <span className="exp-title">Add Experience ($SLS)</span>
                    <span 
                        className="close-icon"
                        onClick={ () => setExperienceView(false) }
                    >
                        &times;
                    </span>
                </span>
                <div className="sk-box-content">
                    {
                        soulsBalance > 0 ? (
                            <span className="sk-flex sk-row">
                                Exp needed:
                                <span 
                                    onClick={
                                        () => setExperience(  
                                            utils.parseEther(soulsBalance).gte( evo.nextLvlExp ) ? 
                                                evo.nextLvlExp :
                                                soulsBalance
                                            )}>
                                                (<b>{evo.nextLvlExp}</b>)
                                </span>
                                {
                                    soulsBalance >= evo.nextLvlExp * 2 ? (
                                        <span onClick={() => setExperience(evo.nextLvlExp * 2)}>(<b>x2</b>)</span>
                                    ) : ( '')
                                }
                                {
                                    soulsBalance >= evo.nextLvlExp * 3 ? (
                                        <span onClick={() => setExperience(evo.nextLvlExp * 3)}>(<b>x3</b>)</span>
                                    ) : ('')
                                }
                            </span>
                        ) : ( '' )
                    }
                    {
                        soulsBalance > 0 ? (
                            <div className="exp-slider-wrapper">
                                <span>{experience}</span>
                                <div className="exp-slider">
                                    <div 
                                        className="exp-slider-inner"
                                        style={{ width: `${experiencePercent}%`}}
                                    ></div>
                                </div>
                                <span>{soulsBalance}</span>
                            </div>
                        ) : (
                            `You don't have $SLS.`
                        )
                    }
                    <div className="dialog-actions">
                        <button
                            className="dialog-action skull-button"
                            onClick={ () => setExperience( experience-1 > 0 ? experience-1 : 0 ) }
                            disabled={ soulsBalance > 0 ? false : true }
                        >
                            <span >-</span>
                        </button>
                        <button 
                            className="dialog-action skull-button"
                            onClick={ () => setExperience( experience-1 <= soulsBalance ? experience+1 : parseInt(soulsBalance) ) }
                            disabled={ soulsBalance > 0 ? false : true }
                        >
                            <span>+</span>
                        </button>
                        <button 
                            className="dialog-action skull-button"
                            onClick={ () => setExperience( parseInt(soulsBalance) ) }
                            disabled={ soulsBalance > 0 ? false : true }
                        >
                            <span>Max</span>
                        </button>
                        <button 
                            className="dialog-action skull-button success"
                            onClick={ () => addExperience() }
                            disabled={ experience ? false : true }
                        >
                            <span>{ soulsAllowance == 0 ? `Approve` : `Add` }</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const renderLevelUpDialog = () => {
        let hasBalance = utils.parseEther(rudeBalance).gte(evo.upgradeCost)
        console.log( hasBalance, evo.upgradeCost, rudeBalance )
        return (
            <div className="sk-box experience-dialog">
                <div className="sk-box-content">
                    <span className="exp-heading">
                        <img className="souls-icon" src={Rude} />
                        <span className="exp-title">Level up Cost: { formatEther( evo.upgradeCost, 2 ) }</span>
                    </span>
                    <div className="dialog-actions">
                        <button
                            className="dialog-action skull-button success"
                            onClick={ () => levelUp( ) }
                            disabled={ rudeAllowance == 0 || hasBalance ? false : true }
                        >
                            { rudeAllowance > 0 ? `Confirm` : `Approve` }
                        </button>
                        <span
                            className="dialog-action skull-button danger"
                            onClick={ () => setLevelupView(false) }
                        >
                            <span >Back</span>
                        </span>
                    </div>
                    {
                        ! hasBalance ? (
                            <MetricContainer 
                                label={`Insufficient Rude`}
                                tooltip={`You need at least ${formatEther( evo.upgradeCost, 2 )} Rude to level up`}
                            />
                        ) : ''
                    }
                </div>
            </div>
        )
    }

    let evoExpProgress, nextLvlExp
    if( current ){
        nextLvlExp = parseInt(evo.nextLvlExp) + parseInt( current.experience)
        evoExpProgress = parseInt( 100 / nextLvlExp * current.experience )

    }
    return (
        <div className={`evo-container ${ type }`}>
            <div className="evo-image-container">
                {
                    evo.imageURL ? (
                        <img 
                            className="evo-image"
                            src={ evo.imageURL } 
                        />
                    ) : (
                        <ReactPlayer 
                            className="evo-image"
                            url={ipfsMetadata}
                            playing={true}
                            muted={true}
                            controls={false}
                            loop={true}
                            width={`100%`}
                            height={`100%`}
                        />
                    )
                }
            </div>
            <div className="card-details">
                <span className="card-info">
                    <span 
                        className="card-exp-after" 
                        style={ {width: `${evoExpProgress}%`} }
                    >
                    </span>
                    <span className="card-level">
                        {current.level}
                        {   
                            isOwner && ! readOnly ?
                                evo.isLevelable ? (
                                    <span 
                                        onClick={() => setLevelupView(true)}
                                        className="levelup-icon"
                                    ></span>
                                ) : (
                                    <span 
                                        onClick={ () => setExperienceView(true) }
                                        className="upgrade-icon"
                                    ></span>
                                )  :
                            ``
                        }
                    </span>
                    {
                        isOwner && ! readOnly ? 
                            experienceView && renderExperienceDialog() :
                            ``
                    }
                    {
                         isOwner && levelupView && ! readOnly && renderLevelUpDialog()
                    }
                    <span className="stat-tooltip">{ isOwner && ! readOnly ? evo.isLevelable ? `Level up` : `Add Experience` : `Level` }</span>
                    <span className="card-exp">
                        {
                            current.experience < nextLvlExp ? 
                                `${current.experience}/${nextLvlExp}` : 
                                accountAddress.toLowerCase() == evo.owner.toLowerCase() ? 
                                    `Levelable` :
                                    ``
                        }
                    </span>
                </span>
            </div>
            <div className="card-stats-container">
                <div className="card-stats">
                    <div className="stat-list vertical">
                        <EvoStat 
                            icon={Power}
                            value={current.power}
                            tooltip={`Power`}
                        />
                    </div>
                    <div className="stat-list">
                        <EvoStat 
                            icon={STR}
                            value={current.strength}
                            tooltip={`Strength`}
                        />
                        <EvoStat 
                            icon={DEX}
                            value={current.dexterity}
                            tooltip={`Dexterity`}
                        />
                        <EvoStat 
                            icon={INT}
                            value={current.intelligence}
                            tooltip={`Intelligence`}
                        />
                        <EvoStat 
                            icon={CONST}
                            value={current.constitution}
                            tooltip={`Constitution`}
                        />
                        <EvoStat 
                            icon={WISD}
                            value={current.wisdom}
                            tooltip={`Wisdom`}
                        />
                        {
                            type == 'evoskull' ? (
                                <EvoStat 
                                    icon={CHAR}
                                    value={current.charisma}
                                    tooltip={`Charisma`}
                                />
                            ) : ( '' )
                        }
                    </div>
                    <span className="card-rank">
                        <img src={rankIcon} draggable="false" />
                    </span>
                </div>
                <RenderStaminaBar />
                <div className="footer">
                    <span>{ type == 'evoskull' ? `EvoSkull` : `Pets` } #<b>{evo.id}</b>/{ type == 'evoskull' ? `333`: `2200`}</span>
                    <span>Owner: <b>{ evo.cnsDomain ? evo.cnsDomain : evo.owner ? `${evo.owner.substr(0, 4)}...${evo.owner.substr(evo.owner.length - 4, evo.owner.length)}` : '' }</b></span>
                </div>
            </div>
        </div>
    )
};



export default EvoCard;

