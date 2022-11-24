import { createContext, useState } from 'react';

export const ClientContext = createContext(null);

const ClientProvider = ({ children }) => {
  const [client, setClient] = useState({});

  return (
    <ClientContext.Provider
      value={{
        client,
        setClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export default ClientProvider;
