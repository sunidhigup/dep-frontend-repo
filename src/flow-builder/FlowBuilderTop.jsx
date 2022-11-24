import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { JobContext } from '../context/JobProvider';
import { BatchContext } from '../context/BatchProvider';
import { ClientContext } from '../context/ClientProvider';
import convertToRequiredFormat from './JsonConverter';

import {
  createFlowBuilderEdgesApi,
  createFlowBuilderFormApi,
  createFlowBuilderJobInputApi,
  createFlowBuilderJsonApi,
  createFlowBuilderNodesApi,
  deleteFlowBuilderJobInputApi,
  getFlowBuilderJobInputApi,
} from "../api's/FlowBuilderApi";
import { createJobApi } from "../api's/JobApi";

const useStyles = makeStyles({
  BulderComponent: {
    display: 'flex',
    alignItems: 'center',
  },

  BuilderRightComponent: {
    padding: '10px',
    marginLeft: 'auto',
  },
});

const FlowBuilderTop = ({ resetElements, nodes, edges, userRole, componentType }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { Job } = useContext(JobContext);
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const [loadBtn, setLoadBtn] = useState(false);
  const navigate = useNavigate();

  const checkData = (e) => {
    e.preventDefault();

    const getNodeData = JSON.parse(sessionStorage.getItem('saved_node'));

    const getElementCount = parseInt(sessionStorage.getItem('elementCount') || 0, 10);

    if (getElementCount <= 0) {
      enqueueSnackbar('Please add some steps before saving!!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      // return;
    } else if (!getNodeData) {
      enqueueSnackbar('Please enter and submit some data for the dragged steps!!', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      // return;
    } else if (getNodeData.length !== getElementCount) {
      enqueueSnackbar('All nodes are not submitted. Please submit all nodes! ', {
        variant: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      // return;
    } else {
      saveFormData(e);
    }
  };

  const saveFormData = async () => {
    setLoadBtn(true);
    try {
      const getAllDataFromLocalStorage = JSON.parse(sessionStorage.getItem('allNodes'));

      getAllDataFromLocalStorage.sort((a, b) => a.y_axis - b.y_axis);

      const getNodeData = JSON.parse(sessionStorage.getItem('saved_node'));

      const getElementCount = parseInt(sessionStorage.getItem('elementCount'), 10) || '';

      if (getNodeData.length === getElementCount) {
        let count = 1;
        getAllDataFromLocalStorage.forEach((el) => {
          el.formField.step_no = count;
          count++;
        });

        const tempFormData = getAllDataFromLocalStorage;

        const createNodesData = {
          client_id: client.client_id,
          batch_id: batch.batch_id,
          nodes,
          jobName: Job,
          batch: batch.batch_name,
        };

        const createNodes = await createFlowBuilderNodesApi(createNodesData);

        const createEdgesData = {
          client_id: client.client_id,
          batch_id: batch.batch_id,
          edges,
          jobName: Job,
          batch: batch.batch_name,
        };

        const createEdges = await createFlowBuilderEdgesApi(createEdgesData);

        getAllDataFromLocalStorage.sort((a, b) => a.formField.step_no - b.formField.step_no);
        const formData = convertToRequiredFormat(getAllDataFromLocalStorage);

        tempFormData.forEach((el) => {
          if (el.nodeName === 'Data Cleansing') {
            el.cleansingRules = el.cleansingRules.filter((el) => {
              return !el.deleted;
            });
          }
        });

        tempFormData.forEach((el) => {
          if (el.nodeName === 'Data Cleansing') {
            el.initial_rules = el.cleansingRules;
          }
        });

        const createFormData = {
          client_id: client.client_id,
          batch_id: batch.batch_id,
          batch: batch.batch_name,
          jobName: Job,
          nodes: tempFormData,
        };

        const createForm = createFlowBuilderFormApi(createFormData);

        if (formData.steps[formData.steps.length - 1] === null) {
          formData.steps.pop();
        }

        // const createFormJson = await createFlowBuilderJsonApi(client.client_name, batch.batch_name, Job, formData);

        const jobInputArr = [];
        if (getAllDataFromLocalStorage) {
          for (let i = 0; i < getAllDataFromLocalStorage.length; i++) {
            if (getAllDataFromLocalStorage[i].nodeName === 'Read' && getAllDataFromLocalStorage[i].formField.path) {
              jobInputArr.push(getAllDataFromLocalStorage[i]);
            }
          }
        }

        if (jobInputArr.length !== 0) {
          const createReadFormData = {
            readForms: jobInputArr,
          };
          const createReadForm = await createFlowBuilderJobInputApi(
            client.client_id,
            batch.batch_id,
            batch.batch_name,
            Job,
            createReadFormData
          );
        } else {
          try {
            const jobInputExist = await getFlowBuilderJobInputApi(client.client_id, batch.batch_id, Job);

            if (jobInputExist.status === 200) {
              const deleteReadInput = await deleteFlowBuilderJobInputApi(client.client_id, batch.batch_id, Job);
            }
          } catch (error) {
            console.log();
          }
        }
        if (createNodes.status === 200 || createNodes.status === 201) {
          localStorage.removeItem('allNodes');
          localStorage.removeItem('node');
          localStorage.removeItem('elementCount');
          localStorage.removeItem('saved_node');
          enqueueSnackbar('Steps and Data are saved!', {
            variant: 'success',
            autoHideDuration: 3000,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
          componentType !== 'preprocessor' && resetElements();

          if (componentType === 'preprocessor') {
            const data = {
              batch_name: batch.batch_name,
              input_ref_key: Job,
              batch_id: batch.batch_id,
              client_id: client.client_id,
              client_name: client.client_name,
            };
            await createJobApi(data, client.bucket_name);
          }
        }
        setLoadBtn(false);

        componentType !== 'preprocessor' && navigate(`/flow-builder`);
      }
    } catch (error) {
      if (error.response.status === 403) {
        enqueueSnackbar('You have only Read Permission !!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      setLoadBtn(false);
    }
  };

  const handleMouseEnter = (e) => {
    e.target.style.color = 'blue';
  };
  const handleMouseLeave = (e) => {
    e.target.style.color = 'black';
  };

  const classes = useStyles();
  return (
    <>
      <Box className={classes.BulderComponent}>
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
          <p style={{ marginRight: '20px' }}>
            <a
              role="button"
              tabIndex="0"
              onClick={() => navigate(-1)}
              onKeyDown={() => navigate(-1)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {batch.batch_name}
            </a>
            <ArrowForwardIosIcon sx={{ fontSize: '12px' }} /> <span style={{ color: '#6c757d' }}>{Job}</span>
          </p>
        </Box>
        <Box className={classes.BuilderRightComponent}>
          {!loadBtn ? (
            <Button
              variant="contained"
              size="small"
              onClick={checkData}
              className="button-color"
              disabled={userRole === 'ROLE_reader'}
            >
              Save
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" size="small">
              Save
            </LoadingButton>
          )}
        </Box>
      </Box>
    </>
  );
};

export default FlowBuilderTop;
