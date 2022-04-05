import React, { useEffect, useState } from "react";
import './home.css'
import { useDispatch } from "react-redux";
import Skull from '../Navbar/skull.png';
import MetricContainer from '../MetricContainer/MetricContainer';
import HomeCard from "../HomeCard/HomeCard";
import { loadEbisusData } from "../../redux/marketplace/marketplaceActions";
import { loadDexData } from "../../redux/dexscreener/dexscreenerActions";
import Grave from "../Navbar/grave.png";
import MarketplaceCard from "./marketplace-card.jpeg";
import TavernCard from "./tavern-card.jpeg";
import BankCard from "./bank-card.jpeg";
import AdventureCard from "./adventure-card.jpeg";
import MerchantCard from "./merchant-card.jpeg";
import RaffleCard from "./raffle-card.jpeg";
import store from "../../redux/store";
import { LazyLoadImage } from "react-lazy-load-image-component";

const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"
const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUriFull = "https://croskull.mypinata.cloud/ipfs/"
const Home = () => {
    let dispatch = useDispatch()
    const [detailsView, setDetailsView] = useState('skulls')
    let { blockchain, marketplace, data, dexscreener } = store.getState()
    let { formatEther, accountAddress } = blockchain

    useEffect( () => {
        if( marketplace.redSolds ) return 
        dispatch(loadEbisusData())
        dispatch(loadDexData())
    }, [])

    let {
        totalSkullsStaked,
        burnedGraves,
        croSkulls,
        croSkullsStaked
    } = data


    let {
        saleSkulls,
        saleBlue,
        saleRed,
        //skull stats
        skullAvgPrice,
        skullFloorPrice,
        skullForSales,
        skullSolds,
        skullTotalVolume,
        //bluepotion stats
        blueAvgPrice,
        blueFloorPrice,
        blueForSales,
        blueSolds,
        blueTotalVolume,
        //redpotion stats
        redAvgPrice,
        redFloorPrice,
        redForSales,
        redSolds,
        redTotalVolume,
    } = marketplace

    let allSkulls = croSkulls.concat(croSkullsStaked)
    console.log(allSkulls)
    let randImage = Math.floor((Math.random() * (allSkulls.length - 1)) + 1)
    return (
        <>
            <div className="sk-flex sk-row">
                <div className="sk-container wd-66">
                    <div className="sk-box sk-welcome">
                        {randImage ? (
                            <LazyLoadImage 
                                className="welcome-image"
                                src={ `${ipfsUri480}${randImage}.webp` }
                            />
                        ) : (
                            <div 
                                className="no-welcome-image"
                                onClick={() => window.location.hash = 'marketplace' }   
                            >
                                <span>No Skull</span>
                            </div>
                        )
                        }
                        {
                            accountAddress ? (
                                <>
                                    <div className="welcome sk-column sk-box-content">
                                        <span className="welcome-message">Hi <b>Skuller</b>,</span>
                                        <span className="welcome-address">{accountAddress}</span>
                                    </div>
                                </>
                            ) : accountAddress ? ( 'Loading' ) : ( 'Connect now')
                        }
                        <div
                            className="buy-cta sk-flex sk-column"
                        >
                            <button
                                className="skull-button icon"
                                onClick={() => window.location.hash = 'marketplace' }
                            >
                                <img className="button-icon" src={Skull} />
                                <span>Buy Skull</span>
                            </button>
                            <button
                                className="icon skull-button"
                                onClick={() => window.open = 'https://mm.finance/swap?outputCurrency=0x9885488cD6864DF90eeBa6C5d07B35f08CEb05e9' } 
                            >
                                <img className="button-icon" src={Grave} />
                                <span>Buy Grave</span>
                            </button>
                        </div>
                    </div>
                    <div className="sk-box">
                        <div className="tab-head">
                            <h2>Dashboard</h2>
                        </div>
                        <div className="card-container sk-row sk-flex">
                            <HomeCard 
                                image={BankCard}
                                title="Bank"
                                description="Stake your GRAVE and GRAVE/CRO LP"
                                location="bank"
                            />
                            <HomeCard 
                                image={MarketplaceCard}
                                title="Marketplace"
                                description="Buy Skulls and Potions"
                                location="marketplace"
                            />
                            <HomeCard 
                                image={TavernCard}
                                title="Tavern"
                                description="Check your Skulls, Potions and Stories"
                                location="tavern"
                            />
                            <HomeCard 
                                image={AdventureCard}
                                title="Adventure (S1)"
                                description="Earn Grave and Souls during the Adventure"
                                location="adventure"
                            />
                            <HomeCard 
                                image={MerchantCard}
                                title="Merchant"
                                description="Purchase Mysterious Pet Eggs"
                                location="merchant"
                            />
                            <HomeCard 
                                image={RaffleCard}
                                title="Raffle"
                                description="Partecipate and Win Amazing Prizes!"
                                location="raffle"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;