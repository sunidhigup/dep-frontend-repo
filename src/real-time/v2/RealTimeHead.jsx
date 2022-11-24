import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Autocomplete, Box, Paper } from '@mui/material';
import { getApprovedClientApi, getClientByUserId } from "../../api's/ClientApi";
import { ClientContext } from '../../context/ClientProvider';
import { fetchStreamByClientName } from "../../api's/StreamApi";
import { AuthContext } from '../../context/AuthProvider';

const RealTimeHead = ({ setFetchedStream, setClusterId }) => {
  const [clientName, setClientName] = useState('');
  const [fetchedClient, setFetchedClient] = useState([]);
  const { client, setClient } = useContext(ClientContext);
  const { userRole, userId } = useContext(AuthContext);
  const fetchClient = async () => {
    try {
      let response = null;
      if (userRole === 'ROLE_executor' || userRole === 'ROLE_reader') {
        response = await getClientByUserId(userId);
      } else response = await getApprovedClientApi();

      if (response.status === 200) {
        const data = response.data.sort((a, b) => {
          if (a.client_name > b.client_name) return 1;

          return 1;
        });

        setFetchedClient(data);
      }
    } catch (error) {
      setFetchedClient([]);
    }
  };

  const fetchStream = async () => {
    const response = await fetchStreamByClientName(client.client_name);

    setClusterId([]);
    if (response.status === 200) {
      setFetchedStream(response.data);
    }
  };

  const handleSetClient = (e, newevent) => {
    if (newevent) {
      const selectedClient = fetchedClient.find((el) => el.client_name === newevent);

      setClientName(newevent);
      setClient(selectedClient);
    } else {
      setClient({});
      setClientName('');
    }
  };
  useEffect(() => {
    fetchClient();
  }, []);
  return (
    <Paper elevation={1} sx={{ marginBottom: '30px', padding: ' 20px 0' }}>
      <div
        style={{
          display: 'grid',
          columnGap: '10px',
          gridTemplateColumns: 'auto auto auto',
          justifyContent: 'space-evenly',
          alignContent: 'center',
        }}
      >
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          value={clientName || client.client_name}
          options={fetchedClient.map((op) => op.client_name)}
          onChange={(event, newValue) => {
            handleSetClient(event, newValue);
          }}
          sx={{ width: 300 }}
          size="small"
          renderInput={(params) => <TextField {...params} label="Select Client" />}
        />

        <Button onClick={fetchStream} variant="outlined" size="small" className="button-color">
          Apply
        </Button>
      </div>
    </Paper>
  );
};

export default RealTimeHead;
