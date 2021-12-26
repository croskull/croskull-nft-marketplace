import React, { useState, useEffect } from "react";
import CroSkullNFTImage from "../CroSkullNFTImage/CroSkullNFTImage";
import MyCroSkullNFTDetails from "../MyCroSkullNFTDetails/MyCroSkullNFTDetails";
import Loading from "../Loading/Loading";
import './MyCroSkulls.css'

const MyCroSkulls = ({
  accountAddress,
  croSkulls,
  totalTokensOwnedByAccount,
}) => {
  const [loading, setLoading] = useState(false);
  const [myCroSkulls, setMyCroSkulls] = useState([]);

  useEffect(() => {
    if (croSkulls.length !== 0) {
      if (croSkulls[0].metaData !== undefined) {
        setLoading(loading);
      } else {
        setLoading(false);
      }
    }
    const my_cro_skulls = croSkulls.filter(
      (croskull) => croskull.currentOwner === accountAddress
    );
    setMyCroSkulls(my_cro_skulls);
  }, [croSkulls]);

  return (
    <div className="container">
          <h5 className="mcb-title">
            Total No. of CroSkulls You Own : {totalTokensOwnedByAccount}
          </h5>
      <div className="d-flex flex-wrap mb-2">
        {myCroSkulls.map(  (croskull) => {
          return (
            <div
              key={croskull.tokenId.toNumber()}
              className="w-50 p-4 mt-1 border"
            >
              <div className="row">
                <div className="col-md-6">
                  {!loading && croskull.metaData ? (
                    <CroSkullNFTImage imageURI={croskull.metaData.image} />
                  ) : (
                    <Loading />
                  )}
                </div>
                <div className="col-md-6 text-center">
                  <MyCroSkullNFTDetails
                    croskull={croskull}
                    accountAddress={accountAddress}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCroSkulls;