import React , { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
const MetricContainer = ({
    value,
    icon,
    label,
    tooltip,
    addClass,
    vertical = false
}) => {
    return (
        <div className={`metric-container ${vertical ? 'vertical' : ''}`}>
            <span>
                {label}
                {
                    tooltip ? (
                        <span className="tooltip-toggle">
                            <FontAwesomeIcon 
                                icon={faQuestionCircle} 
                                className="tooltip-icon"
                            /> 
                            <span className="sk-tooltip">
                                {tooltip}
                            </span>
                        </span>
                    ) : (
                        ''
                    )
                }
            </span>
            <span 
                className={`metric-icon ${ addClass ? addClass : ''}`}
            >
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