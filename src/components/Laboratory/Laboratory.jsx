import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './Laboratory.css';
import HomeCard from "../HomeCard/HomeCard";
import LabCard from '../images/laboratory-card.jpg'
import EvoCard from '../images/evo-mint-card.jpg'
import PetCard from "../images/pet-card.jpeg"


const Laboratory = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();

    return (
        <>
            <div className="sk-container sk-box ">
                <div className="tab-head">
                    <h2>Laboratory</h2>
                </div>
                <div className="card-container sk-row sk-flex">
                    <HomeCard 
                        image={EvoCard}
                        title="EvoSkull Laboratory"
                        description="Mint your EvoSkull in few Clicks!"
                        location="mint-evo"
                    />
                    <HomeCard 
                        image={PetCard}
                        title="Pets Laboratory"
                        description="Hatch the unique Pet Season I"
                        location="mint-egg"
                    />
                    <HomeCard 
                        image={LabCard}
                        title="Potion Laboratory"
                        description="Mint the super-rare Purple Potion"
                        location="laboratory-potion"
                    />
                </div>
            </div>
        </>
    )
};



export default Laboratory;

const wallet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11];