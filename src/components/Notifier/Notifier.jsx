import React, { useEffect, useState } from "react";
import  ReactNotification, {store} from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css'
import internalState from "../../redux/store";
const Notifier = () => {

    const { data } = internalState.getState()

    const [ state, setNotifier ] = useState({
        message: "",
        tx: "",
        error: false,
    });


    useEffect((a) => {
        let message = data.message || data.errorMsg
        let type = data.type
        if( message ) {
            console.log( message )
            store.addNotification(
                {
                    title: `${data.title}!`,
                    message: `${message}...`,
                    type: type || "success",
                    insert: "top",
                    container: "bottom-left",
                    dismiss: {
                        duration: 6000
                    }
                }
            )
        }
    }, [data.message, data.errorMsg])


    return (
        <div>
            <ReactNotification />
        </div>
    )
}

export default Notifier;