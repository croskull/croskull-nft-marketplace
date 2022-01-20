import React, { Component } from "react";
import './CroskullAdventure.css';
import banner1 from './bonefire.jpg';
import banner2 from './ice-bonefire.jpg';
import token from './token.png';
import cave from './cave.png';
import fire from './fire.png';
import sword from './attack.png';
import { Link } from "react-router-dom";
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

      <div className="container-fluid" style={{ marginTop: '1%' }}>
        <div className="row">
          <div className="col-6">

            <div className="header-adventure">
              <div className="row">
                <div className="col-4 adventure-title" >
                  <h1>Adventure</h1>
                </div>
                <div className="col-8 skull-in-adventure" >
                  <h3>croskull in Adventure: {this.props.totalTokensOwnedByAccount}</h3>
                </div>
              </div>
            </div>

            <div className="adventure-container">
              <div className="row flex-row flex-nowrap">
                {
                  (this.state.croSkulls).map((cr, index) => {
                    if (index < (this.state.croSkulls.length / 2)) {
                      return (
                        <div className="col-3" key={cr} >
                          <div className={this.state.selectAdventureCr.includes(cr) ? 'selected div-skull' : 'div-skull'}>
                            <p>#{cr}</p>
                            <img src={this.state.imgUri + cr + ".png"}
                              onClick={() => this.selectAdventureCr(cr)}
                              className={this.state.selectAdventureCr.includes(cr) ? 'selected img-skull' : 'img-skull'}></img>
                            <img src={sword} className="sword-img"></img>
                            <button className="btn btn-info btn-sm to-tavern-button">Send To Tavern</button>
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
                          <div className={this.state.selectAdventureCr.includes(cr) ? 'selected div-skull' : 'div-skull'}>
                            <p>  #{cr}</p>
                            <img src={this.state.imgUri + cr + ".png"}
                              onClick={() => this.selectAdventureCr(cr)}
                              className={this.state.selectAdventureCr.includes(cr) ? 'selected img-skull' : 'img-skull'}></img>
                            <img src={sword} className="sword-img"></img>
                            <button className="btn btn-info btn-sm rounded to-tavern-button" onClick={() => this.sendSingle(cr)}>Send To Tavern</button>
                          </div>
                        </div>
                      );
                    }
                  })
                }
              </div>
            </div>
            <div className="div-button">
              <button className="btn btn-info rounded" onClick={() => this.sendAll()}>Send All</button>
              <button className="btn btn-info rounded" hidden={(this.state.selectAdventureCr.length > 0 ? false : true)} onClick={() => this.sendSelected()}>Send Selected</button>
            </div>
          </div>


          <div className="col-6">

            <div className="container-data">
              <img src={cave} width={"100%"} style={{ borderRadius: '15px 15px 0 0' }} />
              <div className="row align-items-center row-data">
                <div className="col-6">
                  <img src={fire} className="fire-token-img"></img>
                  <p>Burn Malus: {malus}%</p>
                  <div class="progress malus">
                    <div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style={{ width: malus + '%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"> {malus}% </div>
                  </div>
                </div>
                <div className="col-3 align-items-center">
                  <img src={token} className="adventure-token-img"></img>
                  <p>Grave Earned: 20</p>
                </div>
                <div className="col-3 align-items-center">
                  <img src={token} className="adventure-token-img"></img>
                  <p>Souls Earned: 20</p>
                </div>
              </div>
            </div>

            <div className="info-data">

              <h3>Info Box</h3>
              <div className="info-box">
                <p className="left-text">Start-Date:{this.state.startDate.getDate()}/{this.state.startDate.getMonth() + 1}/{this.state.startDate.getFullYear()}
                  <span><p>End-Date:{this.state.endDate.getDate()}/{this.state.endDate.getMonth() + 1}/{this.state.endDate.getFullYear()}</p></span>
                </p>

                <div class="progress">
                  <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style={{ width: timeElapsed + '%' }} aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"> {timeElapsed}% </div>
                </div>
              </div>
              <div class="accordion" id="accordionDetails">
                <div className="div-details">
                  <h4  data-toggle="collapse" data-target="#collapseOne">
                    Details
                  </h4>
                 

                  <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordionDetails">
                    <p>Since the beginning of the adventure you have earned:</p>
                    <p>Since the beginning of the adventure you have burned:</p>
                    <p>Since the beginning of the adventure you have claimed:</p>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <button className="claim-button btn btn-warning rounded">Claim</button>
                </div>
                <div className="col-6" style={{ textAlign: 'right' }}>
                  <Link to="/tavern" className="tavern-button btn btn-info rounded">
                    Tavern
                  </Link>
                </div>
              </div>


            </div>

          </div>

        </div>
      </div>

    );
  }
}

export default CroskullAdventure;
