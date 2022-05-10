import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './EvoTavern.css';
import EvoCard from "../EvoCard/EvoCard";
import { LazyLoadImage } from "react-lazy-load-image-component";



const EvoTavern = () => {


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
const walletSkull =[skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3,skull1,skull2,skull3];
    let [skull, setSkull] = useState(null);
    const [viewState, setViewState] = useState( {
        selectedSkulls: []
      })
    const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
    

      useEffect(() => {
          skull= walletSkull[0];
        setSkull(walletSkull[0]);
        console.log(skull);
        console.log('qua');
      },[])

      const selectSkull = e => {
        let {selectedSkulls} = viewState;
        console.log(selectedSkulls )
        if ( selectedSkulls && selectedSkulls.includes(e)) {
          for( let i = 0; i < selectedSkulls.length; i++){
            if (selectedSkulls[i] === e) {
              selectedSkulls.splice(i, 1);
            }
          }
        } else {
          selectedSkulls.push(e);
        }
        setViewState({
          ...viewState,
          selectedSkulls: selectedSkulls
        })
      };

    return (
        <>
            <div className="sk-box sk-row">
                <marquee behavior="scroll" direction="left">{testo.map(t => {
                    return (
                        <>
                            {t} &emsp;&emsp;&emsp;
                        </>
                    )
                })}</marquee>
            </div>
            <div className="sk-flex sk-row h100">
                <div className="sk-container wd-66 h100">
                    <div className="sk-box">
                        <div className="tab-head">
                            <h2>EvoSkulls </h2>
                        </div>
                        <div className="sk-box-content skull-grid">
                        {
                            walletSkull.map( s =>{
                                let cr = s.id;
                                return (
                                    <div key={cr} className="skull-item" >
                                      <div 
                                        className={viewState.selectedSkulls.includes(cr) ? 'selected card' : 'card'} 
                                        onClick={() => selectSkull(cr)}
                                      >
                                        <LazyLoadImage
                                          src={`${ipfsUri480}${cr}.webp`}
                                        />
                                        <div className="floating-badges-container">
                                          <span className="badge id">{cr}</span>
                                        </div>
                                      </div>
                                    </div>
                                    );
                            }
                                )
                        }
                        </div>
                    </div>
                </div>
                <div className="sk-container wd-33 h100">
                    <div className="card-cont">
                   { skull ? <EvoCard skull={skull} /> : '' }
                   </div>
                </div>
            </div>

        </>
    )
};



export default EvoTavern;

