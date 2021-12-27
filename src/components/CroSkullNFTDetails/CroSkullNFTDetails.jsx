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

    let {croskull, accountAddress, toggleForSale} = this.props
    if( toggleForSale || accountAddress === croskull.currentOwner){
    return (
      <div key={croskull.tokenId.toNumber()} className=" vertical skullItem-details">
        <div>
          {accountAddress === croskull.currentOwner ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                this.callChangeTokenPriceFromApp(
                  croskull.tokenId.toNumber(),
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
          {accountAddress === croskull.currentOwner ? (
            croskull.forSale ? (
              <button
                className="btn btn-outline-danger mt-4 w-100"
                style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                onClick={() =>
                  this.props.toggleForSale(
                    croskull.tokenId.toNumber()
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
                    croskull.tokenId.toNumber()
                  )
                }
              >
                Keep for sale
              </button>
            )
          ) : null}
        </div>
        <div>
          {accountAddress !== croskull.currentOwner ? (
            croskull.forSale ? (
              <button
                className="btn btn-outline-primary mt-3 w-100"
                value={croskull.price}
                style={{ fontSize: "0.8rem", letterSpacing: "0.14rem" }}
                onClick={(e) =>
                  this.props.buyCroSkull(
                    croskull.tokenId.toNumber(),
                    e.target.value
                  )
                }
              >
                Buy For{" "}
                {window.web3.utils.fromWei(
                  croskull.price.toString(),
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
