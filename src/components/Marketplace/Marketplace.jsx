import { ethers } from 'ethers';
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import { loadEbisusData, loadEbisusSkulls, loadEbisusBlue, loadEbisusRed, purchaseItem, loadEbisusSkullsNew, getAttribute } from "../../redux/marketplace/marketplaceActions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon } from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage } from "react-lazy-load-image-component";
import './marketplace.css';
import { sendNotification } from '../../redux/data/dataActions';
import {loadingGif} from './loading.gif';
import { faAngleUp, faAngleDown, faQuestionCircle, faExternalLink } from '@fortawesome/free-solid-svg-icons';

const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"
const blueImage = "https://croskull.mypinata.cloud/ipfs/QmPvie22kUv9A7PcXFLbGtGBYuNiFdvQdUvVZZLNA59tbG/bluepotion.gif";
const redImage = "https://croskull.mypinata.cloud/ipfs/QmRdN5CQTpogBtjtnXq3PLrF7A4LezZ1TPt3ynXybcNNZP/redpotion.gif";
const Marketplace = () => {
    let dispatch = useDispatch()
    let { blockchain, marketplace } = store.getState()
    let [modalData, setModalData] = useState()
    const [viewInventory, toggleInventory] = useState(false)
    const [hasData, toggleData] = useState(false)
    let [sort, setSort] = useState(0);
    let [filter, setFilter] = useState([
        { name: 'Background', value: [] },
        { name: 'Skull', value: [] },
        { name: 'Body', value: [] },
        { name: 'Nose', value: [] },
        { name: 'Eyes', value: [] },
        { name: 'Hat', value: [] },
        { name: 'Trait', value: [] }
    ]);
    let [angleIconFilter, setAngleIconFilter] = useState([]);
    let [filterModal, setFilterModal] = useState(false);
    let [skullModal, setSkullModal] = useState(false);
    let [spinner, setSpinner] = useState(true);
    let [skullArr, setSkullArr] = useState();
    let { accountAddress, contractDetected } = blockchain
    let { saleSkulls, saleBlue, saleRed, blueForSales, redForSales, skullAvgPrice, skullFloorPrice, skullForSales, skullSolds, skullTotalVolume, loading, skullList, attributesList } = marketplace

    useEffect(() => {
        if (hasData) return
        dispatch(loadEbisusData(sort))
        dispatch(getAttribute())
        toggleData(true)
    }, [])

    const handlePurchase = async (id, type) => {
        let { contractDetected, ebisusMarketplace, accountBalance } = blockchain
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

    function openSkullModal(croskull) {
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
    function openFilterModal() {
        document.getElementById('filter-modal').style.visibility = 'visible';
        setFilterModal(true);

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

    function addFilter(name, value) {
        switch (name) {
            case 'Background':
                if (!filter[0].value.includes(value))
                    filter[0].value.push(value);
                else {
                    const index = filter[0].value.indexOf(value);
                    filter[0].value.splice(index, 1);
                }
                break;
            case 'Skull':
                if (!filter[1].value.includes(value))
                    filter[1].value.push(value);
                else {
                    const index = filter[1].value.indexOf(value);
                    filter[1].value.splice(index, 1);
                }
                break;
            case 'Body':
                if (!filter[2].value.includes(value))
                    filter[2].value.push(value);
                else {
                    const index = filter[2].value.indexOf(value);
                    filter[2].value.splice(index, 1);
                }
                break;
            case 'Nose':
                if (!filter[3].value.includes(value))
                    filter[3].value.push(value);
                else {
                    const index = filter[3].value.indexOf(value);
                    filter[3].value.splice(index, 1);
                }
                break;
            case 'Eyes':
                if (!filter[4].value.includes(value))
                    filter[4].value.push(value);
                else {
                    const index = filter[4].value.indexOf(value);
                    filter[4].value.splice(index, 1);
                }
                break;
            case 'Hat':
                if (!filter[5].value.includes(value))
                    filter[5].value.push(value);
                else {
                    const index = filter[5].value.indexOf(value);
                    filter[5].value.splice(index, 1);
                }
            case 'Trait':
                if (!filter[6].value.includes(value))
                    filter[6].value.push(value);
                else {
                    const index = filter[6].value.indexOf(value);
                    filter[6].value.splice(index, 1);
                }
                break;
            default:
                break;
        }
        loadSkullFilter();
    }

    function checkFilter(cr) {
        let flag = true;
        filter.map(f => {
            if (f.value.length > 0 && flag) {
                cr.nft.attributes.map(at => {
                    if (at.trait_type == f.name && flag) {
                        console.log('secondo if')
                        if (f.value.includes(at.value))
                            flag = true
                        else {
                            flag = false;
                        }
                    }
                })

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
        filter.map((f)=>{
            f.value =[];
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
                                <div className='sk-row sk-flex skull-box'>
                                    <div className='skull-details'>
                                        <h1>{modalData.nft.name}</h1>
                                        <h1>Seller: {modalData.seller.substr(0, 4)}...{modalData.seller.substr(39, 41)}</h1>
                                        <h1>Price: {modalData.price}CRO</h1>
                                        <h1>Rank: {modalData.nft.rank}</h1>
                                    </div>
                                    <img src={ipfsUri480 + modalData.nft.edition + '.webp'} className='img-modal'></img>
                                </div>
                                <div className='attribute-container row'>
                                    {modalData.nft.attributes.map(at => {
                                        return (
                                            <div className='attribute'>
                                                <p>{at.trait_type}</p>
                                                <p>{at.value}</p>
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
                                                                                <label for={attribute.name + '-' + value}> {value}</label>
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
                                <div className='loading'>
                                                    <img src={loadingGif} />
                                                </div>
                                    {
                                        skullList ?
                                            (skullList).map((cr, index) => {
                                                if (checkFilter(cr))
                                                    return (
                                                        <div key={index} className="skull-item" onClick={() => openSkullModal(cr)}>
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
                                                                        <FontAwesomeIcon icon={faDungeon} />
                                                                        Purchase
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
                                                </div>
                                            )
                                    }
                                </div>
                            </div>
                            <div className={` `} hidden={viewState.currentView.includes('bluepotion') ? false : true}>
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
                                                                    onClick={() => {
                                                                        handlePurchase(index, 'blue')
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
                                                    <span>{loading ? `Loading...` : ''}</span>
                                                </div>
                                            )
                                    }
                                    {
                                        saleSkulls.length < skullForSales ? (
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
                                                    <span>{loading ? `Loading...` : ''}</span>
                                                </div>
                                            )
                                    }
                                    {
                                        saleSkulls.length < skullForSales ? (
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

