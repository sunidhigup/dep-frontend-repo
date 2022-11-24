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
        Data Loader
      </div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Write', 'dndnode input')}
        draggable
      >
        <img src={writeIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Data Export
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Join', 'dndnode input')}
        draggable
      >
        <img src={joinIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Match and Merge
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'editableNode', 'Attribute Selection', 'dndnode input')}
        draggable
      >
        <img src={selectIcon} width="30" alt="Nagarro" style={{ filter: 'contrast(200%)', margin: '10px' }} />
        Attribute Selection
      </div>
    </aside>
  );
};
