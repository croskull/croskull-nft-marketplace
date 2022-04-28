import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ethers } from 'ethers';
import store from "../../../redux/store";
import { updateState, sendNotification, getSkullsData, fetchBalances } from "../../../redux/data/dataActions"
import './PotionLab.css';
import Lottie from 'react-lottie'
import blue from './cauldron-lotties/blue.json';
import red from './cauldron-lotties/red.json';
import purple from './cauldron-lotties/purple.json';
import green from './cauldron-lotties/green.json';
import { LazyLoadImage } from "react-lazy-load-image-component";
import IpfsHttpClient from "ipfs-http-client";
import MetricContainer from "../../MetricContainer/MetricContainer";
import purplegif from '../purple-potion.gif';
import blueIcon from "../../images/bluePotionImage.png";
import redIcon from "../../images/redPotionImage.png";
import graveIcon from "../../images/grave.png";
import purpleIcon from "../../images/purplePotionImage.png";
const PotionLab = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    const blueImage = "https://croskull.mypinata.cloud/ipfs/QmPvie22kUv9A7PcXFLbGtGBYuNiFdvQdUvVZZLNA59tbG/bluepotion.gif";
    const redImage = "https://croskull.mypinata.cloud/ipfs/QmRdN5CQTpogBtjtnXq3PLrF7A4LezZ1TPt3ynXybcNNZP/redpotion.gif";
    const [loading, setLoading] = useState(false)
    const blueOptions = {
        loop: true,
        autoplay: true,
        animationData: blue,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const redOptions = {
        loop: true,
        autoplay: true,
        animationData: red,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const purpleOptions = {
        loop: true,
        autoplay: true,
        animationData: purple,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const greenOptions = {
        loop: true,
        autoplay: true,
        animationData: green,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    const [caldAnimation, setCaldAnimation] = useState(greenOptions)
    const [calderone, setCalderone] = useState({
        red: null,
        blue: null
    })

    const [potionModal, setModal] = useState({
        blue: false,
        red: false
    })

    useEffect(() => {

    }, [])

    function addRed(i) {
        if (calderone.red == i)
            calderone.red = null
        else
            calderone.red = i;
            closeRedPotion()
        calderoneAnimationChange()
    }

    function addBlue(i) {
        console.log(i, calderone.blue)
        if (calderone.blue == i) {
            calderone.blue = null;
        } else {
            calderone.blue = i;
        }
        closeBluePotion()
        calderoneAnimationChange()
    }

    function calderoneAnimationChange() {
        if (calderone.blue != null && calderone.red != null) {
            setCaldAnimation(purpleOptions);
        }
        else {
            if (calderone.blue != null && calderone.red == null)
                setCaldAnimation(blueOptions);
            else {
                if (calderone.blue == null && calderone.red != null)
                    setCaldAnimation(redOptions);
                else
                    setCaldAnimation(greenOptions);
            }
        }

    }
    function closeBluePotion() {
        setModal({
            ...potionModal,
            blue: false
        })
    }
    function closeRedPotion() {
        setModal({
            ...potionModal,
            red: false
        })
    }
    function openCreation() {
        var modal = document.getElementById("creation-modal");
        modal.style.display = "block";
        creationText();
    }
    function creationText() {
        
    }

    function closeCreation() {
        var modal = document.getElementById("creation-modal");
        modal.style.display = "none";
    }

    const setGraveAllowance = async () => {
        let { croSkullsGrave, croPotionPurple } = store.getState().blockchain
        let tx = croSkullsGrave.approve(croPotionPurple.address, ethers.constants.MaxUint256)
        await tx.then(
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
                title: `Approved!`,
                message: `Grave Approved.`,
                tx,
                type: "success"
              }))
              dispatch(updateState({
                  key: "purpleGraveAllowance",
                  value: ethers.constants.MaxUint256.toString()
              }))
            }
          )
    }

    const setPotionApproval = async (color = false) => {
        if( ! color ) return
        let { croPotionRed, croPotionBlue, croPotionPurple } = store.getState().blockchain
        let contract;
        if( color == 'red'){
            contract = croPotionRed
        }else{
            contract = croPotionBlue
        }
        let tx = contract.setApprovalForAll(croPotionPurple.address, true)
        await tx.then(
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
                title: `Approved!`,
                message: `Potions ${color} Approved.`,
                tx,
                type: "success"
              }))
              dispatch(updateState({
                  key: `purple${color[0].toUpperCase() + color.slice(1)}Approval`,
                  value: ethers.constants.MaxUint256.toString()
              }))
            }
          )
    }

    const mergePotions = async () => {
        if( ! calderone.blue || ! calderone.red ) return
        let { croPotionPurple } = blockchain
        var t = document.getElementById("creation-text");
        var c = document.getElementById("modal-calderone");
        var g = document.getElementById("modal-potion");
        let currentToken = await croPotionPurple.totalSupply()
        currentToken.toString()
        currentToken++
        try {
            setLoading(true)
            const client = IpfsHttpClient(new URL('https://ipfs.infura.io:5001/api/v0'))
            let potionData = {
                "name": `CroSkull Purple Potion #${currentToken}`,
                "description": "Use this potion to evolve your Skulls.",
                "image": "ipfs://QmcGbCtc5JYPKX3FEoxG6kbTGNcCwUY7qJHtveZqtPUrUw",
                "edition": currentToken,
                "compiler": "Powered by CroSkull.com"
            }
            let potionfiy = JSON.stringify(potionData)
            let descriptionBuffer = Buffer.from(potionfiy)
            const ipfsResponse = await client.add(descriptionBuffer)
            if( ipfsResponse.path !== "" ){
                let ipfsUri = `ipfs://${ipfsResponse.path}`
                let tx = croPotionPurple.mergePotions(
                    calderone.blue,
                    calderone.red,
                    ipfsUri
                )
                await tx.then(
                    async(tx) => {
                        dispatch(sendNotification({
                            title: `Transaction Sent`,
                            message: 'Waiting for confirmation...',
                            tx,
                            type: "info"
                        }))
                        var modal = document.getElementById("creation-modal");
                        modal.style.display = "block";
                        setCaldAnimation(greenOptions);
                        t.innerHTML ='Adding Rotten Water';t.style.animation = "4.2s textGreen";t.style.paddingTop = "10vh";
                        await tx.wait(2)
                        t.innerHTML ='Adding Blue Potion';  t.style.animation ="4s textBlue"; t.style.color ="blue";setCaldAnimation(blueOptions);
                        await tx.wait(3)
                        dispatch(fetchBalances())
                        t.innerHTML ='Adding Red Potion'; t.style.animation ="4s textRed"; t.style.color ="red";setCaldAnimation(redOptions);
                        await tx.wait(4)
                        dispatch(getSkullsData())
                        t.innerHTML ='Mixing the potions'; t.style.color ="purple";setCaldAnimation(purpleOptions);t.style.animation ="4s textPurple";
                        await tx.wait(5)
                        t.innerHTML =`Potion #${currentToken} Created!`; c.style.display= "none"; g.style.display="block"
                        await tx.wait(6)
                        closeCreation();t.innerHTML ='Adding Rotten Water'; g.style.display= "none"; c.style.display="block"
                        dispatch(sendNotification({
                            title: `Potion Minted!`,
                            message: `Purple Potion # ${currentToken} Minted succesful`,
                            tx,
                            type: "success"
                          }))
                    }
                )
            }
        } catch (e) {
            console.log(e)
        }
        setLoading(false)
    }

    const renderPotionsList = ( potionIds, potionName, image, condition, onClick ) => {
        return(
            <div className={`sk-box sk-column pot-box hide-scrollbar ${ potionModal.blue ? 'show' : ''}`}>
                <h1>{potionName} { potionIds.length > 1 ? `Potions` : `Potion`} { `(${potionIds.length})` }</h1>
                <div className="sk-box-content potions-list">
                {
                    potionIds.length ? (
                        potionIds.map(potionId => {
                            return (
                                <div
                                    className={`potion-item ${potionId == condition ? `selected-${potionName.toLowerCase()}` : ''}`}
                                    onClick={ () => onClick(potionId)}
                                >
                                    <LazyLoadImage
                                        src={`${image}`}
                                    />
                                    <div className="floating-badges-container">
                                        <span className="badge id">#{potionId}</span>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                            <span>You don't have any {potionName} potion. Buy one in the <b><a href="#marketplace">Marketplace.</a></b></span>
                        )
                }
                </div>
            </div>
        )
    }

    let { blueId, redId, graveBalance, purpleBlueApproval, purpleRedApproval, purpleGraveAllowance, purpleSupply, purpleCount } = data

    const [approvals, setApproval] = useState({
        red: false,
        blue: true,
        grave: false
    })
    return (
        <>
            <div className="modal-container" id="creation-modal">
                <div className="div-text">
                    <p id='creation-text'></p>
                </div>
                <div id="modal-calderone">
                    <Lottie
                        options={caldAnimation}
                        width='100%'
                        height='300px'
                    />
                </div>
                <div id='modal-potion'>
                    <img src={purplegif} />
                </div>
            </div>
            <div className="sk-container">
                <div className="sk-container-wrapper sk-flex sk-row">
                    <div className="wd-66 potions-container">
                        { blueId && renderPotionsList( blueId, "Blue", blueImage, calderone.blue, addBlue ) }
                        { redId && renderPotionsList( redId, "Red", redImage, calderone.red, addRed ) }
                    </div>
                    <div className="wd-33 calderone-box">
                        <div className="calderone-container">
                            <Lottie
                                options={caldAnimation}
                                width='100%'
                                height={'100%'}
                            />
                        </div>
                        <div className="sk-box sk-column">
                            <h1>Purple Potion Cauldron</h1>
                            <div className="sk-box-content sk-column">
                                <MetricContainer
                                    label={ `Blue potion` }
                                    value={ calderone.blue ? 
                                        ! purpleBlueApproval ? 
                                        `Approve #${calderone.blue}` :
                                            `OK #${calderone.blue}`:
                                                blueId.length ? 
                                                    `Choose` : 
                                                `Buy`
                                        }
                                    icon={ blueIcon }
                                />
                                <MetricContainer
                                    label={ `Red potion` }
                                    value={ calderone.red ? 
                                        ! purpleRedApproval ? 
                                        `Approve #${calderone.red}` :
                                            `OK #${calderone.red}`:
                                                redId.length ? 
                                                    `Choose` : 
                                                `Buy`
                                        }
                                    icon={ redIcon }
                                />
                                <MetricContainer
                                    label={ `Minted` }
                                    value={`${purpleSupply}/333`}
                                    icon={ purpleIcon }
                                />
                            </div>
                            <MetricContainer
                                label={ `Cost` }
                                value="20"
                                icon={ graveIcon }
                            />
                            {
                                loading ? (
                                    <button 
                                        className="skull-button create"
                                        disabled
                                    >
                                        Loading...
                                    </button>
                                ) : ! blueId.length || ! redId.length ? ( 
                                    <button 
                                        className="skull-button create"
                                        onClick={() => window.location.hash = "marketplace"} 
                                    >
                                        You Need Both Potions
                                    </button>
                                ): ! purpleBlueApproval ? (
                                    <button 
                                        className="skull-button create"
                                        onClick={() => setPotionApproval('blue')} 
                                    >
                                        Approve Blue
                                    </button>
                                ) : ! purpleRedApproval ? (
                                    <button 
                                        className="skull-button create"
                                        onClick={() => setPotionApproval('red') }
                                    >
                                        Approve Red
                                    </button>
                                ) : ! graveBalance >= ethers.utils.parseEther('20').toString() ? (
                                    <button 
                                        className="skull-button create"
                                        onClick={() => window.open("https://mm.finance/swap?outputCurrency=0x9885488cd6864df90eeba6c5d07b35f08ceb05e9")} 
                                    >
                                        BUY Grave
                                    </button>
                                ) : purpleGraveAllowance == "0" ? (
                                    <button 
                                        className="skull-button create"
                                        onClick={() => setGraveAllowance() } 
                                    >
                                        Approve Grave
                                    </button>
                                ) : blueId && redId ? (
                                    <button 
                                        className="skull-button create"
                                        onClick={() => 
                                            calderone.blue ? 
                                                calderone.red ? 
                                                    mergePotions() : 
                                                addRed(redId[0]) : 
                                            addBlue(blueId[0])
                                        } 
                                    >
                                        { calderone.blue ? calderone.red ? `Create` : `Select Red #${redId[0]}` : `Select Blue #${blueId[0]}` }
                                    </button>
                                ) : (
                                    <button 
                                        className="skull-button create"
                                        onClick={() => openCreation()} 
                                    >
                                        Buy Potions
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default PotionLab;