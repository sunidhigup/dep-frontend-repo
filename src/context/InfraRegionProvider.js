import { createContext, useState } from 'react';

export const InfraRegionContext = createContext(null);

const InfraRegionProvider = ({ children }) => {
  const [infraRegion, setInfraRegion] = useState({});

  return (
    <InfraRegionContext.Provider
      value={{
        infraRegion,
        setInfraRegion,
      }}
    >
      {children}
    </InfraRegionContext.Provider>
  );
};

export default InfraRegionProvider;
