import React from "react";

const EvoStat = ({icon, value, tooltip}) => {
    return  (
        <div class="stat">
            <img class="stat-icon" src={icon} />
            <span class="stat-tooltip">{tooltip}</span>
            <span>{value}</span>
        </div>
    )
}
export default EvoStat;