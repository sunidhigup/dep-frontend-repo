import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import { Alert, Button, Snackbar, Stack } from '@mui/material';
import axios from 'axios';
import { BASEURL } from '../../constants/Constant';
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
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function Sales_Requested_users() {
    const [RequestedUserList, setRequestedUserList] = React.useState([])
    const { admin_username, admin_password } = React.useContext(AdminLoginContext)
    const [message, setmessage] = React.useState()
    const [type, settype] = React.useState()
    const [iserror, setiserror] = useState(false)
    const [snackBarOpen, setsnackBarOpen] = React.useState(false);
    React.useEffect(() => {
        const getRequestedUserList = async () => {
            let res = await axios.get(`${BASEURL}/salesadmin/getrequesteduserlist`, {
                auth: {
                    username: admin_username,
                    password: admin_password
                }
            }).then(response => {
                if (response.data.includes("Error")) {
                    setiserror(true)
                } else {
                    setRequestedUserList(response.data)
                }
            }).catch(error => {
                console.log(error)
            })
        }
        getRequestedUserList();
    }, [])
    React.useEffect(() => {
        const getRequestedUserList = async () => {
            let res = await axios.get(`${BASEURL}/salesadmin/getrequesteduserlist`, {
                auth: {
                    username: admin_username,
                    password: admin_password
                }
            }).then(response => {
                setRequestedUserList(response.data)
            }).catch(error => {
                console.log(error)
            })
        }
        getRequestedUserList();
    }, [RequestedUserList])

    const rejectUserBtn = async (event, idx) => {
        let user = RequestedUserList[idx]
        console.log(idx + " is rejected")
        let res1 = await axios.delete(`${BASEURL}/salesadmin/rejectuser`, {
            data: {
                email: user["email"]
            },
            auth: {
                username: admin_username,
                password: admin_password
            }
        })
        // console.log(res1)
        if (res1.status === 200) {
            setmessage(`${user['email']} is successfully deleted `)
            settype("success")
            setsnackBarOpen(true);
            let res2 = await axios.get(`${BASEURL}/salesadmin/getrequesteduserlist`, {
                auth: {
                    username: admin_username,
                    password: admin_password
                }
            }).then(response => {
                setRequestedUserList(response.data)
            })
        }
    }

    const approveUserBtn = async (event, idx) => {
        let user = RequestedUserList[idx]
        // console.log(user)
        // console.log(`${BASEURL}/salesadmin/adduser`)
        let res = await axios.post(`${BASEURL}/salesadmin/adduser`, {
            name: user["name"],
            username: user["username"],
            email: user["email"],
            password: user["password"],
            domain: "sales",
            secret: user["secret"]
        }, {
            auth: {
                username: admin_username,
                password: admin_password
            }
        })
        console.log(res)
        if (res.status === 200) {
            let res1 = await axios.delete(`${BASEURL}/salesadmin/rejectuser`, {
                data: {
                    email: user["email"]
                },
                auth: {
                    username: admin_username,
                    password: admin_password
                }
            })
            if (res1.status === 200) {
                await axios.get(`${BASEURL}/salesadmin/getrequesteduserlist`, {
                    auth: {
                        username: admin_username,
                        password: admin_password
                    }
                }).then(response => {
                    setRequestedUserList(response.data)
                })
            }
        }
        else {
            console.log("Not deleted")
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
                                <StyledTableCell align="left">Secret_key</StyledTableCell>
                                <StyledTableCell align="left">Reject</StyledTableCell>
                                <StyledTableCell align="left">Approve</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                RequestedUserList && RequestedUserList.map((row, row_idx) => (
                                    <StyledTableRow key={row_idx}>
                                        <StyledTableCell component="th" scope="row">{row.name}</StyledTableCell>
                                        <StyledTableCell align="left">{row.username}</StyledTableCell>
                                        <StyledTableCell align="left">{row.email}</StyledTableCell>
                                        <StyledTableCell align="left">{row.password}</StyledTableCell>
                                        <StyledTableCell align="left">{row.secret}</StyledTableCell>
                                        <StyledTableCell align="left"><Button onClick={(e) => rejectUserBtn(e, row_idx)}><CancelIcon color='error' fontSize='large' /></Button></StyledTableCell>
                                        <StyledTableCell align="left"><Button onClick={(e) => approveUserBtn(e, row_idx)}><CheckCircleSharpIcon color='success' fontSize='large' /></Button></StyledTableCell>
                                    </StyledTableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer >
            }
            {
                iserror &&
                <h3 style={{display: 'flex', alignItems: 'center', justifyContent : 'center', color: 'red'}}>404 PAGE NOT FOUND</h3>
            }
        </>
    );
}
