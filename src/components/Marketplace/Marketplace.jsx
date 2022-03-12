import { ethers } from 'ethers';
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import { loadEbisusData, loadEbisusSkulls, purchaseItem } from "../../redux/marketplace/marketplaceActions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon, faRunning, faCoins, faSkullCrossbones, faSpinner, faRedoAlt  } from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage } from "react-lazy-load-image-component";
import './marketplace.css';
import { parseBytes32String } from '@ethersproject/strings';
import { sendNotification } from '../../redux/data/dataActions';

const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"
const Marketplace = () => {
    let dispatch = useDispatch()
    let { blockchain, marketplace } = store.getState()

    const [viewInventory, toggleInventory] = useState( false )
    const [hasData, toggleData] = useState(false)

    useEffect( () => {
        if( hasData ) return 
        console.log( 'loading data')
        dispatch(loadEbisusData())
        toggleData(true)
    }, [])

    const handlePurchase = async ( id ) => {
        let { contractDetected, ebisusMarketplace, accountBalance } = blockchain
        let { saleSkulls } = marketplace
        if( saleSkulls && saleSkulls[id] ){
            let { price, nftId, listingId } = saleSkulls[id]
            let formattedPrice = ethers.utils.parseUnits( price, 18 )
            let formattedBalance = accountBalance ? ethers.utils.parseUnits( accountBalance, 0 ) : false;
            if( formattedBalance && formattedBalance.gte(formattedPrice)){
                dispatch(purchaseItem({
                    _listingId: listingId,
                    _cost: formattedPrice,
                    _skullId: nftId
                }))
            }else{
                console.log( false )
                dispatch(sendNotification({
                    title: `Insufficient balance`,
                    type: "info",
                    tx: '',
                    message: `You need ${price} CRO`
                  }))
            }
        }
    }

    const [viewState, setViewState] = useState( {
        currentView: 'croskull', //croskull, bluepotion, redpotion, petegg,
        selectedSkulls: [],
        selectedStakeSkulls: []
    })
    

    let { accountAddress, contractDetected } = blockchain
    let { saleSkulls, skullAvgPrice, skullFloorPrice, skullForSales, skullSolds, skullTotalVolume, loading } = marketplace
    return (
        <>
        <div className="sk-flex sk-row">
            <div className="sk-container wd-100">
                <div className="sk-box">
                    <div className="tab-head">
                        <ul className="sk-row view-list">
                            <li className={`skull-button view-button ${ viewState.currentView === 'croskull' ? 'active' : ''}`}
                                onClick={ () => {
                                    setViewState( {
                                    ...viewState,
                                    currentView: 'croskull'
                                    } )
                                }}
                            >
                            { 
                                saleSkulls && saleSkulls.length > 0 ? (
                                <span className="floating-counter">{saleSkulls.length}</span>
                                ) : 
                                '' 
                            }
                                CroSkulls 
                            </li>
                            <li
                            className={`skull-button view-button ${ viewState.currentView === 'bluepotion' ? 'active' : ''}`}
                            onClick={ () => {
                                setViewState( {
                                ...viewState,
                                currentView: 'bluepotion'
                                } )
                            }}
                            >
                            { 
                                1 ? (
                                <span className="floating-counter">{1}</span>
                                ) : 
                                '' 
                            }
                                Blue Potions
                            </li>
                        </ul>
                    </div>
                    <div className="sk-box-content sk-column">
                        <div className={`skulls-list in-tavern ${ viewState.currentView === 'croskull' ? `active` : `` }`}>
                            <div className="sk-row skull-grid">
                            {
                                saleSkulls.length > 0 ?
                                (saleSkulls).map((cr, index) => {
                                return (
                                    <div key={index} className="skull-item" >
                                        <div 
                                            className="card"
                                            >
                                            <LazyLoadImage
                                            src={`${ipfsUri480}${cr.nftId}.webp`}
                                            />
                                            <div className="floating-badges-container">
                                                <span className="badge id">{cr.nftId}</span>
                                                <span className="badge rank">Price {cr.price}</span>
                                            </div>
                                            <div className="bottom-actions">
                                                <button 
                                                    className="skull-button mission-button"
                                                    onClick={ () => {
                                                        handlePurchase( index )
                                                    }}
                                                > 
                                                    <FontAwesomeIcon icon={faDungeon} /> 
                                                    Purchase
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })
                                : (
                                <div className="sk-flex sk-column">
                                    <span>{ loading ? `Loading...` : ''  }</span>
                                </div>
                                )
                            }
                            {
                                saleSkulls.length < skullForSales ? (
                                    <button
                                        className="skull-button load-more"
                                        onClick={ () => {
                                            dispatch(loadEbisusSkulls())
                                        }}
                                    >
                                        Load More
                                    </button>
                                ) : (
                                    ''
                                )
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        { false ? (
            '' ) : ('')}
        </ >
    )
}

export default Marketplace;
