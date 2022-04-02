import React , { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
const MetricContainer = ({
    value,
    icon,
    label,
    tooltip,
    addClass,
    vertical = false,
    usdValue,
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
                <b>{ value }</b>
                {
                    icon ? (
                        <img 
                            className="skull-icon"
                            src={icon} 
                        />
                    ) : ('')
                }
            </span>
            { usdValue ? (
                <span className="metric-usd-value">
                    ${parseFloat(usdValue).toFixed(2)}
                </span>
             ) : ('')
            }
        </div>
    )
}

export default MetricContainer;