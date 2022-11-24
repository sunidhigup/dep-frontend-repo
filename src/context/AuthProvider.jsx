import React, { useEffect, createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  const [userId, setUserId] = useState(() =>
    localStorage.getItem('userId') ? JSON.parse(localStorage.getItem('userId')) : null
  );
  const [jwtToken, setJwtToken] = useState(() =>
    localStorage.getItem('jwtToken') ? JSON.parse(localStorage.getItem('jwtToken')) : null
  );
  const [loggedIn, setLoggedIn] = useState(() =>
    localStorage.getItem('loggedIn') ? JSON.parse(localStorage.getItem('loggedIn')) : null
  );
  const [userRole, setUserRole] = useState(() =>
    localStorage.getItem('userRole') ? JSON.parse(localStorage.getItem('userRole')) : null
  );
  const [userDomainType, setUserDomainType] = useState(() =>
    localStorage.getItem('userDomainType') ? JSON.parse(localStorage.getItem('userDomainType')) : null
  );

  const logoutUser = () => {
    setUser(null);
    setLoggedIn(null);
    setJwtToken(null);
    setUserRole(null);
    setUserDomainType(null);
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userDomainType');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        userId,
        setUserId,
        loggedIn,
        setLoggedIn,
        jwtToken,
        setJwtToken,
        userRole,
        setUserRole,
        logoutUser,
        userDomainType,
        setUserDomainType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
