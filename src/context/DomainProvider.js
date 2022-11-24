import React,{ createContext, useState } from 'react';

export const DomainContext = createContext(null);

const DomainProvider = ({ children }) => {
    const [DomainType, setDomainType] = useState({});

    return (
        <DomainContext.Provider
            value={{
                DomainType,
                setDomainType,
            }}
        >
            {children}
        </DomainContext.Provider>
    );
};

export default DomainProvider;