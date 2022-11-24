import React, { createContext, useState } from 'react';

export const StreamContext = createContext(null);
const StreamProvider = ({ children }) => {
  const [stream, setStream] = useState({});
  return <StreamContext.Provider value={{ stream, setStream }}>{children}</StreamContext.Provider>;
};

export default StreamProvider;
