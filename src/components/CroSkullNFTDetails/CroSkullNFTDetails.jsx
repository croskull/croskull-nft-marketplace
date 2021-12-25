import React, { Component } from "react";

class CroSkullNFTDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newCroSkullPrice: "",
    };
  }

  callChangeTokenPriceFromApp = (tokenId, newPrice) => {
    this.props.changeTokenPrice(tokenId, newPrice);
  };

  render() {

    let {croskull} = this.props
    if(this.props.toggleForSale || this.props.accountAddress == this.props.croskull.currentOwner)
    {
    return (
     
      <div key={this.props.croskull.tokenId.toNumber()} className=" vertical skullItem-details">
        <div>
          {this.props.accountAddress === this.props.croskull.currentOwner ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                this.callChangeTokenPriceFromApp(
                  this.props.croskull.tokenId.toNumber(),
                  this.state.newCroSkullPrice
                );
              }}
            >
              <div className="form-group mt-4 ">
                <label htmlFor="newCroSkullPrice">
                  <span className="font-weight-bold">Change Token Price</span> :
                </label>{" "}
                <input
                  required
                  type="number"
                  name="newCroSkullPrice"
                  id="newCroSkullPrice"
                  value={this.state.newCroSkullPrice}
                  className="form-control w-100"
                  placeholder="Enter new price"
                  onChange={(e) =>
                    this.setState({
                      newCroSkullPrice: e.target.value,
                    })
                  }
                />
              </div>
              <button
                type="submit"
                style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                className="btn btn-outline-info mt-0 w-100"
              >
                Change price
              </button>
            </form>
          ) : null}
        </div>
        <div>
          {this.props.accountAddress === this.props.croskull.currentOwner ? (
            this.props.croskull.forSale ? (
              <button
                className="btn btn-outline-danger mt-4 w-100"
                style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                onClick={() =>
                  this.props.toggleForSale(
                    this.props.croskull.tokenId.toNumber()
                  )
                }
              >
                Remove from sale
              </button>
            ) : (
              <button
                className="btn btn-outline-success mt-4 w-100"
                style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                onClick={() =>
                  this.props.toggleForSale(
                    this.props.croskull.tokenId.toNumber()
                  )
                }
              >
                Keep for sale
              </button>
            )
          ) : null}
        </div>
        <div>
          {this.props.accountAddress !== this.props.croskull.currentOwner ? (
            this.props.croskull.forSale ? (
              <button
                className="btn btn-outline-primary mt-3 w-100"
                value={this.props.croskull.price}
                style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                onClick={(e) =>
                  this.props.buyCroSkull(
                    this.props.croskull.tokenId.toNumber(),
                    e.target.value
                  )
                }
              >
                Buy For{" "}
                {window.web3.utils.fromWei(
                  this.props.croskull.price.toString(),
                  "Ether"
                )}{" "}
                Ξ
              </button>
            ) : (
              <>
                <p className="mt-2">Currently not for sale!</p>
              </>
            )
          ) : null}
        </div>
      </div>
    );}
    else{
      return null;
    }

  }
}

export default CroSkullNFTDetails;
