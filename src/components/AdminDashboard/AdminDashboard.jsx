import React, { Component } from "react";
import Switch from "react-switch";

class AdminDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
          newBaseURI: "",
          baseURI: props.state.baseURI ? props.state.baseURI : '',
          addressToWhitelist: '',
          addressToReward: '',
          managerAddress: '',
          percent: 0
        };
    }

    callUpdateTokenUriFromApp = (e) => {
        e.preventDefault();
        this.props.setBaseURI(
            this.state.newBaseURI
        );
    };

    handleNewWhiteListAddress = (e) => {
        e.preventDefault();
        if( this.state.addressToWhitelist !== '')
            this.props.addAddressToWhitelist(
                this.state.addressToWhitelist
            )
    }

    handleNewRewardableUser = (e) => {
        e.preventDefault();
        if( this.state.addressToReward !== '' ){
            this.props.addNewRewardableUser(
                this.state.addressToReward,
                this.state.percent
            )
        }
    }

    handleNewManager = (e) => {
        e.preventDefault();
        if( this.state.managerAddress !== '' ){
            this.props.addNewManager(
                this.state.managerAddress,
            )
        }
    }


    render() {

        let {
            isMarketplace,
            isWhitelist,
            isWithdraw
        } = this.props.state; 

        let {
            toggleSmartcontractVariables,
        } = this.props
        
        return (

        <div className="container border-shadow mt-3">
            <div className="card mt-1 " >
                <div className="card-body align-items-left d-flex justify-content-center">
                         <h5>Easliy Manage your SmartContract</h5>
                    </div>
                </div>
                <div className="row adminDash">
                    <div className="col-md-6">
                        <form onSubmit={this.callUpdateTokenUriFromApp} className="pt-4 mt-1">
                            <h5>
                                Set Token URI
                            </h5>
                            <div>
                                <label htmlFor="BaseURI">New URI Path</label>
                                <input
                                required
                                type="text"
                                name="BaseURI"
                                id="newBaseURI"
                                defaultValue={this.state.baseURI}
                                className="form-control"
                                onChange={(e) =>
                                    this.setState({ newBaseURI: e.target.value })
                                }
                                />
                            </div>
                            <button
                                id="baseURIbtn"
                                style={{ fontSize: "0.9rem", letterSpacing: "0.14rem" }}
                                type="submit"
                                className="btn mt-4 btn-block btn-outline-primary"
                            >
                                Update 
                            </button>   
                        </form>
                        <form onSubmit={this.handleNewManager} className="pt-4 mt-1">
                            <h5>
                                Add user as Manager
                            </h5>
                            <div>
                                <label htmlFor="address">Address to make Manager</label>
                                <input
                                required
                                type="text"
                                name="address"
                                id="managerAddress"
                                className="form-control"
                                onChange={(e) => {
                                    this.setState( { managerAddress: e.target.value })
                                    }
                                }
                                />
                                <button
                                    id="whiteListAddress"
                                    style={{ fontSize: "0.9rem", letterSpacing: "0.14rem" }}
                                    type="submit"
                                    className="btn mt-4 btn-block btn-outline-primary"
                                >
                                   Make Manager (Only Owner)
                                </button>
                            </div>
                        </form>
                    </div>  
                    <div className="col-md-6">
                        <h5>
                            Enable/Disable Features
                        </h5>
                        <div className="toggleContainer">
                            <label htmlFor="isMarketplace">{ isMarketplace ? 'Disable' : 'Enable' } Marketplace</label>
                            <Switch
                                name="isMarketplace"
                                id="toggleMarketplace"
                                checked={isMarketplace}
                                onChange={ () => {
                                    toggleSmartcontractVariables('isMarketplace')
                                }}
                            />
                        </div>
                        <div className="toggleContainer">
                            <label htmlFor="isWhitelist">{ isWhitelist ? 'Disable' : 'Enable' } Whitelist</label>
                            <Switch
                                name="isWhitelist"
                                id="toggleWhitelist"
                                checked={isWhitelist}
                                onChange={ () => {
                                    toggleSmartcontractVariables('isWhitelist')
                                }}
                            />
                        </div>
                        <div className="toggleContainer">
                            <label htmlFor="isWithdraw">{ isWithdraw ? 'Disable' : 'Enable' } Withdraw</label>
                            <Switch
                                name="isWithdraw"
                                id="toggleWithdraw"
                                checked={isWithdraw}
                                onChange={ () => {
                                    toggleSmartcontractVariables('isWithdraw')
                                }}
                            />
                        </div>
                        <form onSubmit={this.handleNewWhiteListAddress} className="pt-4 mt-1">
                            <h5>
                                Add an Address to the Whitelist
                            </h5>
                            <div>
                                <label htmlFor="address">Address to be Whitelisted</label>
                                <input
                                required
                                type="text"
                                name="address"
                                id="addressToAdd"
                                className="form-control"
                                disabled={ ! isWhitelist }
                                onChange={(e) => {
                 
                                    this.setState( { addressToWhitelist: e.target.value })
                                    }
                                }
                                />
                                <button
                                    id="whiteListAddress"
                                    style={{ fontSize: "0.9rem", letterSpacing: "0.14rem" }}
                                    type="submit"
                                    className="btn mt-4 btn-block btn-outline-primary"
                                    disabled={ ! isWhitelist }
                                >
                                    Whitelist Address { isWhitelist || '(Disabled)'}
                                </button>
                            </div>
                        </form>
                        <form onSubmit={this.handleNewRewardableUser} className="pt-4 mt-1">
                            <h5>
                                Add an user to the rewardable list
                            </h5>
                            <div>
                                <label htmlFor="address">Address to be Reward</label>
                                <input
                                required
                                type="text"
                                name="address"
                                id="addressToAdd"
                                className="wd-50 form-control"
                                onChange={(e) => {
                                   
                                    this.setState( { addressToReward: e.target.value })
                                    }
                                }
                                />

                                <label htmlFor="percent">Percent Fee</label>
                                <input
                                required
                                type="number"
                                name="percent"
                                id="percent"
                                step=".1"
                                className="wd-50 form-control"
                                onChange={(e) => {
                                   
                                    this.setState( { percent: e.target.value })
                                    }
                                }
                                />
                                <button
                                    id="addRewardable"
                                    style={{ fontSize: "0.9rem", letterSpacing: "0.14rem" }}
                                    type="submit"
                                    className="btn mt-4 btn-block btn-outline-primary"
                                >
                                    Reward address
                                </button>
                            </div>
                        </form>
                    </div>  
                </div>
            </div>
        );
    }
}


export default AdminDashboard;
