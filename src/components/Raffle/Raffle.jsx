import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { useDispatch } from "react-redux";
import store from "../../redux/store";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { loadRaffleData } from '../../redux/raffle/raffleActions';
import { faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import { sendNotification } from "../../redux/data/dataActions";
import IpfsHttpClient from "ipfs-http-client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Coins from "./coins.png";
import Grave from "../Navbar/grave.png";
import Rune from "../Navbar/grave-burn.png";
import Soul from "../Navbar/soul.png";
import "react-quill/dist/quill.snow.css";
import './Raffle.css';

const Raffle = ({ accountAddress }) => {
  let dispatch = useDispatch()
  let { blockchain, raffle } = store.getState()
  let { formatEther } = blockchain
  let { isManager, raffles } = raffle;
  const [hasData, toggleData] = useState(false)

  useEffect( () => {
      if( raffle.init ) return 
      dispatch(loadRaffleData())
  }, [blockchain.croRaffle])

  const raf1 = {
    type: 500,
    image: 0,
    title: "Raffle Title",
    winnersCount: 5,
    participants: 45,
    maxParticipants: 0,
    cost: 0,
    collectionName: '',
    collectionAddress: 0,
    startTimestamp: new Date(2022, 1, 12),
    endTimestamp: new Date(2022, 1, 21),
    winners: [],
    description: 'Join now this amazing raffle in partnership with MM.Finance.',
  }

  const raf2 = {
    type: 0,
    image: 0,
    title: "Raffle Title 2",
    winnersCount: 5,
    participants: 45,
    maxParticipants: 50,
    cost: 0,
    collectionName: '',
    collectionAddress: 0,
    startTimestamp: new Date(2022, 1, 12),
    endTimestamp: new Date(2022, 3, 27),
    winners: [],
    description: 'Join now this amazing raffle in partnership with MM.Finance.',
  }

  const [modalState, setModalState] = useState({
    title: '',
    winners: [],
    prize: 1,
    coin: ''
  });

  const [raffleCreator, setRaffleCreator] = useState( {
    display: false,
    image: 0,
    type: 0,
    title: "Thrid Raffle",
    winnersCount: 0,
    maxParticipants: 0,
    cost: 0,
    collectionName: '',
    collectionAddress: 0,
    startTimestamp: 0,
    endTimestamp: 0,
    description: '',
  } )

  const handleFieldChange = ( event ) => {
    let value = event.target ? event.target.value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : event
    let name = event.target ? event.target.id : "description"
    let type = event.target ? event.target.type : "description"
    if( type === 'date' ){
      value = parseInt( new Date( value ).getTime() / 1000 )
    }
    setRaffleCreator( {
      ...raffleCreator,
      [name]: value
    } )
  }


  const openModal = (raf) => {
    setModalState({
      title: raf.title,
      winners: raf.winners,
      prize: raf.win / raf.nWinners,
      coin: raf.coin
    })
    let modal = document.getElementById("modal-winners");
    modal.style.display = "block";

  }
  const closeModal = () => {
    let modal = document.getElementById("modal-winners");
    modal.style.display = "none";
  }
  const rafs = [raf1, raf2];

  const DAY_IN_SEC = 60 * 60 * 24 * 1000;
  const HUNDRED_DAYS_IN_SEC = 100 * DAY_IN_SEC//100 * DAY_IN_SEC;
  const formatDate = (timestamp) => {
    let tsHours = timestamp / 60 / 60
    let days = parseInt(timestamp / DAY_IN_SEC)
    let hoursDiff = tsHours - (days * 24)
    let hours = parseInt(hoursDiff)
    let tsMinutes = hoursDiff * 60
    let minutes = parseInt(tsMinutes - (hours * 60))
    return {
      days,
      hours,
      minutes
    }
  }

  let crazyDesc = 'A Crazy Raffle, every time someone join the time is reduced by 5%';
  let normalDesc = 'A Normal raffle join to get a chance to win!';

  const retrieveImage = (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setRaffleCreator({
        ...raffleCreator,
        image: Buffer(reader.result)
      });
    }
    e.preventDefault();  
  }


  const participateRaffle = async () => {
    return
  }

  const addRaffle = async ( ) => {
    let { croRaffle } = blockchain
    setRaffleCreator({
      ...raffleCreator,
      startTimestamp: parseInt( new Date( ).getTime() / 1000 ),
    })
    let rafflefied = JSON.stringify(raffleCreator)
    let descriptionBuffer = Buffer.from(rafflefied)
    try {
      const client = IpfsHttpClient(new URL('https://ipfs.infura.io:5001/api/v0'));
      if( raffleCreator.image ){
        const ipfsImage = await client.add(raffleCreator.image);
        setRaffleCreator({
          ...raffleCreator,
          image: `ipfs://${ipfsImage.path}`
        })
      }
      const ipfsResponse = await client.add(descriptionBuffer);
      if( ipfsResponse.path !== "" ){
          let ipfsPath = `ipfs://${ipfsResponse.path}`
          let addRaffleTx = croRaffle.addRaffle(
            raffleCreator.winnersCount,
            raffleCreator.collectionAddress,
            ethers.utils.parseEther(raffleCreator.cost),
            raffleCreator.endTimestamp,
            ipfsPath,
            raffleCreator.type * 100,
            raffleCreator.maxParticipants
          )
            //return;
            await addRaffleTx.then(
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
                  title: `Raffle Created!`,
                  message: `Raffle Created Succesful`,
                  tx,
                  type: "success"
                }))
                setRaffleCreator({
                  ...raffleCreator,
                  display: false
                })
                dispatch(loadRaffleData())
              }
          )
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <>
      <div className="modal" id="modal-winners">
        <div className="modal-w-content">
          <div className="sk-box">
            <span class="close-btn" onClick={() => { closeModal() }}>&times;</span>
            <h1>{modalState.title}</h1>
            <div className="modal-header"> 
              <h3>Prize</h3>
              <span>
                <h3>Address</h3>
              </span>
            </div>
            {
              /*raffles && raffles.length > 0 ?
                raffles.winners.map((winner,i) => {
                  return (
                    <div className="modal-header">
                      <h3>{i+1}</h3>
                      <span className="address">{winner}</span>
                    </div>
                  )
                })
              :
              ('')*/
            }
          </div>
        </div>
      </div>
        {
          raffleCreator.display && isManager ? (
            <div className="story-modal">
              <div 
                className="sk-box container" 
              >
              <div className="image">
                <label for="image">Raffle Image</label>
                <input type="file" name="image" onChange={retrieveImage} />
                <label for="endTimestamp">Finish date</label>
                <input
                  id="endTimestamp"
                  type="date"
                  name="endTimestamp"
                  onChange={handleFieldChange}
                />
                <label htmlFor="type">Fast Raffle ( 0 = deactivated )</label>
                <input
                  id="type"
                  type="number"
                  name="type"
                  onChange={handleFieldChange}
                />
                <label htmlFor="maxParticipants">Max Participants ( 0 = deactivated )</label>
                <input
                  id="maxParticipants"
                  type="number"
                  name="maxParticipants"
                  onChange={handleFieldChange}
                />
                <label htmlFor="maxParticipants">Ticket Cost</label>
                <input
                  id="cost"
                  type="number"
                  name="cost"
                  onChange={handleFieldChange}
                />
                <label htmlFor="winnersCount">Winners ( max 10 )</label>
                <input
                  id="winnersCount"
                  type="number"
                  name="winnersCount"
                  onChange={handleFieldChange}
                />
              </div>
                <div className="metadata">
                  <div
                    className="close-icon"
                    onClick={ () => {
                      setRaffleCreator({
                        ...raffleCreator,
                        display: false
                      })
                    }}
                  >
                    Back
                  </div>
                  <h2 style={{ fontSize: '18px' }}>Create a new Raffle</h2>
                  <label for="collectionName">Collection Name</label>
                  <input
                    id="collectionName"
                    type="text"
                    name="collectionName"
                    onChange={handleFieldChange}
                  />
                  <label for="collectionAddress">Collection Address</label>
                  <input
                    id="collectionAddress"
                    type="text"
                    name="collectionAddress"
                    onChange={handleFieldChange}
                  />
                  <label for="title">Raffle Title</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    onChange={handleFieldChange}
                  />
                  <label for="description">Raffle Description</label>
                  <div
                    style={{ overflowY: 'scroll'}}
                  >
                    <ReactQuill
                      className="description-editor"
                      modules={modules}
                      formats={formats}
                      value={raffleCreator.description}
                      onChange={handleFieldChange}
                      placeholder={"Write something awesome..."}
                      name="description"
                    />
                  </div>
                  <div
                    className="pay-action"
                  >
                    <button
                      className="skull-button save-grave"
                      onClick={ () => addRaffle() }
                    >
                      Add Raffle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : 
          ('')
        }
      <div className="sk-container sk-row" style={{ overflow: 'hidden' }}>
        <div className="sk-box sk-column sk-raffle">
          <div className="">
            <h3>Raffle Time!</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eget urna ex. Etiam eleifend interdum lobortis. Morbi laoreet purus sed felis semper posuere.
            </p>
            {
              isManager ? (
              <button 
                className="skull-button"
                onClick={ () => 
                  setRaffleCreator({
                    ...raffleCreator,
                    display: true
                  })
                }
              >
                Add Raffle
              </button>
              ) : ('')
            }
          </div>
          <div className="sk-raffle sk-flex sk-column">
            { raffles && raffles.length > 0 ?
              raffles.map( raf => {
                let {
                  type, 
                  title, 
                  winnersCount, 
                  maxParticipants, 
                  cost, 
                  collectionName, 
                  collectionAddress, 
                  startTimestamp, 
                  endTimestamp, 
                  description,
                  participants,
                  winners
                } = raf
                /*let raffleDuration = raf.finish - ( new Date() / 1000 );
                let raffleStart = raf.start - ( new Date() / 1000 );
                let raffleDurationDate = formatDate(raffleDuration);*/
                let currentTimestamp = parseInt( new Date( ).getTime() / 1000 )
                let raffleDuration = currentTimestamp < endTimestamp ? endTimestamp - currentTimestamp : 0
                let raffleDurationFormatted = formatDate(raffleDuration)
                console.log(
                  currentTimestamp,
                  raffleDuration,
                  raffleDurationFormatted
                )
                let raffleStart = 0;
                let raffleDurationDate = 0;
                
                return (
                  <div className="sk-raffle-item sk-flex sk-row" >
                    <div className="wd-22">
                      <img src={Coins} className="img-raffle" />
                    </div>
                    <div className="raffle-box-1 wd-44 sk-flex sk-column">
                        <span className="sk-raffle-details">
                          { `${type > 0 ? `Fast Raffle ${type}%` : 'Normal Raffle'} | ${winnersCount} Winners | ${ maxParticipants ? `${participants}/${maxParticipants}` : participants } Participants` }
                        </span>
                        <h3>{title}</h3>
                        <p>
                          {description} 
                        </p>
                    </div>
                    {

                      winners && winners.length ?
                        (
                          <div className="raffle-box-2 wd-33">
                            <p>Started: {startTimestamp}</p>
                            <p>Ended: {endTimestamp}</p>
                            <button 
                              className="skull-button winners-button" 
                              onClick={ () => { openModal(raf) } } 
                            >
                              View Winners
                            </button>
                          </div>
                        ) : (
                          <div className="raffle-box-2 wd-33">
                            <p>Cost: { cost }<img src={Grave} className="skull-icon" /></p>
                            <p>Ending in: {raffleDurationFormatted.days}d {raffleDurationFormatted.hours}h {raffleDurationFormatted.minutes}m <FontAwesomeIcon icon={faHourglassHalf} /></p>
                            <button 
                              className="skull-button winners-button" 
                              onClick={ () => { participateRaffle(raf.id) } }
                            >
                              Participate
                            </button>
                          </div>
                        )
                    }
                  </div>
                )
              }) :
                ('')
              }
          </div>
        </div>
      </div>
    </>
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

export default Raffle;
