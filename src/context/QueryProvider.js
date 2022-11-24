import { createContext, useState } from 'react';

export const QueryContext = createContext(null);

const QueryProvider = ({ children }) => {
  const [queryProvider, setQueryProvider] = useState({});

  return (
    <QueryContext.Provider
      value={{
        queryProvider,
        setQueryProvider,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

export default QueryProvider;
