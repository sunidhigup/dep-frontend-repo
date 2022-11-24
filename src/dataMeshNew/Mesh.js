import { Paper } from '@mui/material'
import { Divider, Input, Modal, Select } from 'antd'
import { useSnackbar } from 'notistack';
import React, { useEffect, useState, useContext } from 'react'
import { LockFilled } from '@ant-design/icons';
import Header from '../admin/approval/Header'
import { DomainContext } from '../context/DomainProvider';
import { AccessTokenContext } from '../context/AccessTokenProvider';
import { getCustomersSecretToken, getDatabaseByDomain, getSalesSecretToken, getTableByDomainAndDatabase } from "../api's/DataMeshApi";
import MeshData from './MeshData';

const { Option } = Select;

const INITIAL_STATE = {
    database: '',
    table: '',
    secretKey: '',
    secretToken: ''
}

const Mesh = () => {
    const { DomainType } = useContext(DomainContext)
    const { enqueueSnackbar } = useSnackbar();
    // const DomainType = 'sales'
    const { Acc_token, DomainUserName } = useContext(AccessTokenContext)
  
    const [AllDatabases, setAllDatabases] = useState([])
    const [AllTables, setAllTables] = useState([])
    const [FormField, setFormField] = useState(INITIAL_STATE)
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleDatabaseChange = (value) => {
        setFormField({ ...FormField, database: value, table: '', secretKey: '', secretToken: '' })
    };
    const handleTableChange = (value) => {
        setFormField({ ...FormField, table: value, secretKey: '', secretToken: '' })
    };

    const handleAuthenticationChange = (e) => {
        setFormField({ ...FormField, secretKey: e.target.value, secretToken: '' })
    }

    const getDataBases = async () => {
        try {
            const res = await getDatabaseByDomain(DomainType, Acc_token)
            if (res.status === 200) {
                setAllDatabases(res.data)
            }
        } catch (error) {
            if (error.response.status === 403) {
                enqueueSnackbar(error.response.data, {
                    variant: 'error',
                    autoHideDuration: 3000,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                });
            }


        }
    }
    useEffect(() => {
        getDataBases();
    }, [])

    const getTables = async () => {
        const res = await getTableByDomainAndDatabase(DomainType, FormField.database, Acc_token)
        if (res.status === 200) {
            setAllTables(res.data)
        }
    }

    useEffect(() => {
        getTables()
    }, [FormField.database])


    useEffect(() => {
        if (FormField.table !== '') {
            showModal();
        }
    }, [FormField.table])


    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        let res;
        if (DomainType === 'sales') {
            res = await getSalesSecretToken(FormField.secretKey)
        } else {
            res = await getCustomersSecretToken(FormField.secretKey)
        }
        if (res.status === 200) {
            const token = res.data["access_token"]
            setFormField({ ...FormField, secretToken: token })
        }
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Header name={`DATA MESH ${DomainType}`} />
            <Divider />
            <Paper elevation={1} sx={{ marginBottom: '30px', padding: ' 20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                    <div>Database :
                        <Select
                            style={{ width: 250, marginLeft: 5 }}
                            onChange={handleDatabaseChange}
                            id="database_select"
                            value={FormField.database}
                            size='large'
                        >
                            {
                                AllDatabases && AllDatabases.map((ele, idx) => {
                                    return (
                                        <Option key={idx} value={ele.database_name}>{ele.database_name}</Option>
                                    )
                                })
                            }
                        </Select>
                    </div>
                    <div>Table :
                        <Select
                            style={{ width: 250, marginLeft: 5 }}
                            onChange={handleTableChange}
                            value={FormField.table}
                            size='large'
                            allowClear
                        >
                            {
                                AllTables && AllTables.map((ele, idx) => {
                                    return (
                                        <Option key={idx} value={ele.tab_name}>{ele.tab_name}</Option>
                                    )
                                })
                            }
                        </Select>
                    </div>

                </div>
                <MeshData secretToken={FormField.secretToken} Domain={DomainType} database={FormField.database} table={FormField.table} DomainUserName={DomainUserName} />

                <Modal
                    title="Authentication"
                    centered
                    width={300}
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}>
                    <LockFilled color='error' />
                    <Input
                        style={{ marginLeft: 3, width: '80%', }}
                        onChange={handleAuthenticationChange}
                        value={FormField.secretKey}
                    />
                </Modal>
            </Paper>
        </>
    )
}

export default Mesh