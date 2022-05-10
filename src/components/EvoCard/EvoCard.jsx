import { faBold, faBolt, faBrain, faCheese, faFistRaised, faFrown, faHandFist, faHandRock, faPlus, faPrayingHands, faRunning, faSadCry, faScroll, faSnowflake, fasword } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import MetricContainer from "../MetricContainer/MetricContainer";
import './EvoCard.css';
import Soul from "../images/soul.png";
import rankD from './Rank/rankD.png';
import rankC from './Rank/rankC.png';
import rankB from './Rank/rankB.png';
import rankA from './Rank/rankA.png';
import rankS from './Rank/rankS.png';
import logo from './Rank/logo.png';
import greenBG from './Rank/greenBg.png';



const EvoCard = ({ skull }) => {
    const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/";

    function getRank(r) {
        switch (r) {
            case 'd':
                return rankD;
            case 'c':
                return rankC;
            case 'b':
                return rankB;
            case 'a':
                return rankA;
            case 's':
                return rankS;
            default:
                return null;
        }
    }
useEffect(() => {
    setInterval(function(){
        console.log('qua');
    let b = document.getElementById('back');
    let f = document.getElementById('front');
    b.style.width = f.offsetWidth +'px';
    b.style.height = f.offsetHeight +'px';
}, 1000);
  },[])

    return (
        <>
            <div className="card-container">
            <div class="card2">
            <div className={'evo-card side'} id='front'>
                <div className={"sk-box "+ skull.bg} >
                    <div className="card-img" >
                        <img src={ipfsUri480 + skull.id + '.webp'} />
                        <p id="rank"><img src={getRank(skull.rank)} id='skull-icon' /></p>
                        <p id="id">#{skull.id}</p>
                        <div id="lvl">{skull.lvl}</div>
                        <div className="sk-row sk-flex" id='malus'>
                            {skull.malus.includes('sad') ? <FontAwesomeIcon icon={faFrown} size='2x' /> : ''}
                            {skull.malus.includes('freeze') ? <FontAwesomeIcon icon={faSnowflake} size='2x' /> : ''}
                            {skull.malus.includes('hungry') ? <FontAwesomeIcon icon={faCheese} size='2x' /> : ''}
                        </div>
                    </div>
                    <div className="evocard-stat">
                        <div className="evocard-row">
                            <div className="wd-48" id='power'>
                                Power
                                <span>{skull.power} <FontAwesomeIcon icon={faHandRock} />
                                </span>
                            </div>
                            <div className="wd-48" id='stamina'>
                                Stamina
                                <span>{skull.stamina} <FontAwesomeIcon icon={faPlus} />
                                </span>
                            </div>
                        </div>
                        <div className="sk-column sk-flex evo-stat sk-box-content">
                            <MetricContainer
                                label="STR"
                                value={<span>{skull.str} <FontAwesomeIcon icon={faFistRaised} /></span>}
                                id='str'
                            />

                            <MetricContainer
                                label="DEX"
                                value={<span>{skull.dex} <FontAwesomeIcon icon={faBolt} /></span>}
                                id='dex'
                            />
                            <MetricContainer
                                label="CONST"
                                value={<span>{skull.const} <FontAwesomeIcon icon={faRunning} /></span>}
                                id='const'
                            />
                            <MetricContainer
                                label="INT"
                                value={<span>{skull.int} <FontAwesomeIcon icon={faBrain} /></span>}
                                id='int'
                            />
                            <MetricContainer
                                label="WISD"
                                value={<span>{skull.wisd} <FontAwesomeIcon icon={faScroll} /></span>}
                                id='wisd'
                            />
                            <MetricContainer
                                label="CHAR"
                                value={<span>{skull.char} <FontAwesomeIcon icon={faPrayingHands} /></span>}
                                id='char'
                            />
                            <img src={logo} id='logo' />
                        </div>
                        <div className="evocard-row">
                            <div className="wd-80">
                                <div className="progress">
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: (skull.exp / skull.nextLvl * 100) + '%' } /*sostituire con timeElapsed in % */}
                                        aria-valuenow="10"
                                        aria-valuemin="0"
                                        aria-valuemax="80"
                                    >
                                        Exp {skull.exp}/{skull.nextLvl}
                                    </div>
                                </div>
                            </div>
                            <div className="wd-20 ">
                                <MetricContainer
                                    value={<FontAwesomeIcon icon={faPlus} />}
                                    icon={Soul}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <div className="side" id='back'>
                    <div className={'evo-card'}>
                        <div />
                    </div>

                </div>
            </div>
            </div>

        </>
    )
};



export default EvoCard;

