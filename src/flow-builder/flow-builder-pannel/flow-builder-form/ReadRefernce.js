import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { getApprovedBatchApi } from "../../../api's/BatchApi";
import { getApprovedClientApi } from "../../../api's/ClientApi";
import { BUCKET_NAME } from '../../../constants/Constant';
import { fetchTableRules } from "../../../api's/TableRuleApi";
import { AllFilesOfS3, AllFoldersOfS3 } from "../../../api's/FlowBuilderApi";

const ReadRefernce = ({ disableForm }) => {
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [AllClient, setAllClient] = useState([]);
  const [AllBatch, setAllBatch] = useState([]);
  const [AllTable, setAllTable] = useState([]);
  const [AllTracking, setAllTracking] = useState([]);
  const [AllFiles, setAllFiles] = useState([]);
  const INITIAL_STATE = {
    clientId: '',
    clientName: '',
    batchName: '',
    tableName: '',
    trackingId: '',
    innerPath: '/Rule_engine/Output/valid/',
    file: '',
  };
  const [Data, setData] = useState(INITIAL_STATE);

  const getClient = async () => {
    const response = await getApprovedClientApi();
    if (response.status === 200) {
      setAllClient(response.data);
    }
  };

  const getBatch = async (clientId) => {
    const sp = clientId.split('_____');
    const response = await getApprovedBatchApi(sp[0]);
    if (response.status === 200) {
      setAllBatch(response.data);
    }
  };

  const getTable = async (batchName) => {
    const sp = Data.clientId.split('_____');
    const response = await fetchTableRules(sp[0], batchName);
    if (response.status === 200) {
      setAllTable(response.data);
    }
  };

  const getTrackingId = async (values) => {
    const sp = Data.clientId.split('_____');
    const response = await AllFoldersOfS3(sp[1], Data.batchName, Data.tableName, Data.innerPath);
    if (response.status === 200) {
      setAllTracking(response.data);
    }
  };

  const getFile = async (values) => {
    const response = await AllFilesOfS3(Data.trackingId);
    if (response.status === 200) {
      setAllFiles(response.data);
    }
  };

  const handleClientChange = async (e) => {
    setData({ ...Data, clientId: e.target.value });
  };

  const handleBatchChange = (e) => {
    setData({ ...Data, batchName: e.target.value });
  };

  const handleTableChange = (e) => {
    setData({ ...Data, tableName: e.target.value });
  };

  const handleTrackingChange = (e) => {
    setData({ ...Data, trackingId: e.target.value });
  };

  const handleFileChange = (e) => {
    console.log(e.target.value);
    setData({ ...Data, file: e.target.value });
  };

  useEffect(() => {
    getClient();
  }, []);

  useEffect(() => {
    getBatch(Data.clientId);
  }, [Data.clientId]);

  useEffect(() => {
    getTable(Data.batchName);
  }, [Data.batchName]);

  useEffect(() => {
    getTrackingId(Data.tableName);
  }, [Data.tableName]);

  useEffect(() => {
    getFile();
  }, [Data.trackingId]);

  return (
    <>
      <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }} noValidate autoComplete="off">
        <div>
          <TextField id="Bucket" name="bucket" disabled value={`s3://${BUCKET_NAME}`} />
          <TextField
            id="outlined-select-client"
            select
            disabled={disableForm}
            required
            label="Client"
            name="client"
            value={Data.clientId}
            onChange={handleClientChange}
          >
            {AllClient &&
              AllClient.map((ele) => {
                return (
                  <MenuItem key={ele.client_id} value={`${ele.client_id}_____${ele.client_name}`}>
                    {ele.client_name}
                  </MenuItem>
                );
              })}
          </TextField>
          <TextField
            id="outlined-select-batch"
            select
            disabled={disableForm}
            required
            label="Batch"
            name="batch"
            value={Data.batchName}
            onChange={handleBatchChange}
          >
            {AllBatch &&
              AllBatch.map((ele) => {
                return (
                  <MenuItem key={ele.batch_id} value={ele.batch_name}>
                    {ele.batch_name}
                  </MenuItem>
                );
              })}
          </TextField>
          <TextField
            id="outlined-select-table"
            select
            disabled={disableForm}
            required
            label="Table"
            name="table"
            value={Data.tableName}
            onChange={handleTableChange}
          >
            {AllTable &&
              AllTable.map((ele) => {
                return (
                  <MenuItem key={ele.tablename} value={ele.tablename}>
                    {ele.tablename}
                  </MenuItem>
                );
              })}
          </TextField>
          <TextField
            id="outlined-select-tracking"
            select
            disabled={disableForm}
            required
            label="Tracking Id"
            name="tracking"
            value={Data.trackingId}
            onChange={handleTrackingChange}
          >
            {AllTracking &&
              AllTracking.map((ele) => {
                return (
                  <MenuItem key={ele.value} value={ele.value}>
                    {ele.label}
                  </MenuItem>
                );
              })}
          </TextField>
          <TextField
            id="outlined-select-file"
            select
            disabled={disableForm}
            required
            label="Files"
            name="file"
            value={Data.file}
            onChange={handleFileChange}
          >
            {AllFiles &&
              AllFiles.map((ele) => {
                return (
                  <MenuItem key={ele.value} value={ele.label}>
                    {ele.label}
                  </MenuItem>
                );
              })}
          </TextField>
          <Button
            style={{ width: '100px' }}
            variant="outlined"
            // onClick={fetchFileHeader}
            disabled={disableForm}
            className="outlined-button-color"
          >
            Fetch
          </Button>
        </div>
      </Box>
    </>
  );
};

export default ReadRefernce;
