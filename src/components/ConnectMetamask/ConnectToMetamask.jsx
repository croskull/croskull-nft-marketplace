import React, {useEffect} from "react";
import metamaskIcon from "./metamask.svg";
import cryptoIcon from "./crypto-com.svg";
import {DeFiWeb3Connector } from 'deficonnect';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
import './ConnectToMetamask.css';

import { useDispatch, useSelector } from "react-redux";
import { connect } from "../../redux/blockchain/blockchainActions";
import { fetchData } from "../../redux/data/dataActions";
import store from "../../redux/store";

const ConnectToMetamask = ({ connectToWeb3, connectToWalletConnect }) => {
  const dispatch = useDispatch();
  let { provider, ethProvider, providerConnected, loading } = store.getState().blockchain

  if( window.ethereum.isConnected() && ! loading ){
    dispatch( connect() ) // try default provider es metamask
  }

  const toggleProvidersModal = async () => {
    await web3Modal._toggleModal();
    web3ModalConnection()
  }

  const web3ModalConnection = () => {
    web3Modal.on("connect", async (_provider) => {
      dispatch(connect( _provider ))
    })
  }


  return (
    <div className="container metamask">
      <div className="">
        <h1 className="display-5">
          CroSkull NFT Marketplace
        </h1>
        <p className="lead">
          Access CroSkull Metaverse
        </p>
        <hr className="my-4" />
        <button
          onClick={toggleProvidersModal}
          className="btn btn-dark d-flex align-items-center"
          style={{ fontSize: "0.9rem", letterSpacing: "0.14rem" }}
        >
          Connect Wallet{" "}
          <img
            src={metamaskIcon}
            alt="metamask-icon"
            style={{ width: "2rem", marginLeft: "0.5rem" }}
          />
          <img
            src={cryptoIcon}
            alt="crypto-icon"
            style={{ width: "2rem", marginLeft: "0.5rem" }}
          />
        </button>
        <br></br>
      </div>
    </div>
  );
};

export default ConnectToMetamask;

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
      options: {},
      package: WalletConnectProvider,
      connector: async (ProviderPackage, options) =>  {
          const connector = new DeFiWeb3Connector({
              supportedChainIds: [25],
              rpc: {25: 'https://evm-cronos.crypto.org'},
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
  cacheProvider: true, // optional
  providerOptions // required
});
