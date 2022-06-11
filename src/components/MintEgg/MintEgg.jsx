import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import eggPic from "./egg.png";
import Grave from "../images/grave.png";
import EvoCard from "../EvoCard/EvoCard";
import EvoPet  from '../images/pet-icon.png'
import MetricContainer from "../MetricContainer/MetricContainer";
import eggCrack from './egg-cracked.png'
import { loadPets } from "../../redux/pet/petActions";
import { sendNotification } from "../../redux/data/dataActions"
import './MintEgg.css';
const petIpfs = `https://croskull.mypinata.cloud/ipfs/Qmckrn1QenE733tJarc48TU5J7pp3jDrXA2wryf363sPd1/`
const MintEgg = () => {
    const dispatch = useDispatch();
    let { blockchain, data, pet } = store.getState();
    let { isEggApproved } = pet
    let { petEggsBalance, petEggsId } = data
    let { croSkullsPetEggs, petSeasonOne } = blockchain
    const [ eggModal,setEggmodal] = useState(false);
    const [ animated, setAnimated ] = useState(eggPic)
    const [ mintedId, setMinted ] = useState([])
    const [qtyError, setQtyError] = useState(false)
    const [qty, setQty] = useState(0)

    useEffect( () => {
        let el = document.getElementsByClassName(`mint-egg`)[0]
        console.log( eggModal )
        if( eggModal ){
            el.classList.add('block')
            el.scrollTop = 0
        }else{
            el.classList.remove('block')
        }
    }, [eggModal])

    function closeEggModal(){
        setEggmodal(false);
    }

    const handleQtyChange = (event) => {
        let value = event.target ? event.target.value : 0
        if( value > 15 ){
            setQtyError(true)
            return
        }
        setQtyError(false)
        if( value > petEggsBalance ){
            value = petEggsBalance
            return
        }

        setQty(value)
    }


    const mintPet = async () => {
        if( ! qty ) return
        let eggs = []
        for(  let i = 0; i < qty; i++){
            eggs.push(petEggsId[i])
        }
        console.log( eggs )
        let tx = petSeasonOne.batchEvocation(
            eggs
        )
        await tx.then( async (tx) => {
            dispatch(sendNotification({
                title: `Transaction Sent`,
                message: 'Waiting for confirmation...',
                tx,
                type: "info"
            }))
            let res = await tx.wait(1)
            setEggmodal(true);
            let baseToken = parseInt(res.events[3].args.tokenId.toString())
            let created = parseInt(res.events.length / 4)
            let tokens = []
            if( created > 1 ){
                created += baseToken - 1
                for(let i = baseToken; i <= created; i++ ){
                    tokens.push( i )
                }
            }else if( created == 1 ){
                tokens.push(baseToken)
            }else{
                tokens = false;
            }
                
            if( ! tokens ){
                dispatch(sendNotification({
                    title: `Error`,
                    message: `Error during transaction`,
                    tx,
                    type: "success"
                }))
            }else{
                setMinted( tokens )
                setAnimated( eggCrack )
                dispatch(sendNotification({
                    title: `Minted!`,
                    message: `Pet minted Succesful`,
                    tx,
                    type: "success"
                }))
                dispatch(loadPets())
            }
        })
    }

    const approveEgg = async () => {
        let tx = croSkullsPetEggs.setApprovalForAll(
            petSeasonOne.address,
            true
        )
        await tx.then(
            async (tx) => {
                dispatch(sendNotification({
                    title: `Transaction Sent`,
                    message: 'Waiting for confirmation...',
                    tx,
                    type: "info"
                }))
                await tx.wait(1)
                dispatch(sendNotification({
                    title: `Approved!`,
                    message: `Approved Succesful`,
                    tx,
                    type: "success"
                }))
                dispatch(loadPets())
            }
        )
    }
    return (
        <>
        <div className='egg-modal' hidden={!eggModal} onClick={() => { closeEggModal() }}>
            <div className={'animation-container'} >
                <div className="egg-container">
                    <img src={animated} id="egg" />
                    <p>What!? { mintedId.length == 1 ? `Hatching your Egg` : `Hatching ${mintedId.length} Eggs!` }</p>
                </div>
                <div className="sk-flex sk-column j-center" id="w-box">
                    <div className="pet-container">
                        {
                            mintedId.length > 0 && mintedId.map( (id) => (
                                <div className="pet-item">
                                    <img
                                        src={`${petIpfs}${id}.jpeg`}
                                        id='pic-minted'
                                    />
                                    <p id='text-minted'>Pet <b>#{id}</b> Summoned!</p>
                                </div>
                            ))
                        }
                    </div>
                    <div className="sk-flex modal-cta sk-row a-center j-center m-100">
                        <button 
                            className="skull-button danger"
                            onClick={ () => closeEggModal() }
                        >
                            Go back
                        </button>
                        <button 
                            className="skull-button success"
                            onClick={ () => window.location.hash = "tavern" }
                        >
                            Tavern
                        </button>
                    </div>
                </div>
            </div>
            </div>
            <div className="sk-flex sk-row">
                <div className="card-container wd-50">
                    <EvoCard type='pet'/>
                </div>
                <div className="sk-box wd-50">
                    <h1>Mint EvoPet</h1>
                        <p>The Underworld is full of all kinds of magical creatures. It's common for CroSkulls to purchase and find Eggs during their Adventures.</p> 
                        <p>Each season of CroSkulls explore new regions of the Underworld and will have different seasonal pets. Once you hatch the egg you'll receive an <b>ERC721evo based Pet</b>, with on-chain Stats.</p>
                        <div className="sk-box-content">
                            <div className="sk-flex sk-row a-center j-center">
                                <img 
                                    src={eggPic}
                                />
                                <label className="sk-flex sk-column">
                                    <MetricContainer 
                                        label="Egg to Mint"
                                        tooltip="Max 15 eggs per tx."
                                    />
                                    <input 
                                        type="number"
                                        placeholder="Enter Egg amount"
                                        value={ qty }
                                        min="0"
                                        max="15"
                                        id='amount'
                                        onChange={ handleQtyChange }
                                    >
                                    </input>
                                    <span>Your eggs: {petEggsBalance}</span>
                                    {
                                        qtyError ? (
                                            <span>Error: Max 15 eggs per time!</span>
                                        ) : ('')
                                    }
                                </label>
                            </div>
                        </div>
                        <MetricContainer
                            label="Total Minted"
                            value={ `${pet.totalSupply}/2200` }
                            icon={EvoPet}
                            tooltip="Total Egg Circulating Supply / Max Supply."
                        />
                        {
                            isEggApproved ? (
                                <button 
                                    className="skull-button" 
                                    disabled={ ! petEggsBalance || ! qty}
                                    onClick={() => mintPet()}
                                >
                                    MINT 
                                </button>
                            ) : (
                                <button 
                                    className="skull-button" 
                                    onClick={() => approveEgg()}
                                >
                                    Approve 
                                </button>
                            )
                        }
                </div>
            </div>
        </>
    )
};

export default MintEgg;