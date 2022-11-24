import { createContext, useState } from 'react';

export const BatchContext = createContext(null);

const BatchProvider = ({ children }) => {
  const [batch, setBatch] = useState({});

  return (
    <BatchContext.Provider
      value={{
        batch,
        setBatch,
      }}
    >
      {children}
    </BatchContext.Provider>
  );
};

export default BatchProvider;
