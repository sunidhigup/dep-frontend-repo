import { Box } from '@mui/material'
import React from 'react'
import ClientRule from './cards/clientRule/ClientRule'
import CustomRule from './cards/customRule/CustomRule'
import GlobalRule from './cards/globalRule/GlobalRule'
import TableRule from './cards/tablerule/TableRule'

const RuleEngineCard = () => {
    return (
        <>
            <div style={{ display: 'flex' }}>
                {/* <div style={{ minWidth: '20vw', border: '2px solid red', height: '100vh' }}>dashboard</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '78vw', border: '2px solid blue', height: '8vh' }}>select client and batch</div> */}

                <div style={{ width: '78vw', height: '90vh', padding: 30 }}>
                    <div style={{ display: 'flex'}}>
                        <div>
                            <GlobalRule />
                        </div>
                        <div style={{ marginLeft: 150, marginBottom: 50 }}>
                            <ClientRule />
                        </div>
                        <div style={{ marginLeft: 180 }}>
                            <CustomRule />
                        </div>
                    </div>
                    {/* <div style={{ display: 'flex' }}>
                        <div>
                            <GlobalRule />
                        </div>
                        <div style={{ marginLeft: 70, marginBottom: 50 }}>
                            <ClientRule />
                        </div>
                        <div style={{ marginLeft: 70 }}>
                            <CustomRule />
                        </div>
                    </div> */}
                    <div style={{ display: 'flex' }}>
                        <div style={{marginLeft: 350}}>
                            <TableRule />
                        </div>
                    </div>
                </div>
            </div>

            {/* <Box sx={{
                width: ,
                height: 300,
                backgroundColor: 'red',
                '&:hover': {
                    backgroundColor: 'primary.main',
                    opacity: [0.9, 0.8, 0.7],
                },
            }}>
                Rule
            </Box> */}
        </>
    )
}

export default RuleEngineCard