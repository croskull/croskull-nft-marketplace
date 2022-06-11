import {
  ethers
} from 'ethers';
import React, { useEffect, useState } from "react";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import { connect, disconnect } from "../../redux/blockchain/blockchainActions";
import cryptoIcon from "../images/crypto-com.svg";
import { DeFiWeb3Connector } from 'deficonnect';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import Logo from "./logo-white.png";
import Grave from "../images/grave.png";
import GraveBurn from "../images/grave-burn.png";
import Skull from "../images/skull.png";
import Rude from "../images/rude.png";
import GraveMined from "../images/grave-mined.png";
import GraveAvailable from "../images/grave-available.png";
import SkullAdventure from '../images/skull-adventure.png';
import { Link } from "react-router-dom";
import menuIcon from "./menu-icon.svg";
import Soul from "../images/soul.png";
import MetricContainer from "../MetricContainer/MetricContainer"
import './navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter, faMedium } from '@fortawesome/free-brands-svg-icons'
import { faBook } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {
  const dispatch = useDispatch();
  let { blockchain, data } = store.getState();
  let { rewardPlusMalus, soulsBalance, graveBalance, rudeBalance, croSkulls, rewards, croSkullsStaked, daysLastWithdraw, petEggsMinted, petEggsLimit, redCount, blueCount, purpleCount } = data
  let { accountAddress, formatEther, contractDetected, loading, cnsDomain } = blockchain
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
      const provider = new ethers.providers.Web3Provider(_provider || window.ethereum);
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

  let canMintEggs = petEggsMinted < petEggsLimit
  let canMintPurple = redCount > 0 && blueCount > 0
  let canMintEvo = croSkulls.length > 0 && purpleCount > 0 || croSkulls.length > 0 && canMintPurple > 0
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
              src={Grave}
            />
            { `${formatEther(graveBalance, true)}` }
            <span className="sk-tooltip">Current GRAVE Balance</span>
          </span>
          <span>
            <img 
              className="skull-icon"
              src={Rude}
            />
            { `${formatEther(rudeBalance, true)}` }
            <span className="sk-tooltip">Current RUDE Balance</span>
          </span>
          <span>
            <img 
              className="skull-icon"
              src={Soul}
            />
            { `${ soulsBalance }` }
            <span className="sk-tooltip">Current SOULS Balance</span>
          </span>
        </div>
        <div className="balances-offcanvas">
          <button
            className="skull-button view-more"
          >
            More
          </button>
          <div className={`sk-box flex-v season`}>
            <span className="season-heading">
              <span className="season-title">Adventure</span>
              <a href="#/adventure" className="season-more">More >></a>
            </span>
            <div className="sk-box-content flex-v">
              <MetricContainer 
                label="Free Skulls"
                value={ `${croSkulls.length ? croSkulls.length : 0}` }
                icon={Skull}
                tooltip="Amount of CroSkulls currently in the Tavern."
              />
              <MetricContainer 
                label="Skull in Adventure"
                value={`${ croSkullsStaked.length ? croSkullsStaked.length : 0}`}
                icon={SkullAdventure}
                tooltip="Amount of CroSkulls currently Staked in the Adventure."
              />
              <MetricContainer 
                label="Generated Grave"
                value={`${formatEther(rewards, true)}`}
                icon={GraveMined}
                tooltip="Amount of CroSkulls currently Staked in the Adventure."
              />
              <MetricContainer 
                label="Withdrawable Grave"
                value={ `${formatEther(rewardPlusMalus, true)}` }
                icon={GraveAvailable}
                addClass="positive"
                tooltip="Amount of Grave currently withdrawable from the Adventure."
              />
              <MetricContainer 
                label="Burned Grave"
                value={ `${ malusAmount } (${ malusPercent < 81 && malusPercent > 0 ? malusPercent : 0 }%)` }
                icon={GraveBurn}
                addClass="negative"
                tooltip="Amount of Grave that will be Burned if claim occurs now."
              />
            </div>
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
          </li>
          {
            <li className="nav-item">
              <Link to="/hall-of-fame" className="nav-link">
                Hall Of Fame
              </Link>
            </li>
          }
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
          {
            /*<li className="nav-item">
            <Link to="/merchant" className={`nav-link ${ canMintEggs ? `hot` : ``}`}>
              Merchant
            </Link>
          </li>*/
          }
          <li className="nav-item">
            <Link to="/analytics" className="nav-link">
              Analytics
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/raffle" className="nav-link hot">
              Raffle
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/laboratory" className={`nav-link ${ canMintPurple || canMintEvo ? `hot` : `` }`}>
              Laboratory
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
              isHovered ? 
                `Disconnect` :
                  cnsDomain ? 
                    `${cnsDomain}` : 
                      `${accountAddress.substr(0, 5)}...${accountAddress.substr(39, 41)}` 
          }
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
