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
    graveBalance: 0,
    graveTotalSupply: 0,
    //soul
    soulsBalance: 0,
    //rude
    rudeBalance: 0,
    //staking
    approval: false,
    alreadyClaimed: 0,
    blockTimestamp: false,
    cyclesLastWithdraw: 0,
    croSkullsStaked: [],
    lastBlock: false,
    malusFee: 0,
    daysLastWithdraw: 0,
    owner: "",
    rewards: 0,
    rewardPlusMalus: 0,
    soulsGenerated: 0,
    startStakeTimestamp: 0,
    stakingStarted: false,
    totalSkullsStaked: 0,
    totalWithdrawedGraves: 0,
    totalWithdrawedSouls: 0,
    lastWithdrawTimestamp: 0,
    //pets
    petEggsLimit: 0,
    petEggsBalance: 0,
    petEggsSupply: 0,
    petEggsMaxSupply: 0,
    petEggsCost: 0,
    approvedEggs: false,
    //blue potion
    blueCount: 0,
    blueId: [],
    //red potion
    redCount: 0,
    redId: [],
    //purple potion
    purpleSupply: 0,
    purpleCount: 0,
    purpleId: [],
    purpleGraveAllowance: 0,
    purpleBlueApproval: false,
    purpleRedApproval: false,
    //stories
    storyAllowance: false,
    skullsStories: [],
    storiesLoading: false,
    storyLastBlock: 0,
    //ebisus
    ebisusData: [],
    //notifier
    title: "",
    message: "",
    type: "info", // success, danger, info, warning
    tx: "",
    error: false,
    errorMsg: "",
    //audioplayer
};

const dataReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "PLAY_SOUND":
            return {
                ...state,
                audioSrc: payload.audioSrc,
                isPlaying: payload.isPlaying
            }
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
        case "SET_STORY_ALLOWANCE": {
            return {
                ...state,
                loading: false,
                storyAllowance: payload.storyAllowance
            }
        }
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
                advancedMetadata: payload.advancedMetadata,
                ebisusData: payload.ebisusData
            }
        case "FETCH_BALANCES_SUCCESS": {
            return {
                ...state,
                graveBalance: payload.graveBalance,
                soulsBalance: payload.soulsBalance,
                petEggsBalance: payload.petEggsBalance
            }
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
                rarityIndex: payload.rarityIndex,
                rarities: payload.rarities,
                totalSkullsStaked: payload.totalSkullsStaked,
                totalWithdrawedGraves: payload.totalWithdrawedGraves,
                totalWithdrawedSouls: payload.totalWithdrawedSouls,
                lastWithdrawTimestamp: payload.lastWithdrawTimestamp,
                daysLastWithdraw: payload.daysLastWithdraw,
                burnedGraves: payload.burnedGraves,
                graveTotalSupply: payload.graveTotalSupply
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
        case "FETCH_STORIES":
            return {
                ...state,
                storiesLoading: true
            }
        case "SET_SKULLS_STORIES":
            return {
                ...state,
                skullsStories: payload.skullsStories,
                storiesLoading: false
            }
        case "SET_POTIONS":
            return {
                ...state,
                redId: payload.redId,
                redCount: payload.redCount,
                blueId: payload.blueId,
                blueCount: payload.blueCount,
                purpleSupply: payload.purpleSupply,
                purpleCount: payload.purpleCount,
                purpleId: payload.purpleId,
                purpleGraveAllowance: payload.purpleGraveAllowance,
                purpleBlueApproval: payload.purpleBlueApproval,
                purpleRedApproval: payload.purpleRedApproval,
                
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
                graveBalance: 0,
                rarities: [],
                title: "",
                message: "",
                type: "info", // success, danger, info, warning
                tx: "",
                skullsStories: [],
                rudeBalance: 0,
                error: false,
                errorMsg: "",
                petEggsLimit: 0,
                petEggsBalance: 0,
                petEggsSupply: 0,
                petEggsMaxSupply: 0,
                petEggsCost: 0,
                approvedEggs: false,
                totalSkullsStaked: 0,
                totalWithdrawedGraves: 0,
                totalWithdrawedSouls: 0,
                lastWithdrawTimestamp: 0,
                soulsBalance: 0,
                redCount: 0,
                blueCount: 0,
                blueId: [],
                redId: [],
                purpleSupply: 0,
                purpleCount: 0,
                purpleId: [],
                purpleGraveAllowance: 0,
                purpleBlueApproval: false,
                purpleRedApproval: false,
                storyAllowance: false,
                daysLastWithdraw: 0,
                graveTotalSupply: 0
            }
        case "UPDATE_MERCHANT":
            return {
                ...state,
                petEggsLimit: payload.petEggsLimit,
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