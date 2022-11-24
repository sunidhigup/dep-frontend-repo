import React, { useEffect, useState } from 'react'
import { Table } from 'antd';

const MeshTable = ({ table }) => {

    const [DisplayTable, setDisplayTable] = useState([])
    const [Columns, setColumns] = useState([])
    const [loadingStatus, setloadingStatus] = useState(false)

    const getAllKeys = (table) => {
        setloadingStatus(true)
        const res = Object.keys(table[0])
        const columns = []
        res.forEach((ele, idx) => {
            columns.push({
                title: ele,
                dataIndex: ele,
                align: 'center',
            })
        })
        setColumns(columns)
        setloadingStatus(false)
    }


    useEffect(() => {
        if (table.length !== 0) {
            getAllKeys(table)
        }
        setDisplayTable(table)
    }, [table])



    const tableColumns = Columns.map((item) => ({ ...item }));

    return (
        <>
            <div style={{ margin: 30, border: '2px solid black',  overflowX: "auto", overflowY: "hidden", }}>
                <Table
                    rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-light')}
                    bordered="true"
                    loading={loadingStatus}
                    pagination={{
                        position: ['bottomCenter'],
                        defaultPageSize: 5,
                    }}
                    columns={tableColumns}
                    dataSource={DisplayTable}
                />
            </div>

        </>
    )
}

export default MeshTable