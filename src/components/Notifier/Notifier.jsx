import React, { useEffect, useState } from "react";
import ReactNotification, { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css'

const Notifier = ({data}) => {

    //const { data } = store.getState()

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
                        duration: 4000
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