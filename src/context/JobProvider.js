import { createContext, useState } from 'react';

export const JobContext = createContext(null);

const JobProvider = ({ children }) => {
  const [Job, setJob] = useState();

  return <JobContext.Provider value={{ Job, setJob }}>{children}</JobContext.Provider>;
};

export default JobProvider;
