import { createContext, useState } from 'react';

export const CountContext = createContext(null);


const InitialState = {
    Client_approved: 0,
    Client_rejected: 0,
    Client_pending: 0,
    Client_ready: false,

    Batch_approved: 0,
    Batch_rejected: 0,
    Batch_pending: 0,
    Batch_unknown: 0,
    Batch_ready: false,

    Jobs_approved: 0,
    Jobs_rejected: 0,
    Jobs_pending: 0,
    Jobs_ready: false,

    update_dashboard: true,
    changeRegion: false

}
const CountProvider = ({ children }) => {
    const [CountData, setCountData] = useState(InitialState);

    return (
        <CountContext.Provider
            value={{
                CountData,
                setCountData
            }}
        >
            {children}
        </CountContext.Provider>
    );
};

export default CountProvider;
