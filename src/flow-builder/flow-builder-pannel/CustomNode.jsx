import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import readIcon from '../../images/books.png';
import writeIcon from '../../images/pencil.png';
import executeSqlIcon from '../../images/gear.png';
import joinIcon from '../../images/link.png';
import sortIcon from '../../images/sorting.png';
import filterIcon from '../../images/filter.png';
import selectIcon from '../../images/select.png';
import cleansingIcon from '../../images/cleansing.png';
import analyticIcon from '../../images/analytics.png';
import udfIcon from '../../images/udf1.png';

function CustomNode({ data, isConnectable, id }) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '20px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            padding: '10px 20px',
            border: '3px solid #ddd',
            borderRadius: '5px',
            alignItems: 'center',
          }}
        >
          <Tooltip title={data.label} placement="top">
            <div>
              <Handle
                type="target"
                position={Position.Left}
                style={{ padding: '7px', backgroundColor: '#aaa' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={isConnectable}
              />
              {/* <div style={{ padding: '10px 25px' }}>{data.label}</div> */}

              {data.initNode === 'Read' && (
                <div style={{ textAlign: 'center' }}>
                  <img src={readIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode === 'Write' && (
                <div style={{ textAlign: 'center' }}>
                  <img src={writeIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode === 'C360' && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={analyticIcon}
                    width="30"
                    alt="Nagarro"
                    style={{ filter: 'contrast(200%)', margin: '10px' }}
                  />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode === 'Execute SQL' && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={executeSqlIcon}
                    width="30"
                    alt="Nagarro"
                    style={{ filter: 'contrast(200%)', margin: '10px' }}
                  />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode === 'Join' && (
                <div style={{ textAlign: 'center' }}>
                  <img src={joinIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode === 'Sort' && (
                <div style={{ textAlign: 'center' }}>
                  <img src={sortIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode === 'Filter' && (
                <div style={{ textAlign: 'center' }}>
                  <img src={filterIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}

              {data.initNode === 'Data Cleansing' && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={cleansingIcon}
                    width="30"
                    alt="Nagarro"
                    style={{ filter: 'contrast(200%)', margin: '10px' }}
                  />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode === 'Aggregation' && (
                <div style={{ textAlign: 'center' }}>
                  <img src={selectIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
              {data.initNode !== 'C360' && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id="a"
                  style={{
                    padding: '7px',
                    backgroundColor: '#aaa',
                  }}
                  isConnectable={isConnectable}
                />
              )}

              {data.initNode === 'Udf' && (
                <div style={{ textAlign: 'center' }}>
                  <img src={udfIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
                  {/* <p style={{ color: '#aaa' }}>{data.initNode}</p> */}
                </div>
              )}
            </div>
          </Tooltip>
        </div>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            data.onNodesChange([{ id, type: 'remove' }]);
          }}
        >
          <DeleteIcon style={{ fontSize: '20px' }} />
        </IconButton>
      </div>
    </>
  );
}

export default memo(CustomNode);
