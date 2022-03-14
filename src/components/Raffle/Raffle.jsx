import React, { useEffect, useState } from "react";

import "react-quill/dist/quill.snow.css";
import coins from "./coins.png";
import './Raffle.css';
import Grave from "../Navbar/grave.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import MetricContainer from "../MetricContainer/MetricContainer";
import Soul from "../Navbar/soul.png";
import Rune from "../Navbar/grave-burn.png";
import Coins from "./coins.png";
const ipfsUri480 = "https://croskull.mypinata.cloud/ipfs/QmWu9bKunKbv8Kkq8wEWGpCaW47oMBbH6ep4ZWBzAxHtgj/";
const ipfsUri128 = "https://croskull.mypinata.cloud/ipfs/QmZn1HvYE1o1J8LhNpxFTj5k8LQb2bWT49YvbrhB3r19Xx/";

const Raffle = ({ accountAddress }) => {
  const raf1 = {
    type: "Crazy-Raffle",
    title: "First Raffle",
    nWinners: 2,
    nPart: 276,
    cost: 5,
    win: 1000,
    coin: 'Soul',
    start: new Date(2022, 1, 12),
    finish: new Date(2022, 1, 25),
    partecipants: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    winners: [1, 3],
    text: 'Join now this amazing raffle in partnership with MM.Finance.',
  }

  const raf2 = {
    type: "Normal-Raffle",
    title: "Second Raffle",
    nWinners: 5,
    nPart: 1000,
    cost: 5,
    win: 2000,
    coin: 'Grave',
    start: new Date(2022, 2, 12),
    finish: new Date(2022, 2, 25),
    partecipants: [],
    winners: [],
    text: 'Join now this amazing raffle in partnership with MM.Finance.',
  }

  const raf3 = {
    type: "Normal-Raffle",
    title: "Thrid Raffle",
    nWinners: 5,
    nPart: 10000,
    cost: 10,
    win: 20000,
    coin: 'Rude',
    start: new Date(2022, 3, 1),
    finish: new Date(2022, 3, 13),
    partecipants: [],
    winners: [],
    text: 'Join now this amazing raffle in partnership with MM.Finance.',
  }

  const [modalState, setModalState] = useState({
    winners: [],
    prize: 1,
  });


  const openModal = (raf) => {
    setModalState({
      winners: raf.winners,
      prize: raf.win / raf.nWinners
    })
    let modal = document.getElementById("modal-winners");
    modal.style.display = "block";

  }
  const closeModal = () => {
    let modal = document.getElementById("modal-winners");
    modal.style.display = "none";
  }
  const rafs = [raf1, raf2, raf3, raf2, raf1, raf2, raf1, raf2, raf1, raf2, raf1, raf2];

  const DAY_IN_SEC = 60 * 60 * 24 * 1000;
  const HUNDRED_DAYS_IN_SEC = 100 * DAY_IN_SEC//100 * DAY_IN_SEC;
  const formatDate = (timestamp) => {
    console.log(timestamp);
    let tsHours = timestamp / 60 / 60 / 1000
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



  return (

    <>
      <div className="modal" id="modal-winners">
        <div className="modal-w-content">
          <div className="sk-box">
            <span class="close-btn" onClick={() => { closeModal() }}>&times;</span>
            {
              modalState.winners.map(winner => {
                return (
                  <div>
                    {winner} wins {modalState.prize} coins;
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
      <div className="sk-container sk-row" style={{ overflow: 'hidden' }}>
        <div className="sk-box sk-column sk-raffle">
          <h3>Raffle Time!</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eget urna ex. Etiam eleifend interdum lobortis. Morbi laoreet purus sed felis semper posuere.
          </p>
          <div className="sk-raffle">
            {(rafs.map(raf => {
              let raffleDuration = raf.finish - new Date();
              let raffleStart = raf.start - new Date();
              let raffleDurationDate = formatDate(raffleDuration);
              return (
                <div className="sk-raffle-item sk-flex sk-row" >
                  <div className="wd-22">
                    <img src={Coins} className="img-raffle" />
                  </div>
                  <div className="raffle-box-1 wd-44">
                    <div  >
                      <h5>{raf.type} <FontAwesomeIcon icon={faQuestionCircle} title={raf.type.includes('Normal') ? normalDesc : crazyDesc} /> |
                        | N-Winners: {raf.nWinners} | N-Partecipants: {raf.nPart}</h5>
                      <h3>{raf.title}</h3>
                      <hr></hr>
                      <p>
                        {raf.text} {raf.win} <img src={
                          raf.coin.includes("Grave") ? Grave :
                            raf.coin.includes("Soul") ? Soul :
                              Rune} className="skull-icon" /> will be airdropped!
                      </p>
                    </div>
                  </div>
                  {
                    raffleDuration > 0 ?
                      (
                        raffleStart < 0 ?
                          <div className="raffle-box-2 wd-33">
                            <p>Cost: 5<img src={Grave} className="skull-icon" /></p>
                            <p>Ending in: {raffleDurationDate.days}D {raffleDurationDate.hours}H {raffleDurationDate.minutes}M <FontAwesomeIcon icon={faHourglassHalf} /></p>
                            {
                              raf.partecipants.includes(accountAddress) ?
                                <button className="skull-button joined-button">Alredy joined</button>
                                :
                                <button className="partecipate-button skull-button " >Partecipate</button>
                            }
                          </div>
                          :
                          <div className="raffle-box-2 wd-33" >
                            <p>Start: {raf.start.toLocaleDateString("en-US")}</p>
                            <p>End: {raf.finish.toLocaleDateString("en-US")}</p>
                            <button className="skull-button soon-button" disabled>Soon!</button>
                          </div>
                      )
                      :
                      <div className="raffle-box-2 wd-33">
                        <p>Started: {raf.start.toLocaleDateString("en-US")}</p>
                        <p>Ended: {raf.finish.toLocaleDateString("en-US")}</p>

                        <button className="skull-button winners-button" onClick={() => { openModal(raf) }}>View Winners</button>
                      </div>
                  }
                </div>
              )
            }))}
          </div>

        </div>

      </div>
    </>
  )
}


export default Raffle;
