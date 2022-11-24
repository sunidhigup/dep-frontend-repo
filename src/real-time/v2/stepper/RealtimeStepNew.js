import React, { useContext, useState } from 'react';
import { Breadcrumb, Button, Divider, message, Steps } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BatchContext } from '../../../context/BatchProvider';
import { ClientContext } from '../../../context/ClientProvider';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

const { Step } = Steps;

const RealtimeStepNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const streamData = location.state;
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const [current, setCurrent] = useState(0);
  const [step1Data, setstep1Data] = useState({ activeStep: 0, s3Path: '', ruleEngine: false, flowBuilder: false, storage:false });
  const [NextData, setNextData] = useState({ step1: true, step2: true, step3: false, step4: true });

  console.log(step1Data);
  const next = () => {
    if (step1Data.ruleEngine && step1Data.flowBuilder) {
      setCurrent(current + 1);
      setNextData({ ...NextData, step3: false });
    } else if (step1Data.ruleEngine && !step1Data.flowBuilder) {
      current === 1 ? setCurrent(current + 2) : setCurrent(current + 1);
    } else if (!step1Data.ruleEngine && step1Data.flowBuilder) {
      current === 0 ? setCurrent(current + 2) : setCurrent(current + 1);
    } else {
      setCurrent(current + 3);
    }
  };

  const prev = () => {
    console.log(current);
    if (step1Data.ruleEngine && step1Data.flowBuilder) {
      setCurrent(current - 1);
      if (current - 1 === 0) {
        setNextData({ ...NextData, step1: true });
        setstep1Data({ ...step1Data, ruleEngine: false, flowBuilder: false });
      }
    } else if (step1Data.ruleEngine && !step1Data.flowBuilder) {
      if (current === 3) {
        setCurrent(current - 2);
        if (current - 2 === 0) {
          setNextData({ ...NextData, step1: true });
          setstep1Data({ ...step1Data, ruleEngine: false, flowBuilder: false });
        }
      } else {
        setCurrent(current - 1);
        if (current - 1 === 0) {
          setNextData({ ...NextData, step1: true });
          setstep1Data({ ...step1Data, ruleEngine: false, flowBuilder: false });
        }
      }
    } else if (!step1Data.ruleEngine && step1Data.flowBuilder) {
      if (current === 2) {
        setCurrent(current - 2);
        if (current - 2 === 0) {
          setNextData({ ...NextData, step1: true });
          setstep1Data({ ...step1Data, ruleEngine: false, flowBuilder: false });
        }
      } else {
        setCurrent(current - 1);
        if (current - 1 === 0) {
          setNextData({ ...NextData, step1: true });
          setstep1Data({ ...step1Data, ruleEngine: false, flowBuilder: false });
        }
      }
    } else {
      setCurrent(current - 3);
      if (current - 3 === 0) {
        setNextData({ ...NextData, step1: true });
        setstep1Data({ ...step1Data, ruleEngine: false, flowBuilder: false });
      }
    }
  };

  const steps = [
    {
      title: 'Stream Table Data',
      content: (
        <Step1
          client={client}
          batch={batch}
          step1Data={step1Data}
          setstep1Data={setstep1Data}
          NextData={NextData}
          setNextData={setNextData}
          streamData={streamData}
        />
      ),
    },
    {
      title: 'Rule Engine Data',
      content: <Step2 step1Data={step1Data} NextData={NextData} setNextData={setNextData} />,
    },
    {
      title: 'Flow Builder',
      content: <Step3 step1Data={step1Data} NextData={NextData} setNextData={setNextData} />,
    },
    {
      title: 'FInished',
      content: <Step4 step1Data={step1Data} NextData={NextData} setNextData={setNextData} />,
    },
  ];
  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/real-time-streaming">
            <span style={{ fontSize: 20, fontWeight: 'bold', color: 'blue' }}>RealTime Home Page</span>
          </Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Divider />
      <br />
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">{steps[current].content}</div>
      <div className="steps-action">
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Previous
          </Button>
        )}
        {current === 0 && (
          <Button disabled={NextData.step1} type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === 1 && (
          <Button disabled={NextData.step2} type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === 2 && (
          <Button disabled={NextData.step3} type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === 3 && (
          <Button
            type="primary"
            onClick={() => {
              navigate(`/real-time-streaming`);
            }}
          >
            Done
          </Button>
        )}
      </div>
    </>
  );
};

export default RealtimeStepNew;
