import {
  ethers
} from 'ethers';
import React, { useEffect, useState } from "react";
import { petUpdateState } from "../../redux/pet/petActions";
import { fetchBalances, getSkullsData, toTavern, toMission, sendNotification, getStakingData, approveStories, refreshSkullsStories, playSound } from "../../redux/data/dataActions";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon, faRunning, faCoins, faSkullCrossbones, faSpinner, faRedoAlt  } from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage } from "react-lazy-load-image-component";
import IpfsHttpClient from "ipfs-http-client";
import hexagon from './hexagon.svg';
import eggImage from '../images/egg.png';
import Souls from '../images/soul.png';
import bluePotionImage from '../images/bluePotionImage.png';
import redPotionImage from '../images/redPotionImage.png';
import purplePotionImage from "../images/purplePotionImage.png";
import ReactQuill from "react-quill";
import AdventureSound from "./skull-in-adventure.mp3";
import SkullLogo from "../images/skull-logo.png";
import EvoLogo from "../images/evoskull-icon.png";
import PetLogo from "../images/pet-icon.png";
import EvoCard from "../EvoCard/EvoCard";
import Inventory from "./inventory.svg";
import "react-quill/dist/quill.snow.css";
import './Tavern.css';
import MetricContainer from '../MetricContainer/MetricContainer';

const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"
const Tavern = () => {
  let dispatch = useDispatch()
  let { blockchain, data, evo, pet } = store.getState()
  let { evoSkulls } = evo
  let { pets, rewards } = pet
  let { petSeasonOne } = blockchain

  const [viewStories, toggleStories] = useState( false )
  const [viewInventory, toggleInventory] = useState( false )

  const [skullState, setSkullState] = useState( {
    currentView: 'tavern', //tavern or adventure
    selectedSkulls: [],
    selectedStakeSkulls: []
  })

  const [tavernView, setTavernView] = useState('skull') //skull, evoskull, pet, inventory, stories,

  const [storyState, setStoryState] = useState( {
    display: false,
    tokenId: 0,
    title: "",
    description: "",
    birthDate: 0,
    deathDate: 0,
    hobby: "",
    twitter: "",
    faction: "",
    ownerOf: "",
    x: 0,
    y: 0
  })

  const [editorStory, setEditorStory] = useState( {
    display: false,
    tokenId: 0,
    title: "",
    description: "",
    birthDate: 0,
    deathDate: 0,
    hobby: "",
    twitter: "",
    faction: ""
  } )

  const [mousePos, setMousePos] = useState({ 
    x: 0, 
    y: 0 
  })

  useEffect(() => {
    if( viewStories )
      toggleStories( false )
    if( viewInventory )
      toggleInventory( false )
  }, [skullState])

  useEffect(() => {
    if( viewInventory && viewStories )
      toggleInventory( false )
  }, [viewStories])

  useEffect(() => {
    if( viewStories  && viewInventory )
      toggleStories( false )
  }, [viewInventory])

  useEffect( () => {
    setEditorStory( { 
      ...editorStory,
      tokenId: storyState.tokenId
    })
  }, [storyState.tokenId])
  
  const fetchSkullDescription = async ( { tokenId, ownerOf } ) => {
    let { croSkullsDescription, accountAddress } = blockchain
    let ipfsHash = await croSkullsDescription.descriptionHashes( tokenId )
    ipfsHash = ipfsHash.toString()
    if( ipfsHash) {
      ipfsHash = ipfsHash.replace('ipfs://', 'https://ipfs.infura.io/ipfs/')
      let hashMetadata = await fetch( ipfsHash );
      let { name, description, birthDate, deathDate, hobby, twitter, faction} = await hashMetadata.json();
      
      setStoryState( {
        ...storyState,
        name,
        description,
        birthDate,
        deathDate,
        hobby,
        twitter,
        faction,
        display: true,
        tokenId,
        ownerOf: ownerOf ? ownerOf : storyState.ownerOf,
        x: mousePos.x,
        y: mousePos.y
      } )
      setEditorStory( {
        ...editorStory,
        name,
        description,
        birthDate,
        deathDate,
        hobby,
        twitter,
        faction,
        display: false,
        tokenId,
        ownerOf: ownerOf ? ownerOf : storyState.ownerOf,
      } )
    } else {
      setStoryState( {
        tokenId,
        ownerOf: ownerOf ? ownerOf : accountAddress,
        display: true
      })
    }
  }

  const saveSkullStory = async ( ) => {
    let { croSkullsDescription } = blockchain
    let storyfied = JSON.stringify(editorStory)
    let descriptionBuffer = Buffer.from(storyfied)
    try {
      const client = IpfsHttpClient(new URL('https://ipfs.infura.io:5001/api/v0'));
      const ipfsResponse = await client.add(descriptionBuffer);
      if( ipfsResponse.path !== "" ){
          let path = `ipfs://${ipfsResponse.path}`
          let skullStoryTx = croSkullsDescription.updateUsingGrave( 
            editorStory.tokenId.toString(), //tokenId
            path, // ipfs string hash with prefix
          )

          await skullStoryTx.then(
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
                title: `Story Updated!`,
                message: `Skull #${editorStory.tokenId}'s story updated succesful`,
                tx,
                type: "success"
              }))
              fetchSkullDescription( { tokenId: editorStory.tokenId })
              setEditorStory({
                ...editorStory,
                display: false
              })
              dispatch(getSkullsData())
            }
          )
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  const claimRewards = async () => {
    if( rewards > 0 ){
      let tx = petSeasonOne.claimRewards()
      await tx.then(async (tx) => {
        dispatch(
          sendNotification({
            title: `Transaction Sent`,
            message: 'Waiting for confirmation...',
            tx,
            type: "default"
          })
        )
        await tx.wait(1)
        dispatch(sendNotification({
          title: `Transaction Confirmed`,
          message: 'Rewards Claimed...',
          tx,
          type: "default"
        }))
        dispatch(
          fetchBalances()
        )
        let rewards = (await petSeasonOne.hasRewards()).rewards.toString()
        dispatch(
          petUpdateState({
            "key": "rewards",
            "value": rewards
          })
        )
      })
    }
  }

  const setApprovalforAll = async () => {
    let { croSkullsStaking, croSkullsContract } = blockchain
    let approvalTx = croSkullsContract.setApprovalForAll(
      croSkullsStaking.address,
      true
    )
    await approvalTx.then( async ( tx ) => {
      console.log( tx )
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "default"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Approved!`,
          message: `Approved Succesful`,
          tx,
          type: "success"
        }))
        dispatch(getStakingData())
    })
  }

  const selectSkull = (e) => {
    let { selectedSkulls } = skullState;
    if ( selectedSkulls && selectedSkulls.includes(e)) {
      for( let i = 0; i < selectedSkulls.length; i++){
        if (selectedSkulls[i] === e) {
          selectedSkulls.splice(i, 1);
        }
      }
    } else {
      selectedSkulls.push(e);
    }
    dispatch(playSound(AdventureSound))
    setSkullState({
      ...skullState,
      selectedSkulls
    })
  }

  const selectStakedSkull = (e) => {
    let { selectedStakeSkulls } = skullState;
    if ( selectedStakeSkulls && selectedStakeSkulls.includes(e)) {
      for( let i = 0; i < selectedStakeSkulls.length; i++){
        if (selectedStakeSkulls[i] === e) {
          selectedStakeSkulls.splice(i, 1);
        }
      }
    } else {
      selectedStakeSkulls.push(e);
    }
    dispatch(playSound(AdventureSound))
    setSkullState({
      ...skullState,
      selectedStakeSkulls
    })
  }

  const handleFieldChange = ( event ) => {
    let value = event.target ? event.target.value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : event
    let name = event.target ? event.target.id : "description"
    let type = event.target ? event.target.type : "description"
    if( type === 'date' ){
      value = parseInt( new Date( value ).getTime() / 1000 )
    }
    setEditorStory( {
      ...editorStory,
      [name]: value
    } )
  }

  //quill description editor setting

  let { storiesLoading, redCount, blueCount, croSkullsStaked, croSkulls, skullsStories, approval, advancedMetadata, loading, croSkullsContractOwner, petEggsBalance, storyAllowance, purpleCount } = data;
  let { accountAddress, contractDetected } = blockchain
  let { 
    tokenId,
    name,
    description,
    birthDate,
    deathDate,
    hobby,
    twitter,
    faction,
    display
  } = storyState
  return (
    <>
      <div className="sk-flex sk-row mh-100">
        <div className="sk-container">
          <div className="sk-box sidebar-list">
            <span
              className={`icon-menu inventory ${ tavernView == 'inventory' ? 'active' : ''}`}
              onClick={ () => {
                setTavernView('inventory')
              }}
            >
              <img
                className="btn-toggle-stories"
                src={Inventory} 
              />
            </span>
            <span className="divider"></span>
            <span 
              className={`icon-menu ${ tavernView == 'skull' ? 'active' : ''}`}
              onClick={ () => {
                setTavernView('skull')
              }}
            >
              <img 
                className="btn-toggle-stories"
                src={SkullLogo} 
              />
            </span>
            <span 
              className={`icon-menu ${ tavernView == 'evoskull' ? 'active' : ''}`}
              onClick={ () => {
                setTavernView('evoskull')
              }}
            >
              <img 
                className="btn-toggle-stories"
                src={EvoLogo} 
              />
            </span>
            <span 
              className={`icon-menu ${ tavernView == 'pet' ? 'active' : ''}`}
              onClick={ () => {
                setTavernView('pet')
              }}
            >
              <img 
                className="btn-toggle-stories"
                src={PetLogo} 
              />
            </span>
            <span className="divider"></span>
            <span 
              className={`icon-menu ${ tavernView == 'stories' ? 'active' : ''}`}
              onClick={ () => {
                setTavernView('stories')
              }}
            >
              <FontAwesomeIcon 
                className="btn-toggle-stories"
                icon={faSkullCrossbones}
              />
            </span>
          </div>
          <div className={`sk-box stories ${ tavernView == 'stories' ? 'active' : 'hide' }`}>
            <span className="stories-heading">Recent Community Stories</span>
            <div className="sk-box-content sk-row of-y-over">
            { skullsStories.length > 0 ?
              skullsStories.map( (story, i ) => {
                let { ownerOf, tokenId } = story
                return (
                  <div className="story-item" key={i}>
                    <div className="item-image-container">
                      <div 
                        style={{ backgroundImage: `url(${ipfsUri128}${tokenId}.webp)`  }}
                        className="item-image" 
                        onClick={() => { 
                          fetchSkullDescription( { tokenId, ownerOf } )
                        } }
                      />
                      <div
                        className="floating-badge"
                      >
                        <span className="token-id">
                          {tokenId}
                        </span>
                      </div>
                    </div>
                    <span
                      className="story-owner"
                    >
                      {`${story.ownerOf.substr(0, 4)}...${story.ownerOf.substr(39, 41)}` }
                    </span>
                  </div>
                )
              }) : (
                <span>Loading amazing stories...</span>
              )
            }
            {
              storiesLoading ? 
              (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="story-icon loading"
                  ></FontAwesomeIcon>
                </>
                
              ):(
                <>
                  <FontAwesomeIcon
                    icon={faRedoAlt}
                    className="story-icon"
                    onClick={ () => {
                      dispatch(
                        refreshSkullsStories()
                      )
                    } }
                  ></FontAwesomeIcon>
                </>
              )
            }
            </div>
          </div>
          <div className={`sk-box skulls ${ tavernView == 'skull' ? 'active' : 'hide'}`}>
            <div className="tab-head">
              <ul className="sk-row view-list">
                <li className={`skull-button view-button ${ skullState.currentView === 'tavern' ? 'active' : ''}`}
                    onClick={ () => {
                    setSkullState( {
                      ...skullState,
                      currentView: 'tavern'
                    } )
                  }}
                >
                  { 
                    croSkulls.length > 0 ? (
                    <span className="floating-counter">{croSkulls.length}</span>
                    ) : 
                    '' 
                  }
                  Relaxing 
                </li>
                {
                  approval ? (
                    <li
                      className={`skull-button view-button ${ skullState.currentView === 'adventure' ? 'active' : ''}`}
                      onClick={ () => {
                        setSkullState( {
                          ...skullState,
                          currentView: 'adventure'
                        } )
                        
                      }}
                    >
                      { 
                        croSkullsStaked.length > 0 ? (
                        <span className="floating-counter">{croSkullsStaked.length}</span>
                        ) : 
                        '' 
                      }
                      Adventure
                    </li>
                  ) : (
                    <button
                      className={`skull-button view-button ${ blockchain.accountAddress ? 'approve' : 'disabled'}`}
                      disabled={ blockchain.accountAddress ? false : true}
                      onClick={ () => {
                        setApprovalforAll()
                        
                      }}
                    >
                      Approve
                    </button>
                  )
                }
              </ul>
            </div>
            <div className="sk-box-content sk-column">
              <div className={`skulls-list in-tavern ${ skullState.currentView === 'tavern' ? `active` : `` }`}>
                <div className="list-head">
                  <div className="div-button">
                    {
                      croSkulls.length > 0 ? 
                      (
                        <>
                        <button className="skull-button btn-success" 
                          onClick={() => dispatch(toMission( croSkulls ))}
                          disabled={ approval ? false : true}
                        >
                          Send All ({ croSkulls.length })
                        </button>
                        <button
                          className="skull-button btn-success" 
                          hidden={(skullState.selectedSkulls.length > 0 ? false : true)} 
                          onClick={() => dispatch(toMission(skullState.selectedSkulls))}
                          disabled={ approval ? false : true}
                        >
                          Send Selected on Adventure { skullState.selectedSkulls.length }
                        </button>
                      </>
                    ) : ('') 
                  }
                  </div>
                </div>
                <div className="sk-row skull-grid">
                  {
                    croSkulls.length > 0 ?
                    (croSkulls).map((cr, index) => {
                      let data = advancedMetadata[cr-1]
                      return (
                      <div key={cr} className="skull-item" >
                        <div 
                          className={skullState.selectedSkulls.includes(cr) ? 'selected card' : 'card'} 
                          onClick={() => selectSkull(cr)}
                        >
                        <LazyLoadImage
                          src={`${ipfsUri480}${cr}.webp`}
                        />
                        <div className="floating-badges-container">
                          <span className="badge id">{cr}</span>
                        </div>
                        <div className="bottom-actions">
                          <button 
                            className="skull-button mission-button"
                            onClick={ () => {
                              dispatch(toMission(cr))
                            }}
                          > 
                            <FontAwesomeIcon icon={faDungeon} /> 
                            Adventure
                          </button>
                          <button
                            className="skull-button sell-button"
                            onClick={ () => {                       
                              window.open("https://app.ebisusbay.com/collection/croskull").focus()
                            }}
                          >
                            <FontAwesomeIcon icon={faCoins} /> 
                            Sell
                          </button>
                          <button
                              className="skull-button story-button"
                              onClick={ () => {
                                fetchSkullDescription({ tokenId: cr, ownerOf: accountAddress })
                              }}
                          > 
                            <img 
                              className="hexagon"
                              src={hexagon}
                              alt=""
                            />
                            <span>Story</span>
                          </button>
                        </div>
                      </div>
                    </div>
                      );
                    })
                    : (
                      <div className="sk-flex sk-column">
                        <span>{ loading && !croSkullsContractOwner ? `Loading...` : ! croSkullsContractOwner && !loading && croSkulls.length === 0 ? `You don't have any skull...`  : `You don't have any skull :c`  }</span>
                        <button 
                          onClick= { () => { window.open("https://app.ebisusbay.com/collection/croskull").focus() } } 
                          className="skull-button"
                        >
                          Buy Skull
                        </button>
                      </div>
                    )
                  }
                </div>
              </div>
              <div className={`skulls-list in-adventure ${ skullState.currentView === 'adventure' ? `active` : `` }`}>
                <div className="list-head">
                  <div className="div-button">
                    {
                      croSkullsStaked.length > 0 ? 
                      (
                      <button className="skull-button retire-button" 
                        onClick={() => dispatch(toTavern( croSkullsStaked ))}
                      >
                        Retire All ({ croSkullsStaked.length })
                      </button> 
                      ) : ('') 
                    }
                    <button 
                      className="skull-button retire-button" 
                      hidden={(skullState.selectedStakeSkulls.length > 0 ? false : true)} 
                      onClick={() => dispatch(toTavern(skullState.selectedStakeSkulls))}
                    >
                      Retire Selected { skullState.selectedStakeSkulls.length }
                    </button>
                  </div>
                </div>
                <div className="sk-row skull-grid">
                  {
                    croSkullsStaked.length > 0 ?
                    (croSkullsStaked).map((cr, index) => {
                      let data = advancedMetadata[cr-1]
                      return (
                        <div key={cr} className="skull-item" >
                          <div 
                            className={skullState.selectedStakeSkulls.includes(cr) ? 'selected card' : 'card'} 
                            onClick={() => selectStakedSkull(cr)}
                          >
                            <LazyLoadImage
                              src={`${ipfsUri480}${cr}.webp`}
                            />
                            <div className="floating-badges-container">
                              <span className="badge id">{cr}</span>
                            </div>
                            <div className="bottom-actions">
                              <button 
                                className="skull-button retire-button"
                                onClick={ (e) => {
                                  e.preventDefault()
                                  dispatch(toTavern(cr))
                                }}
                              > 
                                <FontAwesomeIcon icon={faRunning} /> 
                                Retire
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                    : (
                      <span>
                        { ! croSkullsStaked.length && contractDetected ? `There're no skulls in adventure, you're not Generating Grave` : `Loading...` }
                      </span>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
          <div className={`sk-box evoskull ${ tavernView == 'evoskull' ? 'active' : 'hide'}`}>
            <div className="sk-box-content sk-column">
              <div className={`skulls-list in-tavern active`}>
                <div className="sk-row skull-grid">
                  {
                    evoSkulls ? (
                      evoSkulls.map(evo => (
                        <EvoCard
                          evo={evo}
                        />
                      ))
                    ) : (
                      ''
                    )
                  }
                </div>
              </div>
            </div>
          </div>
          <div className={`sk-box pet ${ tavernView == 'pet' ? 'active' : 'hide'}`}>
            <div className="pet-rewards sk-flex sk-row a-center">
              <MetricContainer 
                label="Rewards"
                value={rewards}
                icon={Souls}
                tooltip={`Max Souls: ${pets.length * 7} = ${pets.length} pets * 7 days`}
                vertical={true}
              />
              <button
                className="skull-button claim"
                disabled={ rewards == 0 }
                onClick={() => claimRewards() }
              >
                Claim
              </button>
            </div>
            <div className="sk-box-content sk-column">
              <div className={`skulls-list in-tavern active`}>
                <div className="sk-row skull-grid">
                  {
                    pets ? (
                      pets.map( (pet, i ) => (
                        <EvoCard
                          evo={pet}
                          key={i}
                          type="pet"
                        />
                      ))
                    ) : (
                      ''
                    )
                  }
                </div>
              </div>
            </div>
          </div>
          <div className={`sk-box inventory ${ tavernView == 'inventory' ? 'active' : 'hide'}`} >
              <span className="stories-heading">
                Inventory
              </span>
              <div className="sk-box-content sk-row of-y-over">
                <div 
                  className="item-image-container"
                  style={{ width: `85px` }}
                >
                  <div 
                    style={{ backgroundImage: `url(${eggImage})` }}
                    className={`item-image ${ ! petEggsBalance ? 'disabled' : ''}`}
                  >
                    <span className="item-count">{ petEggsBalance }</span>
                  </div>
                </div>
                <div 
                  className="item-image-container"
                  style={{ width: `85px` }}
                >
                  <div 
                    style={{ backgroundImage: `url(${purplePotionImage})` }}
                    className={`item-image ${ !purpleCount ? 'disabled' : ''}`}
                  >
                    <span className="item-count">{ `${purpleCount}` }</span>
                  </div>
                </div>
                <div 
                  className="item-image-container"
                  style={{ width: `85px` }}
                >
                  <div 
                    style={{ backgroundImage: `url(${bluePotionImage})` }}
                    className={`item-image ${ !blueCount ? 'disabled' : ''}`}
                  >
                    <span className="item-count">{ `${blueCount}` }</span>
                  </div>
                </div>
                <div 
                  className="item-image-container"
                  style={{ width: `85px` }}
                >
                  <div 
                    style={{ backgroundImage: `url(${redPotionImage})` }}
                    className={`item-image ${ !redCount ? 'disabled' : ''}`}
                  >
                    <span className={"item-count"}>{ `${redCount}` }</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
      { display ? (
        <div className="story-modal">
            { editorStory.display ? (
              <div 
                className="sk-box container" 
                style={{ left: `${storyState.x}px`, top: `${storyState.y}px` }}
              >
              <div className="image">
                <LazyLoadImage 
                  src={`${ipfsUri480}${tokenId}.webp`}
                  className='selected div-skull'
                />
                <label for="birthDate">Birth date</label>
                <input
                  id="birthDate"
                  type="date"
                  name="birthDate"
                  onChange={handleFieldChange}
                />
                <label for="deathDate">Death date</label>
                <input
                  id="deathDate"
                  type="date"
                  name="deathDate"
                  onChange={handleFieldChange}
                />
                <label for="faction">Faction</label>
                <select
                  name="faction"
                  id="faction"
                  onChange={handleFieldChange}
                >
                  <option value="none">None</option>
                  <option value="lowlights">Lowlight’s</option>
                  <option value="shadowrats">ShadowRats</option>
                  <option value="acquafall">Acquafall</option>
                  <option value="solarcry">Solarcry</option>
                </select>
                <label htmlFor="twitter">Twitter Handle ( with @ )</label>
                <input
                  id="twitter"
                  type="text"
                  name="twitter"
                  onChange={handleFieldChange}
                />
              </div>
              <div className="metadata">
                <div
                  className="close-icon"
                  onClick={ () => {
                    setEditorStory({
                      ...editorStory,
                      display: false
                    })
                  }}
                >
                  Back to Skull
                </div>
                <h2 style={{ fontSize: '18px' }}>Edit your Skull Details</h2>
                <label for="name">Skull Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  onChange={handleFieldChange}
                />
                <label for="hobby">Hobbies/Motto</label>
                <input
                  id="hobby"
                  type="text"
                  name="hobby"
                  onChange={handleFieldChange}
                />
                <label for="description">Skull's Story</label>
                <div
                  style={{ overflowY: 'scroll'}}
                >
                  <ReactQuill
                    className="description-editor"
                    modules={modules}
                    formats={formats}
                    value={editorStory.description}
                    onChange={handleFieldChange}
                    placeholder={"Write something awesome..."}
                    name="description"
                  />
                </div>
                <div
                  className="pay-action"
                >
                  {
                    storyAllowance > 0 ? (
                      <button
                        className="skull-button save-grave"
                        onClick={ () => saveSkullStory() }
                      >
                        Update using (10) Grave
                      </button>
                    ) : (
                      <button
                        className="skull-button save-grave"
                        onClick={ () => dispatch( approveStories() ) }
                      >
                        Approve Story
                      </button>
                    )
                  }
                </div>
              </div>
            </div>
            ) : (
              <div className="sk-box container">
                <div className="image">
                  <LazyLoadImage 
                    src={`${ipfsUri480}${tokenId}.webp`}
                    className='card div-skull'
                  />
                  <span>Birth Date: {  birthDate > 0 ?  new Date(birthDate * 1000).toISOString().slice(0, 10) : '' }</span>
                  <span>Death Date: {  deathDate > 0 ? new Date(deathDate * 1000).toISOString().slice(0, 10) : '' }</span>
                  <span>Faction: { faction }</span>
                  <span>Twitter: { twitter !== '' ? (
                    <a href={ twitter ? `https://twitter.com/${twitter.replace('@', '')}` : ''} target="_blank" rel="noopener noreferrer">{twitter}</a>
                  ) : ('') }</span>
                  {
                    storyState.ownerOf && ethers.utils.getAddress(storyState.ownerOf) === ethers.utils.getAddress(accountAddress) ? (
                      <button 
                        className="skull-button edit-button"
                        onClick={ () => {
                          setEditorStory( {
                            ...editorStory,
                            display: true
                          })
                        }}
                      >
                        Edit Story
                      </button> 
                    ) : (
                      <span>
                        Owner: { storyState.ownerOf ? `${storyState.ownerOf.substr(0, 5)}...${storyState.ownerOf.substr(38, 41)}` : '' }
                      </span>
                    )
                  }
                  
                </div>
              <div className="metadata">
                <div
                    className="close-icon"
                    onClick={ () => {
                      setStoryState({
                        ...storyState,
                        display: false
                      })
                    }}
                  >
                  Close
                </div>
                <h2>{ name }</h2>
                <span>Hobby: { hobby }</span>
                <div 
                  className="description"
                  dangerouslySetInnerHTML={{ __html: description }
                }
                >
                </div>
              </div>
            </div>
            ) }
        </div>
      ) : ('')}
    </ >
  )
}

let modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline','strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['clean']
  ],
};

let formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
];

export default Tavern;
