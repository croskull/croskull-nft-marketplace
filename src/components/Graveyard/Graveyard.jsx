import { ethers } from 'ethers';
import React, { useEffect, useState, useRef  } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import { loadAllSkull, getAttribute,resetSkullList, getEbisusLink, loadFilterSkull,getFilterSkullLenght,getAttributeNew,loadSkull } from "../../redux/gallery/galleryAction";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon, faFilter, faM, faStore } from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage } from "react-lazy-load-image-component";
import './graveyard.css';
import { sendNotification } from '../../redux/data/dataActions';
import {loadingGif} from './loading.gif';
import bgIcon from './Icon/bg.png';
import bodyIcon from './Icon/body.png';
import noseIcon from './Icon/nose.png';
import skullIcon from './Icon/skull.png';
import eyesIcon from './Icon/eyes.png';
import hatIcon from './Icon/hat.png';
import numberIcon from './Icon/number.png';
import ebisusIcon from './Icon/ebisus-icon.png';
import logoIcon from './Icon/logo-icon.png';
import searchIcon from './Icon/search.png';
import { faAngleUp, faAngleDown, faPortrait, faStoreAlt, faPlus, faMinus,faWindowClose } from '@fortawesome/free-solid-svg-icons';
import AttributeMap from '../AttributeMap/AttributeMap';

const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri = 'https://ipfs.io/ipfs/QmZA9idEBomqsYBvA9ZH5JzuirmyQ414UBaqBGaEk2w69x/'
const Graveyard = () => {
    let dispatch = useDispatch();

    let { blockchain, gallery } = store.getState()
    let { accountAddress, contractDetected } = blockchain;
    let { skullsList, attributeList, ebisusLink,skullsFilterLenght=6666 } = gallery;

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
    let [skullsListLength, setSkullsListLength] = useState(0);
    let [angleIconFilter, setAngleIconFilter] = useState([]);
    let [skullModal, setSkullModal] = useState(false);
    let [skullData, setSkullData] = useState()
    let [page, setPage] = useState(0);





    useEffect(() => {
        dispatch(loadAllSkull(0))
        dispatch(getAttributeNew())
        toggleData(true)
        return() =>{
            skullsList = null;
            attributeList = null;
        }
    }, [])




    function openSkullModal(croskull) {
        setSkullData(croskull);
        setSkullModal(true);
        dispatch(getEbisusLink(croskull));

        
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


    function loadSkullFilter() {
        dispatch(resetSkullList());
        dispatch(getFilterSkullLenght(filter))
        console.log(skullsFilterLenght);
        if(checkVoidFilter())
        {
            dispatch(loadAllSkull(0))
            setPage(0);
            skullsFilterLenght = 6666;
        }
        else{
            dispatch(loadFilterSkull(filter,page));
        }
        console.log('filtro: '+checkVoidFilter())
        
    }

    function checkVoidFilter() {
        let flag = true;
        filter.map(at =>{
            if(at.value.length !=0)
            flag = false
        })
        return flag;
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
        setPage(0);
        loadSkullFilter();
    }

    function clear() {
        sort=0;
        filter.map((f)=>{
            f.value =[];
        })
        attributeList.map((attribute,i) =>{
            attribute.value.map(value =>{
                let s = document.getElementById(attribute.name + '-' + value.name);
                console.log(s);
                s.checked = false;
            })
        
        })
        loadSkullFilter();
    }

    function chooseIcon(at) {
        switch(at){
            case 'Background':
                return bgIcon;
            case 'Nose':
                return noseIcon;
            case 'Hat':
                return hatIcon;
            case 'Skull':
                return skullIcon;
            case 'Eyes':
                return eyesIcon;
            case 'Body':
                return bodyIcon;
            case 'Trait':
                return numberIcon;
        }
    }

  


    const listenScroll= (event) => {
        let scrollValue = event.target.scrollTop;
        let dh = document.getElementById('skull-row').clientHeight
        if(checkVoidFilter()){
            console.log('listen')
            if(scrollValue > dh/100*60 && skullsListLength != skullsList.length && page<+66)
            {
                setSkullsListLength(skullsList.length);
                setPage(page+1);
                page=page+1
                dispatch(loadAllSkull(page))
                console.log('qua')
            }
        }else{
            if(scrollValue > dh/100*60 && skullsListLength != skullsList.length )
            {
                setSkullsListLength(skullsList.length);
                setPage(page+1);
                page=page+1
                dispatch(loadFilterSkull(filter,page));
                console.log('qua',skullsListLength,skullsList.length,page)
            }
        }
    }

    const openbar = () =>
    {
      document.getElementById("sidebar").style.width = "100%";
    }
    const closebar = () =>
    {
      document.getElementById("sidebar").style.width = "0px";
    }

    function searchById(event){
        let n = event.target.value;
        console.log(event.target.value)
        if(n)
        {
            dispatch(loadSkull(n))
        }else{
            loadSkullFilter()
        }
        
    }

    return (
        <>
            <div  className='skull-modal' hidden={!skullModal} onClick={() => { closeSkullModal() }}>
            {
                skullData != null ?
                <>
                <div className={'modal-container '+skullData.attributes[0].value} >

                        <div className='modal-img'>
                        <img src={ipfsUri480+skullData.edition+'.webp'} />
                        </div>
                        <div className='modal-desc'>
                            <div className='desc-header'>
                                <div className='desc-title'>
                                    <p>CroSkull</p> 
                                    <h1>#{skullData.edition}</h1>
                                </div>
                                <div className='desc-icons'>
                                  <a href={ipfsUri+skullData.edition+'.png'}> <FontAwesomeIcon icon={faPortrait} /></a> 
                                  {
                                      ebisusLink ?
                                      <a href={ebisusLink}> <FontAwesomeIcon icon={faStoreAlt} /></a>
                                      :
                                      ''
                                  }
                                  
                                </div>
                           </div>
                           
                        <div className='attribute-container row'>
                                    {skullData.attributes.map(at => {
                                        return (
                                            <div className={'attribute attribute-'+skullData.attributes[0].value}>
                                                <div className='attribute-icon'>
                                                    <img src={chooseIcon(at.trait_type)} />
                                                </div>
                                                <div className='attribute-desc'>
                                                    <p className='type'>{at.trait_type}:</p>
                                                    <p className='value'><AttributeMap value={at.value} /></p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div className={'attribute attribute-'+skullData.attributes[0].value}>
                                                <div className='attribute-icon'>
                                                    <img src={chooseIcon('Trait')} />
                                                </div>
                                                <div className='attribute-desc'>
                                                    <p className='type'>N. Trait:</p>
                                                    <p className='value'>{skullData.attributes.length}</p>
                                                </div>
                                            </div>
                                </div>

                    </div>
                    <img src={logoIcon} className='logo' />
                </div>
                </>
                :
                ''
            }
            </div>


            <div className='header'>
            <h1 id='filter-header'>Filter <span id='clear-button' onClick={() => clear()}><FontAwesomeIcon icon={faWindowClose} /></span> </h1>
            <div className='skull-header'>
                    <h1>CROSKULLS<span>//{skullsFilterLenght}</span><span id='filter-button' onClick={() => openbar()}><FontAwesomeIcon icon={faFilter} /></span></h1>
                </div>
            </div>
        <div className='gallery-container'>
            <div className='filter-container' id='sidebar'> 
            <div className='filter-title'>
                <h1>Filter <span id='filter-button' onClick={() => closebar()}><FontAwesomeIcon icon={faMinus} /></span></h1>
            </div>
                        <div className='filter-header'>
                            <div className='filter-icon'>
                                <img src={searchIcon} />
                            </div>
                            <div className='filter-name'>
                                <input type='number' className='search-skull' placeholder='Search skull by id' onChange={searchById}></input>

                            </div>
                        </div>
                {
                                            attributeList ?
                                            attributeList.map((attribute, i) => {
                                                    return (
                                                        <div className='filter-box' key={'filter-box-' + i} id={'filter-box-' + i}>
                                                            <div className='filter-header' onClick={() => ShowCheckbox(i)}>
                                                                <div className='filter-icon'>
                                                                    <img src={chooseIcon(attribute.name)} /> 
                                                                </div>
                                                                <div className='filter-name'>
                                                                    <h1>{attribute.name}
                                                                    <span> <FontAwesomeIcon icon={angleIconFilter[i] ? faMinus : faPlus} /></span>
                                                                    </h1>
                                                                    
                                                                </div>
                                                            </div>
                                                            <div className='filter-checkbox' id={'filter-checkbox-' + i} hidden={!angleIconFilter[i]}>
                                                                {
                                                                    attribute.value.map((value, i) => {
                                                                        return (
                                                                            <div className='checkbox'>
                                                                                <input type="checkbox" id={attribute.name + '-' + value.name} name={attribute.name + '-' + value.name} onChange={() => addFilter(attribute.name, value.name)} />
                                                                                <label for={attribute.name + '-' + value.name}> <AttributeMap value={value.name} /> <span>({value.cont})</span></label>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>

                                                        </div>
                                                    )
                                                }) : (<></>)
                                        }
                <div className='div-clear'>
                    <button className='skull-button clear-button' onClick={() => clear()}>Clear</button>
                </div>
            </div>
            <div className='skull-container' onScroll={listenScroll}>

                <div className='filter-bar'>

                </div>
                <div className='skull-row row' id='skull-row'>
                    {
                        skullsList ? 
                        (
                            skullsList.map(skull =>{
                                return(
                                <div className='skull-card' key={skull.edition} onClick={() => openSkullModal(skull)}>
                                    <div className='skull-img'>
                                        <img src={ipfsUri480+skull.edition+'.webp'} />
                                    </div>
                                    <div className='skull-desc'>
                                        <p className='type'>CroSkull</p>
                                        <p className='number'>NO. {skull.edition}</p>
                                    </div>
                                </div>
                                )
                            })

                            ) :
                            (
                                <div>
                                    Loading
                                </div>
                            )
                    }
                </div>
            </div>
        </div>

        </ >
    )
}

export default Graveyard;


