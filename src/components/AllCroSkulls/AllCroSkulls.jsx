import React, { Component } from "react";
import CroSkullList from "../CroSkullsList/CroSkullsList";
import FilterBar from "../FilterBar/FilterBar";
import Select from "react-select";
import './AllCroSkulls.css';


class AllCroSkulls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountAddress: this.props.accountAddress,
      croSkullsCount: this.props.croSkullsCount,
      changeTokenPrice: this.props.changeTokenPrice,
      toggleForSale: this.props.toggleForSale,
      buyCroSkull: this.props.buyCroSkull,
      loading: this.props.loading,
      traits: this.props.traits,
      traitsTypes: this.props.traitsTypes,
      order: this.props.order
    };
    this.handleOrderChange = this.props.handleOrderChange;
    this.handleFilterBar = this.props.handleFilterBar;
    this.resetFilter = this.props.resetFilter;
    this.priceOptions = [
      { value: 'ASC', label: 'Price ASC' },
      { value: 'DESC' , label: 'Price DESC' }
    ];
  }

  componentDidMount  ( ) {
    /*if( this.props.croSkulls[0].metaData !== 0)
    this.setState( {marketPlaceView: this.props.croSkulls })*/
  }

  render() {
    let {
      accountAddress,
      changeTokenPrice,
      toggleForSale,
      buyCroSkull,
      order,
    } = this.state;

    let {
      floorPrice,
      highPrice,
      croSkullsMaxSupply,
      croSkullsCount,
      handleStatusNFTFilter
    } = this.props;

    let customStyle = {
      option: (provided, state) => ({
        ...provided,
        color: 'black',
      })
    }
    return (
        <div className="container">
          <div className="card mt-1">
            <div className="card-body align-items-left d-flex justify-content-center">
              { highPrice ? 
            <div className="align-items-left d-flex justify-content-left spaced">
                <span className="contractInfo border-shadow">
                  Floor Price
                  <b>{ ` ${floorPrice} Ξ`}</b>
                </span>
                <span className="contractInfo border-shadow">
                  Higher Price
                  <b>{ ` ${highPrice} Ξ`}</b>
                </span>
                <span className="contractInfo border-shadow">
                  Minted CroSkull
                  <b>{ ` #${croSkullsCount}/${croSkullsMaxSupply}`}</b>
                </span>
              </div>
              : '' }
            </div>
          </div>
          <div className="card mt-1">
            <div className="border-shadow card-body align-items-left d-flex justify-content-space-between">
              <FilterBar
                traits={this.props.traits}
                traitsTypes={this.props.traitsTypes}
                handleFilterBar={this.handleFilterBar}
                handleStatusNFTFilter={handleStatusNFTFilter}
              />
              <span onClick={this.resetFilter} className="filterBar">&times; Reset</span>
              <div className="align-items-right d-flex justify-content-right spaced">
                <div>
                  <span>Price Order</span>
                  <Select 
                    options={this.priceOptions}
                    onChange={this.handleOrderChange}
                    value={order}
                    styles={customStyle}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="skullContainer d-flex flex-wrap mb-2">
            <CroSkullList
              croSkulls={this.props.marketplaceView}
              accountAddress={accountAddress}
              croSkullsCount={croSkullsCount}
              changeTokenPrice={changeTokenPrice}
              toggleForSale={toggleForSale}
              buyCroSkull={buyCroSkull}
            />
            </div>
      </div>
    )
  }
};

export default AllCroSkulls;
