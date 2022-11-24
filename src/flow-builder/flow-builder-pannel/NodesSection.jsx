import React from 'react';

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

export default () => {
  const onDragStart = (event, nodeType, nodeValue, className) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeName', nodeValue);
    event.dataTransfer.setData('className', className);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Read', 'dndnode input')}
        draggable
      >
        <img src={readIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Read
      </div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Write', 'dndnode input')}
        draggable
      >
        <img src={writeIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Write
      </div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Execute SQL', 'dndnode input')}
        draggable
      >
        <img src={executeSqlIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Execute SQL
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Join', 'dndnode input')}
        draggable
      >
        <img src={joinIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Join
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Sort', 'dndnode input')}
        draggable
      >
        <img src={sortIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Sort
      </div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Filter', 'dndnode input')}
        draggable
      >
        <img src={filterIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Filter
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Data Cleansing', 'dndnode input')}
        draggable
      >
        <img src={cleansingIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Data Cleansing
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Aggregation', 'dndnode input')}
        draggable
      >
        <img src={selectIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Aggregation
      </div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'C360', 'dndnode input')}
        draggable
      >
        <img src={analyticIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Predictive Analytics
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Udf', 'dndnode input')}
        draggable
      >
        <img src={udfIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Udf
      </div>
    </aside>
  );
};
