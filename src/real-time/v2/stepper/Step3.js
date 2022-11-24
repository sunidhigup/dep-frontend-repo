import React, { useContext, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import LoadingIcon from '../../../reusable-components/LoadingIcon';
import { ClientContext } from '../../../context/ClientProvider';
import { ApprovedfetchJobsApi } from "../../../api's/JobApi";
import QueryNFlowPannel from '../../../flow-builder/flow-builder-pannel/QueryNFlowPannel';
import { getFlowBuilderEdgesApi, getFlowBuilderFormApi, getFlowBuilderNodesApi } from "../../../api's/FlowBuilderApi";
import { JobContext } from '../../../context/JobProvider';

const Step3 = ({ step1Data, NextData, setNextData }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { client } = useContext(ClientContext);
  const [show, setshow] = useState(false);
  const { Job, setJob } = useContext(JobContext);

  const jobHandle = async () => {
    // setJob('');
    try {
      // const response = await ApprovedfetchJobsApi(client.client_id, step1Data.stream_id);
      // if (response.status === 200) {
      //   setJob(response.data[0].input_ref_key);
      //   await fetchJobNodes(response.data[0].input_ref_key);
      //   // setshow(true)
      // }
      await fetchJobNodes(Job);
    } catch (error) {
      if (error.response.status === 404) {
        enqueueSnackbar('Create new flow!!', {
          variant: 'warning',
          autoHideDuration: 5000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }

      // enqueueSnackbar('Something went wrong', {
      //   variant: 'error',
      //   autoHideDuration: 5000,
      //   anchorOrigin: { vertical: 'top', horizontal: 'right' },
      // });

      sessionStorage.removeItem('allNodes');
      sessionStorage.removeItem('node');
      sessionStorage.removeItem('elementCount');
      sessionStorage.removeItem('saved_node');
      sessionStorage.removeItem('edges');
      setshow(true);
    }
  };

  const fetchJobNodes = async (jobName) => {
    let response;

    try {
      response = await getFlowBuilderNodesApi(client.client_id, step1Data.stream_id, jobName);
    } catch (error) {
      if (error.response.status === 404) {
        setshow(true);
      }
      return;
    }

    const getEdges = await getFlowBuilderEdgesApi(client.client_id, step1Data.stream_id, jobName);

    const getNodesData = await getFlowBuilderFormApi(client.client_id, step1Data.stream_id, jobName);

    let elemCount = 0;
    let nodes = '';
    let nodeData = '';
    let edges = '';

    if (response.status === 200 || getNodesData.status === 200) {
      nodes = response.data.nodes;

      nodes.forEach((el) => {
        if (el.type === 'editableNode') {
          el['id'] = `${el.id}`;
        }
      });

      nodeData = getNodesData.data.nodes;

      const newSavedElement = [];
      nodeData.forEach((el) => {
        el['nodeId'] = `${el.nodeId}`;
        elemCount++;
        newSavedElement.push(el.nodeId);
      });

      edges = getEdges.data.edges;

      edges.forEach((el) => {
        if (el.source && el.target) {
          el['id'] = `${el.id}`;
          el['source'] = `${el.source}`;
          el['target'] = `${el.target}`;
        }
      });

      sessionStorage.setItem('allNodes', JSON.stringify(nodeData));
      sessionStorage.setItem('elementCount', elemCount);
      sessionStorage.setItem('node', JSON.stringify(nodes));
      sessionStorage.setItem('edges', JSON.stringify(edges));
      sessionStorage.setItem('saved_node', JSON.stringify(newSavedElement));
      setshow(true);
    }
  };

  useEffect(() => {
    sessionStorage.removeItem('allNodes');
    sessionStorage.removeItem('node');
    sessionStorage.removeItem('elementCount');
    sessionStorage.removeItem('saved_node');
    sessionStorage.removeItem('edges');
    jobHandle();
  }, []);

  return (
    <>
      {!show && <LoadingIcon />}
      {show && <QueryNFlowPannel />}
    </>
  );
};

export default Step3;
