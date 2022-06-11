const initialState = {
    loading: false,
    //grave related
    allowance: 0,
    //global bank state
    maxApy: 0,
    totalGraveVolume: 0,
    totalWishbonesVolume: 0,
    totalContractsVolume: 0,
    depositedGrave: 0,
    activeWishbones: 0,
    activeContracts: 0,
    wishboneCost: 0,
    bankFee: 0,
    //user state
    userContractsCount: 0,
    userActiveContracts: [],
    userContracts: [],
    //global farm state
    lpPairAllowance: 0,
    rewardPerBlock: 0,
    paidOut: 0,
    endBlock: 0,
    stakedAmount: 0,
    pendingRewards: 0,
    totalPending: 0,
    //global farm
    totalLiquidity: 0,
    lpPairBalance: 0,
    totalStakedCro: 0
};

const bankReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "FETCH_BANK_REQUEST":
            return {
                ...initialState,
                loading: true
            };
        case "FETCH_BANK_SUCCESS":
            return {
                ...state,
                loading: false,
                allowance: payload.allowance,
                maxApy: payload.maxApy,
                totalGraveVolume: payload.totalGraveVolume,
                totalWishbonesVolume: payload.totalWishbonesVolume,
                totalContractsVolume: payload.totalContractsVolume,
                depositedGrave: payload.depositedGrave,
                activeWishbones: payload.activeWishbones,
                activeContracts: payload.activeContracts,
                wishboneCost: payload.wishboneCost,
                bankFee: payload.bankFee,
                //user state
                userContractsCount: payload.userContractsCount,
                userActiveContracts: payload.userActiveContracts,
                userContracts: payload.userContracts,
            };
        case "FETCH_FARM_SUCCESS":
            return {
                ...state,
                rewardPerBlock: payload.rewardPerBlock,
                paidOut: payload.paidOut,
                endBlock: payload.endBlock,
                lpPairAllowance: payload.lpPairAllowance,
                stakedAmount: payload.stakedAmount,
                totalLiquidity: payload.totalLiquidity,
                pendingRewards: payload.pendingRewards,
                lpPairBalance: payload.lpPairBalance,
                totalPending: payload.totalPending,
                totalStakedCro: payload.totalStakedCro
            }
        default:
            return state;
    }
};

export default bankReducer;