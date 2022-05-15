import React, { useEffect, useState } from "react";
import store from "../../redux/store";
import 'react-notifications-component/dist/theme.css'
const Notifier = () => {

    let { data } = store.getState()

    const [ state, setNotifier ] = useState({
        title: "",
        message: "",
        type: "",
        duration: 6000,
    });


    useEffect((a) => {
        let message = data.message || data.errorMsg
        let type = data.type
        if( message ) {
            console.log( message )
            setNotifier(
                {
                    title: `${data.title}!`,
                    message: `${message}...`,
                    type: type || "success",
                    duration: 6000
                }
            )
        }
    }, [data.message, data.errorMsg])


    return (
        <div>
            adkadkadksdka
        </div>
    )
}

export default Notifier;