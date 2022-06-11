import React from "react";

const EvoStat = ({icon, value, tooltip}) => {
    return  (
        <div className="stat">
            <img className="stat-icon" src={icon} />
            <span className="stat-tooltip">{tooltip}</span>
            <span>{value}</span>
        </div>
    )
}
export default EvoStat;