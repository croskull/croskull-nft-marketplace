import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './Laboratory.css';

import HomeCard from "../HomeCard/HomeCard";

import LabPot from './lab-potion.jpg'
import undercostruction from './undercostruction.png'



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
                                image={LabPot}
                                title="Potion Laboratory"
                                description="Create the Purple Potion"
                                location="laboratory-potion"
                            />
                                                        <HomeCard 
                                image={undercostruction}
                                title="Evo Laboratory"
                                description="Manage EvoSkull"
                                location=""
                            />
                        </div>
                    </div>
        </>
    )
};



export default Laboratory;

const wallet = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11];