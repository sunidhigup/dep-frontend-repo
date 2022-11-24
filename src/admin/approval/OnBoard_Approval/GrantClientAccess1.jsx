import {
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import DoneIcon from '@mui/icons-material/Done';
import styled from '@emotion/styled';
import { AuthContext } from '../../../context/AuthProvider';
import { getClientApi, getClientByUserId, grantClientAccessToUser } from "../../../api's/ClientApi";
import { getAllUsersByAdminApi } from "../../../api's/ManagementApi";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  padding: '5px 10px',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  padding: '5px 10px',
}));
const GrantClientAccess1 = () => {
  const [allusers, setAllUsers] = useState([]);
  const { user, userId } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [userObj, setUserObj] = useState();
  const [clientObj, setClientObj] = useState();

  const fetchClientByAdminId = async () => {
    const response = await getClientApi();

    if (response.status === 200) setClients(response.data);
  };

  const getAllUserFromAdminId = async () => {
    const response = await getAllUsersByAdminApi(userId);
    if (response.status === 200) setAllUsers(response.data);
  };

  const handleSetUserObj = (e, newevent) => {
    const selectedUser = allusers.find((el) => el.email === newevent);

    setUserObj(selectedUser);
  };

  const handleSetClientObj = (e, newevent) => {
    const selectedClient = clients.find((el) => el.client_name === newevent);

    setClientObj(selectedClient);
  };
  const handleGrantAccess = async () => {
    console.log(clientObj);
    console.log(userObj);
    const response = await grantClientAccessToUser(userObj.email, clientObj.client_id);

    if (response.status === 200) {
      fetchClientByAdminId();
      getAllUserFromAdminId();
    }
  };
  useEffect(() => {
    fetchClientByAdminId();
    getAllUserFromAdminId();
  }, []);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Client</TableCell>
            <TableCell align="center">User</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <StyledTableRow>
            <StyledTableCell>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                name="email"
                value={clientObj}
                options={clients && clients.map((op) => op.client_name)}
                onChange={(event, newValue) => {
                  handleSetClientObj(event, newValue);
                }}
                required
                fullWidth
                size="small"
                sx={{ mb: 3 }}
                renderInput={(params) => <TextField {...params} required label="Select Client" />}
              />
            </StyledTableCell>
            <StyledTableCell>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                name="email"
                value={userObj}
                options={allusers && allusers.map((op) => op.email)}
                onChange={(event, newValue) => {
                  handleSetUserObj(event, newValue);
                }}
                required
                fullWidth
                size="small"
                sx={{ mb: 3 }}
                renderInput={(params) => <TextField {...params} required label="Select User" />}
              />
            </StyledTableCell>
            <StyledTableCell align="center">
              <Button variant="outlined" color="success" onClick={handleGrantAccess}>
                <DoneIcon sx={{ fontSize: '1rem' }} />
              </Button>
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GrantClientAccess1;
