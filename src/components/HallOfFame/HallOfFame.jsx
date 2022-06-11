import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './HallOfFame.css'
import EvoStat from "../EvoCard/EvoStat/EvoStat";
import Power from "../images/power.svg"
import SRank from "../images/s-rank.png";
import SPRank from "../images/s-plus-rank.png";
import ARank from "../images/a-rank.png";
import BRank from "../images/b-rank.png";
import EvoCard from "../EvoCard/EvoCard";
const HallOfFame = () => {
    const [init, setInit] = useState(false)
    const [skulls, setSkulls] = useState(false)
    useEffect(() => {
        if( init ) return
        ( async () => {
            await loadSkulls()
        })()
    }, [])
    
    const loadSkulls = async () => {
        let skulls = await(await fetch('https://api.croskull.com/api/collections/get/evoskull?sort[power]=-1')).json()
        setSkulls(skulls.entries)
        setInit(true)
    }

    const getRank = (power) => {
        if( power > 0 && power <= 50 )
            return BRank

        if(  power > 50 && power <= 70)
            return ARank

        if( power > 70 && power <= 85 )
            return SRank

        if(  power > 85 )
            return SPRank
    }

    const getEvo = (evo) => {
        return evo = {
            ...evo,
            currentToken: evo,
            id: evo.tokenId
        }
    }
    
    
    return (
        <>
            <div className="sk-flex sk-column sk-row sk-box">
                <div className="sk-container">
                    EvoSkull Hall of Fame
                </div>
                <div className="sk-box-content container">
                    Get 
                </div>
            </div>
            <div className="sk-flex sk-row">
                <div className="wd-66 sk-flex sk-row">
                    {
                        skulls.length ? (
                            <>
                                <div className="second-place">
                                    <span className="position">2nd</span>
                                    <EvoCard 
                                        readOnly={true}
                                        evo={skulls.length > 1 ? getEvo(skulls[1]) : false}
                                    />
                                </div>
                                <div className="first-place">
                                    <span className="position">1st</span>
                                    <EvoCard 
                                        readOnly={true}
                                        evo={skulls.length > 1 ? getEvo(skulls[0]) : false}
                                    />
                                </div>
                                <div className="third-place">
                                    <span className="position">3rd</span>
                                    <EvoCard 
                                        readOnly={true}
                                        evo={skulls.length > 1 ? getEvo(skulls[2]) : false}
                                    />
                                </div>
                            </>
                        ) : ('')
                    }
                </div>
                <div className="wd-33 sk-box hall-list sk-column sk-flex">
                    {
                        skulls.length ? (
                            skulls.map((skull, i) => {
                                let rankIcon = getRank(skull.power)
                                if( i < 3) return
                                return (
                                    <div className="hall-item sk-box-content sk-row center">
                                        <span className="rank">{i+1}</span>
                                        <span className="tokenId">#<b>{skull.tokenId}</b></span>
                                        <span className="sk-flex realtive sk-column center">
                                            <img  className="skull-thumb" src={skull.metadata.image} />
                                            <span className="level">Level: <b>{skull.level}</b></span>
                                        </span>
                                        <span className="sk-horizontal sk-flex">
                                            <span className="card-rank">
                                                <img src={rankIcon} draggable="false" />
                                            </span>
                                            <EvoStat 
                                                icon={Power}
                                                value={skull.power}
                                                tooltip={`Power`}
                                            />
                                        </span>
                                        <span className="sk-column sk-flex">
                                            <span className="owner">{`${skull.owner.substr(0, 4)}...${skull.owner.substr(skull.owner.length-3)}`}</span>
                                            <span className="cns">{skull.cns}</span>
                                        </span>
                                    </div>
                                )
                            })
                        ):('')
                    }
                </div>
            </div>
        </>
    )
}

export default HallOfFame