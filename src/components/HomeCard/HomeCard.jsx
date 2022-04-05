import React from "react";



const HomeCard = ({ image = false, title = false, description = false, location = false, redirect = false }) => {

    return (
        <div 
            className="home-card fg-1 sk-box-content sk-column"
            onClick={ location || redirect ? () => location ? window.location.hash = location : window.open(redirect) : () => {} }
        >
            {
                image ? (
                    <img 
                        className="card-image"
                        src={image} 
                    />
                ) : ('')
            }
            {
                title ? (
                    <span className="card-title">{title}</span>
                ) : ('')
            }
            {
                description ? (
                    <span className="card-description">{description}</span>
                ) : ('')
            }
        </div>
    )
}


export default HomeCard;