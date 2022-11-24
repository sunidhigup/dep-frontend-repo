import React, { createContext, useState } from 'react';

export const JobListContext = createContext(null);

const JobListProvider = ({ children }) => {
  const [jobList, setJobList] = useState([]);
  return (
    <JobListContext.Provider
      value={{
        jobList,
        setJobList,
      }}
    >
      {children}
    </JobListContext.Provider>
  );
};

export default JobListProvider;
