import React  from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './merchant.css';
import { sendNotification, getStakingData, updateUserBalance } from "../../redux/data/dataActions";
import MerchantAvatar from "./merchant-avatar.png";
import PetEgg from "./egg_broken.jpg"
import MerchantEmpty from "./merchant-empty.png";

const MAX_APPROVE = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
const Merchant = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    let { petEggsSupply, petEggsMaxSupply, petEggsLimit, petEggsMintedByUser, petEggsCost, userGraveBalance, approvedEggs } = data
    let { croSkullsGrave, croSkullsPetEggs, accountAddress, formatEther } = blockchain


    const purchaseEgg = async () => {
        let purchaseTx = croSkullsPetEggs.purchaseEgg(
            accountAddress
        )
        await purchaseTx.then( async ( tx ) => {
            dispatch(sendNotification({
                title: `Transaction Sent`,
                message: 'Waiting for confirmation...',
                tx,
                type: "default"
            }))
            await tx.wait(2)
            dispatch(sendNotification({
                title: `Egg Purchased!`,
                message: `Successful purchased 1 pet's egg.`,
                tx,
                type: "success"
            }))
            dispatch(updateUserBalance())
            dispatch(getStakingData())
        })
    }

    const approveEggs = async () => {
        let allowanceTx = croSkullsGrave.approve(
            croSkullsPetEggs.address,
            MAX_APPROVE
        )
        await allowanceTx.then( async ( tx ) => {
            dispatch(sendNotification({
                title: `Transaction Sent`,
                message: 'Waiting for confirmation...',
                tx,
                type: "default"
            }))
            await tx.wait(2)
            dispatch(sendNotification({
                title: `Approved Successful!`,
                message: `Now you can purchase your pet's egg.`,
                tx,
                type: "success"
            }))
            dispatch( getStakingData() )
        })
    }
    
    let canMint = petEggsMintedByUser < petEggsLimit
    let hasBalance = parseInt(petEggsCost) <= parseInt(userGraveBalance)
    let currentDate = parseInt(new Date() / 1000)
    let endDate = 1654903359;
    let diffDate = endDate > currentDate ? endDate - currentDate : false;
    let diffDateFormatted = formatDate(diffDate)
    return (
        <>
            <div className="sk-flex sk-row">
                <div className="sk-container">
                    <div className={`sk-box`}>
                        <h2>Mint Pet Eggs Gen 1</h2>
                        <img className="pet-egg-thumb" src={PetEgg}/>
                        <div className="sk-box-content sk-row">
                            <div className="sk-flex sk-column">
                                <span>Minted</span>
                                <span className="highlight">{petEggsSupply} of {petEggsMaxSupply}</span>
                                <b>Ends in: {diffDateFormatted.days}d {diffDateFormatted.hours}h {diffDateFormatted.minutes}m</b>
                            </div>
                        </div>
                        <span>Burn your <b>GRAVE</b> to receive a limited and super-rare NFT Seasonal Pet Eggs Generation 1.</span>
                        <div className="sk-box-content sk-column">
                            <span>Cost: { formatEther(petEggsCost) } <b>GRAVE</b></span>
                            <span>Limit: Max 2 Eggs per Address</span>
                            <span>Max Supply: {petEggsMaxSupply} EGGS</span>
                            <span>{ `Your Limit: ${petEggsMintedByUser}/${petEggsLimit}` }</span>
                        </div>
                        {
                            ! approvedEggs ? 
                            (
                                <button
                                    className={`sk-purchase-btn ${ accountAddress ? '' : 'disabled'}`}
                                    disabled={ accountAddress ? false : true}
                                    onClick={
                                        () => {
                                            approveEggs()
                                        }
                                    }
                                >
                                    Approve Contract
                                </button>
                            ) : (
                                <button 
                                    className="sk-purchase-btn"
                                    disabled={ canMint && hasBalance ? false : true }
                                    onClick={ 
                                        () => {
                                            canMint && hasBalance ?
                                                purchaseEgg() :
                                                window.open('https://mm.finance/swap?outputCurrency=0x9885488cD6864DF90eeBa6C5d07B35f08CEb05e9')
                                        }
                                    }
                                >
                                    {
                                        ! canMint ?
                                        'Limit Reached' : 
                                            ! hasBalance ?
                                            'You need more Grave' :
                                        'Mint Rare Pet Egg'
                                    }
                                </button>
                            )
                        }
                    </div>
                </div>
                <div className="sk-container">
                    <img 
                        src={ petEggsMintedByUser ? MerchantAvatar : MerchantEmpty }
                        className={ `${approvedEggs ? `merchant-egg` : `merchant-egg trip`}` }
                        alt="Pet's Egg"
                    />
                </div>
            </div>
        </>
    )
};

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

export default Merchant;
