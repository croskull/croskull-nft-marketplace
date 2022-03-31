// constants
import {
    ethers
} from 'ethers';
// log
import CroSkullsAmbassador from "../../abis/CroSkullsAmbassador.json";
import CroSkulls from "../../abis/CroSkulls.json";
import StakingArtifacts from "../../abis/croSkullStaking.json";
import Grave from "../../abis/Grave.json";
import Description from "../../abis/nftDescription.json";
import BluePotion from "../../abis/CroSkullsBluePotions.json";
import RedPotion from "../../abis/CroSkullsRedPotions.json";
import PetEggs from "../../abis/petEggs.json";
import Souls from "../../abis/Souls.json";
import Raffle from "../../abis/SkullsRaffle.json";
import {
  sendNotification, getSkullsData, cleanData
} from "../data/dataActions";
const chainId =  "0x19" || "0x152"; //testnet - 3
const networkId =  25; //338 || 5777; //25 production, 339 cassini, 5777 ganache local env
const stakingAddress = StakingArtifacts.networks[networkId].address;
const graveAddress = Grave.networks[networkId].address;
const ContractAddress = CroSkulls.networks[networkId].address;
const descriptionAddress = Description.networks[networkId].address;
const petEggsAddress = PetEggs.networks[networkId].address;
const soulsAddress = Souls.networks[networkId].address;
const blueAddress = BluePotion.networks[networkId].address;
const redAddress = RedPotion.networks[networkId].address;
const raffleAddress = Raffle.networks[networkId].address;
const ebisusAddress = "0x7a3CdB2364f92369a602CAE81167d0679087e6a3";

const ebisusAbi = [
    "function makePurchase(uint256 _id) public payable"
];

//const ContractAddress = CroSkulls.networks[networkId].address;

const connectRequest = () => {
    return {
        type: "CONNECTION_REQUEST",
    };
};

const cleanBlockchain = () => {
    return {
        type: "CLEAN_BLOCKCHAIN",
    };
}

const connectSuccess = (payload) => {
    return {
        type: "CONNECTION_SUCCESS",
        payload: payload,
    };
};

const connectFailed = (payload) => {
    return {
        type: "CONNECTION_FAILED",
        payload: payload,
    };
};

const updateAccountRequest = (payload) => {
    return {
        type: "UPDATE_ACCOUNT",
        payload: payload,
    }
}

const contractNotDetected = () => {
    return {
        type: "CONTRACT_NOT_DETECTED"
    }
}

const noAccount = () => {
    return {
        type: "CONTRACT_NOT_DETECTED"
    }
}

const requestDisconnect = () => {
    return {
        type: "DISCONNECT"
    }
}

export const wishboneError = () => {
   
    return async (dispatch) => {
         dispatch(sendNotification({
        title: `Wishbones Error`,
        message: `wishbones must be a multiple of 10`,
        type: "danger"
    }))}
}

export const disconnect = () => {
    return async (dispatch) => {
        dispatch(requestDisconnect())
        dispatch(cleanData())
    }
}

export const connect = ( ethProvider = false) => {
    return async (dispatch) => {
        dispatch(connectRequest());
        if( ! ethProvider ){
            ethProvider = await ethers.getDefaultProvider('https://gateway.nebkas.ro')
            await ethProvider.getNetwork()
        }
        dispatch(handleProviderChanges(ethProvider))
        if (ethProvider.provider.chainId == chainId || ethProvider.provider.chainId == networkId ) {
            let signer = ethProvider.getSigner()
            let croSkullsContract = new ethers.Contract(ContractAddress, CroSkulls.abi, signer ? signer : false )
            let croSkullsStaking = new ethers.Contract(stakingAddress, StakingArtifacts.abi, signer ? signer : false )
            let croSkullsGrave = new ethers.Contract(graveAddress, Grave.abi, signer ? signer : false )
            let croPotionBlue = new ethers.Contract(blueAddress, BluePotion.abi, signer ? signer : false )
            let croPotionRed = new ethers.Contract(redAddress, RedPotion.abi, signer ? signer : false )
            //let croSkullsDescription = ''
            let croSkullsDescription = new ethers.Contract(descriptionAddress, Description.abi, signer ? signer : false )
            let croSkullsPetEggs = new ethers.Contract(petEggsAddress, PetEggs.abi, signer ? signer : false )
            let croSkullsSouls = new ethers.Contract(soulsAddress, Souls.abi, signer ? signer : false )
            let croRaffle = new ethers.Contract(raffleAddress, Raffle.abi, signer ? signer : false )
            let ebisusMarketplace = new ethers.Contract(ebisusAddress, ebisusAbi, signer ? signer : false )
            let accounts = await ethProvider.provider.request({
                method: 'eth_accounts',
            })
            
            if (accounts.length === 0) {
                dispatch(noAccount())
            } else {
                let accountAddress = accounts[0]
                dispatch(sendNotification({
                    title: `Welcome Back`,
                    message: `${accountAddress}`,
                    type: "default"
                }))
                let accountBalance = await ( await ethProvider.getBalance(accountAddress)).toString();
                dispatch(connectSuccess({
                    accountAddress,
                    accountBalance,
                    ethProvider,
                    croSkullsContract,
                    croSkullsStaking,
                    croSkullsGrave,
                    croSkullsDescription,
                    croSkullsPetEggs,
                    croSkullsSouls,
                    croPotionBlue,
                    croPotionRed,
                    croRaffle,
                    ebisusMarketplace
                }))
                dispatch(getSkullsData())
            }
            //await this.loadBlockchainData()
        } else {
            dispatch(contractNotDetected())
            ethProvider.provider.request({
                "id": 1,
                "jsonrpc": "2.0",
                "method": "wallet_switchEthereumChain",
                "params": [
                  {
                    "chainId": chainId,
                  }
                ]
            })
        }
    }
}

export const handleProviderChanges = (ethProvider) => {
    return async (dispatch) => {
        ethProvider.provider.on( 'accountsChanged', (accounts) => {
            dispatch(cleanData())
            dispatch(connect(ethProvider))
        })
        ethProvider.provider.on( 'chainChanged', (_chainId) => {
                dispatch(connect(ethProvider))
        })
    }
}