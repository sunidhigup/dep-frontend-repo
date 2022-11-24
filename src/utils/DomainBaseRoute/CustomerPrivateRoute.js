import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from "../../context/AuthProvider";

const CustomerPrivateRoute = () => {

    const { loggedIn, user, userDomainType } = useContext(AuthContext);
    return (
        <>
            {
                loggedIn && userDomainType === "DOMAIN_customers" ? <Outlet /> : <Navigate to='/login' />
            }
        </>
    )
}

export default CustomerPrivateRoute