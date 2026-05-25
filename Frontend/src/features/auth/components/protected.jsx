import {useAuth} from "../hooks/useAuth";
import React from "react";
import {Navigate} from "react-router-dom";
import { useNavigate } from "react-router-dom";
const Protected = ({children}) => {

    const {loading  , user } = useAuth()
    const navigate = useNavigate()
    if(loading) {
        return <p>Loading...</p>
    }

    if(!user) {
        return <Navigate to="/login" />
        return null
    }

    return (
        <div>
            {children}
        </div>
    )
}

export default Protected