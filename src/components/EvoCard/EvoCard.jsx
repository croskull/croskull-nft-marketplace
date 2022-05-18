import React from "react";
import MetricContainer from "../MetricContainer/MetricContainer";
import EvoStat from "./EvoStat/EvoStat";
import './EvoCard.css';
import Power from "../images/power.svg"
import STR from "../images/str.svg";
import DEX from "../images/dex.svg";
import INT from "../images/int.svg";
import WISD from "../images/wisd.svg";
import CONST from "../images/const.svg";
import CHAR from "../images/char.svg";
import store from "../../redux/store";
import SRank from "../images/s-plus-rank.png";
import GraveIcon from "../images/grave.png"
import EvoVideo from "../images/evo-video.mp4";
import ReactPlayer from 'react-player'


const EvoCard = ({ type = 'evoskull'}) => {
    const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/";
    let { accountAddress } = store.getState().blockchain
    const evo = {
            id: 4,
            type: type,
            image: type == 'evoskull' ? "https://analytics.croskull.com/skull.webp" : "https://analytics.croskull.com/evopet.jpeg",
            maxStamina: 15,
            stamina: 9,
            owner: '0x8479f2Ac6a9d94708FE5831CF6B7678aD0fdEfd0'.toLowerCase(),
            cnsDomain: `hiutaky.cro`,
            level: 6,
            experience: 434,
            nextLvlExp: 1024,
            isLevelable: false,
            isClaimable: true,
            str: 12,
            dex: 12,
            int: 12,
            wisd: 12,
            const: 12,
            char: 10,
            power: 70,
        }
    console.log( evo.owner == accountAddress, evo.owner, accountAddress)

    const RenderStaminaBar = () => {
        let staminaBar = [];
        const staminaSpan = (active) => {  
            return (
                <span class={ active ? `active` : ``}></span>
            )
        }

        for( let i = 0; i < evo.maxStamina; i++){
                staminaBar[i] = staminaSpan( i < evo.stamina ? true : false)
        }
        return (
            <div className="stamina-bar">
                {
                    evo.isClaimable && evo.type == 'evoskull' ? (
                        <span >
                            <img 
                                className="evo-claim-button"
                                src={GraveIcon} 
                            />
                        </span>
                    ) : ('')
                }
                <div className="stamina-bar-container">
                    { staminaBar }
                </div>
                <span>
                    { 
                        evo.stamina ? 
                            `${evo.stamina}/${evo.maxStamina}` : 
                            accountAddress == evo.owner ?
                                `Restore` :
                                    `No stamina` 
                    }
                </span>
                <span className="stamina-tooltip">Stamina</span>
            </div>
        )
    }

    let evoExpProgress = parseInt( 100 / evo.nextLvlExp * evo.experience )

    return (
        <div class={`evo-container ${ evo.type }`}>
            <div className="evo-image-container">
                <ReactPlayer 
                    className="evo-image"
                    url={EvoVideo}
                    playing={true}
                    muted={true}
                    controls={false}
                    loop={true}
                    width={`100%`}
                    height={`100%`}
                />
                <span className="card-rank">
                    <img src={SRank} draggable="false" />
                </span>
            </div>
            <div className="card-details">
                <span className="card-info">
                    <span 
                        className="card-exp-after" 
                        style={ {width: `${evoExpProgress}%`} }
                    >
                    </span>
                    <span className="card-level">
                        {evo.level}
                        {   
                            accountAddress == evo.owner ?
                                evo.isLevelable ? 
                                    <span className="levelup-icon"></span> : 
                                    <span className="upgrade-icon"></span> :
                                ``
                        }
                    </span>
                    <span className="stat-tooltip">Level</span>
                    <span className="card-exp">
                        {
                            evo.experience < evo.nextLvlExp ? 
                                `${evo.experience}/${evo.nextLvlExp}` : 
                                accountAddress == evo.owner ? 
                                    `Levelable` :
                                    ``
                        }
                    </span>
                </span>
            </div>
            <div className="card-stats-container">
                <div className="card-stats">
                    <div className="stat-list vertical">
                        <EvoStat 
                            icon={Power}
                            value={evo.power}
                            tooltip={`Power`}
                        />
                    </div>
                    <div className="stat-list">
                        <EvoStat 
                            icon={STR}
                            value={evo.str}
                            tooltip={`Strength`}
                        />
                        <EvoStat 
                            icon={DEX}
                            value={evo.dex}
                            tooltip={`Dexterity`}
                        />
                        <EvoStat 
                            icon={INT}
                            value={evo.int}
                            tooltip={`Intelligence`}
                        />
                        <EvoStat 
                            icon={CONST}
                            value={evo.const}
                            tooltip={`Constitution`}
                        />
                        <EvoStat 
                            icon={WISD}
                            value={evo.wisd}
                            tooltip={`Wisdom`}
                        />
                        <EvoStat 
                            icon={CHAR}
                            value={evo.char}
                            tooltip={`Charisma`}
                        />
                    </div>
                </div>
                <RenderStaminaBar />
                <div className="footer">
                    <span>EvoSkull #<b>{evo.id}</b>/333</span>
                    <span>Owner: <b>{evo.cnsDomain || evo.owner }</b></span>
                </div>
            </div>
        </div>
    )
};



export default EvoCard;

