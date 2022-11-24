import { createContext, useState } from 'react';

export const DataRegionContext = createContext(null);

const DataRegionProvider = ({ children }) => {
  const [dataRegion, setDataRegion] = useState({});

  return (
    <DataRegionContext.Provider
      value={{
        dataRegion,
        setDataRegion,
      }}
    >
      {children}
    </DataRegionContext.Provider>
  );
};

export default DataRegionProvider;
