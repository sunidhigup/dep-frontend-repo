import React, { useContext, useState } from 'react'
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Alert, Button, Snackbar, Stack } from '@mui/material';
import axios from 'axios';
import { BASEURL } from '../../constants/Constant';
import DeleteIcon from '@mui/icons-material/Delete';
import User_or_Admin from '../../user_or_admin/User_or_Admin';
import Header from '../../navbar/Header';
import { AuthContext } from '../../context/AuthProvider';
import { AdminLoginContext } from '../../context/AdminLoginCredentialProvider';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


const Customer_Approved_users = () => {
    const { Username } = React.useContext(AuthContext)
    const { admin_username, admin_password } = useContext(AdminLoginContext)
    const [ApprovedUsers, setApprovedUsers] = React.useState([])
    const [message, setmessage] = React.useState()
    const [iserror, setiserror] = useState(false)
    const [type, settype] = React.useState()
    const [snackBarOpen, setsnackBarOpen] = React.useState(false);
    React.useEffect(() => {
        const getApprovedUsers = async () => {
            let res = await axios.get(`${BASEURL}/customeradmin/approveduserlist`, {
                auth: {
                    username: admin_username,
                    password: admin_password
                }
            }).then(response => {
                if (response.data.includes("Error")) {
                    setiserror(true)
                } else {
                setApprovedUsers(response.data)
                setiserror(false)
                }
            }).catch(error => {
                console.log(error)
            })
        }
        getApprovedUsers();
    }, [ApprovedUsers])


    const deleteUser = async (e, row) => {
        console.log(row.email + " is deleted")

        let res1 = await axios.delete(`${BASEURL}/customeradmin/deleteuser`, {
            data: {
                email: row.email
            },
            auth: {
                username: admin_username,
                password: admin_password
            }
        })
        // console.log(res1)
        if (res1.status === 200) {
            setmessage(`${row.email} is successfully deleted `)
            settype("success")
            setsnackBarOpen(true);
            let res2 = await axios.get(`${BASEURL}/customeradmin/approveduserlist`, {
                auth: {
                    username: admin_username,
                    password: admin_password
                }
            }).then(response => {
                setApprovedUsers(response.data)
            })
        }

    }

    const snackBarhandleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setsnackBarOpen(false)
    }


    return (
        <>
            <div>
                <Stack spacing={2} sx={{ width: '100%' }}>
                    <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={snackBarOpen} autoHideDuration={6000} onClose={snackBarhandleClose}>
                        <Alert onClose={snackBarhandleClose} severity={type} sx={{ width: '100%', marginTop: '15%' }}>
                            {message}
                        </Alert>
                    </Snackbar>
                </Stack>
            </div>
            {
                !iserror &&
                <TableContainer component={Paper} >
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Name</StyledTableCell>
                                <StyledTableCell align="left">Username</StyledTableCell>
                                <StyledTableCell align="left">Email</StyledTableCell>
                                <StyledTableCell align="left">Password</StyledTableCell>
                                <StyledTableCell align="left">Secret</StyledTableCell>
                                <StyledTableCell align="left">Revoke</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                ApprovedUsers.map((row, row_idx) => (
                                    <StyledTableRow key={row_idx}>
                                        <StyledTableCell component="th" scope="row">{row.name}</StyledTableCell>
                                        <StyledTableCell align="left">{row.username}</StyledTableCell>
                                        <StyledTableCell align="left">{row.email}</StyledTableCell>
                                        <StyledTableCell align="left">{row.password}</StyledTableCell>
                                        <StyledTableCell align="left">{row.secret}</StyledTableCell>
                                        <StyledTableCell align="left"><Button onClick={(e) => deleteUser(e, row)}><DeleteIcon color='error' /></Button></StyledTableCell>
                                    </StyledTableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer >
            }
            {
                iserror &&
                <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>404 PAGE NOT FOUND</h3>
            }

        </>

    )
}

export default Customer_Approved_users