import React, { Component } from "react";
import './Tavern.css';
import banner2 from './ice-bonefire.jpg';
import token from './token.png';
import tavern from './tavern.jpg';
import boccale from './boccale.png';
import { Link } from "react-router-dom";
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

      <div className="container-fluid" style={{ marginTop: '1%' }}>
        <div className="row">
          <div className="col-6">

            <div className="row header">
              <div className="col-4 tavern-title" >
                <h1>Tavern</h1>
              </div>
              <div className="col-8 skull-in-tavern" >
                <h3>croskull in tavern: {this.props.totalTokensOwnedByAccount}</h3>
              </div>
            </div>

            <div className="tavern-container">
              <div className="row flex-row flex-nowrap">
                {
                  (this.state.croSkulls).map((cr, index) => {
                    if (index < (this.state.croSkulls.length / 2)) {
                      return (
                        <div className="col-3" key={cr} >
                          <div className={this.state.selectTavernCr.includes(cr) ? 'selected div-skull' : 'div-skull'}>
                            <p>#{cr}</p>
                            <img src={this.state.imgUri + cr + ".png"}
                              onClick={() => this.selectTavernCr(cr)}
                              className={this.state.selectTavernCr.includes(cr) ? 'selected img-skull' : 'img-skull'}></img>
                              <img src={boccale} className="boc-img"/>
                            <button className="to-adventure-button btn btn-2 btn-sm rounded">Send On Adventure</button>
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
                        <div className="col-3" key={cr} >
                          <div className={this.state.selectTavernCr.includes(cr) ? 'selected div-skull' : 'div-skull'}>
                            <p>#{cr}</p>
                            <img src={this.state.imgUri + cr + ".png"}
                              onClick={() => this.selectTavernCr(cr)}
                              className={this.state.selectTavernCr.includes(cr) ? 'selected img-skull' : 'img-skull'}></img>
                              <img src={boccale} className="boc-img"/>
                            <button className="to-adventure-button btn btn-2 btn-sm rounded" onClick={() => this.sendSingle(cr)}>Send  On Adventure</button>
                          </div>
                        </div>
                      );
                    }
                  })
                }
              </div>
            </div>
            <div className="div-button">
              <button className="btn btn-2 rounded" onClick={() => this.sendAll()}>Send All</button>
              <button className="btn btn-2 rounded" hidden={(this.state.selectTavernCr.length > 0 ? false : true)} onClick={() => this.sendSelected()}>Send Selected</button>
            </div>
          </div>


          <div className="col-6">

            <div className="container-data">
              <img src={tavern} width={"100%"} style={{borderRadius: '15px 15px 0 0 '}}/>
              <div className="row align-items-center row-data">
                <div className="col-4">
                  <p>Your CroSkull In Adventure: 20</p>
                </div>
                <div className="col-4">
                  <img src={token} className="adventure-token-img"></img>
                  <p>Grave Earned: 20</p>
                </div>
                <div className="col-4">
                  <img src={token} className="adventure-token-img"></img>
                  <p>Souls Earned: 20</p>
                </div>
              </div>
            </div>

            <div className="global-data">

              <h3>GLOBAL STAT</h3>
              <div className="row">
                <div className="col-4">
                  <div className="global-stat rounded">
                    <img src={banner2} className="rounded"></img>
                    <p>Total Skull In Mission</p>
                    <div class="progress">
                      <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style={{ width: 10 * 2 + '%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"> {10 * 2}% </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="global-stat rounded">
                    <img src={banner2} className="rounded"></img>
                    <p>Total Supply Earned</p>
                    <div class="progress">
                      <div class="progress-bar progress-bar-striped bg-warning" role="progressbar" style={{ width: 10 * 4 + '%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"> {10 * 4}% </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="global-stat rounded">
                    <img src={banner2} className="rounded"></img>
                    <p>Total Supply Burned</p>
                    <div class="progress">
                      <div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style={{ width: 10 * 7 + '%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"> {10 * 7}% </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="div-data-button">
              <Link to="/adventure" className="btn btn-2 rounded">
                Adventure
              </Link>
              </div>

            </div>

          </div>

        </div>
        <div class="card">
  Magic Card
</div>
      </div>
    );
  }
}

export default Tavern;
