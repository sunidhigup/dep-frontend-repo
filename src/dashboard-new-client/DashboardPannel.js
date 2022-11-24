import React, { useContext, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Divider } from '@mui/material';
import Box from '@mui/material/Box';
import OnBoarding from './OnBoarding/OnBoarding';
import Charts from './Charts/Charts';
import ClientTable from './tables/ClientTable';
import JobTable from './tables/JobTable';
import BatchTable from './tables/BatchTable';
import Header from './tables/Header';
import Region from './Region/Region';
import { AuthContext } from '../context/AuthProvider';
import { getClientApi, getClientBatchJobByUserIdApi } from "../api's/ClientApi";
import { fetchAllJobsApi } from "../api's/JobApi";
import { getAllBatchApi } from "../api's/BatchApi";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const DashboardPannel = () => {
  const { userId } = useContext(AuthContext);
  const [allClient, setAllClient] = useState([]);
  const [allBatch, setAllBatch] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const { userRole } = useContext(AuthContext);
  const fetchDashboardData = async () => {
    const response = await getClientBatchJobByUserIdApi(userId);

    if (response.status === 200) {
      const batch = [];
      const job = [];
      setAllClient(response.data[0].client_info);
      console.log(response.data);
      response.data[0].client_info.forEach((el) => {
        if (el.batch_info) batch.push(...el.batch_info);
        if (el.job_info) job.push(...el.job_info);
      });
      setAllBatch(batch);
      setAllJobs(job);
    }
  };

  const fetchAllClientBatchJob = async () => {
    const clients = await getClientApi();
    const batches = await getAllBatchApi();
    const jobs = await fetchAllJobsApi();

    if (clients.status === 200) setAllClient(clients.data);
    if (batches.status === 200) setAllBatch(batches.data);
    if (jobs.status === 200) setAllJobs(jobs.data);
  };

  useEffect(() => {
    if (userRole === 'ROLE_executor') {
      fetchDashboardData();
    } else {
      fetchAllClientBatchJob();
    }

    return () => {
      setAllClient([]);
      setAllBatch([]);
      setAllJobs([]);
    };
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 10, sm: 2, md: 3 }}
        direction="row"
        justifyContent="flex-start"
      >
        <Grid item xs={3} direction="column">
          {/* <Grid>
            <Item>
              <Header name="Select Region" />
              <Region />
            </Item>
          </Grid> */}
          <Grid style={{ marginTop: 20 }}>
            <Item>
              <Header name="OnBoarding" />
              <OnBoarding />
            </Item>
          </Grid>
          <Divider />
          <Grid style={{ marginTop: 20 }}>
            <Item>
              <Header name="Charts" />
              <Charts />
            </Item>
          </Grid>
        </Grid>
        <Grid item xs={9} direction="column">
          <Grid>
            <Item>
              <Header name="Client Table" />
              <div style={{ border: '2px solid black' }}>
                {allClient.length > 0 && <ClientTable fetchedClient={allClient} />}
              </div>
            </Item>
          </Grid>
          <Grid style={{ marginTop: 20 }}>
            <Item>
              <Header name="Batch Table" />
              <div style={{ border: '2px solid black' }}>
                {allBatch.length > 0 && <BatchTable fetchedBatch={allBatch} />}
              </div>
            </Item>
          </Grid>
          <Grid style={{ marginTop: 20 }}>
            <Item>
              <Header name="Job Table" />
              <div style={{ border: '2px solid black' }}>
                {allJobs.length > 0 && (
                  <JobTable JobFetched={allJobs} fetchedBatch={allBatch} fetchedClient={allClient} />
                )}
              </div>
            </Item>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPannel;
