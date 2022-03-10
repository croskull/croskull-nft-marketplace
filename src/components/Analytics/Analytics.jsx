import React, { useEffect, useState } from "react";
import './analytics.css'
import CROIcon from '../Navbar/crypto-com.svg';
import Skull from '../Navbar/skull.png';
import MetricContainer from '../MetricContainer/MetricContainer';
import store from "../../redux/store";

const Analytics = () => {
    let { blockchain, data } = store.getState()
    
    let {
        totalSkullsStaked,
        ebisusData
    } = data

    

    return (
        <>
            <div className="sk-flex sk-row">
                <div className="sk-container wd-66">
                    <div className="sk-box">
                        <div className="tab-head">
                            <h2>Analytics</h2>
                        </div>
                        <div className="sk-box-content sk-row">
                            <MetricContainer 
                                label="SLiq"
                                value={`${ totalSkullsStaked }`}
                                icon={Skull}
                                vertical={true}
                                tooltip="Stake Liquidity: amout of CroSkulls NFT staked in Adventures."
                            />
                            <MetricContainer 
                                label="Stake Percent"
                                value={`${ totalSkullsStaked ? parseFloat(100 / 6666 * totalSkullsStaked).toFixed(1) : 0 }%`}
                                icon={Skull}
                                vertical={true}
                                tooltip={`Stake Percent: Percent of Staked skull based on the Total Supply (${totalSkullsStaked}/6666).`}
                            />
                            <MetricContainer 
                                label="FDV"
                                value={totalSkullsStaked && ebisusData ? totalSkullsStaked * ebisusData.floorPrice : 0}
                                vertical={true}
                                icon={CROIcon}
                                tooltip="Fully Diluted Value: Total diluted market cap of the Adventure pool equal to ( SLiq * Current Floor Price)."
                            />
                            <MetricContainer 
                                label="ADV"
                                value={totalSkullsStaked && ebisusData ? parseInt(totalSkullsStaked * ebisusData.averageSalePrice) : 0}
                                vertical={true}
                                icon={CROIcon}
                                tooltip="Average Diluted Value: Diluted market cap of the Adventure pool equal to ( SLiq * Current Avg Sale Price)."
                            />
                        </div>
                        <div className="sk-box-content sk-row">

                        </div>
                    </div>
                </div>
                <div className="sk-container wd-33">
                    <div className="sk-box">
                        <div className="tab-head">
                            <h2>CroSkull Stats</h2>
                        </div>
                        <div className="sk-box-content sk-column">
                            <MetricContainer 
                                label="Total Volume"
                                value={ebisusData && ebisusData.totalVolume ? parseInt(ebisusData.totalVolume) : 0}
                                icon={CROIcon}
                            />
                            <MetricContainer 
                                label="Floor Price"
                                value={ebisusData && ebisusData.floorPrice ? parseInt(ebisusData.floorPrice) : 0}
                                icon={CROIcon}
                            />
                            <MetricContainer 
                                label="Avg. Sale Price"
                                value={ebisusData && ebisusData.averageSalePrice ? parseFloat(ebisusData.averageSalePrice).toFixed(2) : 0 }
                                icon={CROIcon}
                            />
                            <MetricContainer 
                                label="Skull Sales"
                                value={ebisusData ? ebisusData.numberOfSales : 0 }
                                icon={Skull}
                            />
                            <MetricContainer 
                                label="Skull for Sales"
                                value={ebisusData ? ebisusData.numberActive : 0}
                                icon={Skull}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Analytics;