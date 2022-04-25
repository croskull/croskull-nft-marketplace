import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../../redux/store";
import './PotionLab.css';
import Lottie from 'react-lottie'
import blue from './blue.json';
import red from './red.json';
import purple from './purple.json';
import green from './green.json';
import purplegif from './Purple_Potion_1.gif';


const PotionLab = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    const blueImage = "https://croskull.mypinata.cloud/ipfs/QmPvie22kUv9A7PcXFLbGtGBYuNiFdvQdUvVZZLNA59tbG/bluepotion.gif";
    const redImage = "https://croskull.mypinata.cloud/ipfs/QmRdN5CQTpogBtjtnXq3PLrF7A4LezZ1TPt3ynXybcNNZP/redpotion.gif";

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

    useEffect(() => {

    }, [])

    function addRed(i) {
        if (calderone.red == i)
            calderone.red = null
        else
            calderone.red = i;
        calderoneAnimationChange()
    }

    function addBlue(i) {
        console.log(i, calderone.blue)
        if (calderone.blue == i) {
            calderone.blue = null;
        } else {
            calderone.blue = i;
        }
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

    function openBluePotion() {
        var modal = document.getElementById("modal-blue");
        modal.style.display = "block";
    }
    function closeBluePotion() {
        var modal = document.getElementById("modal-blue");
        modal.style.display = "none";
    }
    function openRedPotion() {
        var modal = document.getElementById("modal-red");
        modal.style.display = "block";
    }
    function closeRedPotion() {
        var modal = document.getElementById("modal-red");
        modal.style.display = "none";
    }
    function openCreation() {
        var modal = document.getElementById("creation-modal");
        modal.style.display = "block";
        creationText();
    }
    function creationText() {
        var t = document.getElementById("creation-text");
        var c = document.getElementById("modal-calderone");
        var g = document.getElementById("modal-potion");
        setCaldAnimation(greenOptions);
         t.innerHTML ='Adding Rotten Water';t.style.animation = "4.2s textGreen";t.style.paddingTop = "10vh";
        setTimeout(() => { t.innerHTML ='Adding Rotten Water.';}, 1000);
        setTimeout(() => { t.innerHTML ='Adding Rotten Water..';}, 2000);
        setTimeout(() => { t.innerHTML ='Adding Rotten Water...';}, 3000);
        setTimeout(() => { t.innerHTML ='Adding Blue Potion'; t.style.paddingTop = "20vh"; t.style.animation ="4s textBlue"; t.style.color ="blue";setCaldAnimation(blueOptions);}, 4000);
        setTimeout(() => { t.innerHTML ='Adding Blue Potion.'}, 5000);
        setTimeout(() => { t.innerHTML ='Adding Blue Potion..'}, 6000);
        setTimeout(() => { t.innerHTML ='Adding Blue Potion...'}, 7000);
        setTimeout(() => { t.innerHTML ='Adding Red Potion'; t.style.paddingTop = "30vh"; t.style.animation ="4s textRed"; t.style.color ="red";setCaldAnimation(redOptions);}, 8000);
        setTimeout(() => { t.innerHTML ='Adding Red Potion.'}, 9000);
        setTimeout(() => { t.innerHTML ='Adding Red Potion..'}, 10000);
        setTimeout(() => { t.innerHTML ='Adding Red Potion...'}, 11000);
        setTimeout(() => { t.innerHTML ='Waiting the Boom'; t.style.paddingTop = "40vh"; t.style.color ="purple";setCaldAnimation(purpleOptions);t.style.animation ="4s textPurple";}, 12000);
        setTimeout(() => { t.innerHTML ='Waiting the Boom.'}, 13000);
        setTimeout(() => { t.innerHTML ='Waiting the Boom..'}, 14000);
        setTimeout(() => { t.innerHTML ='Waiting the Boom...'}, 15000);
        setTimeout(() => { t.innerHTML ='Potion Created!'; c.style.display= "none"; g.style.display="block"}, 16000);
        
        setTimeout(() => { closeCreation();t.innerHTML ='Adding Rotten Water';}, 20000);
    }
    function closeCreation() {
        var modal = document.getElementById("creation-modal");
        modal.style.display = "none";
    }



    return (
        <>
            <div className="modal-container" id='creation-modal'>
                <div className="div-text">
                <p id='creation-text'></p>
                </div>
                    <div id="modal-calderone">
                    <Lottie
                            options={caldAnimation}
                            width='100%'
                            height={'100%'}
                        />
                    </div>
                    <div id='modal-potion'>
                        <img src={purplegif} />
                    </div>

            </div>

            <div className="sk-container sk-box">
                <div className="sk-flex sk-row" id='container-desktop'>
                    <div className="wd-33" >

                        <div className="sk-box pot-box">
                            <h1>RED POTION:</h1>
                            {
                                wallet.map(w => {
                                    return (
                                        <img src={redImage} onClick={() => addRed(w)} className={w == calderone.red ? 'selected' : ''} />
                                    )
                                })
                            }

                        </div>
                    </div>
                    <div className="wd-33 calderone-box">
                        <Lottie
                            options={caldAnimation}
                            width='100%'
                            height={'100%'}
                        />
                        <button className="skull-button create" onClick={() => openCreation()} disabled={calderone.blue == null || calderone.red == null}>CREATE</button>
                    </div>
                    <div className="wd-33">

                        <div className="sk-box pot-box" >
                            <h1>BLUE POTION:</h1>
                            {
                                wallet.map(w => {
                                    return (
                                        <img src={blueImage} onClick={() => addBlue(w)} className={w == calderone.blue ? 'selected' : ''} />
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

                <div className="sk-flex sk-column" id='container-mobile'>
                    <div className="button-container">
                        <button className="skull-button" onClick={() => openBluePotion()}>Blue Potion</button>
                        <button className="skull-button" onClick={() => openRedPotion()}>Red Potion</button>
                    </div>

                    <div className="calderone-container">
                        <Lottie
                            options={caldAnimation}
                            width='90%'
                            height={'90%'}
                        />
                        <button className="skull-button create"  onClick={() => openCreation()} disabled={calderone.blue == null || calderone.red == null}>CREATE</button>
                    </div>


                    <div id="modal-blue" class="modal-container">
                        <div className="modal-custom">
                            <span class="close-btn" onClick={() => { closeBluePotion() }}>
                                &times;
                            </span>
                            <div className="modal-header-custom">
                                <h1>BLUE POTION</h1>
                            </div>
                            <div className="modal-content">
                                {
                                    wallet.map(w => {
                                        return (
                                            <img src={blueImage} onClick={() => addBlue(w)} className={w == calderone.blue ? 'selected' : ''} />
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    <div id="modal-red" class="modal-container">
                        <div className="modal-custom">
                            <span class="close-btn" onClick={() => { closeRedPotion() }}>
                                &times;
                            </span>
                            <div className="modal-header-custom">
                                <h1>RED POTION</h1>
                            </div>
                            <div className="modal-content">
                                {
                                    wallet.map(w => {
                                        return (
                                            <img src={redImage} onClick={() => addRed(w)} className={w == calderone.red ? 'selected' : ''} />
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>

                </div>


            </div>
        </>
    )
};



export default PotionLab;

const wallet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11];