import { ethers } from 'ethers';
const initialState = {
    loading: false,
    errorMsg: "",
    provider: false,
    ethProvider: false,
    accountAddress: "",
    accountBalance: "",
    managerAddress: null,
    croSkullsContract: false,
    croSkullsStaking: false,
    croSkullsGrave: false,
    croSkullsDescription: false,
    croSkullsPetEggs: false,
    croSkullsSouls: false,
    croPotionBlue: false,
    croPotionRed: false,
    croPotionPurple: false,
    croSkullsBank: false,
    croSkullsFarm: false,
    croSkullsRude: false,
    croRaffle: false,
    ebisusMarketplace: false,
    providerConnected: false,
    contractDetected: false,
    lpPair: false,
    ethers: ethers,
    formatEther: (bn, fixed = false) => fixed ? parseFloat(ethers.utils.formatEther(bn)).toFixed(2) : ethers.utils.formatEther(bn)
}

const blockchainReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "CONNECTION_REQUEST":
            return {
                ...initialState,
                loading: true,
            };
            case "CONNECTION_SUCCESS":
            return {
                ...state,
                loading: false,
                contractDetected: true,
                accountAddress: payload.accountAddress,
                accountBalance: payload.accountBalance,
                ethProvider: payload.ethProvider,
                croSkullsContract: payload.croSkullsContract,
                croSkullsStaking: payload.croSkullsStaking,
                croSkullsGrave: payload.croSkullsGrave,
                croSkullsDescription: payload.croSkullsDescription,
                croSkullsPetEggs: payload.croSkullsPetEggs,
                croSkullsSouls: payload.croSkullsSouls,
                croSkullsBank: payload.croSkullsBank,
                croSkullsFarm: payload.croSkullsFarm,
                croPotionBlue: payload.croPotionBlue,
                croPotionRed: payload.croPotionRed,
                croPotionPurple: payload.croPotionPurple,
                croSkullsRude: payload.croSkullsRude,
                croRaffle: payload.croRaffle,
                lpPair: payload.lpPair,
                ebisusMarketplace: payload.ebisusMarketplace,
                provider: payload.provider,
                providerConnected: true,
            };
        case "CONNECTION_FAILED":
            return {
                ...initialState,
                loading: false,
                    errorMsg: action.payload,
            };
        case "UPDATE_ACCOUNT":
            return {
                ...state,
                account: action.payload.account,
            };
        case "DISCONNECT":
            return {
                ...state,
                loading: false,
                errorMsg: "",
                provider: false,
                ethProvider: false,
                accountAddress: "",
                accountBalance: "",
                managerAddress: null,
                croSkullsContract: false,
                croSkullsStaking: false,
                croSkullsGrave: false,
                croSkullsDescription: false,
                croSkullsSouls: false,
                croSkullsBank: false,
                croPotionBlue: false,
                croPotionRed: false,
                croPotionRed: false,
                croRaffle: false,
                croSkullsFarm: false,
                lpPair: false,
                ebisusMarketplace: false,
                providerConnected: false,
                contractDetected: false,
            }
        case "CONTRACT_NOT_DETECTED":
            return {
                ...state,
                loading: false,
                providerConnected: true,
                contractDetected: false
            }
        default:
            return state;
    }
};

export default blockchainReducer;