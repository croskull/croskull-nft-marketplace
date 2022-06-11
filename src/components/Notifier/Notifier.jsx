import React, { useEffect, useState } from "react";
import store from "../../redux/store";
import 'react-notifications-component/dist/theme.css'
import './Notifier.css';
import SkullLogo from '../images/skull-logo.png';
const Notifier = () => {

    let { data } = store.getState()

    const [ notifier, setNotifier ] = useState({
        title: "",
        message: "",
        type: "",
        duration: 6000,
    });

    const [ display, setDisplay ] = useState(false)

    const onClickHide = () => {
        setDisplay(false)
    }


    useEffect((a) => {
        let message = data.message || data.errorMsg
        let type = data.type
        let icon;
        if( notifier.message != message && notifier.title != data.title) {
            setNotifier(
                {
                    title: `${data.title}`,
                    message: `${message}`,
                    type: type || "success",
                    duration: 5000,
                }
            )
            setDisplay(true)
        }
    }, [data.message, data.errorMsg])

    useEffect( ( ) => {
        setTimeout(() => {
            setDisplay(false)
        }, notifier.duration)
    }, [notifier.title])

    return (
        <div 
            className={`sk-box sk-notifier ${display ? `show` : ``}`}
            onClick={() => onClickHide()}
        >
            <div className="notifier-wrapper">
                { /**
                 * 
                 * <span className="notifier-icon">
                    <img src={notifier.icon} />
                    </span>
                 */}
                <div className="sk-box-content sk-flex sk-column">
                    <span className="progress-container">
                        <span className="progress-bar"></span>
                    </span>
                    <span className="notifier-title">{notifier.title}</span>
                    <span className="notifier-description">{notifier.message}</span>
                </div>
            </div>
        </div>
    )
}

export default Notifier;