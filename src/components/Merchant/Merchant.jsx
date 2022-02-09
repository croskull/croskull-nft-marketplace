import React , { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './merchant.css';
import { connect, disconnect } from "../../redux/blockchain/blockchainActions";
import MerchantAvatar from "./merchant-avatar.png";


const Merchant = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    let { rewardPlusMalus, malusFee, soulsGenerated, userGraveBalance, croSkulls, rewards, croSkullsStaked } = data
    let { croSkullsPetEggs, accountAddress, loading, contractDetected, providerConnected, formatEther } = blockchain
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div className="container-fluid merchant">
            <div className="sk-flex sk-row">
                <div className="sk-container">
                    <div className="sk-box">
                        <h2>Merchant</h2>
                        <div className="sk-box-content">
                            <span>Minted</span>
                            <span className="highlight">239 of 2200</span>
                        </div>
                        <h3></h3>
                        <span>Exchange your $<b>GRAVE</b> for limited and rare Pet Eggs.</span>
                        <div className="sk-box-content">
                            <span>Cost: 500 $<b>GRAVE</b></span>
                            <span>Limit: Max 2 Eggs per Address</span>
                            <span>Max Supply: 2200 EGGS</span>
                        </div>
                        <button className="sk-purchase-btn">
                            Purchase
                        </button>
                    </div>
                </div>
                <div className="sk-container">
                    <img 
                        src={MerchantAvatar}
                        className="merchant-image" 
                    />
                </div>
            </div>
        </div>
    )
};
export default Merchant;
