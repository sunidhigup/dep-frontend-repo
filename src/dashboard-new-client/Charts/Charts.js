import React, { useContext, useEffect, useState } from 'react';
import { Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import PIECHART from './PIECHART';
import { CountContext } from '../../context/CountProvider';

const data = [
  { name: 'Rejected', value: 400 },
  { name: 'Approved', value: 300 },
  { name: 'Pending', value: 300 },
];

const Charts = () => {
  const [ClientDataChart, setClientDataChart] = useState([]);
  const [BatchDataChart, setBatchDataChart] = useState([]);
  const [JobDataChart, setJobDataChart] = useState([]);
  const { CountData } = useContext(CountContext);

  const ChartData = () => {
    if (CountData.Client_approved === 0 && CountData.Client_rejected === 0 && CountData.Client_pending) {
      setClientDataChart([{ name: 'No Client Found', value: 0 }]);
      setBatchDataChart([{ name: 'No Batch Found', value: 0 }]);

      setJobDataChart([{ name: 'No Jobs Found', value: 0 }]);
    } else {
      setClientDataChart([
        { name: 'Approved Client', value: CountData.Client_approved },
        { name: 'Rejected Client', value: CountData.Client_rejected },
        { name: 'Pending Client', value: CountData.Client_pending },
      ]);
      setBatchDataChart([
        { name: 'Approved Batch', value: CountData.Batch_approved },
        { name: 'Rejected Batch', value: CountData.Batch_rejected },
        { name: 'Pending Batch', value: CountData.Batch_pending },
        { name: 'unknown Batch', value: CountData.Batch_unknown },
      ]);
      setJobDataChart([
        { name: 'Approved Jobs', value: CountData.Jobs_approved },
        { name: 'Rejected Jobs', value: CountData.Jobs_rejected },
        { name: 'Pending Jobs', value: CountData.Jobs_pending },
        { name: 'UnKnown Jobs', value: CountData.Jobs_unknown },
      ]);
    }
  };
  useEffect(() => {
    ChartData();
  }, [CountData.Client_ready, CountData.Batch_ready, CountData.Jobs_ready]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            <u>Client</u>
          </div>
          <div>
            <PIECHART data={ClientDataChart} chart_name="Client" />
          </div>
        </div>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            <u>Batch</u>
          </div>
          <div>
            <PIECHART data={BatchDataChart} chart_name="Batch" />
          </div>
        </div>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            <u>Jobs</u>
          </div>
          <div>
            <PIECHART data={JobDataChart} chart_name="Job" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Charts;
