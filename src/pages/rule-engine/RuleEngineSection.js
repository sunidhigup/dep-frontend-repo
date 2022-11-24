import React, { useContext, useState } from 'react';
import { useSnackbar } from 'notistack';

import HeadOptions from '../HeadOptions';

import { BatchContext } from '../../context/BatchProvider';
import { ClientContext } from '../../context/ClientProvider';
import { ApprovedfetchJobsApi } from "../../api's/JobApi";
import { JobListContext } from '../../context/JobListProvider';
import RuleEngineStart from './RuleEngineStart';

const RuleEnginePannel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { batch } = useContext(BatchContext);
  const { client } = useContext(ClientContext);
  const { jobList, setJobList } = useContext(JobListContext);

  const [loading, setLoading] = useState();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await ApprovedfetchJobsApi(client.client_id, batch.batch_id);
      setJobList(response.data);
      // setFetchedJob(response.data);
    } catch (error) {
      // setFetchedJob([]);
      setJobList([]);

      if (error.response.status === 404) {
        enqueueSnackbar('No jobs found!', {
          variant: 'warning',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    }
    setLoading(false);
  };

  return (
    <>
      <HeadOptions fetchJob={fetchJob} />

      {!loading && jobList.length > 0 && <RuleEngineStart />}
      {}
    </>
  );
};

export default RuleEnginePannel;
