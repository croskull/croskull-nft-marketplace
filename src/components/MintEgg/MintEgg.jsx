import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './MintEgg.css';
import eggPic from "./egg.png";
import purplePotionImage from "../images/purplePotionImage.png";
import Skull from "../images/skull.png";
import EvoSkull from "../images/evoskull-icon.png";
import Grave from "../images/grave.png";
import EvoCard from "../EvoCard/EvoCard";
import EvoPet  from '../images/pet-icon.png'
import MetricContainer from "../MetricContainer/MetricContainer";
import eggCrack from './egg-cracked.png'

const MintEgg = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    const [egg , setEgg] = useState(null);
    let [eggModal,setEggmodal] = useState(false);
    const [ view, setView ] = useState(false) // false or 0 hide, 1 for Skull and 2 for Potion

    function chooseEgg(egg) {
        setEgg(egg);
        setView(0)
    }
    function closeEggModal(){
        setEggmodal(false);
    }

    function openEggModal(){
        let e = document.getElementById('egg');
        setEggmodal(true);
        setTimeout(() => {
            e.src= eggCrack;
          }, 5000);
    }
    return (
        <>
        <div className='egg-modal' hidden={!eggModal} onClick={() => { closeEggModal() }}>
         <div className={'animation-container '} >
             <div className="egg-container">
                <img src={eggPic} id='egg'/>
                <p>What!? The egg is hatching</p>
             </div>
                <div id='w-box'>
                    <div className="pet-container">
                        <img
                            src={'https://analytics.croskull.com/evopet.jpeg'}
                            id='pic-minted'
                        />
                        <p id='text-minted'>EVOPET #1 IS BORN!</p>
                    </div>

                </div>
             </div>
         </div>
            <div className="sk-flex sk-row">
                <div className="card-container wd-50">
                        <EvoCard type='evopet'/>
                </div>
                <div className="sk-box wd-50">
                    <h1>Mint EvoPet</h1>
                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                        <p>t has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p>
                    <div className="sk-box-content">
                        <div className={`inventory-list sk-box ${ view == 1 ? 'show' : ''}`}>
                            <div className="sk-box-content sk-row">
                            {
                                walletSkull.map( e =>{
                                    return(
                                        <div className="circular-image">
                                            <img src={eggPic}  onClick={() => chooseEgg(e)}/>
                                            <p>#{e}</p>
                                        </div>
                                    )

                                })
                            }
                            </div>
                        </div>
                        <div className="sk-row sk-flex">
                            <div 
                                className="sk-flex sk-column"
                            >
                                <img 
                                    src={eggPic} 
                                    style={  egg ? {} : {filter: 'grayscale(100%)'}}
                                    onClick={ () => 
                                        view != 1 ? setView(1) : setView(0) 
                                    } 
                                />
                                <span id='egg-id'>
                                    {egg ? `Egg: #${egg}` : `Select egg`}
                                </span>
                            </div>
                        </div>

                    </div>
                        <MetricContainer
                            label="Egg"
                            value={ egg ? `OK #${egg}` : `Select` }
                            icon={eggPic}
                            tooltip="Select a Egg to proced. Egg disappear after the mint."
                        />
                        <MetricContainer
                            label="Total Minted"
                            value={ `22/2200` }
                            icon={EvoPet}
                            tooltip="Total Egg Circulating Supply / Max Supply."
                        />
                        <MetricContainer
                            label="Mint Cost"
                            value={ <p style={{transform: 'scale(2'}}>&infin;</p> }
                            icon={Grave}
                            tooltip="Transaction cost in Grave."
                        />
                        <button 
                            className="skull-button" 
                            disabled={ ! egg}
                            onClick={() => openEggModal()}
                        >
                            MINT 
                        </button>
                </div>
            </div>
        </>
    )
};



export default MintEgg;

const walletSkull =[1,2,3,4,5,6,7,8,9];
