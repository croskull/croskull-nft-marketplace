import React, { Component } from "react";
import './Tavern.css';
import banner2 from './ice-bonefire.jpg';
import token from './token.png';
import tavern from './tavern.jpg';
import boccale from './boccale.png';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDungeon} from '@fortawesome/free-solid-svg-icons';
import { faCoins} from '@fortawesome/free-solid-svg-icons';
import { LazyLoadImage, trackWindowScroll } from "react-lazy-load-image-component";

class Tavern extends Component {
  constructor(props) {
    super(props);
    this.state = {
      croSkulls: [1, 2, 3, 4, 5, 6, 7, 8,
        9, 10, 11, 12, 13, 14, 15],
      selectTavernCr: [],
      selectMissionCr: [],
      imgUri: "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"

    };

  }

  selectTavernCr(e) {
    if (this.state.selectTavernCr.includes(e)) {
      for (var i = 0; i < this.state.selectTavernCr.length; i++) {
        if (this.state.selectTavernCr[i] == e) {
          this.state.selectTavernCr.splice(i, 1);
        }
      }
    }
    else {
      this.state.selectTavernCr.push(e);
    }
  };


  sendSelected() {
    this.state.selectTavernCr.map(cr => {
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

    return (
      <div className="container-fluid tavern">
          <div className="container">
            <div className="row head">
              <div className="col-sm-10">
                <h1>Your CroSkull: {this.state.croSkulls.length}</h1>
              </div>
              <div className="col-sm-2">
              <button className="btn btn-sm btn-warning ml-auto rounded"> <FontAwesomeIcon icon={faDungeon} /> Adventure</button>
              </div>
            </div>
            <div style={{overflowX: 'auto'}}>
              <div className="row flex-row flex-nowrap">
                {
                  (this.state.croSkulls).map((cr, index) => {
                    if (index < (this.state.croSkulls.length / 2)) {
                      return (
                        <div key={cr} className='col-sm-3' >
                          <div className={this.state.selectTavernCr.includes(cr) ? 'selected div-skull ' : 'div-skull'} style={{ backgroundImage: 'url(' + this.state.imgUri + cr + '.png)' }}  onClick={() => this.selectTavernCr(cr)}>
                            <span class="badge badge-dark rounded">#{cr}</span>
                            <div className="d-flex">
                              <button className="btn btn-sm btn-danger rounded"> <FontAwesomeIcon icon={faCoins} /> Sell</button>
                              <button className="btn btn-sm btn-warning ml-auto rounded"> <FontAwesomeIcon icon={faDungeon} /> Adventure</button>
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
                          <div className={this.state.selectTavernCr.includes(cr) ? 'selected div-skull ' : 'div-skull'} style={{ backgroundImage: 'url(' + this.state.imgUri + cr + '.png)' }}  onClick={() => this.selectTavernCr(cr)}>
                            <span class="badge badge-dark rounded">#{cr}</span>
                            <div className="row d-flex">
                              <button className="btn btn-sm btn-danger rounded"> <FontAwesomeIcon icon={faCoins} /> Sell</button>
                              <button className="btn btn-sm btn-warning ml-auto rounded"> <FontAwesomeIcon icon={faDungeon} /> Adventure</button>
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
              <button className="btn btn-sm btn-success rounded" onClick={() => this.sendAll()}>Send All</button>
              <button className="btn btn-sm btn-success rounded" hidden={(this.state.selectTavernCr.length > 0 ? false : true)} onClick={() => this.sendSelected()}>Send Selected</button>
            </div>

          </div>
          </div>
    );
  }
}

export default Tavern;
