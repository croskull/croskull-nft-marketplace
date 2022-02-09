import {
  ethers
} from 'ethers';
import React, { useEffect, useState } from "react";
import { getSkullsData, toTavern, toMission, sendNotification, getStakingData } from "../../redux/data/dataActions";
import store from "../../redux/store";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon, faRunning, faCoins } from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage } from "react-lazy-load-image-component";
import ReactQuill from "react-quill";
import IpfsHttpClient from "ipfs-http-client";
import hexagon from './hexagon.svg';
import "react-quill/dist/quill.snow.css";
import './tavern.css';

const ipfsUri =  "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"
const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/"
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/"
const Tavern = () => {
  let dispatch = useDispatch()
  let { blockchain, data } = store.getState()

  const [viewState, setViewState] = useState( {
    currentView: 'tavern', //tavern or adventure
    selectedSkulls: [],
    selectedStakeSkulls: []
  })

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
    ownerOf: ""
  } )

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

  const composeJson = () => {
    let composed = JSON.parse( editorStory )
    console.log( composed )
  }

  

  /*useEffect(() => {
    if( blockchain.contractDetected && ! data.croSkulls.length ){
      dispatch(getSkullsData())
      dispatch(refreshSkullsStories())
    }
  }, [blockchain.contractDetected])*/

  useEffect( () => { 
    console.log( storyState )
  }, [storyState] )

  useEffect( () => {
    setEditorStory( { 
      ...editorStory,
      tokenId: storyState.tokenId
    })
  }, [storyState.tokenId])
  
  useEffect( () => {
    console.log( editorStory )
  }, [editorStory] )
  
  const fetchSkullDescription = async ( { tokenId, ownerOf } ) => {
    console.log( tokenId, ownerOf )
    let { croSkullsDescription, accountAddress } = blockchain
    let ipfsHash = await croSkullsDescription.descriptionHashes( tokenId )
    ipfsHash = ipfsHash.toString()
    if( ipfsHash ) {
      ipfsHash = ipfsHash.replace('ipfs://', 'https://ipfs.infura.io/ipfs/')
      let hashMetadata = await fetch( ipfsHash );
      let { name, description, birthDate, deathDate, hobby, twitter, faction} = await hashMetadata.json();
      console.log( ipfsHash )
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
        ownerOf: ownerOf ? ownerOf : storyState.ownerOf
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
    let { croSkullsDescription, ethProvider, accountBalance } = blockchain
    let storyfied = JSON.stringify(editorStory)
    let descriptionBuffer = Buffer.from(storyfied)
    try {
      const client = IpfsHttpClient(new URL('https://ipfs.infura.io:5001/api/v0'));
      const ipfsResponse = await client.add(descriptionBuffer);
      if( ipfsResponse.path != "" ){
        let costInCRO = await croSkullsDescription._getcostInCRO()
        costInCRO = costInCRO.toString()
        if( accountBalance >= costInCRO ){
          let path = `ipfs://${ipfsResponse.path}`
          let skullStoryTx = croSkullsDescription.updateUsingCRO( 
            editorStory.tokenId.toString(), //tokenId
            path, // ipfs string hash with prefix
            { value: costInCRO } // sending some cro == costInCRO or revert
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
              await tx.wait(2)
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
      }
    } catch (error) {
      console.log(error.message);
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
    let { selectedSkulls } = viewState;
    if ( selectedSkulls && selectedSkulls.includes(e)) {
      for( let i = 0; i < selectedSkulls.length; i++){
        if (selectedSkulls[i] == e) {
          selectedSkulls.splice(i, 1);
        }
      }
    } else {
      selectedSkulls.push(e);
    }
    setViewState({
      ...viewState,
      selectedSkulls
    })
  }

  const selectStakedSkull = (e) => {
    let { selectedStakeSkulls } = viewState;
    if ( selectedStakeSkulls && selectedStakeSkulls.includes(e)) {
      for( let i = 0; i < selectedStakeSkulls.length; i++){
        if (selectedStakeSkulls[i] == e) {
          selectedStakeSkulls.splice(i, 1);
        }
      }
    } else {
      selectedStakeSkulls.push(e);
    }
    setViewState({
      ...viewState,
      selectedStakeSkulls
    })
  }

  const handleFieldChange = ( event ) => {
    let value = event.target ? event.target.value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : event
    let name = event.target ? event.target.id : "description"
    let type = event.target ? event.target.type : "description"
    if( type == 'date' ){
      value = new Date( value ).getTime() / 1000
    }
    setEditorStory( {
      ...editorStory,
      [name]: value
    } )
  }

  useEffect( () => {
    console.log( viewState )
  }, [viewState])

  //quill description editor setting

  let { croSkullsStaked, croSkulls, skullsStories, approval, advancedMetadata } = data;
  let { accountAddress, accountBalance } = blockchain
  let totalSkulls = croSkullsStaked.length > 0 ? croSkullsStaked.length + croSkulls.length : 0
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
    <div className= "container-fluid tavern">
      <div className="sk-flex sk-row">
        <div className="sk-container wd-100">
          <div className="sk-box">
            <span className="stories-heading">Recent Community Stories</span>
            <div className="sk-box-content sk-row of-y-over">
            { skullsStories ?
              skullsStories.map( (story ) => {
                let { ownerOf, tokenId } = story
                return (
                  <div className="story-item">
                    <div className="story-image-container">
                      <div 
                        style={{ backgroundImage: `url(${ipfsUri128}${tokenId}.webp)`  }}
                        className="story-image" 
                        onClick={() => { 
                          fetchSkullDescription( { tokenId, ownerOf } )
                        } }
                      />
                      <div
                        className="floating-badge"
                      >
                        <span class="token-id">
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
              }) : ('')
            }
            </div>
          </div>
        </div>
      </div>
      <div className="sk-flex sk-row">
        <div className="sk-container wd-100">
          <div className="sk-box">
            <div className="tab-head">
              <ul className="view-list">
                <li className={`skull-button view-button ${ viewState.currentView == 'tavern' ? 'active' : ''}`}
                    onClick={ () => {
                    setViewState( {
                      ...viewState,
                      currentView: 'tavern'
                    } )
                  }}
                >
                  Relaxing { croSkulls.length > 0 ? `(${croSkulls.length})` : '' }
                </li>
                {
                  approval ? (
                    <li
                      className={`skull-button view-button ${ viewState.currentView == 'adventure' ? 'active' : ''}`}
                      onClick={ () => {
                        setViewState( {
                          ...viewState,
                          currentView: 'adventure'
                        } )
                      }}
                    >
                      Adventure { croSkullsStaked.length > 0 ? `(${croSkullsStaked.length})` : '' }
                    </li>
                  ) : (
                    <li
                      className={`skull-button view-button approve`}
                      onClick={ () => {
                        setApprovalforAll()
                      }}
                    >
                      Approve Adventure
                    </li>
                  )
                }
              </ul>
            </div>
            <div className="sk-box-content sk-column">
              <div className={`skulls-list in-tavern ${ viewState.currentView == 'tavern' ? `active` : `` }`}>
                <div className="list-head">
                  <div className="div-button">
                    {
                      croSkulls.length > 0 ? 
                      (
                      <button className="skull-button btn-success" 
                        onClick={() => dispatch(toMission( croSkulls ))}
                      >
                        Send All ({ croSkulls.length })
                      </button> 
                      ) : ('') 
                    }
                    <button 
                      className="skull-button btn-success" 
                      hidden={(viewState.selectedSkulls.length > 0 ? false : true)} 
                      onClick={() => dispatch(toMission(viewState.selectedSkulls))}
                    >
                      Send Selected in Mission { viewState.selectedSkulls.length }
                    </button>
                  </div>
                </div>
                <div className="sk-row skull-grid">
                  {
                  (croSkulls).map((cr, index) => {
                    let data = advancedMetadata[cr-1]
                    return (
                    <div key={cr} className="skull-item" >
                      <LazyLoadImage
                        src={`${ipfsUri480}${cr}.webp`}
                        className={viewState.selectedSkulls.includes(cr) ? 'selected skull-image' : 'skull-image'} 
                        onClick={() => selectSkull(cr)}
                      />
                      <div className="floating-badges-container">
                        <span className="badge id">#{cr}</span>
                        <span className="badge rank">Rank: {data ? data.rank : ''}</span>
                        <span className="badge rank">Rarity: { data ? String(data.rarityPercent).substr(0, 3) : '' }%</span>
                      </div>
                      <div className="bottom-actions">
                        <button 
                          className="skull-button mission-button"
                          onClick={ () => {
                          dispatch(toMission(cr))
                          }}
                        > 
                          <FontAwesomeIcon icon={faDungeon} /> 
                          Mission
                        </button>
                        <button
                          className="skull-button sell-button"
                          onClick={ () => {
                          this.sellSkull(cr)
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
                          />
                          <span>Story</span>
                        </button>
                      </div>
                    </div>
                    );
                  })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container-fluid tavern">
      
      { display ? (
        <div className="story-modal">
            { editorStory.display ? (
              <div className="container">
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
                  onChange={handleFieldChange}
                >
                  <option>none</option>
                  <option>Skulattoni</option>
                  <option>Dragopodi</option>
                </select>
                <label for="twitter">Twitter Handle ( with @ )</label>
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
                  <button
                    className="skull-button save-cro"
                    onClick={ () => saveSkullStory() }
                  >
                    { accountBalance >= 0 ? `Update using (1) CRO` : `Insufficient CRO Balance`}
                  </button>
                  <button
                    className="skull-button save-grave"
                    disabled="disabled"
                  >
                    Update using (5) Grave
                  </button>
                </div>
              </div>
            </div>
            ) : (
              <div className="container">
                <div className="image">
                  <LazyLoadImage 
                    src={`${ipfsUri480}${tokenId}.webp`}
                    className='selected div-skull'
                  />
                  <span>Birth Date: { birthDate ?  new Date(birthDate * 1000).toISOString().slice(0, 10) : '' }</span>
                  <span>Death Date: { deathDate ? new Date(deathDate * 1000).toISOString().slice(0, 10) : '' }</span>
                  <span>Faction: { faction }</span>
                  <span>Twitter: { twitter }</span>
                  {
                    storyState.ownerOf && ethers.utils.getAddress(storyState.ownerOf) == ethers.utils.getAddress(accountAddress) ? (
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
      <div className="boxed">
        <div className="col-sm-12 skulls-container">
          <div 
            className="skull-viewer"
          >
            <div className="tab-head">
              <ul className="view-list">
                <li className={`skull-button view-button ${ viewState.currentView == 'tavern' ? 'active' : ''}`}
                    onClick={ () => {
                    setViewState( {
                      ...viewState,
                      currentView: 'tavern'
                    } )
                  }}
                >
                  Relaxing { croSkulls.length > 0 ? `(${croSkulls.length})` : '' }
                </li>
                {
                  approval ? (
                    <li
                      className={`skull-button view-button ${ viewState.currentView == 'adventure' ? 'active' : ''}`}
                      onClick={ () => {
                        setViewState( {
                          ...viewState,
                          currentView: 'adventure'
                        } )
                      }}
                    >
                      Adventure { croSkullsStaked.length > 0 ? `(${croSkullsStaked.length})` : '' }
                    </li>
                  ) : (
                    <li
                      className={`skull-button view-button approve`}
                      onClick={ () => {
                        setApprovalforAll()
                      }}
                    >
                      Approve Adventure
                    </li>
                  )
                }
              </ul>
            </div>
              <div className={`skulls-list in-tavern ${ viewState.currentView == 'tavern' ? `active` : `` }`}>
                <div className="list-head">
                  <div className="div-button">
                    {
                      croSkulls.length > 0 ? 
                      (
                        <button className="skull-button btn-success" 
                          onClick={() => dispatch(toMission( croSkulls ))}
                        >
                          Send All ({ croSkulls.length })
                        </button> 
                      ) : ('') 
                    }
                    <button 
                      className="skull-button btn-success" 
                      hidden={(viewState.selectedSkulls.length > 0 ? false : true)} 
                      onClick={() => dispatch(toMission(viewState.selectedSkulls))}
                    >
                      Send Selected in Mission { viewState.selectedSkulls.length }
                    </button>
                  </div>
                </div>
                <div className="flex-display flex-row flex-wrap">
                  {
                    (croSkulls).map((cr, index) => {
                      let data = advancedMetadata[cr-1]

                      return (
                        <div key={cr} className='col-sm-3' >
                          <LazyLoadImage 
                            src={`${ipfsUri480}${cr}.webp`}
                            className={viewState.selectedSkulls.includes(cr) ? 'selected div-skull ' : 'div-skull'} 
                            onClick={() => selectSkull(cr)}
                          />
                          <div className="floating-badges-container">
                            <span className="badge id">#{cr}</span>
                            <span className="badge rank">Rank: {data ? data.rank : ''}</span>
                            <span className="badge rank">Rarity: { data ? String(data.rarityPercent).substr(0, 3) : '' }%</span>
                          </div>
                          <div className="bottom-actions">
                            <button 
                              className="skull-button mission-button"
                              onClick={ () => {
                                dispatch(toMission(cr))
                              }}
                            > 
                              <FontAwesomeIcon icon={faDungeon} /> 
                              Mission
                            </button>
                            <button
                              className="skull-button sell-button"
                              onClick={ () => {
                                this.sellSkull(cr)
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
                              />
                              <span>
                                Story
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  }
              </div>
            </div>
            <div className={`skulls-list in-adventure ${ viewState.currentView == 'adventure' ? `active` : `` }`}>
              <div className="list-head">
                <div className="div-button">
                  {
                    croSkullsStaked.length > 0 ? (
                    <button className="skull-button btn-success" 
                      onClick={() => dispatch( toTavern( croSkullsStaked ) ) }
                    >
                      Retire All
                    </button>
                    ): ( '') 
                  }
                  <button 
                    className="skull-button btn-success" 
                    hidden={(viewState.selectedStakeSkulls.length > 0 ? false : true)} 
                    onClick={() => dispatch( toTavern( viewState.selectedStakeSkulls ) ) }
                  >
                    Retire Selected ({viewState.selectedStakeSkulls.length})
                  </button>
                  <Link to="/adventure">
                    <button
                      className="skull-button"
                    >
                      Adventure
                    </button>
                  </Link>
                </div>
              </div>
              <div className="flex-display flex-row flex-wrap">
                {
                  (croSkullsStaked).map((cr, index) => {
                    return (
                      <div key={cr} className='col-sm-3' >
                        <LazyLoadImage 
                          src={`${ipfsUri480}${cr}.webp`}
                          className={viewState.selectedStakeSkulls.includes(cr) ? 'selected div-skull ' : 'div-skull'} 
                          onClick={() => selectStakedSkull(cr)}
                        />
                        <span className="badge rounded">#{cr}</span>
                        <button 
                          className="skull-button retire-button"
                          onClick={ () => {
                            dispatch(toTavern(cr))
                          }}
                        > 
                          <FontAwesomeIcon icon={faRunning} /> 
                          Retire
                        </button>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
