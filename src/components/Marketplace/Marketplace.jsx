import { ethers } from 'ethers';
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import { loadEbisusData, loadEbisusBlue, loadEbisusRed, purchaseItem, loadEbisusSkullsNew, getAttribute } from "../../redux/marketplace/marketplaceActions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LazyLoadImage } from "react-lazy-load-image-component";
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import MetricContainer from '../MetricContainer/MetricContainer';
import AttributeMap from '../AttributeMap/AttributeMap';
import { sendNotification } from '../../redux/data/dataActions';
import CroIcon from "../images/crypto-com.svg";
import SkullIcon from "../images/skull.png"
import RedIcon from "../images/redPotionImage.png"
import BlueIcon from "../images/bluePotionImage.png"
import PurpleIcon from "../images/purplePotionImage.png"
import './marketplace.css';

const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri =  "https://croskull.mypinata.cloud/ipfs/QmZA9idEBomqsYBvA9ZH5JzuirmyQ414UBaqBGaEk2w69x/"
const blueImage = "https://croskull.mypinata.cloud/ipfs/QmPvie22kUv9A7PcXFLbGtGBYuNiFdvQdUvVZZLNA59tbG/bluepotion.gif";
const redImage = "https://croskull.mypinata.cloud/ipfs/QmRdN5CQTpogBtjtnXq3PLrF7A4LezZ1TPt3ynXybcNNZP/redpotion.gif";
const Marketplace = () => {
    let dispatch = useDispatch()
    let { blockchain, marketplace } = store.getState()
    let [modalData, setModalData] = useState()
    const [hasData, toggleData] = useState(false)
    let [sort, setSort] = useState(0);
    /*
    let [filter, setFilter] = useState([
        { name: 'Background', value: [] },
        { name: 'Skull', value: [] },
        { name: 'Body', value: [] },
        { name: 'Nose', value: [] },
        { name: 'Eyes', value: [] },
        { name: 'Hat', value: [] },
        { name: 'Trait', value: [] }
    ]);*/
    let [filter, setFilter] = useState({
        'Background': [],
        'Skull': [],
        'Body': [],
        'Nose': [],
        'Eyes': [],
        'Hat': [],
        'Trait': []
    })
    let [angleIconFilter, setAngleIconFilter] = useState([]);
    let [skullModal, setSkullModal] = useState(true);
    let {
        saleSkulls,
        saleBlue,
        saleRed,
        //skull stats
        skullForSales,
        //bluepotion stats
        blueForSales,
        //redpotion stats
        redForSales,
        loading, 
        skullList, 
        attributesList
    } = marketplace

    useEffect(() => {
        if (hasData) return
        dispatch(loadEbisusData(sort))
        dispatch(getAttribute())
        toggleData(true)
        setSkullModal(false)
    }, [])

    const handlePurchase = async (id, type) => {
        let { accountBalance } = blockchain
        let { saleSkulls, saleBlue, saleRed } = marketplace
        let items;
        switch (type) {
            case 'skull': {
                items = saleSkulls
                break;
            }
            case 'blue': {
                items = saleBlue
                break;
            }
            case 'red': {
                items = saleRed
                break;
            }
        }
        console.log(id, type, items[id])
        if (items && items[id]) {
            let { price, nftId, listingId } = items[id]
            let formattedPrice = ethers.utils.parseUnits(price, 18)
            let formattedBalance = accountBalance ? ethers.utils.parseUnits(accountBalance, 0) : false;
            if (formattedBalance && formattedBalance.gte(formattedPrice)) {
                dispatch(purchaseItem({
                    _listingId: listingId,
                    _cost: formattedPrice,
                    _skullId: nftId
                }))
            } else {
                console.log(false)
                dispatch(sendNotification({
                    title: `Insufficient balance`,
                    type: "info",
                    tx: '',
                    message: `You need ${price} CRO`
                }))
            }
        }
    }

    const [viewState, setViewState] = useState({
        currentView: 'croskull', //croskull, bluepotion, redpotion, petegg,
        selectedSkulls: [],
        selectedStakeSkulls: []
    })

    function openSkullModal(croskull, index) {
        croskull['index'] = index
        setModalData(croskull);
        setSkullModal(true);
    }

    function closeSkullModal() {
        setSkullModal(false);
    }

    function selectSort(event) {
        const select = document.getElementById('sortBy');
        let value = select.selectedIndex;
        sort = value;
        setSort(value);

        loadSkullFilter();

    }

    const setFilterAngleState = (i) => {
        let ids = [...angleIconFilter];
        ids[i] = !ids[i];
        setAngleIconFilter(ids);
    }

    const ShowCheckbox = (i) => {
        setFilterAngleState(i);
        let d = document.getElementById("filter-checkbox-" + i);
        d.style.height = 'auto';

    }


    function closeFilterModal() {
        document.getElementById('filter-modal').style.visibility = 'hidden';
    }


    function loadSkullFilter() {
        dispatch(loadEbisusSkullsNew());
        console.log(sort);
        dispatch(loadEbisusSkullsNew(sort));
    }

    function addFilter(trait, value) {
        if (!filter[trait].includes(value))
            filter[trait].push(value);
        else {
            const index = filter[trait].indexOf(value);
            filter[trait].splice(index, 1);
        }
        loadSkullFilter();
    }

    function checkFilter(cr) {
        let flag = true;
        Object.entries(filter).map( (trait) => {
            let name = trait[0]
            trait = trait[1]
            if (trait.length > 0 && flag) {
                if( name == 'Trait') {
                if(trait.includes(5)) {   
                    console.log(5)
                    cr.nft.attributes.map(at => {
                        if (at.trait_type == 'Hat' && flag) {
                            if (at.value.includes('none'))
                                flag = true
                            else {
                                flag = false;
                            }
                        }
                    })
                }
                if(trait.includes(6))
                {
                    console.log(6)
                    cr.nft.attributes.map(at => {
                        if (at.trait_type == 'Hat' && flag) {
                            if (at.value.includes('none'))
                                flag = false
                            else {
                                flag = true;
                            }
                        }
                    })
                } 
            }else{
                cr.nft.attributes.map(at => {
                    if (at.trait_type == name && flag) {
                        if (trait.includes(at.value))
                            flag = true
                        else {
                            flag = false;
                        }
                    }
                })
            }

            }
        })
        console.log(flag);
        return flag;
    }

    function enableFitler() {
        let f = document.getElementById('filter-container');
        let s = document.getElementById('skull-box');
        let b = document.getElementById('filter-button')
        if(f.style.display.includes('none'))
            {
                f.style.display = 'block';
                s.style.display = 'none';
                b.innerHTML = 'Skulls';
            }
        else{
            f.style.display = 'none';
            s.style.display = 'block';
            b.innerHTML = 'Filters'
        }
    }

    function clear() {
        sort=0;
        setSort(0);
        Object.entries(filter).map((trait)=>{
            trait[1] = [];
        })
        let select = document.getElementById('sortBy').options;
        select[0].selected = true; //seleziono la prima scelta
        attributesList.map((attribute,i) =>{
            attribute.value.map(value =>{
                let s = document.getElementById(attribute.name + '-' + value);
                console.log(s);
                s.checked = false;
            })
        
        })
        loadSkullFilter();
    }

    let icons = {
        "skull": SkullIcon,
        "red": RedIcon,
        "blue": BlueIcon,
        "purple": PurpleIcon,
    }

    const RenderCollectionDetails = ({type}) => {
        let name = type[0].toUpperCase() + type.slice(1)
        return (
            <div className="collection-details sk-box-content sk-row">
                <MetricContainer 
                    label="Floor"
                    value={parseFloat(marketplace[`${type}FloorPrice`]).toFixed(2)}
                    vertical="true"
                    icon={CroIcon}
                />
                <MetricContainer 
                    label="Avg. Sale"
                    value={parseFloat(marketplace[`${type}AvgPrice`]).toFixed(2)}
                    vertical="true"
                    icon={CroIcon}
                />
                <MetricContainer 
                    label="Total Volume"
                    value={parseFloat(marketplace[`${type}TotalVolume`]).toFixed(2)}
                    vertical="true"
                    icon={CroIcon}
                />
                <MetricContainer 
                    label={`${name} Sales`}
                    value={marketplace[`${type}Solds`]}
                    vertical="true"
                    icon={icons[type]}
                />
                <MetricContainer 
                    label={`Active Listings`}
                    value={marketplace[`${type}ForSales`]}
                    vertical="true"
                    icon={icons[type]}
                />
            </div>
        )
    }

    return (
        <>
            <div id='skull-modal' hidden={!skullModal}>
                <div className='mSkull-container sk-box'>
                    {
                        modalData != null ?
                            <>
                                <span class="close-btn" onClick={() => { closeSkullModal() }}>
                                    &times;
                                </span>
                                <div className='sk-row sk-flex sk-box-content sk-details-wrapper'>
                                    <div className='skull-details sk-column sk-flex'>
                                        <h1>{modalData.nft.name}</h1>
                                        <span>Seller: {modalData.seller.substr(0, 4)}...{modalData.seller.substr(39, 41)}</span>
                                        <span>Price: {modalData.price}CRO</span>
                                        <span>Rank: {modalData.nft.rank}</span>
                                        <a
                                            href={ipfsUri + modalData.nft.edition + '.png'}
                                            target="_blank"
                                        >
                                            Original Image (ipfs) >>
                                        </a>
                                        <button
                                            className="skull-button mission-button"
                                            onClick={() => {
                                                handlePurchase(modalData.index, 'skull')
                                            }}
                                        >
                                            Buy
                                        </button>
                                    </div>
                                    <img src={ipfsUri480 + modalData.nft.edition + '.webp'} className='img-modal'></img>
                                </div>
                                <div className='attribute-container sk-flex sk-column'>
                                    {modalData.nft.attributes.map(at => {
                                        return (
                                            <div className='sk-box-content sk-row'>
                                                <p>{at.trait_type}</p>
                                                <p>{ at.value ? <AttributeMap value={at.value} /> : ''}</p>
                                                <p>{(at.occurrence * 100).toFixed(0) + '%'}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                            :
                            ''
                    }

                </div>
            </div>
            <div className="sk-flex sk-row ">
                <div className="sk-container wd-100">
                    <div className="sk-box">
                        <div className="tab-head sk-row sk-flex">
                            <ul className="sk-row view-list">
                                <li className={`skull-button view-button ${viewState.currentView === 'croskull' ? 'active' : ''}`}
                                    onClick={() => {
                                        setViewState({
                                            ...viewState,
                                            currentView: 'croskull'
                                        })
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
                                    className={`skull-button view-button ${viewState.currentView === 'bluepotion' ? 'active' : ''}`}
                                    onClick={() => {
                                        setViewState({
                                            ...viewState,
                                            currentView: 'bluepotion'
                                        })
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
                                    className={`skull-button view-button ${viewState.currentView === 'redpotion' ? 'active' : ''}`}
                                    onClick={() => {
                                        setViewState({
                                            ...viewState,
                                            currentView: 'redpotion'
                                        })
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
                        <div className="sk-box-content sk-column ">
                            <div className='sk-row sk-flex skull-container' hidden={viewState.currentView.includes('croskull') ? false : true}>
                                <button className='skull-button filter-button' onClick={() => enableFitler()} id='filter-button'>
                                    filters
                                </button>
                                <div className='sk-column filter-container' id='filter-container'>
                                    <div className='sort-container'>
                                    <div className='select-div'>
                                        <select name="sortBy" id="sortBy" onChange={selectSort} >
                                            
                                            <optgroup label="Sort By">
                                                <option value='0' selected>None</option>
                                                <option value="1" onClick={selectSort}>Latest Listing</option>
                                                <option value="2" onClick={selectSort}>Price (Lowest)</option>
                                                <option value="3" onClick={selectSort}>Price (Highest)</option>
                                                <option value="4" onClick={selectSort}>Rank (Lowest)</option>
                                                <option value="5" onClick={selectSort}>Rank (Highest)</option>
                                            </optgroup>
                                        </select>
                                        </div>
                                        <div className='button-div'>
                                        <button className='skull-button clear-button' onClick={() => clear()}>Clear</button>
                                        </div>
                                    </div>
                                        {
                                            attributesList ?
                                                attributesList.map((attribute, i) => {
                                                    return (
                                                        <div className='filter-box' key={'filter-box-' + i} id={'filter-box-' + i}>
                                                            <div className='filter-header' onClick={() => ShowCheckbox(i)}>
                                                                <h1>{attribute.name}
                                                                <span> <FontAwesomeIcon icon={angleIconFilter[i] ? faAngleUp : faAngleDown} /></span></h1>
                                                            </div>
                                                            <div className='filter-checkbox' id={'filter-checkbox-' + i} hidden={!angleIconFilter[i]}>
                                                                {
                                                                    
                                                                        attribute.value.map((value, i) => {
                                                                                return (
                                                                                    <div className='checkbox'>
                                                                                        <input type="checkbox" id={attribute.name + '-' + value} name={attribute.name + '-' + value} onChange={() => addFilter(attribute.name, value)} />
                                                                                        <label for={attribute.name + '-' + value}> { value ? <AttributeMap value={value} /> : ''} </label>
                                                                                    </div>
                                                                                )
                                                                    })
                                                                }
                                                            </div>

                                                        </div>
                                                    )
                                                }) : (<></>)
                                        }
                                </div>
                                <div className="sk-row skull-grid skull-box" id='skull-box'>
                                    { 
                                        <RenderCollectionDetails
                                            type="skull"
                                        />
                                    }
                                    {
                                        skullList && skullList.length ?
                                            (skullList).map((cr, index) => {
                                                if (checkFilter(cr))
                                                    return (
                                                        <div key={index} className="skull-item" onClick={() => openSkullModal(cr, index)}>
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
                                                                        onClick={() => {
                                                                            handlePurchase(index, 'skull')
                                                                        }}
                                                                    >
                                                                        Buy
                                                                    </button>
                                                                </div>
                                                                <div className='rank-container'>
                                                                    <span className="badge id">Rank: {cr.nft.rank}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                            })
                                            : (
                                                <div className='loading-div'>
                                                    <span>Loading...</span>
                                                </div>
                                            )
                                    }
                                </div>
                            </div>
                            <div className={` `} hidden={viewState.currentView.includes('bluepotion') ? false : true}>
                                <div className="sk-row skull-grid">
                                    <RenderCollectionDetails
                                        type="blue"
                                    />
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
                                                                    onClick={() => {
                                                                        handlePurchase(index, 'blue')
                                                                    }}
                                                                >
                                                                    Buy
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                            : (
                                                <div className="sk-flex sk-column">
                                                    <span>{loading ? `Loading...` : ''}</span>
                                                </div>
                                            )
                                    }
                                    {
                                        saleBlue.length < blueForSales ? (
                                            <button
                                                className="skull-button load-more"
                                                onClick={() => {
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
                            <div className={``} hidden={viewState.currentView.includes('redpotion') ? false : true}>
                                <div className="sk-row skull-grid">
                                    <RenderCollectionDetails
                                        type="red"
                                    />
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
                                                                    onClick={() => {
                                                                        handlePurchase(index, 'red')
                                                                    }}
                                                                >
                                                                    Buy
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                            : (
                                                <div className="sk-flex sk-column">
                                                    <span>{loading ? `Loading...` : ''}</span>
                                                </div>
                                            )
                                    }
                                    {
                                        saleRed.length < redForSales ? (
                                            <button
                                                className="skull-button load-more"
                                                onClick={() => {
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
            {false ? (
                '') : ('')}

        </ >
    )
}

export default Marketplace;

const filters =
    [
        {
            type: 'background',
            value: ['blue', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red']
        },
        {
            type: 'Body',
            value: ['blue', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red']
        },
        {
            type: 'Eyes',
            value: ['blue', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red']
        },
        {
            type: 'hat',
            value: ['blue', 'greeb', 'red', 'greeb', 'red']
        },
        {
            type: 'Nose',
            value: ['blue', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red']
        },
        {
            type: 'Skull',
            value: ['blue', 'greeb', 'red', 'greeb', 'red', 'greeb', 'red']
        },
        {
            type: 'Trait',
            value: [5, 6]
        },
    ];

