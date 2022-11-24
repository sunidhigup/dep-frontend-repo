import React, { useContext, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';
import { ApprovedfetchJobsApi } from "../../api's/JobApi";
import QueryNFlowPannel from '../../flow-builder/flow-builder-pannel/QueryNFlowPannel';
import { getFlowBuilderEdgesApi, getFlowBuilderFormApi, getFlowBuilderNodesApi } from "../../api's/FlowBuilderApi";

const Step3 = ({ step1Data, NextData, setNextData }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const [show, setshow] = useState(false);

  const jobHandle = async () => {
    // setJob();
    try {
      const response = await ApprovedfetchJobsApi(client.client_id, batch.batch_id);
      console.log(response.data);
      if (response.status === 200) {
        // setJob(response.data[0].input_ref_key);
        console.log(response.data);
        await fetchJobNodes(response.data[0].input_ref_key);
        // setshow(true)
      }
    } catch (error) {
      sessionStorage.removeItem('allNodes');
      sessionStorage.removeItem('node');
      sessionStorage.removeItem('elementCount');
      sessionStorage.removeItem('saved_node');
      sessionStorage.removeItem('edges');
    }
  };

  const fetchJobNodes = async (jobName) => {
    // sessionStorage.removeItem('allNodes');
    // sessionStorage.removeItem('node');
    // sessionStorage.removeItem('elementCount');
    // sessionStorage.removeItem('saved_node');
    // sessionStorage.removeItem('edges');

    let response;

    try {
      response = await getFlowBuilderNodesApi(client.client_id, batch.batch_id, jobName);
    } catch (error) {
      if (error.response.status === 404) {
        console.log(error);
        setshow(true);
      }
      return;
    }

    const getEdges = await getFlowBuilderEdgesApi(client.client_id, batch.batch_id, jobName);

    const getNodesData = await getFlowBuilderFormApi(client.client_id, batch.batch_id, jobName);

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
      {show && <QueryNFlowPannel componentType="preprocessor" />}
    </>
  );
};

export default Step3;
