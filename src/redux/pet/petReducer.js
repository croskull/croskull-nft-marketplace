const initialState = {
    loading: false,
    pets: [],
    isEggApproved: false,
    rudeAllowance: false,
    soulsAllowance: false,
    totalSupply: 0,
    //rewards
    rewards: 0
}

const petReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "FETCH_PET":
            return {
                ...initialState,
                loading: true,
            };
        case "LOAD_PET":
            return {
                ...state,
                loading: false,
                pets: payload.pets,
                isEggApproved: payload.isEggApproved,
                rudeAllowance: payload.rudeAllowance,
                soulsAllowance: payload.soulsAllowance,
                rewards: payload.rewards,
                totalSupply: payload.totalSupply,
            };
        case "UPDATE_STATE":
            return {
                ...state,
                [payload.key]: payload.value
            }
        case "DISCONNECT":
            return {
                ...initialState
            }
        default:
            return state;
    }
};

export default petReducer;