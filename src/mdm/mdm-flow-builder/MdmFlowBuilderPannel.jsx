import React, { useState, useRef, useCallback, useMemo, useEffect, useContext } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  updateEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'react-flow-renderer';
import { Paper } from '@mui/material';
import { useSnackbar } from 'notistack';

import './flowbuilderpannel.css';
import { useLocation } from 'react-router-dom';
import { getMDMEntityEdge, getMDMEntityNode } from "../../api's/MDMApi";
import NodesSection from './NodesSection';
import FlowBuilderTop from './FlowBuilderTop';
import CustomNode from './CustomNode';
import ButtonEdge from './ButtonEdge';
import NodeModalRead from './NodeModal_Read';
import NodeModalJoin from './NodeModal_Join';
import NodeModalWrite from './NodeModal_Write';
import NodeModalAttribute from './NodeModal_AttributeSelection';
import { StreamContext } from '../../context/StreamProvider';
import { ClientContext } from '../../context/ClientProvider';

const edgeTypes = {
  buttonedge: ButtonEdge,
};

const getId = () => `dndnode_${+new Date()}`;

const MdmFlow = () => {
  const nodeTypes = useMemo(() => ({ editableNode: CustomNode }), []);
  const location = useLocation();
  const { entity } = location.state;
  const { stream } = useContext(StreamContext);
  const { client } = useContext(ClientContext);
  const { enqueueSnackbar } = useSnackbar();
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [nodeName, setNodeName] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [childForm, setChildForm] = useState();

  const [sortOpen, setSortOpen] = useState(false);
  const handleSortOpen = () => setSortOpen(true);
  const handleSortClose = () => setSortOpen(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const handleFilterOpen = () => setFilterOpen(true);
  const handleFilterClose = () => setFilterOpen(false);

  const [joinOpen, setJoinOpen] = useState(false);
  const handleJoinOpen = () => setJoinOpen(true);
  const handleJoinClose = () => setJoinOpen(false);

  const [readOpen, setReadOpen] = useState(false);
  const handleReadOpen = () => setReadOpen(true);
  const handleReadClose = () => setReadOpen(false);

  const [cleansingOpen, setCleansingOpen] = useState(false);
  const handleCleansingOpen = () => setCleansingOpen(true);
  const handleCleansingClose = () => setCleansingOpen(false);

  const [sqlOpen, setSqlOpen] = useState(false);
  const handleSqlOpen = () => setSqlOpen(true);
  const handleSqlClose = () => setSqlOpen(false);

  const [writeOpen, setWriteOpen] = useState(false);
  const handleWriteOpen = () => setWriteOpen(true);
  const handleWriteClose = () => setWriteOpen(false);

  const [aggregateOpen, setAggregateOpen] = useState(false);
  const handleAggregateOpen = () => setAggregateOpen(true);
  const handleAggregateClose = () => setAggregateOpen(false);

  const [C360Open, setC360Open] = useState(false);
  const handleC360Open = () => setC360Open(true);
  const handleC360Close = () => setC360Open(false);

  const [attributeOpen, setAttributeOpen] = useState(false);
  const handleAttributeOpen = () => setAttributeOpen(true);
  const handleAttributeClose = () => setAttributeOpen(false);

  const onConnect = useCallback((params) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: 'buttonedge',
          data: { onEdgesChange },
        },
        eds
      )
    );
  }, []);

  const onEdgeUpdate = (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els));

  const onNodesChange = useCallback((changes) => {
    if (changes[0].type === 'remove') {
      const getElementsId = JSON.parse(sessionStorage.getItem('saved_node'));

      if (getElementsId && getElementsId.includes(changes[0].id)) {
        enqueueSnackbar('You cannot delete after submiting form data!', {
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      setNodes((ns) => applyNodeChanges(changes, ns));

      const getAllNodes = JSON.parse(sessionStorage.getItem('allNodes'));

      if (getAllNodes) {
        getAllNodes.forEach((el, i) => {
          if (el.nodeId === changes[0].id) {
            getAllNodes.splice(i, 1);
            sessionStorage.setItem('allNodes', JSON.stringify(getAllNodes));
          }
        });
      }

      const elemCount = parseInt(sessionStorage.getItem('elementCount'), 10);

      elemCount && sessionStorage.setItem('elementCount', elemCount - 1);

      setNodeName('');
      setNodeId('');
    } else {
      setNodes((ns) => applyNodeChanges(changes, ns));
    }
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((es) => applyEdgeChanges(changes, es));
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const name = event.dataTransfer.getData('nodeName');
      const className = event.dataTransfer.getData('className');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${name}`, initNode: `${name}`, onNodesChange },
      };

      const elemCount = parseInt(sessionStorage.getItem('elementCount'), 10);

      elemCount ? sessionStorage.setItem('elementCount', elemCount + 1) : sessionStorage.setItem('elementCount', 1);

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onNodeClick = (event, node) => {
    if (nodeName || nodeId) {
      setNodeName('');
      setNodeId('');
    }

    setNodeId(node.id);
    setNodeName(node.data.initNode);

    if (node.data.initNode === 'Sort') {
      handleSortOpen();
    }

    if (node.data.initNode === 'Filter') {
      handleFilterOpen();
    }

    if (node.data.initNode === 'Join') {
      handleJoinOpen();
    }

    if (node.data.initNode === 'Read') {
      handleReadOpen();
    }

    if (node.data.initNode === 'Data Cleansing') {
      handleCleansingOpen();
    }

    if (node.data.initNode === 'Execute SQL') {
      handleSqlOpen();
    }

    if (node.data.initNode === 'Write') {
      handleWriteOpen();
    }

    if (node.data.initNode === 'Aggregation') {
      handleAggregateOpen();
    }

    if (node.data.initNode === 'C360') {
      handleC360Open();
    }

    if (node.data.initNode === 'Attribute Selection') {
      handleAttributeOpen();
    }
  };

  const getChildProp = (data) => {
    setChildForm(data);
  };

  const getJoinProp = (data, tables, joins) => {
    let tableCount = 3;
    let joinCount = 2;

    if (tables) {
      tables.forEach((el) => {
        data.formField.tables[`table${tableCount++}`] = el;
      });
    }
    if (joins) {
      joins.forEach((el) => {
        data.formField.joins[`join${joinCount++}`] = el;
      });
    }
    setChildForm(data);
  };

  const changeNodeName = (newNode) => {
    newNode.forEach((el) => {
      el.data.onNodesChange = onNodesChange;
    });
    setNodes(newNode);
  };

  const resetElements = () => {
    setNodes([]);
  };

  useEffect(() => {
    const fetchNodes = JSON.parse(sessionStorage.getItem('node'));
    const fetchEdges = JSON.parse(sessionStorage.getItem('edges'));

    if (fetchEdges && fetchNodes) {
      fetchNodes.forEach((el) => {
        el.data.onNodesChange = onNodesChange;
      });
      fetchEdges.forEach((el) => {
        el.data.onEdgesChange = onEdgesChange;
      });

      setNodes(fetchNodes);
      setEdges(fetchEdges);
    }
  }, []);

  return (
    <Paper style={{ flex: 4, padding: ' 10px' }}>
      <FlowBuilderTop resetElements={resetElements} nodes={nodes} edges={edges} entityName={entity.entityName} />

      <div className="node-sec">
        <NodesSection />
      </div>

      <div className="dndflow">
        <ReactFlowProvider>
          {nodeName === 'Write' && nodes && (
            <NodeModalWrite
              nodeId={nodeId}
              getProp={getChildProp}
              changeNodeName={changeNodeName}
              nodeName={nodeName}
              nodes={nodes}
              edges={edges}
              open={writeOpen}
              handleClose={handleWriteClose}
            />
          )}
          {/* {nodeName === 'C360' && nodes && (
            <NodeModalC360
              nodeId={nodeId}
              getProp={getChildProp}
              changeNodeName={changeNodeName}
              nodeName={nodeName}
              nodes={nodes}
              edges={edges}
              open={C360Open}
              handleClose={handleC360Close}
            />
          )} */}
          {nodeName === 'Read' && nodes && (
            <NodeModalRead
              nodeId={nodeId}
              nodeName={nodeName}
              getProp={getChildProp}
              changeNodeName={changeNodeName}
              nodes={nodes}
              edges={edges}
              open={readOpen}
              handleClose={handleReadClose}
              entity={entity}
            />
          )}
          {nodeName === 'Attribute Selection' && nodes && (
            <NodeModalAttribute
              nodeId={nodeId}
              getProp={getChildProp}
              nodeName={nodeName}
              changeNodeName={changeNodeName}
              nodes={nodes}
              edges={edges}
              open={attributeOpen}
              handleClose={handleAttributeClose}
              entity={entity}
            />
          )}

          {nodeName === 'Join' && nodes && (
            <NodeModalJoin
              nodeId={nodeId}
              getJoinProp={getJoinProp}
              nodeName={nodeName}
              changeNodeName={changeNodeName}
              nodes={nodes}
              edges={edges}
              open={joinOpen}
              handleClose={handleJoinClose}
            />
          )}

          {/* {nodeName === 'Sort' && nodes && (
            <NodePropertiesSort
              nodeId={nodeId}
              getJoinProp={getJoinProp}
              nodeName={nodeName}
              changeNodeName={changeNodeName}
              nodes={nodes}
              edges={edges}
              open={sortOpen}
              handleClose={handleSortClose}
            />
          )}

          {nodeName === 'Filter' && nodes && (
            <NodePropertiesFilter
              nodeId={nodeId}
              getJoinProp={getJoinProp}
              nodeName={nodeName}
              changeNodeName={changeNodeName}
              nodes={nodes}
              edges={edges}
              open={filterOpen}
              handleClose={handleFilterClose}
            />
          )}

          {nodeName === 'Data Cleansing' && nodes && (
            <NodeModalDataCleansing
              nodeId={nodeId}
              getJoinProp={getJoinProp}
              nodeName={nodeName}
              changeNodeName={changeNodeName}
              nodes={nodes}
              edges={edges}
              open={cleansingOpen}
              handleClose={handleCleansingClose}
            />
          )}

          {nodeName === 'Aggregation' && nodes && (
            <NodeModalAggregate
              nodeId={nodeId}
              getJoinProp={getJoinProp}
              nodeName={nodeName}
              changeNodeName={changeNodeName}
              nodes={nodes}
              edges={edges}
              open={aggregateOpen}
              handleClose={handleAggregateClose}
            />
          )} */}
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodeClick={onNodeClick}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onEdgeUpdate={onEdgeUpdate}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
            >
              <Controls />
              <Background color="#aar" gap={20} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </Paper>
  );
};

export default MdmFlow;
