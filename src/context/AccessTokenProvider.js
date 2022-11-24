import React, { createContext, useState } from "react";

export const AccessTokenContext = createContext(null);

const AccessTokenProvider = ({ children }) => {
    const [Acc_token, setAcc_token] = useState();
    const [DomainUserName, setDomainUserName] = useState();

    return (
        <AccessTokenContext.Provider
            value={{
                Acc_token,
                setAcc_token,
                DomainUserName,
                setDomainUserName
            }}
        >
            {children}
        </AccessTokenContext.Provider>
    );
};

export default AccessTokenProvider