import React, { Component } from "react";
import randomSkullsGif from "./random-skulls.gif"
import './MintPage.css';
import { LazyLoadImage } from "react-lazy-load-image-component";

class MintPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mintAmount: 1,
      mintCost: 1,
    };
  }


  totalCost = (_mintAmount) => { 
    return this.props.croSkullsCost * _mintAmount
  };

  componentDidMount = async () => {
    await this.props.setMintBtnTimer();
  };

  callMintMyNFTFromApp = (e) => {
    e.preventDefault();
    this.props.mintMyNFT(
      this.state.mintAmount
    );
  };

  render() {
    let { 
      croSkullsCount,
      croSkullsMaxSupply,
      croSkullsCost,
      isAddressWhitelisted
    } = this.props.state;

    let {
      mintAmount,
      mintCost
    } = this.state;

    return (
      <div className="container">
            <p className="fp-title">Mint your CroSkull NFT</p>
        <form onSubmit={this.callMintMyNFTFromApp} className="pt-4 mt-1">
          <div className="row">
            <div className="col-md-6">
              <LazyLoadImage
                src={randomSkullsGif}
                width="100%"
                height="100%"
              />
            </div>
            <div className="mint-wrapper col-md-6">
              <div className="fp-text">
                <p>Get now your <b>blockchain-unique CroSkull NFT</b> out of 6666 possibile Skulls with unique traits and dna.</p>
                <p>Collet at least <b>3 CroSkulls</b> to be eligibility for the free-AirDrop of a <b>1/1 Potion Mystery Box</b>. <b>Mystery Box</b> will return you a <b>Potion</b>, you can use Potions to Mint CroSkull+ and revieve $SkullLP Token Rewards.</p>
              </div>
              { isAddressWhitelisted ? (
                <div>
                  <div className="mint-action">
                    <div>
                      <label htmlFor="amount" className="fp-text-m">Mint amount</label>
                      <input
                        required
                        type="number"
                        name="amount"
                        id="mintAmount"
                        max="20"
                        value={mintAmount || 1 }
                        className="form-control"
                        placeholder="Enter Amount" 
                        style={{ color: 'black' }}
                        onChange={(e) =>
                          this.setState({ mintAmount: e.target.value })
                        }
                      />
                    </div>
                    <button
                      id="mintBt"
                      style={{fontSize: "0.9rem", letterSpacing: "0.14rem"  }}
                      type="submit"
                      className="btn mt-4 btn-block btn-outline-success elite"
                    >
                      Mint CroSkull
                      { mintAmount > 1 ? 
                      `s (${mintAmount})` : 
                      ` (${mintAmount})`}
                    </button>
                  </div>
                  <div className="vertical">
                    <span className="cost-label" className="fp-text-m">Mint Cost (excluded network fees) </span>
                    <span className="cost-value" className="fp-text-m">
                      { mintAmount > 0 && croSkullsCost ? 
                        `${this.totalCost(mintAmount)} Ξ` 
                      : ``}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="alert alert-info elite" >
                      <strong>{ `${croSkullsCount} / ${croSkullsMaxSupply}` } CroSkull{ croSkullsCount > 1 ? 's' : '' } Minted</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert error alert-info elite">
                  <strong>Your address is not Whitelisted! </strong>
                </div>
              ) }
              
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default MintPage;
