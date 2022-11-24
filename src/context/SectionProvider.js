import { createContext, useState } from 'react';

export const SectionContext = createContext(null);

const SectionProvider = ({ children }) => {
    const [section, setSection] = useState({});
    return (
        <SectionContext.Provider
            value={{
                section,
                setSection
            }}
        >
            {children}
        </SectionContext.Provider>
    )
}

export default SectionProvider
