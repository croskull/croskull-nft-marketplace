import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import thunk from "redux-thunk";
import blockchainReducer from "./blockchain/blockchainReducer";
import dataReducer from "./data/dataReducer";
import marketplaceReducer from "./marketplace/marketplaceReducer";
import raffleReducer from "./raffle/raffleReducer";
import dexscreenerReducer from "./dexscreener/dexscreenerReducer";
import bankReducer from "./bank/bankReducer";
import evoReducer from "./evo/evoReducer";
import petReducer from "./pet/petReducer";

const rootReducer = combineReducers({
  blockchain: blockchainReducer,
  data: dataReducer,
  marketplace: marketplaceReducer,
  raffle: raffleReducer,
  dexscreener: dexscreenerReducer,
  bank: bankReducer,
  evo: evoReducer,
  pet: petReducer
});

const middleware = [thunk];
const composeEnhancers = compose(applyMiddleware(...middleware));

const configureStore = () => {
  return createStore(rootReducer, composeEnhancers);
};

const store = configureStore();

export default store;
