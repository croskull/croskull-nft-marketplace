import React from "react";
import { Accordion, Card } from "react-bootstrap";
import news from './new_blue.png';
import './MyCroSkullNFTDetails.css'


const MyCroSkullNFTDetails = (props) => {
  const {
    tokenId,
    tokenName,
    price,
    mintedBy,
    previousOwner,
    numberOfTransfers,
    metaData
  } = props.croskull;

  return (
    <div key={tokenId.toNumber()} className="mt-4 ml-3">
      <p>
        <span className="font-weight-bold">Token Id</span> :{" "}
        {tokenId.toNumber()}
      </p>
      <div className="d-flex list-group skullMetadata border-shadow">
        {metaData ?
          metaData.attributes.map(attribute => {
            return (
              <span className="font-weight-bold">{attribute.trait_type}:
                {" "}{attribute.value}
              </span>
            )
          })
          : ''}
      </div>
      {props.accountAddress === mintedBy &&
        props.accountAddress !== previousOwner ? (
        <div className="alert alert-success w-50 text-center m-auto">
          Minted
        </div>
      ) : (
        <div className="alert alert-info w-50 text-center m-auto">Bought</div>
      )}
      {new Date().getTime() - metaData.date < 1800000 ?
        <div><img src={news} className="details-img"></img> </div> :
        <div> </div>
      }

    </div>

  );
};

export default MyCroSkullNFTDetails;
