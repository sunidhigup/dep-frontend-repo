import { FormControlLabel, Switch, TextField, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@mui/styles';
import React, { useContext, useEffect, useState } from 'react';
import LoadingIcon from '../../reusable-components/LoadingIcon';

import { listS3 } from "../../api's/TableRuleApi";
import { ClientContext } from '../../context/ClientProvider';

const useStyles = makeStyles({
  formStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
  },
  formDiv: {
    width: '600px',
  },
});
const PreprocessorStep1 = ({
  streamData,
  jsonFile,
  setJsonFile,
  newFlowBuilder,
  newRuleEngine,
  setNewRuleEngine,
  setNewFlowBuilder,
  newStorage,
  setNewStorage,
}) => {
  const [isLoad, setIsLoad] = useState(false);
  const [path, setpath] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);

  const handleListS3 = async () => {
    setIsLoad(true);
    // const prefix = `${streamData.client_name}/${streamData.stream_name}/${streamData.table_name}/Rule_engine/Table-Json`;
    const prefix = `${streamData.client_name}/${streamData.stream_name}/${streamData.table_name}/Rule_engine/Table-Json`;

    const resp = await listS3(client.client_id, prefix);

    if (resp.status === 200) {
      setJsonFile(resp.data[0]);
      setIsLoad(false);
    }
  };
  // console.log(streamData);
  const classes = useStyles();

  useEffect(() => {
    // handleListS3();
    setNewRuleEngine(streamData.ruleEngine);
    setNewFlowBuilder(streamData.flowBuilder);
    setNewStorage(streamData.storage);
  }, [streamData]);

  const handleAddJsonPath = async (e) => {
    const regex = /^s3:\/\/.*json$/;
    setIsLoad(true);
    const prefix = path;

    if (!regex.test(path)) {
      enqueueSnackbar('S3 path is invalid!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }

    setJsonFile(prefix);
  };

  return (
    <div>
      <form className={classes.formStyle} autoComplete="off">
        {isLoad ? (
          <>
            <LoadingIcon />
            {console.log('hello')}
          </>
        ) : (
          <div className={classes.formDiv}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <h3>Client Name</h3>
              </div>

              <div>
                <TextField
                  style={{ marginBottom: '10px' }}
                  fullWidth
                  variant="standard"
                  id="clientName"
                  value={streamData.client_name}
                  disabled
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <h3>Batch Name</h3>
              </div>

              <div>
                <TextField
                  style={{ marginBottom: '10px' }}
                  fullWidth
                  variant="standard"
                  id="streamName"
                  value={streamData.batch_name}
                  disabled
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <h3>Table Name</h3>
              </div>

              <div>
                <TextField
                  style={{ marginBottom: '10px' }}
                  fullWidth
                  variant="standard"
                  id="tableName"
                  value={streamData.table_name}
                  disabled
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'left' }}>
              <div>
                <h3>Json</h3>
              </div>

              <div>
                <TextField
                  style={{ marginBottom: '10px' }}
                  variant="standard"
                  id="json"
                  value={path}
                  onChange={(e) => setpath(e.target.value)}
                />
                <Button onClick={handleAddJsonPath}>Submit</Button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <h3>Rule Engine</h3>
              </div>

              <div>
                <FormControlLabel
                  control={<Switch checked={newRuleEngine} onChange={() => setNewRuleEngine(!newRuleEngine)} />}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <h3>Flow Builder</h3>
              </div>

              <div>
                <FormControlLabel
                  control={<Switch checked={newFlowBuilder} onChange={() => setNewFlowBuilder(!newFlowBuilder)} />}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PreprocessorStep1;
