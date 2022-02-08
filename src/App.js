import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import AllCroSkulls from "./components/AllCroSkulls/AllCroSkulls";
import AccountDetails from "./components/AccountDetails/AccountDetails";
import ContractNotDeployed from "./components/ContractNotDeployed/ContractNotDeployed";
import ConnectToMetamask from "./components/ConnectMetamask/ConnectToMetamask";
import CroskullAdventure from "./components/CroskullAdventure/CroskullAdventure";
import Navbar from "./components/Navbar/Navbar";
import Notifier from "./components/Notifier/Notifier";
import Tavern from "./components/Tavern/Tavern";
import { connect } from "./redux/blockchain/blockchainActions";
import market from './utils/market.jpg'
import { ethers } from 'ethers';
import { useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import "./App.css";

let provider, contract, stakingContract, graveContract, ethProvider, signer;
//const ContractAddress = "0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blockchain: 0,
      //reward
      
      traits: [],
      traitsTypes: [],
      order: 'ASC',
      marketplaceView: [],
      activeFilters: [],
      activeNFTStatus: 'all',
    };
  }

  componentWillMount = async () => {
    this.subscribe()
  };

  setProvider = (_provider = false ) => {
    if( _provider ){
      provider = _provider;
    }else if( ! provider ) {
      provider = window.ethereum
    }
  }

  loadBlockchainData = async () => {
    let accounts = 0
    if (accounts.length === 0) {
      this.setState({ providerConnected: false });
    } else {
      this.setState({ providerConnected: true });
      this.setState({ loading: true });
      let address = getAddress( accounts[0]);
      this.setState({ accountAddress: address });
      //get and set accountBalance
      
      let accountBalance = await ethProvider.getBalance(address);
      accountBalance =  formatEther( accountBalance )
      this.setState({ accountBalance });
      this.setState({ loading: false });
      this.setState({ croSkullsContract: contract });
      this.setState({ contractDetected: true });

      let contractOwner = await contract.owner()
    
      contractOwner = getAddress(contractOwner)

      this.setState( { croSkullsContractOwner: contractOwner })

      let managerAddress = await contract
        .manager()
      managerAddress = getAddress(managerAddress)

      this.setState( { managerAddress } )
      let isMarketplace = await contract
        .settings('isMarketplace')
        
      let isWhitelist = await contract
        .settings('isWhitelist')
        
      let isWithdraw = await contract
        .settings('isWithdraw')
        
      let isAddressWhitelisted = await contract
        .whitelist( address )
        
      this.setState( {
        isMarketplace,
        isWhitelist,
        isWithdraw,
        isAddressWhitelisted
      } );

      //get current token baseURI
      let baseURI = await contract
        .baseURI()
        
      this.setState({ loading: false });
      
      await this.getRewardData()

      if( baseURI ) {
        baseURI = baseURI.replace('ipfs://', '');
        baseURI = 'https://gateway.pinata.cloud/ipfs/' + baseURI;
        this.setState({ baseURI }); 
        const croSkullsMaxSupply = await contract
          .getMaxSupply()
          
        
        this.setState( { croSkullsMaxSupply } )


        const croSkullsCost = await contract
          .getCost()
          
        this.setState({ croSkullsCost });

        //get total minted tokens ( include burned (?) )
        let totalTokensMinted = await contract
          .getNumberOfTokensMinted()
          
        totalTokensMinted = totalTokensMinted.toNumber();
        this.setState({ totalTokensMinted });
  
        await this.fetchAllCroSkulls();
        let floorPrice = 9999999999;
        let highPrice = 0;
        let croSkulls = this.state.croSkulls;
        croSkulls.forEach( cryptoboy => {
          let price = formatEther(cryptoboy.price)
          if( price < floorPrice )
            floorPrice = price
          
          if( price > highPrice)
            highPrice = price
        })
        this.setState({ floorPrice, highPrice })
      } 
    }
  };

  toggleSmartcontractVariables = async (toBeChanged) => { //can be marketplace || whitelist
    let {  isMarketplace, isWhitelist, isWithdraw, accountAddress } = this.state;
    
    await contract
        .toggleSetting(toBeChanged)
        .send({ from: accountAddress })
        .on("confirmation", async (confirmation) => {
          if( confirmation === 1 ){
            let newState = {};
            switch (toBeChanged) {
              case 'isMarketplace':
                newState = { isMarketplace: !isMarketplace }
                break;
              case 'isWhitelist':
                newState = { isWhitelist: !isWhitelist }
                break;
              case 'isWithdraw':
                newState = { isWithdraw: !isWithdraw }
                break;
              default:
                return;
            }
            
            this.setState( newState )

            return;
          }
        })
  }

  getRewardData = async () => {
    let { accountAddress } = this.state;
    let isRewardable = await contract
      .rewardableUsers( accountAddress )
      
    isRewardable = isRewardable.toString()
    if( isRewardable !== "0" ){
      let totalRewardPool = await contract
        .totalCROVolume()
        
      if( totalRewardPool ){
        let currentReward = await contract
          .getRewardValue()
          
        
        currentReward = formatEther( currentReward.toString() )
        
        let currentRewardFee = await contract
          .rewardableUsers(accountAddress)
        
        currentRewardFee = currentRewardFee.toString() / 10;
  
        totalRewardPool = formatEther( totalRewardPool.toString() );
        /*let alreadyClaimed = await contract
          .userClaimedRewards(accountAddress)
          
        alreadyClaimed = window.web3.utils.fromWei( alreadyClaimed.toString() )*/
        this.setState({
          totalRewardPool,
          currentRewardFee,
          currentReward,
          /*alreadyClaimed*/
        })
      }
      
      this.setState( { isRewardable: true } )
    }
  }

  addNewRewardableUser = async (address = false, percent = 0) => {
    let {  accountAddress } = this.state;
    address = getAddress( address )
    if( ! address || ! address || ! percent )
      return;
    
    percent = percent * 10; // mul per 10 to handle 1decimal 
    let isCurrentAddressRewardable = await contract
      .rewardableUsers(address)

    isCurrentAddressRewardable = isCurrentAddressRewardable.toString();
    
    if( isCurrentAddressRewardable === 0){
      let addRewardable = contract
        .addRewardable(address, percent)
        .on("confirmation", (c) => this.handleConfirmation(c, () => 
          console.log()
        ))
        .on("error", () => window.location.reload );

      this.setState( { currentTx: addRewardable } );
      await this.state.currentTx;
    }
  }

  addNewManager = async (address = false) => {
    let {  accountAddress } = this.state;
    if( ! address || ! window.web3.utils.isAddress(address) )
      return;
    
    await contract
      .setManager(address)
      .send({ from: accountAddress});
  }

  addAddressToWhitelist = async (address = false) => {
    let {  isWhitelist, accountAddress } = this.state;
    if( ! isWhitelist || ! address || ! window.web3.utils.isAddress(address) )
      return;
    
    let isCurrentAddressWhitelisted = await contract
      .whitelist(address)
      
    
    if( ! isCurrentAddressWhitelisted ){

      let addToWhitelist = contract
        .addToWhitelist(address)
        .send({ from: accountAddress })
        .on("confirmation", (c) => this.handleConfirmation(c, () => 
          console.log()
        ))
        .on("error", () => window.location.reload );

      this.setState( { currentTx: addToWhitelist } );
      await this.state.currentTx;
    }
  }

  setMintBtnTimer = () => {
    const mintBtn = document.getElementById("mintBtn");
    if (mintBtn !== undefined && mintBtn !== null) {
      this.setState({
        lastMintTime: localStorage.getItem(this.state.accountAddress),
      });
      this.state.lastMintTime === undefined || this.state.lastMintTime === null
        ? (mintBtn.innerHTML = "Mint")
        : this.checkIfCanMint(parseInt(this.state.lastMintTime));
    }
  };

  checkIfCanMint = (lastMintTime) => {
    const mintBtn = document.getElementById("mintBtn");
    const timeGap = 300000; //5min in milliseconds
    const countDownTime = lastMintTime + timeGap;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = countDownTime - now;
      if (diff < 0) {
        mintBtn.removeAttribute("disabled");
        mintBtn.innerHTML = "Mint";
        localStorage.removeItem(this.state.accountAddress);
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        mintBtn.setAttribute("disabled", true);
        mintBtn.innerHTML = `Next mint in ${minutes}m ${seconds}s`;
      }
    }, 1000);
  };

  loadWeb3 = async (provider) => {
    
  };

  handleWithdraw = async () => {
    let {  isWithdraw, accountAddress, currentReward } = this.state;
    if( isWithdraw && currentReward > 0 ){
      let override = {
        from: accountAddress,
      }
      let withDrawTX = await contract
        .withdrawReward(override)



      this.setState({
        currentTx: withDrawTX
      })

      await withDrawTX
        .then( async () => {

          }
        )
    }
  }

  getNFTData = async () => {
    let {croSkullContract, stakingContract, accountAddress} = this.state
    let receivedFilter = croSkullContract.filters.Transfer(null,accountAddress)
    let transferedFilter = croSkullContract.filters.Transfer(accountAddress)
    let inStakeFilter = stakingContract.filters.Stake(accountAddress)

    let receivedEvents = await croSkullContract.queryFilter(receivedFilter)
    let transferedEvents = await croSkullContract.queryFilter(transferedFilter)

    let inStakeTokens = await stakingContract.getTokensIds()

    let received = [];
    let transfered = [];
    receivedEvents.map( event => {
      let topics = event.decode( event.data, event.topics)
      let tokenId = topics.tokenId.toString()
      console.log(tokenId)
      //if( ! received.includes(tokenId) )
      if( received[tokenId] ){
        received[tokenId]++
      } else{
        received[tokenId] = 1
      }
    })
    transferedEvents.map( event => {
      let topics = event.decode( event.data, event.topics)
      let tokenId = topics.tokenId.toString()
      if( transfered[tokenId] ){
        transfered[tokenId]++
      } else{
        transfered[tokenId] = 1
      }
    })
    let final = []
    received.forEach( ( nTrasfer, tokenId ) => {
      if(  nTrasfer > transfered[tokenId] || nTrasfer && !transfered[tokenId] ){
        final.push(tokenId)
      }
    })
    //let sfiltred = received.filter( x => ! transfered.includes(x))
    final = final.filter( x => ! inStakeTokens.includes(x))
    this.setState({
      croSkulls: final,
      croSkullsStaked: inStakeTokens
    })
  }
  

  fetchAllCroSkulls = async () => {
    let {  croSkullsCount } = this.state
    console.log( croSkullsCount )
    croSkullsCount = croSkullsCount ? croSkullsCount + 1 : croSkullsCount;

    let newCroSkullsCount = await contract
        .croSkullCounter()
        
    newCroSkullsCount = newCroSkullsCount.toNumber()
    this.setState({ croSkullsCount: newCroSkullsCount });


    const result = await fetch(this.state.baseURI + '_metadata' );
    const metaDatas = await result.json();

    let totalTokensOwnedByAccount = await contract
          .getTotalNumberOfTokensOwnedByAnAddress(this.state.accountAddress)
          
        totalTokensOwnedByAccount = totalTokensOwnedByAccount.toNumber();
        this.setState({ totalTokensOwnedByAccount });

    
    for (croSkullsCount; croSkullsCount <= newCroSkullsCount; croSkullsCount++) {
      const croSkull = await contract
      .allCroSkulls(croSkullsCount)


      metaDatas.map(async (metaData) => {
        if( /*croSkull.tokenId.toNumber()*/ croSkullsCount === metaData.edition )
        this.setState({
          croSkulls: [
            ...this.state.croSkulls, {
              ...croSkull,
              metaData,
            }
          ],
          marketplaceView: [
            ...this.state.croSkulls, {
              ...croSkull,
              metaData,
            }
          ],
        });
      })
    }
    
  }

  connectToWalletConnect = async () => {
    await window.ethereum.enable();
    await this.loadWeb3( )
    this.setState({ walletConnectConnected: true });
    //window.location.reload();
  }

  setMetaData = async () => {
    const { croSkulls } = this.state
    if (croSkulls.length !== 0) {
      let traits = []
      let traitsTypes = []
      if( croSkulls.length.length !== 0 ){
        let boyLength = croSkulls.length
        croSkulls.forEach( (cryptoboy, iBoy) => { //loop cryptoboy
          if( cryptoboy.metaData ){
            let traitsLength = cryptoboy.metaData.attributes.length
            cryptoboy.metaData.attributes.forEach( (trait, iTraits) => { // loop tratti
              
              let { trait_type, value } = trait
              let type = trait_type.replace(' ', '-')
              let uniqueType = true

              traitsTypes.forEach( ( existType, i) => {
                if( existType === type )
                  uniqueType = false
              } )

              if( uniqueType )
                traitsTypes.push( type )

              if( traits[type] === undefined )
                traits[type] = []

              let unique = true
              traits[type].forEach( existValue => {
                if (existValue === value )
                  unique = false
              })

              if( unique )
                traits[type].push( value )
              

                
                if( boyLength === ( iBoy + 1 ) && traitsLength === ( iTraits + 1 ) ){
                  this.setState({ traits });
                  this.setState( { traitsTypes });
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
    switch (value){
      case 'all':
        newMarketplaceView = croSkulls
        break;
      case 'inSale':
        croSkulls.forEach( ( croSkull, i ) => {
          if( croSkull.forSale )
            newMarketplaceView.push(croSkull)
        } )
        break;
      case 'notInSale':
        croSkulls.forEach( ( croSkull, i ) => {
          if( ! croSkull.forSale )
            newMarketplaceView.push(croSkull)
        } )
        break;
      case 'owned':
        croSkulls.forEach( ( croSkull, i ) => {
          if( croSkull.currentOwner === accountAddress)
            newMarketplaceView.push(croSkull)
        } )
        break;
      }
      this.setState( { marketplaceView: newMarketplaceView } )


  }

  handleFilterBar = (ev) => {
    const { croSkulls, activeFilters } = this.state;
    let value = ev.value.split('_')

    let trait = value[0]

    value = value[1].replace('-', ' ')

    let newFilters = activeFilters
    if( ! newFilters.length > 0){
      newFilters.push({ trait_type: trait , value: value })
    }else{
      let exist = false
      newFilters.forEach( ( filter, i )=> { //controllo i filtri attivi
        if( exist ) return; //se esiste già esco
        if( filter.trait_type === trait  ){ // tipo tratto uguale 
          if( filter.value != value){ // valore tratto diverso 

              newFilters[i] = { trait_type: trait , value: value }
            exist = true
          }
          if( filter.value === value ){ // valoe tratto uguale
            exist = true
          }
        }
      })
        if( ! exist ) 
          newFilters.push( { trait_type: trait , value: value } )
    }


    let newView = [];
    croSkulls.map( ( croSkull, i ) => { //crypto boy 1
      if( croSkull.metaData ){
        let filterValid = true
        newFilters.forEach( filter => { //filtro 1
          if( ! filterValid ) return
          let traitValid = false
          croSkull.metaData.attributes.forEach(forTrait => { // tratto 1
            if( traitValid ) return

            if( ( forTrait.trait_type === filter.trait_type ) && ( forTrait.value === filter.value ) || ( filter.value === 'none' ) ){ //tratto valido
              traitValid = true
              return
            }
          })
          filterValid = traitValid
        })
        if(filterValid)
          newView.push(croSkull) // aggiungo il tratto
      }
    })


    this.setState( { marketplaceView: newView } )
    this.setState( { activeFilters: newFilters } )
  }

  handleOrderChange = (ev = null) => {

    const { numToEth } = this
    let order = ev != null ? ev.value : this.state.order
    const { marketplaceView } = this.state;
    if( order === 'ASC' ){
      marketplaceView.sort( (a, b) => {
        a = parseInt( numToEth(a.price) )
        b = parseInt( numToEth(b.price) )
        return (  a - b  ) 
      })
    }else{
      marketplaceView.sort( (a, b) => {
        a = parseInt( numToEth(a.price) )
        b = parseInt( numToEth(b.price) )
        return (  a - b  ) 
      }).reverse()
    }
    this.setState({ order })
  }

  setBaseURI = async ( _baseURI ) => {
    this.setState({ loading: true });
    this.state.contract
      .setBaseURI(_baseURI)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      });
  }

  setNftPerAddressLimit = (_limit) => {
    this.state.contract
      .setNftPerAddressLimit(_limit)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {

        this.setState({ loading: false });
        this.setState({ nftPerAddressLimit: _limit });
      });
  }

  mintMyNFT = async (_mintAmount) => {
    _mintAmount = _mintAmount || false;
    if ( _mintAmount ) {
      let {  accountAddress, croSkullsCost, currentTx } = this.state;

      let callback_1 = async (c = 3) => {
        
        localStorage.setItem(accountAddress, new Date().getTime());
      }

      let callback_2 = (c) => {
        window.location.hash = "/my-tokens"; // hash redirect alla pagina dei token 
      }

      const totalCost =  ethers.utils.parseEther( String( 199 * _mintAmount ) ).toString();
      console.log( totalCost )
      let override = {
        from: accountAddress,
        value: totalCost
      }
      let txCroSkullMint = contract
        .mintCroSkull(_mintAmount, override)

       /* .send({ from: accountAddress, value: totalCost })
        
        .on("confirmation", (c) => this.handleConfirmation(c, callback_1, callback_2) )
        .on("error", () => window.location.reload );*/

      this.setState( { currentTx: txCroSkullMint } );
      await txCroSkullMint
        .then( async () => {
          await this.fetchAllCroSkulls();
          await callback_1()
          callback_2()
          }
        )

     /* await currentTx
        .on("confirmation", )
        .on("error", () => window.location.reload );*/
    }
  };

  handleConfirmation = async ( confirmation, callback_1 = false, callback_2 = false ) => {
    if(confirmation === 1 && callback_1 ){
      callback_1(confirmation)
    }
    if(confirmation === 3 ){
      if( callback_2 )
        callback_2(confirmation);
      
      this.state.currentTx.off("confirmation")
      this.setState( { currentTx: [] } );
    }
  }

  toggleForSale = (tokenId) => {
    this.setState({ loading: true });
    this.state.contract
      .toggleForSale(tokenId)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      })
      .on("error", (error) => {
        window.location.reload();
      });
  };

  changeTokenPrice = (tokenId, newPrice) => {
    this.setState({ loading: true });
    const newTokenPrice = window.web3.utils.toWei(newPrice, "Ether");
    this.state.contract
      .changeTokenPrice(tokenId, newTokenPrice)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      })
      .on("error", (error) => {
        window.location.reload();
      });
  };

  resetFilter = () => {
    const { croSkulls } = this.state;
    this.setState( { marketplaceView: croSkulls } )
  }

  buyCroSkull = (tokenId, price) => {
    this.setState({ loading: true });
    this.state.contract
      .buyToken(tokenId)
      .send({ from: this.state.accountAddress, value: price })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      })
      .on("error", (error) => {
        window.location.reload();
      });
  };

  subscribe = () => {
    store.subscribe(() => {
      // When state will be updated(in our case, when items will be fetched), 
      // we will update local component state and force component to rerender 
      // with new data.
      
      
      this.setState({
        blockchain: store.getState().blockchain
      });
    });
  }
  

  render() {
    return (
      <div className="main container-fluid">
        <Notifier />
        {  (
                <>
            <HashRouter basename="/" >
              <Navbar/>
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
                  this.state.isMarketplace ? 
                    <AllCroSkulls
                      accountAddress={this.state.accountAddress}
                      marketplaceView={this.state.marketplaceView}
                      croSkullsCount={this.state.croSkullsCount}
                      changeTokenPrice={this.changeTokenPrice}
                      toggleForSale={this.toggleForSale}
                      buyCroSkull={this.buyCroSkull}
                      loading={this.state.loading}
                      floorPrice={this.state.floorPrice}
                      highPrice={this.state.highPrice}
                      handleOrderChange={this.handleOrderChange}
                      handleFilterBar={this.handleFilterBar}
                      handleStatusNFTFilter={this.handleStatusNFTFilter}
                      order={this.state.order}
                      traits={this.state.traits}
                      traitsTypes={this.state.traitsTypes}
                      croSkullsMaxSupply={this.state.croSkullsMaxSupply}
                      resetFilter={this.resetFilter}
                      />
                    :
                    <div class="card">
                       <div className="market-title">
                        <h2>
                        Click <a href="https://app.ebisusbay.com/collection/0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F">Here!</a> to trade CroSkull on Ebisu's bay marketplace!
                        </h2>
                      </div>
                      <br></br>
                      <img src={market} className="market" />
                    </div>     
                  )}
                />
              <Route
                path="/adventure"
                render={() => (
                  <CroskullAdventure
                    accountAddress={this.state.accountAddress}
                    croSkulls={this.state.croSkulls}
                    totalTokensOwnedByAccount={
                      this.state.totalTokensOwnedByAccount
                    }
                    provider={ethProvider}
                    croSkullContract={contract}
                    stakingContract={stakingContract}
                    baseURI={this.state.baseURI}
                  />
                )}
              />
              <Route
                path="/tavern"
                render={() => (
                  <Tavern
                    accountAddress={this.state.accountAddress}
                    croSkulls={this.state.croSkulls}
                    totalTokensOwnedByAccount={
                      this.state.totalTokensOwnedByAccount
                    }
                    provider={ethProvider}
                    croSkullContract={contract}
                    stakingContract={stakingContract}
                    baseURI={this.state.baseURI}
                  />
                )}
              />
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
