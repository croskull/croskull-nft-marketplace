import { ethers } from "ethers";
import store from "../store";
import { sendNotification, getSkullsData } from "../data/dataActions";

const fetchRaffleRequest = () => {
  return {
    type: "FETCH_RAFFLE_REQUEST",
  };
};

const fetchRaffleSuccess = (payload) => {
    return {
      type: "FETCH_RAFFLE_SUCCESS",
      payload: payload
    }
}

export const loadRaffleData = () => {
    return async (dispatch) => {
        dispatch(fetchRaffleRequest())
        let { accountAddress, croRaffle, croSkullsGrave } = store.getState().blockchain
        let raffleCount = await croRaffle.raffleCounter()
        let raffles = []
        raffleCount = await raffleCount.toString()
        if( raffleCount ) {
            for( let i = raffleCount-1; i > 1; i--){
                if( i <= 1 ) return
                let raffle = await croRaffle.getRaffle(i)
                let winners = await croRaffle.getWinners(i)

                let isParticipant = await croRaffle.isParticipant(i)
                let playersCount = await raffle.playersCount.toString()

                let ipfsHash = raffle.ipfsHash.replace('ipfs://', 'https://ipfs.infura.io/ipfs/')
                let hashMetadata = await fetch( ipfsHash );
                hashMetadata = await hashMetadata.json()
                let { type, title, winnersCount, maxParticipants, cost, collectionName, collectionAddress, startTimestamp, description, image } = hashMetadata;
                raffles.push({
                    type, 
                    title,
                    id: i,
                    winnersCount,
                    maxParticipants, 
                    cost,
                    image,
                    collectionName,
                    isParticipant,
                    collectionAddress,
                    startTimestamp,
                    endTimestamp: raffle.endTimestamp.toString(),
                    description,
                    winners,
                    participants: playersCount
                })
            }
        }
        let isManager = await croRaffle.managers(accountAddress)
        let owner = await croRaffle.owner()
        if(  ethers.utils.getAddress(owner) == ethers.utils.getAddress( accountAddress ) ) 
            isManager = true

        let allowance = await croSkullsGrave.allowance( accountAddress, croRaffle.address )
        allowance = allowance.toString()

        dispatch(fetchRaffleSuccess( {
            raffleCount,
            init: true,
            raffles,
            allowance,
            isManager
        } ))
    }
}