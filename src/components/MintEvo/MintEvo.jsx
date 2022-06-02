import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './MintEvo.css';
import egg from "./egg.png";
import purplePotionImage from "../images/purplePotionImage.png";
import Skull from "../images/skull.png";
import EvoSkull from "../images/evoskull-icon.png";
import Grave from "../images/grave.png";
import EvoCard from "../EvoCard/EvoCard";
import MetricContainer from "../MetricContainer/MetricContainer";

const MintEvo = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    const [ evolver, setEvolver ] = useState({
        skull: 0,
        potion: 0
    })

    const [ view, setView ] = useState(false) // false or 0 hide, 1 for Skull and 2 for Potion

    function chooseSkull(skull) {
        setEvolver({
            ...evolver,
            skull
        })
        setView(0)
    }

    function choosePotion(potion) {
        setEvolver({
            ...evolver,
            potion
        })
        setView(0)
    }
    const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
    
    return (
        <>
            <div className="sk-flex sk-row">
                <div className="card-container wd-50">
                        <EvoCard type='evopet'/>
                </div>
                <div className="sk-box wd-50">
                    <h1>Mint EvoSkull</h1>
                        <p>EvoSkulls is a collection of Unique, Animated, 1/1 NFTs with on-chain Stats powered on the Cronos blockchain. The collection consists of 333 Super-rare Skulls, all 1/1.</p>
                        <p>By owning an Evo, you can generate 9 $GRVE daily. Evo also have different on-chain stats, this means that these data can be leveraged to powers amazing PVP Battling and Mission systems.</p>
                    <div className="sk-box-content">
                        <div className={`inventory-list sk-box ${ view == 1 ? 'show' : ''}`}>
                            <div className="sk-box-content sk-row">
                            {
                                walletSkull.map( s =>{
                                    return(
                                        <div className="circular-image">
                                            <img src={ipfsUri480+s+".webp"}  onClick={() => chooseSkull(s)}/>
                                            <p>#{s}</p>
                                        </div>
                                    )

                                })
                            }
                            </div>
                        </div>
                        <div className={`inventory-list sk-box ${ view == 2 ? 'show' : ''}`}>
                            <div className="sk-box-content sk-row">
                                {
                                    walletSkull.map( s =>{
                                        return(
                                            <div className="circular-image">
                                                <img src={purplePotionImage}  onClick={() => choosePotion(s)}/>
                                                <p>#{s}</p>
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
                                    src={evolver.skull ? ipfsUri480+evolver.skull+".webp" : egg}  
                                    onClick={ () => 
                                        view != 1 ? setView(1) : setView(0) 
                                    } 
                                />
                                <span id='skull-id'>
                                    {evolver.skull ? `Skull: #${evolver.skull}` : `Select Skull`}
                                </span>
                            </div>
                            <FontAwesomeIcon icon={faPlus} size="2x"/>
                            <div 
                                className="sk-flex sk-column"
                            >
                                <img 
                                    src={evolver.potion ? `${purplePotionImage}` : egg} 
                                    onClick={ () =>  
                                        view != 2 ? setView(2) : setView(0)
                                    }
                                />
                                <span id='potion-id'>
                                    {evolver.potion ? `Potion: #${evolver.potion}` : `Select Potion`}
                                </span>
                            </div>
                        </div>

                    </div>
                        <MetricContainer
                            label="CroSkull"
                            value={ evolver.skull ? `OK #${evolver.skull}` : `Select` }
                            icon={Skull}
                            tooltip="Select a CroSkull to proced. Skull is returned after the mint."
                        />
                        <MetricContainer
                            label="Purple Potion"
                            value={ evolver.potion ? `OK #${evolver.potion}` : `Select` }
                            icon={purplePotionImage}
                            tooltip="You need both CroSkull and Purple Potion. Potion is burned during the mint."
                        />
                        <MetricContainer
                            label="Total Minted"
                            value={ `5/333` }
                            icon={EvoSkull}
                            tooltip="Total Evo Circulating Supply / Max Supply."
                        />
                        <MetricContainer
                            label="Mint Cost"
                            value={ `200` }
                            icon={Grave}
                            tooltip="Transaction cost in Grave."
                        />
                        <button 
                            className="skull-button" 
                            disabled={ ! evolver.skull || ! evolver.potion ? true : false}
                        >
                            MINT
                        </button>
                </div>
            </div>
        </>
    )
};



export default MintEvo;

const walletSkull =[1,2,3,4,5,6,7,8,9];

const skull1 ={
    id: 123,
    rank:'d',
    lvl : 0,
    bg: 'white',
    str : '5',
    dex : '5',
    const : '5',
    int : '5',
    wisd : '5',
    char: '5',
    stamina: '10',
    power: '30',
    exp : '15',
    nextLvl : '25',
    malus : ['freeze']
}

const skull2 ={
    id: 1234,
    rank:'b',
    lvl : 7,
    bg: 'green',
    str : '12',
    dex : '12',
    const : '12',
    int : '12',
    wisd : '12',
    char: '12',
    stamina: '10',
    power: '72',
    exp : '100',
    nextLvl : '250',
    malus : ['freeze','sad']
}

const skull3 ={
    id: 345,
    rank:'s',
    lvl : 10,
    bg: 'purple',
    str : '15',
    dex : '15',
    const : '15',
    int : '15',
    wisd : '15',
    char: '15',
    stamina: '10',
    power: '90',
    exp : '1777',
    nextLvl : '2500',
    malus : ['hungry','freeze']
}

const testo =['testo1','testo2','testo3','testo4','testo5','testo6','testo7','testo8'];