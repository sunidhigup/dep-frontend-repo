import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { styled, useTheme } from '@mui/material/styles';
import { IconButton, Modal, Tooltip } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import Error from '@mui/icons-material/Error';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { createBatchidApi, fetchBatchidApi } from "../../../api's/BatchApi";
import { executeRuleEngine, getRuleEngineStatus, deleteTableRule } from "../../../api's/TableRuleApi";
import { BatchContext } from '../../../context/BatchProvider';
import { ClientContext } from '../../../context/ClientProvider';
import LoadingIcon from '../../../reusable-components/LoadingIcon';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    padding: '7px',
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

const styleLoading = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
};

const TableRuleRowNew = ({ data, fetchTableRule }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const [disableRun, setDisableRun] = useState(false);
  const [runStatus, setRunStatus] = useState('Loading...');
  const [openLoadingModal, setOpenLoadingModal] = useState(false);

  const handleLoadingModalOpen = useCallback(() => setOpenLoadingModal(true), []);

  const handleLoadingModalClose = useCallback(() => setOpenLoadingModal(false), []);

  const runRuleEngine = async (e, tablename) => {
    e.preventDefault();

    handleLoadingModalOpen();
    try {


      const batch_table_id = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine_${new Date().getTime()}`;

      const client_job = `${client.client_name}_${batch.batch_name}_${tablename}_ruleEngine`;

      const data = {
        client_job: client_job.replaceAll(' ', ''),
        batch_id: batch_table_id.replaceAll(' ', ''),
      };

      const res = await createBatchidApi(data);

      const input = {
        batch: batch.batch_name,
        execution_id: batch_table_id.replaceAll(' ', ''),
        client_id: client.client_id,
        batch_id: batch.batch_name_id,
        table_name: tablename,
        client_name: client.client_name,
      };

      const response = await executeRuleEngine(input);

      if (response.status === 200) {
        setDisableRun(true);
        setRunStatus('In Progress');
        handleLoadingModalClose();
        enqueueSnackbar('Table Rule is running!', {
          variant: 'Success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    handleLoadingModalClose();
  };

  const refreshBtn = async (e, batchname, tablename) => {
    e.stopPropagation();
    const batchID = `${client.client_name}_${batchname}_${tablename}_ruleEngine`;

    try {
      const result = await fetchBatchidApi(batchID.replaceAll(' ', ''));

      if (result.status === 200) {
        const data = {
          id: `${result.data}`,
        };
        const result1 = await getRuleEngineStatus(data);

        if (result1.data.status === 'Completed') {
          setDisableRun(false);
          setRunStatus(result1.data.status);
          enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else if (result1.data.status === 'Running') {
          setDisableRun(true);
          setRunStatus(result1.data.status);
          enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
            variant: 'warning',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else if (result1.data.status === 'Failed') {
          setDisableRun(false);
          setRunStatus(result1.data.status);
          enqueueSnackbar(`Rule Engine is ${result1.data.status}`, {
            variant: 'failed',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } else {
          const time = result.data.split('~')[1];
          const triggeredTime = new Date(time);
          const currentTime = new Date();

          const diffTime = currentTime - triggeredTime;

          const elapsedTime = Math.floor(diffTime / 60e3);

          if (elapsedTime < 5) {
            setDisableRun(true);
            setRunStatus('In Progress');
            enqueueSnackbar(`Rule Engine is in progress.`, {
              variant: 'secondary',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
          } else {
            setDisableRun(false);
            setRunStatus('Failed');
            enqueueSnackbar(`Rule Engine is failed.`, {
              variant: 'error',
              autoHideDuration: 3000,
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
          }
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        setRunStatus('Unknown');
        setDisableRun(false);
        enqueueSnackbar(`Rule Engine is not running`, {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  const loadJobStatus = async (batchname, source) => {
    const batchID = `${client.client_name}_${batchname}_${source}_ruleEngine`;
    try {
      const result = await fetchBatchidApi(batchID.replaceAll(' ', ''));

      if (result.status === 200) {
        const data = {
          id: `${result.data}`,
        };

        const result1 = await getRuleEngineStatus(data);

        if (result1.data.status === 'Completed') {
          setDisableRun(false);
          setRunStatus(result1.data.status);
        } else if (result1.data.status === 'Running') {
          setDisableRun(true);
          setRunStatus(result1.data.status);
        } else if (result1.data.status === 'Failed') {
          setDisableRun(false);
          setRunStatus(result1.data.status);
        } else {
          const time = result.data.split('~')[1];
          const triggeredTime = new Date(time);
          const currentTime = new Date();

          const diffTime = currentTime - triggeredTime;

          const elapsedTime = Math.floor(diffTime / 60e3);

          if (elapsedTime < 5) {
            setDisableRun(true);
            setRunStatus('In Progress');
          } else {
            setDisableRun(false);
            setRunStatus('Failed');
          }
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        setRunStatus('Unknown');
        setDisableRun(false);
      }
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }

  };

  useEffect(() => {
    batch.batch_name && data.tablename && loadJobStatus(batch.batch_name, data.tablename);
  }, [data.tablename]);

  const deleteTableRule1 = async (e, tablename) => {
    try {

      const response = await deleteTableRule(client.client_id, batch.batch_name, tablename);
      if (response.status === 200) {
        fetchTableRule();
        enqueueSnackbar(`${tablename} is deleted`, {
          variant: 'success',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } else {
        enqueueSnackbar(`Internal server error`, {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
  };

  return (
    <>
      <StyledTableRow>
        <StyledTableCell align="left">
          <h3>{data.tablename}</h3>
        </StyledTableCell>

        <StyledTableCell
          align="center"
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '15%' }}>
            <Tooltip title="Run">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                style={{
                  border: '1px solid #ccc',
                  margin: ' 0 10px',
                }}
                onClick={(e) => runRuleEngine(e, data.tablename)}
              >
                <PlayArrowIcon
                  {...(disableRun ? { color: 'disable' } : { color: 'success' })}
                  sx={{ fontSize: '1rem' }}
                />
              </IconButton>
            </Tooltip>
          </div>
          <div style={{ width: '5%' }}>
            <Tooltip title={`Delete ${data.tablename}`}>
              <IconButton
                color="error"
                aria-label="upload picture"
                component="span"
                style={{
                  border: '1px solid #ccc',
                  margin: ' 0 10px',
                }}
                onClick={(e) => {
                  deleteTableRule1(e, data.tablename);
                }}
              >
                <DeleteIcon {...(disableRun ? { color: 'disable' } : { color: 'error' })} sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </div>

          <div style={{ width: '15%' }}>
            <Tooltip title="View Logs">
              <Link to={`/rule-engine/logs/${data.tablename}`} style={{ textDecoration: 'none' }}>
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  style={{ border: '1px solid #ccc', margin: ' 0 10px' }}
                >
                  <FormatListBulletedIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Link>
            </Tooltip>
          </div>
          <div
            style={{
              display: 'flex',
              paddingTop: 5,
              justifyContent: 'center',
              width: '30%',
            }}
          >
            {runStatus === 'Loading...' && runStatus}
            {runStatus === 'Completed' && (
              <p
                style={{
                  color: 'green',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlineIcon style={{ fontSize: '18px' }} /> &nbsp;
                {runStatus}
              </p>
            )}
            {runStatus === 'Running' && (
              <p
                style={{
                  color: '#ffc300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccessTimeIcon style={{ fontSize: '18px' }} /> &nbsp; {runStatus}
              </p>
            )}
            {runStatus === 'Unknown' && (
              <p
                style={{
                  color: 'grey',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DoNotDisturbOnIcon style={{ fontSize: '18px' }} /> &nbsp;
                {runStatus}
              </p>
            )}

            {runStatus === 'Error' && (
              <p
                style={{
                  color: 'red',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Error style={{ fontSize: '18px' }} /> &nbsp;
                {runStatus}
              </p>
            )}

            {runStatus === 'Failed' && (
              <p
                style={{
                  color: 'red',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CancelIcon style={{ fontSize: '18px' }} /> &nbsp;
                {runStatus}
              </p>
            )}

            {runStatus === 'In Progress' && (
              <p
                style={{
                  color: '#98c1d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PendingIcon style={{ fontSize: '18px' }} /> &nbsp;
                {runStatus}
              </p>
            )}
          </div>

          <div style={{ width: '10%' }}>
            <Tooltip title="Refresh Status">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                style={{ border: '1px solid #ccc', margin: ' 0 10px' }}
                onClick={(e) => refreshBtn(e, batch.batch_name, data.tablename)}
              >
                <RefreshIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </div>
        </StyledTableCell>
        <StyledTableCell style={{ width: '20%' }} align="center">
          <Link to={`/rule-engine/table-rule/${data.tablename}/${data.id}`}>
            <Tooltip title="View Rule">
              <IconButton color="primary" aria-label="upload picture" component="span">
                <ArrowCircleRightIcon />
              </IconButton>
            </Tooltip>
          </Link>
        </StyledTableCell>
      </StyledTableRow>

      <Modal open={openLoadingModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box style={styleLoading}>
          <LoadingIcon />
        </Box>
      </Modal>
    </>
  );
};

export default memo(TableRuleRowNew);
