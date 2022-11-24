import React, { useEffect } from 'react'

import Header from './Header'
import ManagementData from './ManagementData'

const ManagementPannel = () => {

    return (
        <>
            <Header />
            <div style={{border: '2px solid black'}}> 
                <ManagementData />
            </div>
        </>
    )
}

export default ManagementPannel