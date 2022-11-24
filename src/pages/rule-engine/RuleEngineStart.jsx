import React from 'react';
import RuleEnginePannel from './RuleEnginePannel';

const RuleEngineStart = () => {
  return (
    <div style={{ width: '100%', marginTop: '30px' }}>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1, color: 'red' }}>
          <RuleEnginePannel />
        </div>
      </div>
    </div>
  );
};

export default RuleEngineStart;
