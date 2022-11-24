import React, { createContext } from "react";

export const HomeTabContext = createContext(null);

const HomeTabProvider = ({ children }) => {
  const [homeValue, setHomeValue] = React.useState(0);

  return (
    <HomeTabContext.Provider
      value={{
        homeValue,
        setHomeValue,
      }}
    >
      {children}
    </HomeTabContext.Provider>
  );
};

export default HomeTabProvider;
