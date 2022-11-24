import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const createFlowBuilderFormApi = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/flow-builder-form/add-form-data`, data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/flow-builder-form/add-form-data`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getFlowBuilderFormApi = async (clientId, batchId, job) => {
  try {
    // return await axios.get(`${BASEURL}/flow-builder-form/get-form-data/${clientId}/${batchId}/${job}`
    // , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/flow-builder-form/get-form-data/${clientId}/${batchId}/${job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteFlowBuilderFormApi = async (clientId, batchId, Job) => {
  try {
    // return await axios.delete(`${BASEURL}/flow-builder-form/delete-form/${clientId}/${batchId}/${Job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/flow-builder-form/delete-form/${clientId}/${batchId}/${Job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createFlowBuilderNodesApi = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/flow-builder-nodes/add-nodes`,data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/flow-builder-nodes/add-nodes`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getFlowBuilderNodesApi = async (clientId, batchId, job) => {
  try {
    // return await axios.get(`${BASEURL}/flow-builder-nodes/get-nodes/${clientId}/${batchId}/${job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/flow-builder-nodes/get-nodes/${clientId}/${batchId}/${job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteFlowBuilderNodesApi = async (clientId, batchId, Job) => {
  try {
    // return await axios.delete(`${BASEURL}/flow-builder-form/delete-nodes/${clientId}/${batchId}/${Job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/flow-builder-nodes/delete-nodes/${clientId}/${batchId}/${Job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createFlowBuilderEdgesApi = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/flow-builder-nodes/add-edges`,data , {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/flow-builder-nodes/add-edges`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getFlowBuilderEdgesApi = async (clientId, batchId, job) => {
  try {
    // return await axios.get(`${BASEURL}/flow-builder-nodes/get-edges/${clientId}/${batchId}/${job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/flow-builder-nodes/get-edges/${clientId}/${batchId}/${job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteFlowBuilderEdgesApi = async (clientId, batchId, Job) => {
  try {
    // return await axios.delete(`${BASEURL}/flow-builder-form/delete-edges/${clientId}/${batchId}/${Job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/flow-builder-nodes/delete-edges/${clientId}/${batchId}/${Job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createFlowBuilderJsonApi = async (
  client,
  batch,
  Job,
  data,
  trackingId,
  TimestampType,
  bucket_name,
  data_region
) => {
  try {
    // return await axios.post(`${BASEURL}/flow-builder-form/convert-to-json/${batch}/${Job}`, data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(
      `${BASEURL}/flow-builder-form/convert-to-json/${client}/${batch}/${Job}/${trackingId}/${TimestampType}/${bucket_name}/${data_region}`,
      data,
      {
        headers: { Authorization: `Bearer ${parseToken}` },
      }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteFlowBuilderJsonApi = async (batch, Job) => {
  try {
    // return await axios.delete(`${BASEURL}/flow-builder-form/delete-json/${batch}/${Job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/flow-builder-form/delete-json/${batch}/${Job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createFlowBuilderJobInputApi = async (clientId, batchId, batch, Job, data) => {
  try {
    // return await axios.post(`${BASEURL}/flow-builder-form/add-job-input/${clientId}/${batchId}/${batch}/${Job}`,data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/flow-builder-form/add-job-input/${clientId}/${batchId}/${batch}/${Job}`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getFlowBuilderJobInputApi = async (clientId, batchId, Job) => {
  try {
    // return await axios.get(`${BASEURL}/flow-builder-form/get-job-input/${clientId}/${batchId}/${Job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.get(`${BASEURL}/flow-builder-form/get-job-input/${clientId}/${batchId}/${Job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const deleteFlowBuilderJobInputApi = async (clientId, batchId, Job) => {
  try {
    // return await axios.delete(`${BASEURL}/flow-builder-form/delete-job-input/${clientId}/${batchId}/${Job}` , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.delete(`${BASEURL}/flow-builder-form/delete-job-input/${clientId}/${batchId}/${Job}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getJsonData = async (data) => {
  try {
    // return  axios.post(`${BASEURL}/table-rule/get-csv-data`,data, {
    //   withCredentials: true,
    // })
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/get-json-data`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getCustomer360SegmentApi = async () => {
  try {
    // return await axios.post(`${BASEURL}/flow-builder-form/add-form-data`, data, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/flow-builder-form/customer-360/getAllSegments`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getUdfNames = async (data) => {
  try {
    // return await axios.post(`${BASEURL}/flow-builder-form/add-form-data`, data, {

    //   withCredentials: true,

    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));

    return await axios.post(`${BASEURL}/flow-builder-form/get-udf-names`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const AllFoldersOfS3 = async (client, batch, table, TimestampType, client_id) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(
      `${BASEURL}/flow-builder-form/get-all-s3-data-list/${client}/${batch}/${table}/${TimestampType}/${client_id}`,
      {
        headers: { Authorization: `Bearer ${parseToken}` },
      }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const AllFilesOfS3 = async (prefix, client_id) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    // prefix = "hello"
    console.log(prefix);
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/flow-builder-form/get-each-s3-data-list/${client_id}`, {
      params: { prefix },
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const fetchOracleDatabase = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/oracle-info/get-db-list`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const fetchOracleTables = async (database) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/oracle-info/get-table-list/${database}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const fetchOracleColumn = async (database, table) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/oracle-info/get-column-list/${database}/${table}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const fetchPostgresDatabase = async () => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/postgres-info/get-db-list`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const fetchPostgresSchema = async (database) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/postgres-info/get-schema-list/${database}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const fetchPostgresTables = async (dbname, schema) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/postgres-info/get-table-list/${dbname}/${schema}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
