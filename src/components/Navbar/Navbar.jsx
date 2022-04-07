import {
  ethers
} from 'ethers';
import React, { useEffect, useState } from "react";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import { connect, disconnect } from "../../redux/blockchain/blockchainActions";
import cryptoIcon from "./crypto-com.svg";
import { DeFiWeb3Connector } from 'deficonnect';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import Logo from "./logo-white.png";
import Grave from "./grave.png";
import GraveBurn from "./grave-burn.png";
import Skull from "./skull.png";
import GraveMined from "./grave-mined.png";
import GraveAvailable from "./grave-available.png";
import SkullAdventure from './skull-adventure.png';
import MetricItem from "./MetricItem";
import { Link } from "react-router-dom";
import menuIcon from "./menu-icon.svg";
import Soul from "./soul.png";
import './navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter, faMedium } from '@fortawesome/free-brands-svg-icons'
import { faBook } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {
  const dispatch = useDispatch();
  let { blockchain, data } = store.getState();
  let { rewardPlusMalus, soulsBalance, userGraveBalance, croSkulls, rewards, croSkullsStaked, daysLastWithdraw } = data
  let { accountAddress, formatEther, contractDetected, loading } = blockchain
  const [isHovered, setIsHovered] = useState(false)
  const [menuState, setMenuState] = useState(false)
  let malusPercent = ( 800 - ( 25 * daysLastWithdraw ) ) / 10
  
  useEffect( () => {
    if( window.ethereum && ! loading && ! contractDetected ){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      dispatch( connect( provider ))
    }
  }, [window.ethereum])

  const toggleMenu = () => {
    setMenuState( ! menuState )
  }

  const toggleProvidersModal = async () => {
    await web3Modal._toggleModal();
    web3ModalConnection()
  }

  const web3ModalConnection = () => {
    web3Modal.on("connect", async (_provider) => {
      const provider = new ethers.providers.Web3Provider(_provider);
      dispatch(connect( provider ))
    })
  }

  const handleButton = () => {
    if( isHovered ){
      if( contractDetected ){
        dispatch(disconnect())
      }else{
        toggleProvidersModal()
      }
    }
  }

  let malusAmount = rewards > 0 ? parseFloat(formatEther( rewards , true) - formatEther( rewardPlusMalus, true)).toFixed(2) : 0
  return (
    <nav className="navbar navbar-expand-sm header">
      <Link to="/" className="crLogo">
        <img src={Logo} alt="CroSkull Logo" className="site-logo"/>
      </Link>
      <button
        className="navbar-toggler"
        onClick={
          () => toggleMenu()
        }
      >
        <span className="navbar-toggler-icon">
          <img 
            src={menuIcon}
            className="toggler-icon"
             />
        </span>
      </button>
      <div 
        className="sk-flex sk-row balances"
      >
        <div className="main-balance">
          <span>
            <img 
              className="skull-icon"
              src={Skull}
            />
            { `${croSkulls.length ? croSkulls.length : 0}` }
            <span className="sk-tooltip">Free skulls</span>
          </span>
          <span>
            <img 
              className="skull-icon"
              src={Grave}
            />
            { `${formatEther(userGraveBalance, true)}` }
            <span className="sk-tooltip">Owned Grave</span>
          </span>
          <span>
            <img 
              className="skull-icon"
              src={Soul}
            />
            { `${ soulsBalance }` }
            <span className="sk-tooltip">Owned Soul</span>
          </span>
        </div>
        <div className="balances-offcanvas">
          <button
            className="skull-button view-more"
          >
            More
          </button>
          <div className={`flex-v season`}>
              <span>Season</span>
              <span>
                <img 
                  className="skull-icon"
                  src={SkullAdventure}
                />
                { `${ croSkullsStaked.length ? croSkullsStaked.length : 0}` }
                <span className="sk-tooltip">Skulls in adventure</span>
              </span>
              <span>
                <img 
                  className="skull-icon"
                  src={GraveMined}
                />
                { `${formatEther(rewards, true)}` }
                <span className="sk-tooltip">Generated Grave</span>
              </span>
              <span
                className="positive"
              >
                <img 
                  className="skull-icon"
                  src={GraveAvailable}
                />
                { `${formatEther(rewardPlusMalus, true)}` }
                <span className="sk-tooltip">Withdrawable Grave</span>
              </span>
              <span className="negative">
                <img 
                  className="skull-icon"
                  src={GraveBurn}
                />
                { `${ malusAmount } -(${malusPercent}%)` }
                <span className="sk-tooltip">Burned Grave</span>
              </span>
          </div>
        </div>
      </div>
      <div 
        id="navbarNav" 
        className={`navMenu navbar-collapse ${menuState ? 'show' : ''}`}
      >
        <ul
          style={{ fontSize: "0.8rem", letterSpacing: "0.2rem" }}
          className="navbar-nav ml-auto"
          onClick={ () => toggleMenu() }
        >
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/bank" className="nav-link">
              Bank
            </Link>
            {  }
          </li>
          <li className="nav-item">
            <Link to="/marketplace" className="nav-link">
              Marketplace
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tavern" className="nav-link">
              Tavern
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/adventure" className="nav-link">
              Adventure
            </Link>
          </li>
          <li className="nav-item merchant-menu">
            <Link to="/merchant" className="nav-link">
              Merchant
            </Link>
          </li>
          <li className="nav-item merchant-menu">
            <Link to="/analytics" className="nav-link">
              Analytics
            </Link>
          </li>
          <li className="nav-item merchant-menu">
            <Link to="/raffle" className="nav-link">
              Raffle
            </Link>
          </li>
        </ul>
        <div
          className="social-list"
        >
          <a href="https://discord.gg/Z2EbH9fFM8" target="_blank">
            <FontAwesomeIcon icon={faDiscord} />
          </a>
          <a href="https://twitter.com/CroskullNFT" target="_blank">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="https://croskull-nft.gitbook.io/croskull/" target="_blank">
            <FontAwesomeIcon icon={faBook} />
          </a> 
          <a href="http://medium.com/@croskullnft" target="_blank">
            <FontAwesomeIcon icon={faMedium} />
          </a>
        </div>
      </div>
      <div 
        className="flex-v"
      >
        <button
          className="account-button"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={
            () =>
            handleButton()
          }
        >
          { ! contractDetected ?
            `Connect` :
            isHovered ? `Disconnect` : `${accountAddress.substr(0, 5)}...${accountAddress.substr(39, 41)}` }
        </button>
      </div>
    </nav>
  )
}

const providerOptions = {
  injected: {
      display: {
          logo: "https://github.com/MetaMask/brand-resources/raw/master/SVG/metamask-fox.svg",
          name: "MetaMask",
          description: "Connect with MetaMask in your browser"
      },
      package: null
  },
  "custom-defiwallet": {
      display: {
          logo: cryptoIcon,
          name: "Crypto.com DeFi Wallet",
          description: "Connect with the CDC DeFi Wallet"
      },
      package: WalletConnectProvider,
      connector: async (ProviderPackage, options) =>  {
          const connector = new DeFiWeb3Connector({
              supportedChainIds: [25],
              rpc: {25: 'https://gateway.nebkas.ro'},
              pollingInterval: 15000,
              metadata: {
                  icons: ['https://ebisusbay.com/vector%20-%20face.svg'],
                  description: "Cronos NFT Marketplace"
              }
          });

          await connector.activate();
          let provider = await connector.getProvider();
          return provider;
      }
  }
}


const web3Modal = new Web3Modal({
  cacheProvider: false, // optional
  providerOptions // required
});

export default Navbar;
