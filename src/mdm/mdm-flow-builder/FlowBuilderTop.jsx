import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Checkbox, Col, Modal, Row } from 'antd';

import { JobContext } from '../../context/JobProvider';
import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';
import convertToRequiredFormat from './JsonConverter';

import {
  createFlowBuilderEdgesApi,
  createFlowBuilderFormApi,
  createFlowBuilderJobInputApi,
  createFlowBuilderJsonApi,
  createFlowBuilderNodesApi,
  deleteFlowBuilderJobInputApi,
  getFlowBuilderJobInputApi,
} from "../../api's/FlowBuilderApi";
import { addMDMEntityEdge, addMDMEntityNode, addMDMFlowBuilderForm, storeFlowJson } from "../../api's/MDMApi";

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

const FlowBuilderTop = ({ resetElements, nodes, edges, entityName }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [loadBtn, setLoadBtn] = useState(false);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [RowLevelOperation, setRowLevelOperation] = useState([]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

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
          entityName,
          nodes,
        };

        const createNodes = await addMDMEntityNode(createNodesData);

        const createEdgesData = {
          entityName,
          edges,
        };

        const createEdges = await addMDMEntityEdge(createEdgesData);

        getAllDataFromLocalStorage.sort((a, b) => a.formField.step_no - b.formField.step_no);
        const formData = convertToRequiredFormat(getAllDataFromLocalStorage);

        console.log(JSON.stringify(formData));

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
          entityName,

          nodes: tempFormData,
        };

        const createForm = await addMDMFlowBuilderForm(createFormData);

        if (formData.steps[formData.steps.length - 1] === null) {
          formData.steps.pop();
        }

        const createFormJson = await storeFlowJson(formData, entityName);

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
          resetElements();
        }
        setLoadBtn(false);
        navigate(`/mdm`);
      }
    } catch (error) {
      console.log(error);
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

  const onChangeRowLevel = (checkedValues) => {
    setRowLevelOperation(checkedValues);
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
              {entityName}
            </a>
            <ArrowForwardIosIcon sx={{ fontSize: '12px' }} /> <span style={{ color: '#6c757d' }}>flow</span>
          </p>
        </Box>
        <Box className={classes.BuilderRightComponent}>
          {/* <Button variant="contained" size="small" onClick={showModal} className="button-color" style={{ marginRight: 10 }}>
            Row Level Operation
          </Button> */}

          {!loadBtn ? (
            <Button variant="contained" size="small" onClick={checkData} className="button-color">
              Save
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined" size="small">
              Save
            </LoadingButton>
          )}
        </Box>
      </Box>
      <Modal
        title="FlowBuilder Row Level Operation"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closable
        okText="submit"
        centered
      >
        <Checkbox.Group
          style={{
            width: '100%',
          }}
          onChange={(e) => onChangeRowLevel(e)}
          // defaultValue={['delimiter', 'cleaning']}
        >
          <Row>
            <Col span={8}>
              <Checkbox value="delimiter">delimiter</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="junkRecords">junkRecords</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="cleaning">cleaning</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="skipTrailers">skipTrailers</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="ignoreBlankLines">ignoreBlankLines</Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </Modal>
    </>
  );
};

export default FlowBuilderTop;
