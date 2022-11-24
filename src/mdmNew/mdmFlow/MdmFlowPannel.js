import { Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Breadcrumb, Divider } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getMDMEntityEdge, getMDMEntityNode, getMDMFlowBuilderForm } from "../../api's/MDMApi";
import { getAllEntity } from "../../api's/EntityApi";
import MdmFlow from '../mdm-flow-builder/MdmFlowBuilderPannel';
import LoadingIcon from '../../reusable-components/LoadingIcon';
import Header from '../../admin/approval/Header';

const MdmFlowPannel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [options, setOptions] = useState([]);
  const [SelectedEntity, setSelectedEntity] = useState({});
  const [loading, setloading] = useState(false);
  const [isFlowShown, setisFlowShown] = useState(false);

  const fetchAllEntities = async () => {
    const response = await getAllEntity();
    if (response.status === 200) {
      console.log(response.data);
      setOptions(response.data);
    }
  };
  useEffect(() => {
    fetchAllEntities();
  }, []);

  const handleMDMFlow = async (entity) => {
    setloading(true);
    sessionStorage.removeItem('allNodes');
    sessionStorage.removeItem('node');
    sessionStorage.removeItem('elementCount');
    sessionStorage.removeItem('saved_node');
    sessionStorage.removeItem('edges');

    let response;

    try {
      response = await getMDMEntityNode(entity.entityName);
    } catch (error) {
      if (error.response.status === 404) {
        setisFlowShown(true);
        setloading(false);
        enqueueSnackbar('No Flow Found!! Create New', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      return;
    }

    const getEdges = await getMDMEntityEdge(entity.entityName);

    const getNodesData = await getMDMFlowBuilderForm(entity.entityName);

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
      setisFlowShown(true);
      setloading(false);
    }
  };
  const onchangeSelect = async (item) => {
    console.log(item);
    setSelectedEntity(item);
    await handleMDMFlow(item);
  };

  return (
    <>
      <Paper elevation={1} style={{ padding: '15px' }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/mdm">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>MDM FLow</Breadcrumb.Item>
        </Breadcrumb>
        <Header name="MDM Flow Builder" />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginTop: 20,
          }}
        >
          <div style={{ flex: 1, fontSize: 18, fontWeight: 'bold' }}>Select Entity : </div>
          <div style={{ flex: 3 }}>
            <Select
              autoFocus
              isSearchable
              placeholder="Select Connection Type"
              value={SelectedEntity}
              onChange={onchangeSelect}
              options={options}
              getOptionValue={(option) => option.entityId}
              getOptionLabel={(option) => option.entityName}
            />
          </div>
          <div style={{ flex: 4 }} />
        </div>
      </Paper>
      <Divider />
      {!loading && isFlowShown && (
        <>
          <MdmFlow entity={SelectedEntity} />
        </>
      )}
      {loading && <LoadingIcon />}
    </>
  );
};

export default MdmFlowPannel;
