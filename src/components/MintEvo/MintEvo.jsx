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
import EvoCard from "../EvoCard/EvoCard";
import MetricContainer from "../MetricContainer/MetricContainer";
import { loadEvoSkulls, updateState } from "../../redux/evo/evoActions"
import { sendNotification } from "../../redux/data/dataActions"
import { BigNumber, ethers } from "ethers";

const MintEvo = () => {
    const dispatch = useDispatch();
    let { blockchain, data, evo } = store.getState();
    let { accountAddress, croPotionPurple, evoSkullsContract, croSkullsContract } = blockchain
    let { croSkulls, purpleId } = data
    let { totalSupply, isPurpleApproved, isSkullApproved } = evo
    const [ evolver, setEvolver ] = useState({
        skull: 0,
        potion: 0
    })
    const [evoView, setEvoView] = useState(false)

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
    const evoIpfsBase = "https://croskull.mypinata.cloud/ipfs/QmTmqi1k5KWv988iidG4wyu1WBuQBiqYUARB2xsRU2Q4pT/"
    const approvePurple = async () => {
        let approveTx = croPotionPurple.setApprovalForAll(
            evoSkullsContract.address,
            true
        )
        await approveTx.then(
            async (tx) => {
              console.log( tx )
              dispatch(sendNotification({
                title: `Transaction Sent`,
                message: 'Waiting for confirmation...',
                tx,
                type: "info"
              }))
              await tx.wait(1)
              dispatch(sendNotification({
                title: `Potion Approved!`,
                message: `Potion can now be used.`,
                tx,
                type: "success"
              }))

              dispatch( updateState({
                  "key": "isPurpleApproved",
                  "value": true
              } ))
            }
        )
    }

    const approveSkull = async () => {
        let approveTx = croSkullsContract.setApprovalForAll(
            evoSkullsContract.address,
            true
        )
        await approveTx.then(
            async (tx) => {
              console.log( tx )
              dispatch(sendNotification({
                title: `Transaction Sent`,
                message: 'Waiting for confirmation...',
                tx,
                type: "info"
              }))
              await tx.wait(1)
              dispatch(sendNotification({
                title: `Skull Approved!`,
                message: `Skull can now be used.`,
                tx,
                type: "success"
              }))

              dispatch( updateState({
                  "key": "isSkullApproved",
                  "value": true
              } ))
            }
        )
    }

    const mintEvo = async () => {
        let currentSupply = (await evoSkullsContract.totalSupply()).toString()
        currentSupply = parseInt(currentSupply)
        if( currentSupply < 333 ) {
            let currentToken = currentSupply+1
            let ipfsMetadata = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes( `${currentToken}`  )
            ).replace('0x','')
            let mintEvo = evoSkullsContract.evocation(
                evolver.skull,
                evolver.potion,
                `${evoIpfsBase}${ipfsMetadata}.json`
            )
            await mintEvo.then(
                async (tx) => {
                    console.log( tx )
                    dispatch(sendNotification({
                        title: `Transaction Sent`,
                        message: 'Waiting for confirmation...',
                        tx,
                        type: "info"
                    }))
                    await tx.wait(1)
                    dispatch(sendNotification({
                        title: `EvoSkull ${currentToken} Summoned`,
                        message: `EvoSkull can now be used.`,
                        tx,
                        type: "success"
                    }))
                    dispatch(
                        loadEvoSkulls()
                    )
                    await loadEvoToken(currentToken)
                }
            )
        }
    }

    const checkSkulls = async () => {
        let correct = 0
        let wrong = 0
        for(let i = 80; i < totalSupply; i++ ){
            let uri = await evoSkullsContract.tokenURI(i)
            let hash = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes( `${i}`  )
                ).replace('0x','')
            let correctEvoIPFS = `${evoIpfsBase}${hash}.json`
            if( uri == correctEvoIPFS ){
                correct++
                console.log('Giusto - ', i, correctEvoIPFS)
            }else{
                wrong++
                console.log('Updating > - ', i, correctEvoIPFS)
                await evoSkullsContract.setTokenURI(i, correctEvoIPFS)
            }
        }
        console.log(correct, wrong)
    }

    const loadEvoToken = async (tokenId) => {
        let tempToken = await evoSkullsContract.getToken(tokenId)
        let tempCurToken = tempToken.currentToken
        let keys = []
        Object.keys(tempCurToken).forEach((e, key) => {
            if( parseInt(e) <= 17 ) return
            keys.push(e)
        })
        let cleanEvo = []
        for(let i = 0; i < keys.length; i++){
            let k = keys[i]
            cleanEvo[k] =  tempCurToken[k] instanceof BigNumber ? tempCurToken[k].toString() : tempCurToken[k]
        }
        let cleanToken = {
            owner: accountAddress,
            id: tokenId.toString(),
            currentToken: cleanEvo,
            isClaimable: tempToken.isClaimable,
            isUsable: tempToken.isUsable,
            nextLvlExp: tempToken.nextLvlExp.toString(),
            isLevelable: tempToken.isLevelable
        }
        setEvoView( cleanToken )
    }


    return (
        <>
            <div className="sk-flex sk-row">
                <div className="card-container wd-50">
                        <EvoCard 
                            evo={evoView ? evoView : false}
                        />
                </div>
                <div className="sk-box wd-50">
                    <h1>Mint EvoSkull</h1>
                        <p>EvoSkulls is a collection of Unique, Animated, 1/1 NFTs with on-chain Stats powered on the Cronos blockchain. The collection consists of 333 Super-rare Skulls, all 1/1.</p>
                        <p>By owning an Evo, you can generate 9 $GRVE daily. Evo also have different on-chain stats, this means that these data can be leveraged to powers amazing PVP Battling and Mission systems.</p>
                    <div className="sk-box-content">
                        <div className={`inventory-list sk-box ${ view == 1 ? 'show' : ''}`}>
                            <div className="sk-box-content sk-row">
                            {
                                croSkulls.length ?
                                    croSkulls.map( (s, i) =>{
                                        return(
                                            <div className="circular-image center" key={i}>
                                                <img src={ipfsUri480+s+".webp"}  onClick={() => chooseSkull(s)}/>
                                                <span>#{s}</span>
                                            </div>
                                        )

                                    }) : (
                                        <span>You don't have any skull... </span>
                                    )
                            }
                            </div>
                        </div>
                        <div className={`inventory-list sk-box ${ view == 2 ? 'show' : ''}`}>
                            <div className="sk-box-content sk-row">
                                {
                                    purpleId.length ?
                                        purpleId.map( s =>{
                                            return(
                                                <div className="circular-image center">
                                                    <img src={purplePotionImage}  onClick={() => choosePotion(s)}/>
                                                    <span>#{s}</span>
                                                </div>
                                            )
                                        }) : (
                                            <span>You don't have any purple potion... </span>
                                        )
                                }
                            </div>
                        </div>
                        <div className="sk-row sk-flex evo-selector">
                            <div 
                                className="sk-flex sk-column center"
                            >
                                <img 
                                    className={`${evolver.skull ? '' : 'disabled'}`}
                                    src={evolver.skull ? ipfsUri480+evolver.skull+".webp" : `${ipfsUri480}1.webp`}  
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
                                className="sk-flex sk-column center"
                            >
                                <img 
                                    className={`${evolver.potion ? '' : 'disabled'}`}
                                    src={`${purplePotionImage}`} 
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
                            value={ `${totalSupply}/333` }
                            icon={EvoSkull}
                            tooltip="Total Evo Circulating Supply / Max Supply."
                        />
                        {
                            ! isSkullApproved ? (
                                <button 
                                    className="skull-button" 
                                    onClick={ () => approveSkull() }
                                >
                                    Approve Skull
                                </button>
                            ) : ! isPurpleApproved ? (
                                <button 
                                    className="skull-button" 
                                    onClick={ () => approvePurple() }
                                >
                                    Approve Purple
                                </button>
                            ) : (
                                <button 
                                    className="skull-button" 
                                    onClick={ () => mintEvo() }
                                    disabled={ ! evolver.skull || ! evolver.potion ? true : false}
                                >
                                    { ! evolver.skull ? `Select Skull` : ! evolver.potion ? `Select Potion` : `Mint EvoSkull`}
                                </button>
                            )
                        }
                        
                </div>
            </div>
        </>
    )
};

export default MintEvo;