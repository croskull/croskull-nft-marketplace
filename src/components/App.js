import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import Web3 from "web3";
import CroSkulls from "../abis/CroSkulls.json";
import MintPage from "./MintPage/MintPage";
import AllCroSkulls from "./AllCroSkulls/AllCroSkulls";
import AccountDetails from "./AccountDetails/AccountDetails";
import ContractNotDeployed from "./ContractNotDeployed/ContractNotDeployed";
import ConnectToMetamask from "./ConnectMetamask/ConnectToMetamask";
import Loading from "./Loading/Loading";
import Navbar from "./Navbar/Navbar";
import MyCroSkulls from "./MyCroSkulls/MyCroSkulls";
import Queries from "./Queries/Queries";
import AdminDashboard from './AdminDashboard/AdminDashboard';
import WalletConnectProvider from "@walletconnect/web3-provider";
import ReactNotification, { store } from 'react-notifications-component';
import "./App.css";
import 'react-notifications-component/dist/theme.css';


const WCProvider = new WalletConnectProvider({
  rpc: {
    339: "https://cassini.crypto.org",
  },
})

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountAddress: "",
      accountBalance: "",
      croSkullsContract: null,
      croSkullsContractOwner: null,
      croSkulls: [],
      croSkullsCount: 0,
      croSkullsMaxSupply: 0,
      croSkullsCost: 1,
      nftPerAddressLimit: 0,
      loading: false,
      metamaskConnected: false,
      walletConnectConnected: false,
      contractDetected: false,
      totalTokensMinted: 0,
      totalTokensOwnedByAccount: 0,
      lastMintTime: null,
      floorPrice: 0,
      highPrice: 0,
      traits: [],
      traitsTypes: [],
      order: 'ASC',
      marketplaceView: [],
      activeFilters: [],
      activeNFTStatus: 'all',
      baseURI: '',
      isMarketplace: true,
      isWhitelist: true,
      isAddressWhitelisted: false,
      currentTx: []
    };
    this.handleWeb3AccountChange();
  }

  handleWeb3AccountChange = () => {
    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.reload()
    })
  }

  componentWillMount = async () => {
    if( window.ethereum )
      await this.loadWeb3(window.ethereum);

    await this.setMintBtnTimer();
  };

  numToEth = (num) => {
    return parseFloat( window.web3.utils.fromWei( num.toString(), "ether" ), 6 )
  }

  toggleSmartcontractVariables = async (toBeChanged) => { //can be marketplace || whitelist
    let { croSkullsContract, isMarketplace, isWhitelist, accountAddress } = this.state;
    let functionToCall, feature, currentStatus;

    switch(toBeChanged){
      case 'marketplace':
          feature = 'Marketplace';
          currentStatus = isMarketplace;
        break;
      case 'whitelist':
          feature = 'Whitelist';
          currentStatus = isWhitelist;
        break;
    }
    if( currentStatus ){
      functionToCall = 'disable' + feature;
    }else{
      functionToCall = 'enable' + feature;
    }

    await croSkullsContract.methods[functionToCall]
        .send({ from: accountAddress })
        .on("confirmation", async (confirmation) => {
          if( confirmation === 1 ){
            let newState = {};
            if(feature === 'Marketplace'){
              newState = { isMarketplace: !isMarketplace }
            }else{
              newState = { isWhitelist: !isWhitelist }
            }
            this.setState( newState )
            store.addNotification(
              {
                title: `${feature} Status Changed: ${! currentStatus }!`,
                message: `1 confirmation(s)`,
                type: "success",
                insert: "top",
                container: "bottom-right",
                dismiss: {
                  duration: 4000
                }
              }
            )
            return;
          }
        })
  }

  addAddressToWhitelist = async (address = false) => {
    let { croSkullsContract, isWhitelist, accountAddress } = this.state;
    if( ! isWhitelist || ! address || ! window.web3.utils.isAddress(address) )
      return;
    
    let isCurrentAddressWhitelisted = await croSkullsContract.methods
      .whitelist(address)
      .call();
    
    if( ! isCurrentAddressWhitelisted ){

      let addToWhitelist = croSkullsContract.methods
        .addToWhitelist(address)
        .send({ from: accountAddress })
        .on("confirmation", (c) => this.handleConfirmation(c, () => 
          store.addNotification({
            title: `Added to Whitelist!`,
            message: `${address} succesful added to the whitelist!`,
            type: "success",
            insert: "top",
            container: "bottom-right",
            dismiss: {
              duration: 4000
            }
          }) 
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
    if (window.ethereum) {
      window.web3 = new Web3(provider);
      await this.loadBlockchainData();
      await this.setMetaData();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      this.setState({ metamaskConnected: false });
    } else {
      this.setState({ metamaskConnected: true });
      this.setState({ loading: true });
      this.setState({ accountAddress: accounts[0] });

      //get and set accountBalance
      let accountBalance = await web3.eth.getBalance(accounts[0]);
      accountBalance = web3.utils.fromWei(accountBalance, "Ether");
      this.setState({ accountBalance });
      this.setState({ loading: false });
      const networkId = await web3.eth.net.getId();
      const networkData = CroSkulls.networks[networkId];
      if (networkData) {
        //load contract data
        this.setState({ loading: true });
        const croSkullsContract = web3.eth.Contract(
          CroSkulls.abi,
          networkData.address
        );
        this.setState({ croSkullsContract });
        this.setState({ contractDetected: true });

        const contractOwner = await croSkullsContract.methods['getOwner']
          .call();
        this.setState( { croSkullsContractOwner: contractOwner })

        let isMarketplace = await croSkullsContract.methods
          .isMarketplace;
        let isWhitelist = await croSkullsContract.methods
          .isWhitelist;
        let isAddressWhitelisted = await croSkullsContract.methods
          .whitelist( accounts[0] )
          .call();
        
        console.log( {
          isMarketplace,
          isWhitelist,
          isAddressWhitelisted
        } );
        this.setState( {
          isAddressWhitelisted
        } );

        //get current token baseURI
        let baseURI = await croSkullsContract.methods
          .baseURI()
          .call();
          
        this.setState({ loading: false });
        if( baseURI ) {
          baseURI = 'https://gateway.pinata.cloud/ipfs/' + baseURI;
          this.setState({ baseURI }); 
  
          await this.fetchAllCroSkulls();
  
          const croSkullsMaxSupply = await croSkullsContract.methods
            .getMaxSupply()
            .call();
          
          this.setState( { croSkullsMaxSupply } )
  
          let floorPrice = 9999999999;
          let highPrice = 0;
          let croSkulls = this.state.croSkulls;
          croSkulls.forEach( cryptoboy => {
            let price = this.numToEth(cryptoboy.price)
            console.log(price)
            if( price < floorPrice )
              floorPrice = price
            
            if( price > highPrice)
              highPrice = price
          })
          this.setState({ floorPrice, highPrice })
        }
        /*const croSkullsCost = await croSkullsContract.methods
          .getCost()
          .call();
        this.setState({ croSkullsCost });*/

        //get total minted tokens ( include burned (?) )
        let totalTokensMinted = await croSkullsContract.methods
          .getNumberOfTokensMinted()
          .call();
        totalTokensMinted = totalTokensMinted.toNumber();
        this.setState({ totalTokensMinted });

        let totalTokensOwnedByAccount = await croSkullsContract.methods
          .getTotalNumberOfTokensOwnedByAnAddress(this.state.accountAddress)
          .call();
        totalTokensOwnedByAccount = totalTokensOwnedByAccount.toNumber();
        this.setState({ totalTokensOwnedByAccount });
      } else {
        this.setState({ contractDetected: false });
      }
    }
  };

  fetchAllCroSkulls = async () => {
    let { croSkullsContract, croSkullsCount } = this.state
    croSkullsCount = croSkullsCount ? croSkullsCount + 1 : croSkullsCount;
    console.log(croSkullsCount)
    let newCroSkullsCount = await croSkullsContract.methods
        .croSkullCounter()
        .call();
    newCroSkullsCount = newCroSkullsCount.toNumber()
    console.log( newCroSkullsCount  )

    this.setState({ croSkullsCount: newCroSkullsCount });
    const result = await fetch(this.state.baseURI + '/_metadata.json' );
    const metaDatas = await result.json();
    for (croSkullsCount; croSkullsCount <= newCroSkullsCount; croSkullsCount++) {
      const croSkull = await croSkullsContract.methods
      .allCroSkulls(croSkullsCount)
      .call();
      
      metaDatas.map(async (metaData) => {
        if( croSkull.tokenId.toNumber() === metaData.edition )
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

  connectToMetamask = async () => {
    await window.ethereum.enable();
    await this.loadWeb3( window.ethereum )
    this.setState({ metamaskConnected: true });
    console.log(this.state.metamaskConnected)
    //window.location.reload();
  };

  connectToWalletConnect = async () => {
    await window.ethereum.enable();
    await WCProvider.enable();
    await this.loadWeb3( WCProvider )
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
        console.log(this.state)
    }
  };

  handleStatusNFTFilter = (ev) => {
    let { croSkulls, accountAddress } = this.state;
    let value = ev.value
    console.log(value)
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
    const { croSkulls, marketplaceView, activeFilters } = this.state;
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
            console.log(value)
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

    console.log(newFilters)
    let newView = [];
    croSkulls.map( ( croSkull, i ) => { //crypto boy 1
      if( croSkull.metaData ){
        let filterValid = true
        newFilters.forEach( filter => { //filtro 1
          if( ! filterValid ) return
          let traitValid = false
          croSkull.metaData.attributes.forEach(forTrait => { // tratto 1
            if( traitValid ) return

            if( forTrait.trait_type === filter.trait_type && forTrait.value === filter.value || filter.value === 'none' ){ //tratto valido
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

    console.log( newView )
    this.setState( { marketplaceView: newView } )
    this.setState( { activeFilters: newFilters } )
  }

  handleOrderChange = (ev = null) => {
    console.log( ev )
    const { numToEth } = this
    let order = ev != null ? ev.value : this.state.order
    const { croSkulls, marketplaceView } = this.state;
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
    this.state.croSkullsContract.methods
      .setBaseURI(_baseURI)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {
        this.setState({ loading: false });
        window.location.reload();
      });
  }

  setNftPerAddressLimit = (_limit) => {
    this.state.croSkullsContract.methods
      .setNftPerAddressLimit(_limit)
      .send({ from: this.state.accountAddress })
      .on("confirmation", () => {
        console.log('limit')
        this.setState({ loading: false });
        this.setState({ nftPerAddressLimit: _limit });
      });
  }

  mintMyNFT = async (_mintAmount) => {
    _mintAmount = _mintAmount || false;
    if ( _mintAmount ) {
      let previousTokenId;

      let { croSkullsContract, accountAddress, croSkullsCost, currentTx } = this.state;

      previousTokenId = await croSkullsContract.methods
        .croSkullCounter()
        .call();

      let callback_1 = async (c) => {
        await this.fetchAllCroSkulls()
        store.addNotification(
          {
            title: `CroSkull${_mintAmount > 1 ? 's' : '' } Minted!`,
            message: `${c} confirmation(s)`,
            type: "success",
            insert: "top",
            container: "bottom-right",
            dismiss: {
              duration: 4000
            }
          }
        )
        localStorage.setItem(accountAddress, new Date().getTime());
      }

      let callback_2 = (c) => {
        window.location.hash = "/my-tokens"; // hash redirect alla pagina dei token 
      }

      previousTokenId = previousTokenId.toNumber();
      const totalCost = window.web3.utils.toWei( ( croSkullsCost * _mintAmount ).toString(), "Ether");
      let txCroSkullMint = croSkullsContract.methods
        .mintCroSkull(_mintAmount)
        .send({ from: accountAddress, value: totalCost })
        .on("confirmation", (c) => this.handleConfirmation(c, callback_1, callback_2) )
        .on("error", () => window.location.reload );

      this.setState( { currentTx: txCroSkullMint } );
      await currentTx;
    }
  };

  handleConfirmation = async ( confirmation, callback_1 = false, callback_2 = false ) => {
    //try to globally handle all the transaction confirmation using transaction
    console.log( confirmation );
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
    this.state.croSkullsContract.methods
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
    this.state.croSkullsContract.methods
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
    this.state.croSkullsContract.methods
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

  render() {
    return (
      <div className="container">
        <ReactNotification />
        {!this.state.metamaskConnected ? (
          <ConnectToMetamask 
            connectToMetamask={this.connectToMetamask} 
            connectToWalletConnect={this.connectToWalletConnect}
          />
        ) : !this.state.contractDetected ? (
          <ContractNotDeployed />
        ) : this.state.loading ? (
          <Loading />
        ) : (
          <>
            <HashRouter basename="/" >
              <Navbar isAdmin={this.state.croSkullsContractOwner === this.state.accountAddress}/>
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
                path="/mint"
                render={() => (
                  <MintPage
                    mintMyNFT={this.mintMyNFT}
                    setMintBtnTimer={this.setMintBtnTimer}
                    state={this.state}
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
                      <h1>Marketplace is Closed :C</h1>
                    </div>
                  )}
                />

              <Route
                path="/my-tokens"
                render={() => (
                  <MyCroSkulls
                    accountAddress={this.state.accountAddress}
                    croSkulls={this.state.croSkulls}
                    totalTokensOwnedByAccount={
                      this.state.totalTokensOwnedByAccount
                    }
                    baseURI={this.state.baseURI}
                  />
                )}
              />
              { this.state.baseURI != '' ? 
              <Route
                path="/queries"
                render={() => (
                  <Queries 
                    croSkullsContract={this.state.croSkullsContract} 
                    baseURI={this.state.baseURI}
                  />
                )}
              />
               : '' }
              {
                this.state.croSkullsContractOwner === this.state.accountAddress ?
              <Route
                path="/admin"
                render={() => (
                  <AdminDashboard
                    state={this.state}
                    setBaseURI={this.setBaseURI} 
                    setNftPerAddressLimit={this.setNftPerAddressLimit} 
                    toggleSmartcontractVariables={this.toggleSmartcontractVariables}
                    addAddressToWhitelist={this.addAddressToWhitelist}
                  />
                )}
              />
               :
               '' }
            </HashRouter>
          </>
        )}
        <span>v0.1.6</span>
      </div>
    );
  }
}

export default App;
