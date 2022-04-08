const initialState = {

};

const galleryReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "FETCH_EBISUS_REQUEST":
            return {
                ...initialState,
            };
        case "FETCH_EBISUS_SUCCESS":
            return {
                ...state,
            };
        case "FETCH_SKULLS_SUCCESS":
            return{
                ...state,
            }
        case "UPDATE_STATE":
            return {
                ...state,
                [payload.key]: payload.value
            }
        default:
            return state;
    }
};

export default galleryReducer;