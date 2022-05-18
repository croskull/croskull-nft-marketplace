// constants
import {
    ethers
} from 'ethers';
// log
import CroSkullsAmbassador from "../../abis/CroSkullsAmbassador.json";
import CroSkulls from "../../abis/CroSkulls.json";
import SkullsStaking from "../../abis/croSkullStaking.json";
import Grave from "../../abis/Grave.json";
import Description from "../../abis/nftDescription.json";
import BluePotion from "../../abis/CroSkullsBluePotions.json";
import RedPotion from "../../abis/CroSkullsRedPotions.json";
import PurplePotion from "../../abis/PurplePotions.json";
import PetEggs from "../../abis/petEggs.json";
import Souls from "../../abis/Souls.json";
import Raffle from "../../abis/SkullsRaffle.json";
import Bank from "../../abis/SkullsBank.json";
import Farm from "../../abis/SkullsFarm.json"
import Rude from "../../abis/Rude.json";
import {
  sendNotification, getSkullsData, cleanData
} from "../data/dataActions";
import { CNS } from '@cnsdomains/core'
const chainId =  "0x19" || "0x152"; //testnet - 3
const networkId =  25; //25 || 5777; //25 production, 338 testnet3, 5777 ganache local env

const lpPairAddress = "0x4672D3D945700cc3BDf4a2b6704e429d567DC52c";
const ebisusAddress = "0x7a3CdB2364f92369a602CAE81167d0679087e6a3";

const ebisusMarketplaceAbi = [
    "function makePurchase(uint256 _id) public payable"
];
const lpPairAbi = [
    "function balanceOf(address account) public external view returns(uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
]

const Core_Contracts = {
    //ERC721
    croSkullsContract: CroSkulls,
    croPotionBlue: BluePotion,
    croPotionRed: RedPotion,
    croPotionPurple: PurplePotion,
    croSkullsPetEggs: PetEggs,
    //ERC20
    croSkullsGrave: Grave,
    croSkullsSouls: Souls,
    croSkullsRude: Rude,
    //ECOSYSTEM
    croSkullsBank: Bank,
    croSkullsFarm: Farm,
    croSkullsStaking: SkullsStaking,
    croRaffle: Raffle,
    croSkullsDescription: Description,
    //EXTERNALS
    ebisusMarketplace: {
        address: ebisusAddress,
        abi: ebisusMarketplaceAbi
    },
    lpPair: {
        address: lpPairAddress,
        abi: lpPairAbi
    }
}

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
            let payload = {}
            //preparing all the artifacts 
            
            Object.entries(Core_Contracts).map(
                (raw_artifact) => {
                    let name = raw_artifact[0]
                    let artifact = raw_artifact[1]
                    let signedContract = false
                    let contractAddress = artifact.address ? artifact.address : artifact.networks[networkId].address ? artifact.networks[networkId].address : false
                    let contractAbi = artifact.abi ? artifact.abi : false
                    if( contractAddress && contractAbi )
                        signedContract = new ethers.Contract(contractAddress, contractAbi, signer || false )

                    payload = {
                        ...payload,
                        [name]: signedContract
                    }
                }
            )
            let accounts = await ethProvider.provider.request({
                method: 'eth_accounts',
            })
            
            if (accounts.length === 0) {
                dispatch(noAccount())
            } else {
                let accountAddress = accounts[0]
                const cns = new CNS(chainId, signer)
                let cnsDomain = await cns.getName(accountAddress)
                dispatch(sendNotification({
                    title: `Welcome Back`,
                    message: `${cnsDomain || accountAddress}`,
                    type: "default"
                }))
                let accountBalance = await ( await ethProvider.getBalance(accountAddress)).toString();
                //updating payload before dispatch
                payload = {
                    ...payload,
                    accountAddress,
                    cnsDomain,
                    accountBalance,
                    ethProvider
                }
                dispatch(connectSuccess(payload))
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