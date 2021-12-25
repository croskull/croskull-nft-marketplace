
import React, { useState, useEffect } from "react";
import CroSkullNFTImage from "../CroSkullNFTImage/CroSkullNFTImage";
import CroSkullNFTDetails from "../CroSkullNFTDetails/CroSkullNFTDetails";
import Loading from "../Loading/Loading";

const CroSkullList = ({
  croSkulls,
  prices,
  accountAddress,
  totalTokensMinted,
  changeTokenPrice,
  toggleForSale,
  buyCroSkull,
}) => {
  const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (croSkulls.length !== 0) {
            if (croSkulls[0].metaData !== undefined) {
                setLoading(loading);
            } else {
                setLoading(false);
            }
        }
    }, [croSkulls]);
    return (
        ! loading ? 
            croSkulls.map((croskull) => {
                return (
                <div
                    key={croskull.tokenId.toNumber()}
                    className="w-25 "
                    >
                        <div className="skullItem border-shadow">
                            { ! loading && croskull.metaData ? 
                                <CroSkullNFTImage 
                                    imageURI={croskull.metaData.image} 
                                />
                            : 
                            <Loading />
                            } 
                        <div className="d-flex mt-2 justify-content-between align-items-center">
                                <span class="skullId">#{croskull.tokenId.toNumber()}</span>
                                <span className="skullPrice">
                                    {
                                    window.web3.utils.fromWei(
                                        croskull.price.toString(),
                                        "Ether"
                                    ) 
                                    } <b>CRO</b>
                                </span>
                        </div>
                        <div className="d-flex list-group skullMetadata border-shadow">
                            { croskull.metaData ? 
                            croskull.metaData.attributes.map( attribute => {
                                return (
                                <span className="font-weight-bold">{attribute.trait_type}: 
                                     {attribute.value}
                                </span>
                                )
                            })
                            : ''}
                        </div>
                        <CroSkullNFTDetails
                            croskull={croskull}
                            accountAddress={accountAddress}
                            changeTokenPrice={changeTokenPrice}
                            toggleForSale={toggleForSale}
                            buyCroSkull={buyCroSkull}
                        />
                        </div>
                </div>
                );
            })
        : ''
    );
}

export default CroSkullList;