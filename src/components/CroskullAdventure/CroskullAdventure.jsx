import React, { Component } from "react";
import './CroskullAdventure.css';
import banner1 from './bonefire.jpg';
import banner2 from './ice-bonefire.jpg';
import token from './token.png';
import cave from './cave.png';
import fire from './fire.png';
import sword from './attack.png';
import title from './title.png';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faDungeon } from '@fortawesome/free-solid-svg-icons';
import { faBeer } from '@fortawesome/free-solid-svg-icons';
import { faFireAlt } from '@fortawesome/free-solid-svg-icons';
import { faGhost } from '@fortawesome/free-solid-svg-icons';
import { faSkull } from '@fortawesome/free-solid-svg-icons';
import { faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { faRunning } from "@fortawesome/free-solid-svg-icons";
import { LazyLoadImage, trackWindowScroll } from "react-lazy-load-image-component";

class CroskullAdventure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      croSkulls: [1, 2, 3, 4, 5, 6, 7, 8,
        9, 10, 11, 12, 13, 14, 15],
      selectAdventureCr: [],
      imgUri: "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/",
      startDate: new Date("2022-01-10"),
      endDate: new Date("2022-03-10")

    };

  }

  selectAdventureCr(e) {
    if (this.state.selectAdventureCr.includes(e)) {
      for (var i = 0; i < this.state.selectAdventureCr.length; i++) {
        if (this.state.selectAdventureCr[i] == e) {
          this.state.selectAdventureCr.splice(i, 1);
        }
      }
    }
    else {
      this.state.selectAdventureCr.push(e);
    }
  };

  sendSelected() {
    this.state.selectAdventureCr.map(cr => {
      console.log(cr);
    })
  };

  sendAll() {
    (this.state.croSkulls).map(cr => {
      console.log(cr);
    })
  };

  sendSingle(cr) {
    console.log(cr);
  };



  render() {
    const malusDay = 20;
    var malus = Math.trunc(100 - (new Date().getTime() - this.state.startDate.getTime()) / (1000 * 3600 * 24) / malusDay * 100);
    if (malus < 0)
      malus = 0;
    var timeElapsed = Math.trunc((new Date().getTime() - this.state.startDate.getTime()) / (this.state.endDate.getTime() - this.state.startDate.getTime()) * 100);

    return (

      <div className="container-fluid adventure">
        <div className="row">
          <div className="col-sm-6 skulls-container">
            <div className="row head">
              <div className="col-sm-10">
                <h1>Your CroSkull: {this.state.croSkulls.length}</h1>
              </div>
              <div className="col-sm-2">
                <button className="btn btn-sm btn-warning ml-auto rounded"> <FontAwesomeIcon icon={faBeer} /> Tavern</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div className="row flex-row flex-nowrap">
                {
                  (this.state.croSkulls).map((cr, index) => {
                    if (index < (this.state.croSkulls.length / 2)) {
                      return (
                        <div key={cr} className='col-sm-3' >
                          <div className={this.state.selectAdventureCr.includes(cr) ? 'selected div-skull ' : 'div-skull'} style={{ backgroundImage: 'url(' + this.state.imgUri + cr + '.png)' }} onClick={() => this.selectAdventureCr(cr)}>
                            <span class="badge badge-dark rounded">#{cr}</span>
                            <div className="d-flex">
                              <button className="btn btn-sm btn-danger rounded"> <FontAwesomeIcon icon={faRunning} /> Retire</button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })
                }
              </div>

              <div className="row flex-row flex-nowrap">
                {
                  (this.state.croSkulls).map((cr, index) => {
                    if (index >= (this.state.croSkulls.length / 2)) {
                      return (
                        <div key={cr} className='col-sm-3' >
                          <div className={this.state.selectAdventureCr.includes(cr) ? 'selected div-skull ' : 'div-skull'} style={{ backgroundImage: 'url(' + this.state.imgUri + cr + '.png)' }} onClick={() => this.selectAdventureCr(cr)}>
                            <span class="badge badge-dark rounded">#{cr}</span>
                            <div className="row d-flex">
                              <button className="btn btn-sm btn-danger rounded"> <FontAwesomeIcon icon={faRunning} /> Retire</button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })
                }
              </div>
            </div>


            <div className="div-button">
              <button className="btn btn-sm btn-success rounded" onClick={() => this.sendAll()}>Retire All</button>
              <button className="btn btn-sm btn-success rounded" hidden={(this.state.selectAdventureCr.length > 0 ? false : true)} onClick={() => this.sendSelected()}>Retire Selected</button>
            </div>
          </div>

          <div className="col-sm-5 details-container">
            <img src={title} width={'75%'} />
            <h1>Chilling Reign</h1>

            <div className="data-container">
              <div className="season-container">
                <FontAwesomeIcon icon={faDungeon} id="dungeon-icon" size="2x" />
                Season Durantion:
                <div class="progress">
                  <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style={{ width: timeElapsed + '%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"> {timeElapsed}% </div>
                </div>
              </div>
              <div className="malus-container">
                <FontAwesomeIcon icon={faFireAlt} id="burn-icon" size="2x" />
                Burn Malus:
                <div class="progress">
                  <div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style={{ width: malus + '%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"> {malus}% </div>
                </div>
              </div>

              <div className="graves-container">
                <FontAwesomeIcon icon={faSkullCrossbones} id="token-icon" size="2x" />
                719(1039)
                <br></br>
                Graves Earned
              </div>
              <div className="claim-container">
                <FontAwesomeIcon icon={faSkull} id="token-icon" size="2x" />
                4392
                <br></br>
                Graves Already Claimed
              </div>
              <div className="souls-container">
                <FontAwesomeIcon icon={faGhost} id="token-icon" size="2x" />
                9
                <br></br>
                Souls Generated
              </div>

              <button className="btn btn-sm btn-warning claim-button">Claim</button>
            </div>

          </div>

        </div>
      </div>


    );
  }
}

export default CroskullAdventure;
