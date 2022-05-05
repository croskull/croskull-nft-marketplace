import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import './MintEvo.css';
import egg from "./egg.png";
import purplePotionImage from "../images/purplePotionImage.png";
import EvoCard from "../EvoCard/EvoCard";



const MintEvo = () => {
    const dispatch = useDispatch();
    let { blockchain, data } = store.getState();
    let [potionC, setPotionC] = useState(null);
    let [skullC, setSkullC] = useState(null);
    let [skull, setSkull] = useState(skull1);
    function showSKull (){
      let s =  document.getElementById("skull-choice");

      let p =  document.getElementById("potion-choice");
      if(s.style.visibility == 'visible')
      {
        s.style.visibility = "hidden";
      }else{
        s.style.display = 'flex'
        s.style.visibility = "visible";
        p.style.display = 'none'
      }

    }
    function showPotion (){
        
        let s =  document.getElementById("skull-choice");

        let p =  document.getElementById("potion-choice");
        if(p.style.display == 'flex')
        {
            p.style.display ='none'
            s.style.display = 'flex'
            s.style.visibility = 'hidden'
        }else{
            s.style.display = 'none'
            s.style.visibility = 'hidden'
            p.style.display = 'flex'
        }

      }

      function chooseSkull(skull) {
        let s =document.getElementById("skull-img");
        s.src = ipfsUri480+skull+".webp";
        let s2 =document.getElementById("skull-id");
        s2.innerHTML = '#'+skull;
        setSkullC(skull);
        console.log(skullC);
      }
      function choosePotion(potion) {
        let p =document.getElementById("potion-img");
        p.src = purplePotionImage;
        let p2 =document.getElementById("potion-id");
        p2.innerHTML = '#'+potion;
        setPotionC(potion);
        console.log(potionC);
      }
    const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
    

      useEffect(() => {
        setInterval(function(){
            let m = Math.floor(Math.random() * 3);
            switch(m){
                case 0:
                    setSkull(skull1 );
                    break;
                case 1:
                    setSkull(skull2 );
                    break;
                case 2:
                    setSkull(skull3 );
                    break;
                default:
                    break;
            }
          }, 5000);
      },[])
    return (
        <>

                <div className="sk-flex sk-row">
                    <div className="sk-box wd-50">
                            <EvoCard skull={skull}/>
                    </div>
                    <div className="sk-box wd-50">
                        <h1>Mint EvoSkull</h1>
                        <div className="sk-box-content">
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
</p>
                            <div className="sk-box-content sk-row of-y-over" id="skull-choice">
                                {
                                    walletSkull.map( s =>{
                                        return(
                                            <div className="circular-image">
                                                <img src={ipfsUri480+s+".webp"}  onClick={() =>chooseSkull(s)}/>
                                                <p>#{s}</p>
                                                </div>
                                        )

                                    })
                                }

                            </div>
                            <div className="sk-box-content sk-row of-y-over" id="potion-choice">
                            {
                                    walletSkull.map( s =>{
                                        return(
                                            <div className="circular-image">
                                                <img src={purplePotionImage}  onClick={() =>choosePotion(s)}/>
                                                <p>#{s}</p>
                                                </div>
                                        )

                                    })
                                }
                            </div>
                            <div className="sk-row sk-flex">
                                <div style={{textAlign: 'center'}}>
                                    <img src={egg}  onClick={() => showSKull()} id='skull-img'/>
                                    <p id='skull-id'>SKull</p>
                                </div>

                                <FontAwesomeIcon icon={faPlus} size="2x"/>
                                <div style={{textAlign: 'center'}}>
                                    <img src={egg} onClick={() => showPotion()} label='' id='potion-img'/>
                                    <p id='potion-id'>Potion</p>
                                </div>

                            </div>
                                <button className="skull-button" disabled={skullC == null || potionC == null}>MINT</button>
                        </div>
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