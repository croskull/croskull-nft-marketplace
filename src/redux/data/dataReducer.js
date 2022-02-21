const initialState = {
    loading: false,
    //croskull
    croSkullsContractOwner: null,
    croSkulls: [],
    croSkullsCount: 0,
    croSkullsMaxSupply: 0,
    advancedMetadata: [],
    rarities: [],
    //grave
    userGraveBalance: 0,
    //staking
    croSkullsStaked: [],
    approval: false,
    stakingStarted: false,
    startStakeTimestamp: 0,
    blockTimestamp: false,
    alreadyClaimed: 0,
    malusFee: 0,
    rewardPlusMalus: 0,
    rewards: 0,
    cyclesLastWithdraw: 0,
    soulsGenerated: 0,
    lastBlock: false,
    owner: "",
    //pets
    petEggsLimit: 0,
    petEggsMintedByUser: 0,
    petEggsSupply: 0,
    petEggsMaxSupply: 0,
    petEggsCost: 0,
    approvedEggs: false,
    //stories
    skullsStories: [],
    //notifier
    title: "",
    message: "",
    type: "info", // success, danger, info, warning
    tx: "",
    error: false,
    errorMsg: "",
};

const dataReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "CHECK_DATA_REQUEST":
            return {
                ...state,
                loading: true,
                error: false,
                errorMsg: "",
            };
        case "CHECK_DATA_SUCCESS":
            return {
                ...state,
                loading: false,
                totalSupply: action.payload.totalSupply,
                // cost: action.payload.cost,
                error: false,
                errorMsg: "",
            };
        case "CHECK_DATA_FAILED":
            return {
                ...initialState,
                loading: false,
                error: true,
                errorMsg: action.payload,
            };
        case "SKULLS_REQUEST":
            return {
                ...state,
                loading: true
            }
        case "SKULLS_SUCCESS":
            return {
                ...state,
                loading: false,
                croSkulls: payload.croSkulls,
                croSkullsStaked: payload.croSkullsStaked,
                advancedMetadata: payload.advancedMetadata
            }
        case "FETCH_STAKING_SUCCESS":
            return {
                ...state,
                loading: false,
                approval: true,
                stakingStarted: true,
                owner: payload.owner,
                malusFee: payload.malusFee,
                rewardPlusMalus: payload.rewardPlusMalus,
                rewards: payload.rewards,
                startStakeTimestamp: payload.startStakeTimestamp,
                cyclesLastWithdraw: payload.cyclesLastWithdraw,
                lastBlock: payload.lastBlock,
                blockTimestamp: payload.blockTimestamp,
                alreadyClaimed: payload.alreadyClaimed,
                soulsGenerated: payload.soulsGenerated,
                userGraveBalance: payload.userGraveBalance,
                rarityIndex: payload.rarityIndex,
                rarities: payload.rarities,
            }
        case "UPDATE_STATE": 
            return {
                ...state,
                [payload.key]: payload.value
            }
        case "STAKING_DISABLED":
            return {
                ...state,
                loading: false,
                approval: false,
                stakingStarted: false
            }
        case "NOTIFICATION_REQUEST":
            return {
                ...state,
                message: payload.message,
                title: payload.title,
                tx: payload.tx,
                type: payload.type
            }
        case "SET_SKULLS_STORIES":
            return {
                ...state,
                skullsStories: payload.skullsStories
            }
        case "CLEAN_DATA":
            return {
                loading: false,
                croSkullsContractOwner: null,
                croSkulls: [],
                croSkullsStaked: [],
                croSkullsCount: 0,
                croSkullsMaxSupply: 0,
                approval: false,
                stakingStarted: false,
                startStakeTimestamp: 0,
                lastBlock: false,
                blockTimestamp: false,
                alreadyClaimed: 0,
                owner: "",
                malusFee: 0,
                rewardPlusMalus: 0,
                rewards: 0,
                cyclesLastWithdraw: 0,
                soulsGenerated: 0,
                userGraveBalance: 0,
                rarities: [],
                title: "",
                message: "",
                type: "info", // success, danger, info, warning
                tx: "",
                skullsStories: [],
                error: false,
                errorMsg: "",
                petEggsLimit: 0,
                petEggsMintedByUser: 0,
                petEggsSupply: 0,
                petEggsMaxSupply: 0,
                petEggsCost: 0,
                approvedEggs: false,
            }
        case "UPDATE_MERCHANT":
            return {
                ...state,
                petEggsLimit: payload.petEggsLimit,
                petEggsMintedByUser: payload.petEggsMintedByUser,
                petEggsSupply: payload.petEggsSupply,
                petEggsMaxSupply: payload.petEggsMaxSupply, 
                petEggsCost: payload.petEggsCost,
                approvedEggs: payload.approvedEggs,
            }
        default:
            return state;
    }
};

export default dataReducer;