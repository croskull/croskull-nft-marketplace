import { ethers } from 'ethers';
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import { loadEbisusData, loadEbisusSkulls, loadEbisusBlue, loadEbisusRed, purchaseItem } from "../../redux/marketplace/marketplaceActions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon, faRunning, faCoins, faSkullCrossbones, faSpinner, faRedoAlt  } from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage } from "react-lazy-load-image-component";
import './marketplace.css';
import { parseBytes32String } from '@ethersproject/strings';
import { sendNotification } from '../../redux/data/dataActions';

const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"
const blueImage = "https://croskull.mypinata.cloud/ipfs/QmPvie22kUv9A7PcXFLbGtGBYuNiFdvQdUvVZZLNA59tbG/bluepotion.gif";
const redImage = "https://croskull.mypinata.cloud/ipfs/QmRdN5CQTpogBtjtnXq3PLrF7A4LezZ1TPt3ynXybcNNZP/redpotion.gif";
const Marketplace = () => {
    let dispatch = useDispatch()
    let { blockchain, marketplace } = store.getState()

    const [viewInventory, toggleInventory] = useState( false )
    const [hasData, toggleData] = useState(false)

    useEffect( () => {
        if( hasData ) return 
        dispatch(loadEbisusData())
        toggleData(true)
    }, [])

    const handlePurchase = async ( id, type ) => {
        let { contractDetected, ebisusMarketplace, accountBalance } = blockchain
        let { saleSkulls, saleBlue, saleRed } = marketplace
        let items;
        switch( type ){
            case 'skull':{
                items = saleSkulls
                break;
            }
            case 'blue':{
                items = saleBlue
                break;
            }
            case 'red':{
                items = saleRed
                break;
            }
        }
        console.log( id, type, items[id])
        if( items && items[id] ){
            let { price, nftId, listingId } = items[id]
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
    let { saleSkulls, saleBlue, saleRed, blueForSales, redForSales, skullAvgPrice, skullFloorPrice, skullForSales, skullSolds, skullTotalVolume, loading } = marketplace
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
                                saleSkulls && skullForSales > 0 ? (
                                <span className="floating-counter">{skullForSales}</span>
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
                                saleBlue.length && blueForSales > 0 ? (
                                    <span className="floating-counter">{blueForSales}</span>
                                ) : 
                                '' 
                            }
                                Blue Potions
                            </li>
                            <li
                                className={`skull-button view-button ${ viewState.currentView === 'redpotion' ? 'active' : ''}`}
                                onClick={ () => {
                                    setViewState( {
                                    ...viewState,
                                    currentView: 'redpotion'
                                    } )
                                }}
                            >
                            { 
                                saleRed.length && redForSales > 0 ? (
                                    <span className="floating-counter">{redForSales}</span>
                                ) : 
                                '' 
                            }
                                Red Potions
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
                                                        handlePurchase( index, 'skull' )
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
                        <div className={`skulls-list in-tavern ${ viewState.currentView === 'bluepotion' ? `active` : `` }`}>
                            <div className="sk-row skull-grid">
                            {
                                saleBlue.length > 0 ?
                                (saleBlue).map((cr, index) => {
                                return (
                                    <div key={index} className="skull-item" >
                                        <div 
                                            className="card"
                                            >
                                            <LazyLoadImage
                                                src={`${blueImage}`}
                                            />
                                            <div className="floating-badges-container">
                                                <span className="badge id">{cr.nftId}</span>
                                                <span className="badge rank">Price {cr.price}</span>
                                            </div>
                                            <div className="bottom-actions">
                                                <button 
                                                    className="skull-button mission-button"
                                                    onClick={ () => {
                                                        handlePurchase( index, 'blue' )
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
                                            dispatch(loadEbisusBlue())
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
                        <div className={`skulls-list in-tavern ${ viewState.currentView === 'redpotion' ? `active` : `` }`}>
                            <div className="sk-row skull-grid">
                            {
                                saleRed.length > 0 ?
                                (saleRed).map((cr, index) => {
                                return (
                                    <div key={index} className="skull-item" >
                                        <div 
                                            className="card"
                                            >
                                            <LazyLoadImage
                                                src={`${redImage}`}
                                            />
                                            <div className="floating-badges-container">
                                                <span className="badge id">{cr.nftId}</span>
                                                <span className="badge rank">Price {cr.price}</span>
                                            </div>
                                            <div className="bottom-actions">
                                                <button 
                                                    className="skull-button mission-button"
                                                    onClick={ () => {
                                                        handlePurchase( index, 'red' )
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
                                            dispatch(loadEbisusRed())
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
