import axios from 'axios';
import BASEURL from '../BaseUrl';
import { logoutApi } from './AuthApi';

export const getCsvData = async (data) => {
  try {
    // return  axios.post(`${BASEURL}/table-rule/get-csv-data`,data, {
    //   withCredentials: true,
    // })
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/get-csv-data`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createCsvToJson = async (client_id, batch, filename, data) => {
  try {
    // return axios.post(`${BASEURL}/table-rule/create-csv-to-json/${client_id}/${batch}/${filename}`,
    //   data, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/create-csv-to-json/${client_id}/${batch}/${filename}`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createS3Path = async (data) => {
  try {
    // return axios.post(`${BASEURL}/table-rule/add-s3-path`,data, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/add-s3-path`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getS3TableRules = async (data) => {
  try {
    // return axios.post(`${BASEURL}/table-rule/get-s3-table-rules`, data, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/get-s3-table-rules`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

// fetch table rule
export const fetchTableRules = async (client_id, batch) => {
  try {
    // return axios.get(`${BASEURL}/table-rule/get-table-rule/${client_id}/${batch}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/get-table-rule/${client_id}/${batch}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    } else {
      return -1;
    }
    throw error;
  }
};

export const fetchTableRulesWithStatus = async (client_id, batch) => {
  try {
    // return axios.get(`${BASEURL}/table-rule/get-table-rule/${client_id}/${batch}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/get-table-rule-with-status/${client_id}/${batch}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    } else {
      return -1;
    }
    throw error;
  }
};

export const fetchStatusForTableruleApi = async (tablerule_id, execution_id) => {
  try {
    // return axios.get(`${BASEURL}/table-rule/get-table-rule/${client_id}/${batch}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/get-table-rule-status/${tablerule_id}/${execution_id}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    } else {
      return -1;
    }
    throw error;
  }
};

export const executeWholeRules = async (data) => {
  try {
    // return  axios.get(`${BASEURL}/rule-engine/execute-rule-engine/${data.batch}/${data.batch_id}/${data.client_id}/${data.execution_id}`, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(
      `${BASEURL}/rule-engine/execute-rule-engine/${data.batch}/${data.batch_id}/${data.client_id}/${data.client_name}/${data.execution_id}`,
      { headers: { Authorization: `Bearer ${parseToken}` } }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

// persit in table rule

export const createTableRule = async (data) => {
  try {
    // return   axios.post(`${BASEURL}/table-rule/add-table-rule`, data, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/add-table-rule`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const createMetadata = async (client_id, metadata) => {
  try {
    // return  await axios.post(`${BASEURL}/table-rule/rule-engine-metadata`,
    // metadata, {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/rule-engine-metadata/${client_id}`, metadata, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const storeTableRuleJson = async (client_id, batch, tablename, idt, data) => {
  try {
    // return  await  axios.post(
    // `${BASEURL}/table-rule/table-rule-json/${client_id}/${batch}/${tablename}`,
    // jsonData, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/table-rule-json/${client_id}/${batch}/${tablename}/${idt}`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const executeRuleEngine = async (data) => {
  try {
    // return  await axios.get(
    //   `${BASEURL}/rule-engine/execute-table-rule-engine/${data.batch}/${data.batch_id}/${data.client_id}/${data.execution_id}/${data.table_name}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(
      `${BASEURL}/rule-engine/execute-table-rule-engine/${data.batch}/${data.batch_id}/${data.client_id}/${data.client_name}/${data.execution_id}/${data.table_name}`,
      { headers: { Authorization: `Bearer ${parseToken}` } }
    );
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const getRuleEngineStatus = async (data) => {
  try {
    // return  await axios.post(`${BASEURL}/table-rule/get-status`,data , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/get-status`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const fetchTableRuleById = async (tableId) => {
  try {
    // return  await axios.get(`${BASEURL}/table-rule/get-rule-by-id/${tableId} , {
    //   withCredentials: true,
    // });

    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/get-rule-by-id/${tableId}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};
export const fetchTableRule = async (client_id, batch_name, tableName) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/getRules/${client_id}/${batch_name}/${tableName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }

    throw error;
  }
};

export const listS3 = async (client_id, prefix) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/get-list-s3/${client_id}`, {
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

// get rule by clientID and streamName/batchName
export const fetchRuleTableByBatchName = async (clientId, batchName) => {
  try {
    let result = null;
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    const response = await axios.get(`${BASEURL}/table-rule/get-table-rule/${clientId}/${batchName}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
    if (response.status === 200) {
      result = response.data[0];
    }

    return result;
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const storeTableRealTimeRuleJson = async (clientId, streamName, tablename, data) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.post(`${BASEURL}/table-rule/table-real-rule-json/${clientId}/${streamName}/${tablename}`, data, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const deleteTableRule = async (clientId, batchname, tablename) => {
  try {
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.delete(`${BASEURL}/table-rule/delete-table-rule/${clientId}/${batchname}/${tablename}`, {
      headers: { Authorization: `Bearer ${parseToken}` },
    });
  } catch (error) {
    if (error.response.status === 401) {
      await logoutApi();
    }
    throw error;
  }
};

export const AllFoldersOfS3 = async (client_id, client_name, batch_name, table_name, data_region_code, bucket_name) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(
      `${BASEURL}/table-rule/get-all-s3-data-list/${client_id}/${client_name}/${batch_name}/${table_name}/${data_region_code}/${bucket_name}`,
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

export const AllFilesOfS3 = async (client_id, prefix) => {
  try {
    // return await axios(`${BASEURL}/jobs/get-jobs/${clientId}/${batchId}`, {
    //   withCredentials: true,
    // });
    const parseToken = JSON.parse(localStorage.getItem('jwtToken'));
    return await axios.get(`${BASEURL}/table-rule/get-each-s3-data-list/${client_id}`, {
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
