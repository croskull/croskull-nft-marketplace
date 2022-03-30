import React, { Component } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Marketplace from "./components/Marketplace/Marketplace";
import AccountDetails from "./components/AccountDetails/AccountDetails";
import CroskullAdventure from "./components/CroskullAdventure/CroskullAdventure";
import Merchant from "./components/Merchant/Merchant";
import Analytics from "./components/Analytics/Analytics";
import Navbar from "./components/Navbar/Navbar";
import Notifier from "./components/Notifier/Notifier";
import Tavern from "./components/Tavern/Tavern";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { ethers } from 'ethers';
import store from "./redux/store";
import "./App.css";
import Raffle from "./components/Raffle/Raffle";
import Story from "./components/Story/Story";
import Bank from "./components/Bank/Bank";
import Profile from "./components/Social/Profile";

let provider, contract, stakingContract, ethProvider;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blockchain: 0,
      //reward©

      traits: [],
      traitsTypes: [],
      order: 'ASC',
      marketplaceView: [],
      activeFilters: [],
      activeNFTStatus: 'all',
    };
  }

  componentDidMount = async () => {
    this.subscribe()
  };

  setProvider = (_provider = false) => {
    if (_provider) {
      provider = _provider;
    } else if (!provider) {
      provider = window.ethereum
    }
  }


  getNFTData = async () => {
    let { croSkullContract, stakingContract, accountAddress } = this.state
    let receivedFilter = croSkullContract.filters.Transfer(null, accountAddress)
    let transferedFilter = croSkullContract.filters.Transfer(accountAddress)
    let inStakeFilter = stakingContract.filters.Stake(accountAddress)

    let receivedEvents = await croSkullContract.queryFilter(receivedFilter)
    let transferedEvents = await croSkullContract.queryFilter(transferedFilter)

    let inStakeTokens = await stakingContract.getTokensIds()

    let received = [];
    let transfered = [];
    receivedEvents.map(event => {
      let topics = event.decode(event.data, event.topics)
      let tokenId = topics.tokenId.toString()
      console.log(tokenId)
      //if( ! received.includes(tokenId) )
      if (received[tokenId]) {
        received[tokenId]++
      } else {
        received[tokenId] = 1
      }
    })
    transferedEvents.map(event => {
      let topics = event.decode(event.data, event.topics)
      let tokenId = topics.tokenId.toString()
      if (transfered[tokenId]) {
        transfered[tokenId]++
      } else {
        transfered[tokenId] = 1
      }
    })
    let final = []
    received.forEach((nTrasfer, tokenId) => {
      if (nTrasfer > transfered[tokenId] || nTrasfer && !transfered[tokenId]) {
        final.push(tokenId)
      }
    })
    //let sfiltred = received.filter( x => ! transfered.includes(x))
    final = final.filter(x => !inStakeTokens.includes(x))
    this.setState({
      croSkulls: final,
      croSkullsStaked: inStakeTokens
    })
  }

  setMetaData = async () => {
    const { croSkulls } = this.state
    if (croSkulls.length !== 0) {
      let traits = []
      let traitsTypes = []
      if (croSkulls.length.length !== 0) {
        let boyLength = croSkulls.length
        croSkulls.forEach((cryptoboy, iBoy) => { //loop cryptoboy
          if (cryptoboy.metaData) {
            let traitsLength = cryptoboy.metaData.attributes.length
            cryptoboy.metaData.attributes.forEach((trait, iTraits) => { // loop tratti

              let { trait_type, value } = trait
              let type = trait_type.replace(' ', '-')
              let uniqueType = true

              traitsTypes.forEach((existType, i) => {
                if (existType === type)
                  uniqueType = false
              })

              if (uniqueType)
                traitsTypes.push(type)

              if (traits[type] === undefined)
                traits[type] = []

              let unique = true
              traits[type].forEach(existValue => {
                if (existValue === value)
                  unique = false
              })

              if (unique)
                traits[type].push(value)



              if (boyLength === (iBoy + 1) && traitsLength === (iTraits + 1)) {
                this.setState({ traits });
                this.setState({ traitsTypes });
              }
            })
          }
        })
      }

    }
  };

  handleStatusNFTFilter = (ev) => {
    let { croSkulls, accountAddress } = this.state;
    let value = ev.value
    let newMarketplaceView = [];
    switch (value) {
      case 'all':
        newMarketplaceView = croSkulls
        break;
      case 'inSale':
        croSkulls.forEach((croSkull, i) => {
          if (croSkull.forSale)
            newMarketplaceView.push(croSkull)
        })
        break;
      case 'notInSale':
        croSkulls.forEach((croSkull, i) => {
          if (!croSkull.forSale)
            newMarketplaceView.push(croSkull)
        })
        break;
      case 'owned':
        croSkulls.forEach((croSkull, i) => {
          if (croSkull.currentOwner === accountAddress)
            newMarketplaceView.push(croSkull)
        })
        break;
    }
    this.setState({ marketplaceView: newMarketplaceView })


  }

  handleFilterBar = (ev) => {
    const { croSkulls, activeFilters } = this.state;
    let value = ev.value.split('_')

    let trait = value[0]

    value = value[1].replace('-', ' ')

    let newFilters = activeFilters
    if (!newFilters.length > 0) {
      newFilters.push({ trait_type: trait, value: value })
    } else {
      let exist = false
      newFilters.forEach((filter, i) => { //controllo i filtri attivi
        if (exist) return; //se esiste già esco
        if (filter.trait_type === trait) { // tipo tratto uguale 
          if (filter.value != value) { // valore tratto diverso 

            newFilters[i] = { trait_type: trait, value: value }
            exist = true
          }
          if (filter.value === value) { // valoe tratto uguale
            exist = true
          }
        }
      })
      if (!exist)
        newFilters.push({ trait_type: trait, value: value })
    }


    let newView = [];
    croSkulls.map((croSkull, i) => { //crypto boy 1
      if (croSkull.metaData) {
        let filterValid = true
        newFilters.forEach(filter => { //filtro 1
          if (!filterValid) return
          let traitValid = false
          croSkull.metaData.attributes.forEach(forTrait => { // tratto 1
            if (traitValid) return

            if ((forTrait.trait_type === filter.trait_type) && (forTrait.value === filter.value) || (filter.value === 'none')) { //tratto valido
              traitValid = true
              return
            }
          })
          filterValid = traitValid
        })
        if (filterValid)
          newView.push(croSkull) // aggiungo il tratto
      }
    })


    this.setState({ marketplaceView: newView })
    this.setState({ activeFilters: newFilters })
  }

  handleOrderChange = (ev = null) => {

    const { numToEth } = this
    let order = ev != null ? ev.value : this.state.order
    const { marketplaceView } = this.state;
    if (order === 'ASC') {
      marketplaceView.sort((a, b) => {
        a = parseInt(numToEth(a.price))
        b = parseInt(numToEth(b.price))
        return (a - b)
      })
    } else {
      marketplaceView.sort((a, b) => {
        a = parseInt(numToEth(a.price))
        b = parseInt(numToEth(b.price))
        return (a - b)
      }).reverse()
    }
    this.setState({ order })
  }

  subscribe = () => {
    store.subscribe(() => {
      this.setState({
        blockchain: store.getState().blockchain
      });
    });
  }


  render() {
    return (
      <div className="main">
        <Notifier data={store.getState().data} />
        {(
          <>
            <HashRouter
              basename="/">
              <Navbar />
              <Route
                render={({ location }) => (

                  <TransitionGroup className={`container-fluid ${location.pathname.replace('/', '')}`}>
                    <CSSTransition
                      key={location.pathname}
                      classNames="fade"
                      timeout={500}
                    >
                      <Switch
                        location={location}
                      >
                        <Route
                          path="/"
                          exact
                          render={() => (
                            <AccountDetails
                              accountAddress={this.state.accountAddress}
                              accountBalance={this.state.accountBalance}
                            />
                          )}
                        />
                        <Route
                          path="/marketplace"
                          render={() => (
                            <Marketplace></Marketplace>
                          )}
                        />
                        <Route
                          path="/adventure"
                          render={() => (
                            <CroskullAdventure></CroskullAdventure>
                          )}
                        />
                        <Route
                          path="/tavern"
                          render={() => (
                            <Tavern />
                          )}
                        />
                        <Route
                          path="/merchant"
                          render={() => (
                            <Merchant />
                          )}
                        />
                        <Route
                          path="/analytics"
                          render={() => (
                            <Analytics />
                          )}
                        />
                        <Route
                          path="/story"
                          render={() => (
                            <Story />
                          )}
                        />
                        <Route
                          path="/raffle"
                          render={() => (
                            <Raffle accountAddress={this.state.accountAddress} />
                          )}
                        />
                        <Route
                          path="/bank"
                          render={() => (
                            <Bank accountAddress={this.state.accountAddress} />
                          )}
                        />
                        <Route
                          path="/profile"
                          render={() => (
                            <Profile accountAddress={this.state.accountAddress} />
                          )}
                        />
                        
                      </Switch>
                    </CSSTransition>
                  </TransitionGroup>
                )} />
            </HashRouter>
          </>
        )}
      </div>
    );
  }
}

export default App;
//export default connect(mapStateToProps)(App);


const formatEther = bn => ethers.utils.formatEther(bn)
const formatUnits = (value, unit) => ethers.utils.formatUnits(value, unit)
const getAddress = address => ethers.utils.getAddress(address)
//preparing modal
