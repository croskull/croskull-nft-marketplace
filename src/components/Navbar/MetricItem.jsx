import React , { useState } from "react";
const MetricContainer = ({
    value,
    icon,
    label,
    tooltip
}) => {
    return (
        <div className="metric-container">
            {label}
            <span className="metric-icon">
            { value }
            <img 
                className="skull-icon"
                src={icon} 
            />
            </span>
        </div>
    )
}

export default MetricContainer;