import React , { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './merchant.css';
import { sendNotification, getStakingData } from "../../redux/data/dataActions";
import MerchantAvatar from "./merchant-avatar.png";
import MerchantEmpty from "./merchant-empty.png";

const MAX_APPROVE = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
const Merchant = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    let { petEggsSupply, petEggsMaxSupply, petEggsLimit, petEggsMintedByUser, petEggsCost, userGraveBalance, approvedEggs } = data
    let { croSkullsGrave, croSkullsPetEggs, accountAddress, formatEther } = blockchain

    let [minted, setMinted] = useState(false)
    const purchaseEgg = async () => {
        //setMinted(true)
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
            dispatch(getStakingData())
        })
        //setMinted(false)
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
    return (
        <>
            <div className="sk-flex sk-row">
                <div className="sk-container">
                    <div className={`sk-box ${minted ? 'card' : ''}`}>
                        <h2>Merchant</h2>
                        <div className="sk-box-content sk-column">
                            <span>Minted</span>
                            <span className="highlight">{petEggsSupply} of {petEggsMaxSupply}</span>
                        </div>
                        <h3></h3>
                        <span>Burn your $<b>GRAVE</b> to recieve a limited and super-rare Pet's Egg.</span>
                        <div className="sk-box-content sk-column">
                            <span>Cost: { formatEther(petEggsCost) } $<b>GRAVE</b></span>
                            <span>Limit: Max 2 Eggs per Address</span>
                            <span>Max Supply: {petEggsMaxSupply} EGGS</span>
                            <span>{ `Your Limit: ${petEggsMintedByUser}/${petEggsLimit}` }</span>
                        </div>
                        {
                            ! approvedEggs ? 
                            (
                                <button
                                    className="sk-purchase-btn"
                                    onClick={
                                        () => {
                                            approveEggs()
                                        }
                                    }
                                >
                                    Approve
                                </button>
                            ) : (
                                <button 
                                    className="sk-purchase-btn"
                                    disabled={ canMint && hasBalance ? false : true }
                                    onClick={ 
                                        () => {
                                            purchaseEgg()
                                        }
                                    }
                                >
                                    {
                                        ! canMint ?
                                        'Limit Reached' : 
                                            ! hasBalance ?
                                            'Not Enough  GRAVE' :
                                        'Purchase'
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
                        
                    />
                </div>
            </div>
        </>
    )
};
export default Merchant;
