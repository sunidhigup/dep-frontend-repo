import React, { createContext } from "react";

export const RuleEngineTabContext = createContext(null);

const RuleEngineTabProvider = ({ children }) => {
  const [value, setValue] = React.useState(0);
  const [preprocessor,setPreprocessor]=React.useState(0);

  return (
    <RuleEngineTabContext.Provider
      value={{
        value,
        setValue,
        preprocessor,
        setPreprocessor
      }}
    >
      {children}
    </RuleEngineTabContext.Provider>
  );
};

export default RuleEngineTabProvider;
