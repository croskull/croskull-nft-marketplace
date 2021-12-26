import React from "react";
import { Accordion, Card } from "react-bootstrap";

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
      <p>
        <span className="font-weight-bold">Price</span> :{" "}
        {window.web3.utils.fromWei(price.toString(), "Ether")} CRO
      </p>
      <p>
        <span className="font-weight-bold">No. of Transfers</span> :{" "}
        {numberOfTransfers.toNumber()}
      </p>
      {props.accountAddress === mintedBy &&
        props.accountAddress !== previousOwner ? (
        <div className="alert alert-success w-50 text-center m-auto">
          Minted
        </div>
      ) : (
        <div className="alert alert-info w-50 text-center m-auto">Bought</div>
      )}
      <br></br>
      <Accordion>
        <Card>
          <Accordion.Toggle eventKey="1" className="toogle-button btn-dark">
            Traits Properties
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="1">
          <div className="d-flex list-group skullMetadata border-shadow">
                            { metaData ? 
                            metaData.attributes.map( attribute => {
                                return (
                                <span className="font-weight-bold">{attribute.trait_type}: 
                                     {attribute.value}
                                </span>
                                )
                            })
                            : ''}
                        </div>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </div>
  );
};

export default MyCroSkullNFTDetails;
