import React, { useEffect, useState } from 'react'
import TablePaginationUnstyled from '@mui/base/TablePaginationUnstyled';
import { experimentalStyled as styled } from '@mui/material/styles';

const Root = styled('div')`
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }

  td,
  th {
    border: 1px solid #ddd;
    text-align: left;
    padding: 8px;
  }

  th {
    background-color: #ddd;
  }
`;

const CustomTablePagination = styled(TablePaginationUnstyled)`
  & .MuiTablePaginationUnstyled-toolbar {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  & .MuiTablePaginationUnstyled-selectLabel {
    margin: 0;
  }

  & .MuiTablePaginationUnstyled-displayedRows {
    margin: 0;

    @media (min-width: 768px) {
      margin-left: auto;
    }
  }

  & .MuiTablePaginationUnstyled-spacer {
    display: none;
  }

  & .MuiTablePaginationUnstyled-actions {
    display: flex;
    gap: 0.25rem;
  }
`;

const ShowTable = ({ table }) => {

    const [DisplayTable, setDisplayTable] = useState([])
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [TableColumns, setTableColumns] = useState()

    useEffect(() => {
        setDisplayTable(table)
    }, [table])


    // const fetchAllColumns = (table) => {

    //     console.log(Object.keys(table[0]))

    //     setTableColumns([...TableColumns, {"ti"}])
    //     Object.keys(table[0]).map((ele, head_idx) => {
    //         return <th key={head_idx}>{ele}</th>
    //     })

    //     console.log(col)
    // }

    // useEffect(() => {
    //     fetchAllColumns(table)
    // }, [])

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - DisplayTable.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // console.log(table)


    return (
        <div>
            {
                DisplayTable.length > 0 &&
                <Root sx={{ maxWidth: '100%' }}>
                    <table aria-label="custom pagination table">
                        <thead>
                            <tr>
                                {
                                    Object.keys(DisplayTable[0]).map((ele, head_idx) => {
                                        return <th key={head_idx}>{ele}</th>
                                    })
                                }

                            </tr>
                        </thead>
                        <tbody>

                            {(rowsPerPage > 0
                                ? Object.values(DisplayTable).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : Object.values(DisplayTable)
                            ).map((row, index) => (
                                <tr key={row.index}>
                                    {
                                        Object.keys(row).map((ele, row_idx) => {
                                            return <td key={row_idx} style={{ width: 160 }} align="right">{row[`${ele}`]}</td>
                                        })
                                    }
                                </tr>
                            ))}

                            {emptyRows > 0 && (
                                <tr style={{ height: 41 * emptyRows }}>
                                    <td colSpan={3} />
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <CustomTablePagination
                                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                    colSpan={6}
                                    count={DisplayTable.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    componentsProps={{
                                        select: {
                                            'aria-label': 'rows per page',
                                        },
                                        actions: {
                                            showFirstButton: true,
                                            showLastButton: true,
                                        },
                                    }}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </tr>
                        </tfoot>
                    </table>
                </Root>
            }
            {
                DisplayTable.length === 0 &&
                <h3>
                    NO TABLE FOUND
                </h3>
            }
        </div>
    )
}

export default ShowTable