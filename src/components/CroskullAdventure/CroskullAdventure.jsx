import React, { Component } from "react";
import './CroskullAdventure.css';
import banner1 from './bonefire.jpg';
import banner2 from './ice-bonefire.jpg';
import token from './token.png';
import { LazyLoadImage, trackWindowScroll } from "react-lazy-load-image-component";

class CroskullAdventure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'd',
      croSkulls: [1,2,3,4],
      selectTavernCr: [],
      selectMissionCr: [],
      croSkullsStaked: [5,6,7,8],
      imgUri: "https://bafybeifax734esbihweq543p5jldhwj4djszkrevo6u7tig4xlorihx53m.ipfs.infura-ipfs.io/"

    };

    if(window.innerWidth <768)
    {
      this.state.view = 'm';
    }
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

  selectMissionCr(e) {
    if (this.state.selectMissionCr.includes(e)) {
      for (var i = 0; i < this.state.selectMissionCr.length; i++) {
        if (this.state.selectMissionCr[i] == e) {
          this.state.selectMissionCr.splice(i, 1);
        }
      }
    }
    else {
      this.state.selectMissionCr.push(e);
    }
  };

  toTavern(){
    var temp = this.state.croSkullsStaked[this.state.croSkullsStaked.length-1];
    this.state.croSkulls.push(temp);
    this.state.croSkullsStaked.pop();
    this.setState({selectMissionCr: []});
  }

  toMission(){
    var temp = this.state.croSkulls[this.state.croSkulls.length-1];
    this.state.croSkullsStaked.push(temp);
    this.state.croSkulls.pop();
    this.setState({ selectTavernCr: [] });
  };

  
  render() {

    return (
      <div className="container">
        <h1 className="adventure-title">CroSkull Adventure</h1>
        <img src={banner1} className="adventure-banner"></img>

        <div className="accordion tavern-container " id="accordionBench">
                    <h1 data-toggle="collapse" data-target="#collapseTavern" aria-expanded="true" aria-controls="collapseTavern">Tavern</h1>
              <div id="collapseTavern" className="collapse" aria-labelledby="headingOne" data-parent="#accordionBench">
                <div className="card-body">
                  <div className={"row " + (this.state.view === 'm' ? 'tavern-mobile-row' : 'tavern-desktop-row')} >
                  {
                    (this.state.croSkulls).map(cr =>{
                      return(
                      <div className="col-sm-4" key={cr} >
                        <div >
                          <img src={this.state.imgUri+cr+".png"} 
                          className={this.state.selectTavernCr.includes(cr) ? 'selected-card' : 'img-card'} 
                          onClick={() => this.selectTavernCr(cr)}></img>
                        </div>
                      </div>
                      );
                    })
                    }
                  </div>
                </div>
                <button type="button" class="btn btn-outline-info btn-sm" onClick={() => this.toMission()} disabled={(this.state.selectTavernCr.length == 0 ? true: false)}>To Mission</button>
              </div>
          </div>

        <div className="adventure-container">
          <div className="pool-container">
            <h1>Adventure Pool</h1>
            <div className="row">

              <div className="col-sm-4">
                  <img src={token} className="adventure-token-img"></img>
                  <h3>BONES</h3>
                  <p>CroSkull.com</p>
              </div>
              <hr></hr>
              <div className="col-sm-4 ca-dd">
                <h3>0 BONES</h3>
                <p>Daily Distrubution</p>
              </div>
            </div>
          </div>

          <img src={banner2} className="adventure-banner"></img>



          <div class="accordion mission-container" id="accordionMission">

                    <h1 data-toggle="collapse" data-target="#collapseMission" aria-expanded="true" aria-controls="collapseMission">Skulls in Mission</h1>

              <div id="collapseMission" class="collapse" aria-labelledby="headingOne" data-parent="#accordionMission">
                <div class="card-body">
                  <div className={"row " + (this.state.view === 'm' ? 'mission-mobile-row' : 'mission-desktop-row')}>
                  {
                    (this.state.croSkullsStaked).map(cr =>{
                      return(
                      <div className="col-sm-4" key={cr} >
                        <div >
                          <img src={this.state.imgUri+cr+".png"} className={this.state.selectMissionCr.includes(cr) ? 'selected-card' : 'img-card'} onClick={() => this.selectMissionCr(cr)}></img>
                        </div>
                      </div>
                      );
                    })
                    }
                </div>
                </div>
                <button type="button" class="btn btn-outline-info btn-sm" onClick={() => this.toTavern()} disabled={(this.state.selectMissionCr.length == 0 ? true: false)}>To Tavern</button>
              </div>
          </div>

          <div className="reward-container">
            <h4>Mining Rate</h4>
            <div className="reward">
              <img src={token} /><span>0 Bones</span>
            </div>
            <p>1000 Hash Power ≈ X Skull / Y Days</p>
            <button type="button" class="btn btn-outline-warning btn-sm">Claim</button>
          </div>

        </div>
      </div>
    );
  }
}

export default CroskullAdventure;
