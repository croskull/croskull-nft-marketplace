// constants
import {
    ethers
} from 'ethers';
// log
import CroSkullsAmbassador from "../../abis/CroSkullsAmbassador.json";
import StakingArtifacts from "../../abis/croSkullStaking.json";
import Grave from "../../abis/Grave.json";
import Description from "../../abis/nftDescription.json";
import {
    fetchData, sendNotification, getSkullsData
} from "../data/dataActions";

const networkId =  338 || 5777; //25 production, 339 cassini, 5777 ganache local env
const stakingAddress = StakingArtifacts.networks[networkId].address;
const graveAddress = Grave.networks[networkId].address;
const ContractAddress = CroSkullsAmbassador.networks[networkId].address;
const descriptionAddress = Description.networks[networkId].address;

//const ContractAddress = CroSkulls.networks[networkId].address;

const connectRequest = () => {
    return {
        type: "CONNECTION_REQUEST",
    };
};

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

export const connect = (_provider = false) => {
    return async (dispatch) => {
        dispatch(connectRequest());
        let provider;

        if (_provider) {
            provider = _provider;
        } else if (!provider) {
            provider = window.ethereum
        }

        let ethProvider = new ethers.providers.Web3Provider(provider, "any");
        if (ethProvider.provider.networkVersion == networkId) {
            let signer = ethProvider.getSigner(0);
            let croSkullsContract = new ethers.Contract(ContractAddress, CroSkullsAmbassador.abi, signer);
            let croSkullsStaking = new ethers.Contract(stakingAddress, StakingArtifacts.abi, signer);
            let croSkullsGrave = new ethers.Contract(graveAddress, Grave.abi, signer);
            let croSkullsDescription = new ethers.Contract(descriptionAddress, Description.abi, signer);
            let accounts = await provider.request({
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
                    provider,
                    croSkullsContract,
                    croSkullsStaking,
                    croSkullsGrave,
                    croSkullsDescription
                }))
                dispatch(getSkullsData())
            }
            //await this.loadBlockchainData()
        } else {
            dispatch(contractNotDetected())
        }

    }
}


export const updateAccount = (account) => {
    return async (dispatch) => {
        dispatch(updateAccountRequest({
            account: account
        }));
        dispatch(fetchData(account));
    };
};