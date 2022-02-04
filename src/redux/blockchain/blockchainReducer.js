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
    providerConnected: false,
    contractDetected: false,
};

const blockchainReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "CONNECTION_REQUEST":
            return {
                ...initialState,
                loading: true,
            };
        case "CONNECTION_SUCCESS":
            console.log( payload )
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