import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from "../../context/AuthProvider";

const SalesPrivateRoute = () => {

    const { loggedIn, user, userDomainType } = useContext(AuthContext);
    console.log(userDomainType)
    console.log(user)
    console.log(loggedIn)
    return (
        <>
            {
                loggedIn && userDomainType === "DOMAIN_sales" ? <Outlet /> : <Navigate to='/login' />
            }
        </>
    )
}

export default SalesPrivateRoute