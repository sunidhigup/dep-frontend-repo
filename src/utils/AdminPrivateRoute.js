import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from "../context/AuthProvider";

const PrivateRoute = () => {
    // console.log("Admin Private Route")

    const { loggedIn, user, userRole } = useContext(AuthContext);
    return (
        <>
            {
                // loggedIn && user === 'rajat' ? <Outlet /> : <Navigate to=' /login' />
                loggedIn && userRole === 'ROLE_admin' ? <Outlet /> : <Navigate to=' /login' />
            }
            {/* <Outlet /> */}
        </>
    )
}

export default PrivateRoute