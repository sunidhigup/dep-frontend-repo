import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const PrivateRoute = () => {
  const { loggedIn, userRole } = useContext(AuthContext);
  return (
    <>
      {loggedIn ? <Outlet /> : <Navigate to="/login" />}
      {/* <Outlet /> */}
    </>
  );
};

export default PrivateRoute;
