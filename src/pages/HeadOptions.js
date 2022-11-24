import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Autocomplete, Box, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';

import { getApprovedClientApi, getApprovedClientApiByUserId, getClientApi } from "../api's/ClientApi";
import { getApprovedBatchApi, getBatchApi } from "../api's/BatchApi";
import { BatchContext } from '../context/BatchProvider';
import { ClientContext } from '../context/ClientProvider';
import { JobListContext } from '../context/JobListProvider';
import { AuthContext } from '../context/AuthProvider';
import { dataRegionInfo } from "../api's/DataRegionApi";

const HeadOptions = ({ fetchJob }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch, setBatch } = useContext(BatchContext);
  const { client, setClient } = useContext(ClientContext);
  const { setJobList } = useContext(JobListContext);
  const { userRole, userId } = useContext(AuthContext);
  const [batchName, setBatchName] = useState('');
  const [clientName, setClientName] = useState('');
  const [fetchedClient, setFetchedClient] = useState([]);
  const [fetchedBatch, setFetchedBatch] = useState([]);
  const [batchDisable, setBatchdisable] = useState(true);
  const [buttonDisable, setButtondisable] = useState(true);

  const handleSetClient = async (e, newevent) => {
    if (newevent) {
      const selectedClient = fetchedClient.find((el) => el.client_name === newevent);
      const resp = await dataRegionInfo(selectedClient.dataRegionEntity);
      const result = { ...selectedClient, ...resp.data };
      // console.log(result)
      setBatch({});
      setJobList([]);
      setBatchdisable(false);
      setButtondisable(true);
      setBatchName('');
      setClientName(newevent);
      setClient(result);
      fetchBatch(selectedClient.client_id);
    } else {
      setClient({});
      setClientName('');
      setBatch({});
      setBatchName('');
      setJobList([]);
    }
  };

  const handleSetBatch = (e, newevent) => {
    if (newevent) {
      const selectedBatch = fetchedBatch.find((el) => el.batch_name === newevent);
      setButtondisable(false);
      setBatchName(newevent);
      setBatch(selectedBatch);

      // fetchJob(selectedBatch.client_id);
    } else {
      setBatch({});
      setBatchName('');
      setJobList([]);
    }
  };

  const fetchClient = async () => {
    try {
      // getApprovedClientApiByUserId

      let response = null;

      if (userRole === 'ROLE_executor') {
        response = await getApprovedClientApiByUserId(userId);
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

  const fetchBatch = async (clientId) => {
    try {
      const response = await getApprovedBatchApi(clientId);

      if (response.status === 200) {
        const data = response.data;

        const result = data.filter((item) => {
          if (item.status === 'approved') {
            return item;
          }
        });

        setFetchedBatch(result);
        // setFetchedBatch(data);
      }
    } catch (error) {
      setFetchedBatch([]);
      enqueueSnackbar('No Batch found!', {
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  useEffect(() => {
    fetchClient();

    client.client_name && setBatchdisable(false);
    batch.batch_name && setButtondisable(false);

    if (client.client_id) {
      fetchBatch(client.client_id);
    }
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
          value={clientName || (client && client.client_name)}
          options={fetchedClient.map((op) => op.client_name)}
          onChange={(event, newValue) => {
            handleSetClient(event, newValue);
          }}
          sx={{ width: 300 }}
          size="small"
          renderInput={(params) => <TextField {...params} label="Select Client" />}
        />

        <Autocomplete
          disablePortal
          id="combo-box-demo2"
          value={batchName || (batch && batch.batch_name)}
          options={fetchedBatch.map((op) => op.batch_name)}
          onChange={(event, newValue) => {
            handleSetBatch(event, newValue);
          }}
          sx={{ width: 300 }}
          size="small"
          disabled={batchDisable}
          renderInput={(params) => <TextField {...params} label="Select Batch" />}
        />
        <Button onClick={fetchJob} variant="outlined" size="small" className="button-color" disabled={buttonDisable}>
          Apply
        </Button>
      </div>
    </Paper>
  );
};

export default HeadOptions;
